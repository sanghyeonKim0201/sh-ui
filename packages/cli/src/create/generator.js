import { input, select, checkbox, confirm } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { getPluginChoices, getPluginsByNames } from './plugins/index.js';
import { resolveTheme } from './theme/decode.js';
import { THEME_PRESETS, getThemePreset } from './theme/presets.js';
import {
  replaceSection,
  buildCssColorsBlock,
  buildCssRadiusBlock,
  buildCssSpacingBlock,
  buildCssTypographyBlock,
  buildCssWeightsBlock,
  buildCssControlsBlock,
  buildCssBordersBlock,
  buildCssDurationsBlock,
  buildCssShadowsBlock,
  buildCssEasesBlock,
  buildCssGradientsBlock,
  buildDartColorsBlock,
  buildDartRadiusBlock,
  buildDartSpacingBlock,
  buildDartTypographyBlock,
  buildDartWeightsBlock,
  buildDartControlsBlock,
  buildDartBordersBlock,
  buildDartDurationsBlock,
  buildDartShadowsBlock,
  buildDartEasesBlock,
  buildDartGradientsBlock,
} from './theme/inject.js';
import { getTemplatesRoot } from '../paths.mjs';
import {
  CSS_FRAMEWORK_DEFAULT,
  CSS_FRAMEWORKS_SUPPORTED,
  CSS_FRAMEWORKS_PLANNED,
} from '../constants.js';

const TEMPLATES_DIR = getTemplatesRoot();

/**
 * 템플릿 복사 직후 sh-ui.config.json 의 cssFramework 필드를 갱신.
 * 템플릿엔 이미 기본값이 박혀 있지만, 사용자가 --css 로 다른 값을 지정한
 * 경우 그 값으로 덮어쓴다. 1단계는 plain 만 지원하므로 사실상 idempotent
 * 이지만 2단계 emitter 가 추가되면 이 한 호출만으로 곧바로 동작.
 */
async function patchShUiConfig(configPath, cssFramework) {
  const fw = cssFramework ?? CSS_FRAMEWORK_DEFAULT;
  if (!(await fs.pathExists(configPath))) return;
  const config = await fs.readJson(configPath);
  config.cssFramework = fw;
  await fs.writeJson(configPath, config, { spaces: 2 });
}

// ─── Create new project ───

// 비대화형 환경(TTY 없음 — 에이전트, CI, 파이프) 에서는 prompt 가 멈추므로
// 누락된 필수 인자가 있으면 즉시 에러로 종료한다. 호출 시점에 평가해 테스트가
// `process.stdin.isTTY = true` 로 prompt 흐름을 그대로 검증할 수 있게 한다.
function assertNoTtyFlag(value, flagLabel) {
  if (value === undefined || value === null) {
    throw new Error(
      `비대화형 환경(TTY 없음)에서는 ${flagLabel} 가 필요합니다. ` +
      `sh-ui create --help 참고.`,
    );
  }
}

export async function createProject(options = {}) {
  if (!process.stdin.isTTY) {
    assertNoTtyFlag(options.name, '<project-name> (positional)');
    assertNoTtyFlag(options.platform, '--platform');
    if (options.platform === 'next') {
      assertNoTtyFlag(options.structure, '--structure');
    }
  }

  const projectName = options.name ?? await input({
    message: '프로젝트 이름:',
    default: 'my-app',
  });

  const platform = options.platform ?? await select({
    message: '플랫폼:',
    choices: [
      { name: 'Next.js', value: 'next' },
      { name: 'Flutter', value: 'flutter' },
    ],
  });

  // CSS 프레임워크 — 현재는 plain 만 지원하지만, 곧 추가될 옵션을 disabled 로
  // 미리 노출해 사용자가 변종 시스템의 존재를 인지할 수 있게 한다.
  // Flutter 는 CSS 프레임워크 개념이 무의미하므로 자동 plain.
  let cssFramework = options.css ?? CSS_FRAMEWORK_DEFAULT;
  if (
    options.css == null &&
    platform !== 'flutter' &&
    process.stdin.isTTY &&
    !options.yes
  ) {
    cssFramework = await select({
      message: 'CSS 프레임워크:',
      default: CSS_FRAMEWORK_DEFAULT,
      choices: [
        ...CSS_FRAMEWORKS_SUPPORTED.map((fw) => ({
          name: `${fw} — 플레인 CSS + custom properties`,
          value: fw,
        })),
        ...CSS_FRAMEWORKS_PLANNED.map((fw) => ({
          name: fw,
          value: fw,
          disabled: '곧 지원',
        })),
      ],
    });
  }

  let theme = null;
  if (options.theme) {
    theme = resolveTheme(options.theme);
  } else if (process.stdin.isTTY && !options.yes) {
    // --yes 는 "선택 옵션은 기본값으로" 의미. 테마는 옵션이므로 prompt 우회.
    const NONE = '__none__';
    const choice = await select({
      message: '테마:',
      default: NONE,
      choices: [
        { name: '기본 (테마 없음 — sh-ui 기본 토큰 그대로)', value: NONE },
        ...Object.entries(THEME_PRESETS).map(([name, preset]) => ({
          name: preset.label,
          value: name,
        })),
      ],
    });
    if (choice !== NONE) theme = getThemePreset(choice);
  }

  // dry-run 은 tmpdir 에 그대로 생성한 뒤 파일 목록 출력 + 정리.
  // 사용자 cwd 를 건드리지 않으면서 실제 generation 흐름을 그대로 검증한다.
  const targetDir = options.dryRun
    ? await fs.mkdtemp(path.join(os.tmpdir(), 'sh-ui-dry-'))
    : path.resolve(process.cwd(), projectName);

  if (!options.dryRun && await fs.pathExists(targetDir)) {
    if (options.yes) {
      await fs.remove(targetDir);
    } else {
      const overwrite = await confirm({
        message: `${projectName} 디렉토리가 이미 존재합니다. 덮어쓸까요?`,
        default: false,
      });
      if (!overwrite) {
        console.log('취소되었습니다.');
        return;
      }
      await fs.remove(targetDir);
    }
  }

  if (platform === 'flutter') {
    await generateFlutter(targetDir, projectName, theme, cssFramework);
    await finalizeProject(targetDir, { dryRun: options.dryRun });
    console.log(`\n✅ ${projectName} Flutter 프로젝트가 생성되었습니다!`);
    console.log(`\n  cd ${projectName}`);
    console.log('  flutter pub get');
    console.log('  flutter run\n');
    return;
  }

  // platform === 'next' 경로
  const projectType = options.structure ?? await select({
    message: '프로젝트 구조:',
    choices: [
      { name: '단독 (Next.js standalone)', value: 'standalone' },
      { name: '모노레포 (Turborepo + pnpm)', value: 'monorepo' },
    ],
  });

  // plugins 는 미지정시 기본 빈 배열 — prompt 띄우지 않는다.
  // (플러그인을 쓰려면 명시적으로 --plugins sentry,next-intl,auth-jwt 등 사용)
  const selectedPluginNames = options.plugins ?? [];

  const plugins = getPluginsByNames(selectedPluginNames);
  plugins.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  if (projectType === 'standalone') {
    await generateStandalone(targetDir, projectName, plugins, theme, cssFramework);
  } else {
    await generateMonorepo(targetDir, projectName, plugins, { yes: options.yes, theme, css: cssFramework });
  }

  await finalizeProject(targetDir, { dryRun: options.dryRun });

  if (options.dryRun) {
    const files = await listAllFiles(targetDir);
    console.log(`\n[DRY RUN] ${projectName} 스캐폴드 시 작성될 파일 (${files.length}개):\n`);
    for (const f of files.sort()) {
      console.log(`  ${f}`);
    }
    await fs.remove(targetDir);
    console.log(`\n실제 스캐폴드: --dry-run 제거 후 같은 명령 실행.`);
    return;
  }

  console.log(`\n✅ ${projectName} 프로젝트가 생성되었습니다!`);
  console.log(`\n  cd ${projectName}`);
  console.log('  pnpm install');
  console.log('  pnpm dev\n');
}

/**
 * targetDir 아래 모든 파일을 상대 경로로 나열. node_modules 등은 자동 스킵
 * (스캐폴드 직후라 install 안 한 상태기 때문).
 */
async function listAllFiles(targetDir) {
  const collected = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        collected.push(path.relative(targetDir, full));
      }
    }
  }
  await walk(targetDir);
  return collected;
}

// ─── Add app to existing monorepo ───

export async function addApp() {
  const isMonorepo = await fs.pathExists(
    path.resolve(process.cwd(), 'pnpm-workspace.yaml'),
  );
  if (!isMonorepo) {
    console.log('❌ 현재 디렉토리가 모노레포가 아닙니다. pnpm-workspace.yaml이 없습니다.');
    return;
  }

  const appName = await input({
    message: '앱 이름:',
    default: 'web',
  });

  const port = await input({
    message: '포트 번호:',
    default: '3000',
  });

  const selectedPlugins = await checkbox({
    message: '추가 기능 선택 (Space로 선택):',
    choices: getPluginChoices(),
  });

  const plugins = getPluginsByNames(selectedPlugins);
  plugins.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const appsDir = path.resolve(process.cwd(), 'apps', appName);

  if (await fs.pathExists(appsDir)) {
    console.log(`❌ apps/${appName} 디렉토리가 이미 존재합니다.`);
    return;
  }

  await generateApp(appsDir, appName, port, plugins);

  console.log(`\n✅ apps/${appName} 이 추가되었습니다!`);
  console.log('\n  pnpm install');
  console.log(`  pnpm --filter ${appName} dev\n`);
}

// ─── Add component to ui packages ───

export async function addComponent(componentName, appName) {
  const cwd = process.cwd();
  const isMonorepo = await fs.pathExists(path.join(cwd, 'pnpm-workspace.yaml'));

  if (!isMonorepo) {
    // Standalone: 현재 디렉토리에서 바로 실행
    if (!componentName) {
      componentName = await input({ message: '컴포넌트 이름:' });
    }
    console.log(`\n📦 sh-ui 컴포넌트 추가: ${componentName}`);
    execSync(`npx sh-ui add ${componentName}`, { cwd, stdio: 'inherit' });
    console.log(`\n✅ ${componentName} 추가 완료!`);
    return;
  }

  // Monorepo: packages/ui/ui-apps/* 에서 실행
  const uiAppsDir = path.join(cwd, 'packages', 'ui', 'ui-apps');
  if (!(await fs.pathExists(uiAppsDir))) {
    console.log('❌ packages/ui/ui-apps/ 디렉토리가 없습니다.');
    return;
  }

  const entries = await fs.readdir(uiAppsDir, { withFileTypes: true });
  const uiPackages = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('ui-') && e.name !== 'ui-app-template')
    .map((e) => e.name);

  if (uiPackages.length === 0) {
    console.log('❌ ui-* 패키지가 없습니다.');
    return;
  }

  if (!componentName) {
    componentName = await input({ message: '컴포넌트 이름:' });
  }

  let targets;
  if (appName) {
    const pkgName = `ui-${appName}`;
    if (!uiPackages.includes(pkgName)) {
      console.log(`❌ packages/ui/ui-apps/${pkgName} 이 존재하지 않습니다.`);
      console.log(`   사용 가능: ${uiPackages.join(', ')}`);
      return;
    }
    targets = [pkgName];
  } else {
    const choice = await select({
      message: '어디에 추가할까요?',
      choices: [
        { name: '모든 ui 패키지', value: 'all' },
        ...uiPackages.map((name) => ({ name: `packages/ui/ui-apps/${name}`, value: name })),
      ],
    });
    targets = choice === 'all' ? uiPackages : [choice];
  }

  for (const pkg of targets) {
    const pkgDir = path.join(uiAppsDir, pkg);
    console.log(`\n📦 packages/ui/ui-apps/${pkg}에 ${componentName} 추가 중...`);
    try {
      execSync(`npx sh-ui add ${componentName}`, { cwd: pkgDir, stdio: 'inherit' });
      console.log(`✅ packages/ui/ui-apps/${pkg} 완료`);
    } catch (error) {
      console.log(`❌ packages/ui/ui-apps/${pkg} 실패: ${error.message}`);
    }
  }

  console.log('\n✅ 컴포넌트 추가 완료!');
}

// ─── Generators ───

async function generateFlutter(targetDir, projectName, theme, css) {
  await fs.copy(path.join(TEMPLATES_DIR, 'flutter-standalone'), targetDir);
  await replaceInAllFiles(targetDir, '{{project_name}}', projectName);
  await injectDartTheme(targetDir, theme);
  await patchShUiConfig(path.join(targetDir, 'sh-ui.config.json'), css);
}

async function generateStandalone(targetDir, projectName, plugins, theme, css) {
  await fs.copy(path.join(TEMPLATES_DIR, 'nextjs-standalone'), targetDir);

  // Update package.json
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;
  for (const plugin of plugins) {
    if (plugin.dependencies) {
      Object.assign(pkg.dependencies, plugin.dependencies);
    }
    if (plugin.devDependencies) {
      Object.assign(pkg.devDependencies, plugin.devDependencies);
    }
  }
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await writeNextConfig(targetDir, plugins, { isMonorepo: false });
  await appendEnvVars(path.join(targetDir, '.env.example'), plugins);
  await writePluginFiles(targetDir, plugins);
  await composeProviders(targetDir, plugins);
  await applyTransforms(targetDir, plugins);
  await injectCssTheme(targetDir, theme);
  await patchShUiConfig(path.join(targetDir, 'sh-ui.config.json'), css);
}

async function generateMonorepo(targetDir, projectName, plugins, { yes = false, theme, css } = {}) {
  await fs.copy(path.join(TEMPLATES_DIR, 'monorepo'), targetDir);

  // Update root package.json
  const rootPkgPath = path.join(targetDir, 'package.json');
  const rootPkg = await fs.readJson(rootPkgPath);
  rootPkg.name = projectName;
  await fs.writeJson(rootPkgPath, rootPkg, { spaces: 2 });

  // Update turbo.json
  const turboPath = path.join(targetDir, 'turbo.json');
  const turbo = await fs.readJson(turboPath);
  for (const plugin of plugins) {
    if (plugin.turboEnvVars) {
      turbo.globalEnv.push(...plugin.turboEnvVars);
    }
  }
  await fs.writeJson(turboPath, turbo, { spaces: 2 });

  // Create first app
  const appName = yes ? 'web' : await input({
    message: '첫 번째 앱 이름:',
    default: 'web',
  });

  const port = yes ? '3000' : await input({
    message: '포트 번호:',
    default: '3000',
  });

  const appsDir = path.join(targetDir, 'apps', appName);
  await generateApp(appsDir, appName, port, plugins);
  const uiAppDir = path.join(targetDir, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  await injectCssTheme(uiAppDir, theme);
  await patchShUiConfig(path.join(uiAppDir, 'sh-ui.config.json'), css);
}

async function generateApp(targetDir, appName, port, plugins) {
  await fs.copy(path.join(TEMPLATES_DIR, 'nextjs-app'), targetDir);

  // Replace ui-app-name placeholder with actual app name in all files
  await replaceInAllFiles(targetDir, 'ui-app-name', `ui-${appName}`);
  await replaceInAllFiles(targetDir, 'app-name', appName);

  // Update package.json
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = appName;
  pkg.scripts.dev = `next dev -p ${port} --turbopack`;
  for (const plugin of plugins) {
    if (plugin.dependencies) {
      Object.assign(pkg.dependencies, plugin.dependencies);
    }
    if (plugin.devDependencies) {
      Object.assign(pkg.devDependencies, plugin.devDependencies);
    }
  }
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await writeNextConfig(targetDir, plugins, { isMonorepo: true, appName });

  // Update Dockerfile
  const dockerPath = path.join(targetDir, 'Dockerfile');
  if (await fs.pathExists(dockerPath)) {
    let dockerfile = await fs.readFile(dockerPath, 'utf-8');
    dockerfile = dockerfile.replace(/EXPOSE \d+/, `EXPOSE ${port}`);
    dockerfile = dockerfile.replace(/ENV PORT=\d+/, `ENV PORT=${port}`);
    await fs.writeFile(dockerPath, dockerfile);
  }

  // Create packages/ui/ui-apps/ui-{appName}/ from ui-app-template
  const monorepoRoot = path.resolve(targetDir, '..', '..');
  const uiPkgDir = path.join(monorepoRoot, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  if (!(await fs.pathExists(uiPkgDir))) {
    await fs.copy(path.join(TEMPLATES_DIR, 'ui-app-template'), uiPkgDir);
    await replaceInAllFiles(uiPkgDir, 'ui-app-name', `ui-${appName}`);
    await replaceInAllFiles(uiPkgDir, 'app-name', appName);
  }

  await appendEnvVars(path.join(targetDir, '.env.example'), plugins);
  await writePluginFiles(targetDir, plugins);
  await composeProviders(targetDir, plugins);
  await applyTransforms(targetDir, plugins);
}

// ─── Helpers ───

/**
 * 스캐폴드 마무리 — `gitignore` 파일을 `.gitignore` 로 되돌리고 `git init` 실행.
 *
 * 왜 이름을 우회하는가: npm publish 는 패키지 안의 `.gitignore` 를 자동으로
 * strip 한다(없으면 `.npmignore` fallback 으로 사용). 사용자에게 도착하지 않으니
 * 템플릿엔 `gitignore` 로 두고 복사 직후 dot-prefix 를 붙인다.
 *
 * git init 은 dry-run 에서는 스킵하고, 실패해도(git 미설치 등) 조용히 넘어간다.
 */
async function finalizeProject(targetDir, { dryRun = false } = {}) {
  const noDot = path.join(targetDir, 'gitignore');
  const withDot = path.join(targetDir, '.gitignore');
  if (await fs.pathExists(noDot)) {
    await fs.move(noDot, withDot, { overwrite: true });
  }

  if (dryRun) return;

  try {
    execSync('git init -q', { cwd: targetDir, stdio: 'ignore' });
  } catch {
    // git 미설치 / 권한 문제 — 스캐폴드 자체는 성공이므로 조용히 넘어간다.
  }
}

async function replaceInAllFiles(dir, search, replace) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      await replaceInAllFiles(fullPath, search, replace);
    } else {
      const content = await fs.readFile(fullPath, 'utf-8');
      if (content.includes(search)) {
        await fs.writeFile(fullPath, content.replaceAll(search, replace));
      }
    }
  }
}

async function writeNextConfig(targetDir, plugins, { isMonorepo, appName }) {
  const imports = [`import type { NextConfig } from 'next';`];
  const preExport = [];
  let configBody;

  if (isMonorepo) {
    const uiPkgName = `ui-${appName ?? 'app'}`;
    configBody = `const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@workspace/ui-core', '@workspace/${uiPkgName}'],
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};`;
  } else {
    configBody = `const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};`;
  }

  for (const plugin of plugins) {
    if (plugin.imports) imports.push(...plugin.imports);
    if (plugin.preExport) preExport.push(...plugin.preExport);
  }

  let exportExpr = 'nextConfig';
  for (const plugin of plugins) {
    if (plugin.wrapExport) {
      exportExpr = plugin.wrapExport(exportExpr);
    }
  }

  const lines = [imports.join('\n'), '', configBody];

  if (preExport.length > 0) {
    lines.push('', preExport.join('\n'));
  }

  lines.push('', `export default ${exportExpr};`, '');

  await fs.writeFile(path.join(targetDir, 'next.config.ts'), lines.join('\n'));
}

async function appendEnvVars(envPath, plugins) {
  const additions = [];
  for (const plugin of plugins) {
    if (plugin.envVars && plugin.envVars.length > 0) {
      additions.push('', ...plugin.envVars);
    }
  }
  if (additions.length > 0) {
    const existing = await fs.readFile(envPath, 'utf-8');
    await fs.writeFile(envPath, existing.trimEnd() + '\n' + additions.join('\n') + '\n');
  }
}

async function writePluginFiles(targetDir, plugins) {
  for (const plugin of plugins) {
    if (plugin.files) {
      for (const [filePath, content] of Object.entries(plugin.files)) {
        const fullPath = path.join(targetDir, filePath);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, content);
      }
    }
  }

  // auth-jwt + next-intl 동시 활성화 시 proxy.ts 병합
  // (각 플러그인이 단독으로 깐 proxy.ts 를 합친 버전으로 덮어쓴다)
  const names = new Set(plugins.map((p) => p.name));
  if (names.has('auth-jwt') && names.has('next-intl')) {
    const mergedProxy = `import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from '@/src/shared/config/i18n/routing';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];

const intl = createIntlMiddleware(routing);

/**
 * 로케일 prefix (/ko, /en) 를 벗겨 인증 라우트 매칭에 사용한다.
 * 예: /ko/sign-in → /sign-in
 */
const stripLocalePrefix = (pathname: string): string => {
  const locales = routing.locales as readonly string[];
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && locales.includes(segments[0])) {
    const rest = segments.slice(1).join('/');
    return \`/\${rest}\`.replace(/\\/$/, '') || '/';
  }
  return pathname;
};

/**
 * Next 16+ proxy.ts (구 middleware.ts).
 * next-intl 라우팅 + auth-jwt 토큰 존재 체크 합성 버전.
 *
 * - intl 이 먼저 로케일 prefix 처리 + NEXT_LOCALE 쿠키 set
 * - 그 위에 인증 가드 — 토큰 없고 인증 라우트도 아니면 /sign-in 으로 redirect
 * - AT 만료 검사나 refresh 는 하지 않는다 (BFF 가 처리)
 */
export default function proxy(req: NextRequest) {
  const intlRes = intl(req);
  const pathname = stripLocalePrefix(req.nextUrl.pathname);
  const hasToken = !!req.cookies.get('accessToken')?.value;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuthRoute) return intlRes;
  if (!hasToken) return NextResponse.redirect(new URL('/sign-in', req.url));

  return intlRes;
}

export const config = {
  matcher: '/((?!api|_next|_vercel|monitoring|.*\\\\..*).*)',
};
`;
    await fs.writeFile(path.join(targetDir, 'proxy.ts'), mergedProxy);
  }
}

async function composeProviders(targetDir, plugins) {
  const extraImports = [];
  const wrappers = [];

  for (const plugin of plugins) {
    if (plugin.providerImports) extraImports.push(...plugin.providerImports);
    if (plugin.providerWrappers) wrappers.push(...plugin.providerWrappers);
  }

  if (extraImports.length === 0 && wrappers.length === 0) return;

  const globalProviderPath = path.join(targetDir, 'src/app/providers/GlobalProvider/index.tsx');
  if (!(await fs.pathExists(globalProviderPath))) return;

  let content = await fs.readFile(globalProviderPath, 'utf-8');

  // import 추가 (파일 최상단에)
  for (const imp of extraImports) {
    if (!content.includes(imp)) {
      content = imp + '\n' + content;
    }
  }

  // wrapper 적용: <ThemeProviders> 바깥쪽에 감싸기
  for (const wrapper of wrappers) {
    if (content.includes(`<${wrapper}>`)) continue;
    content = content.replace(
      /(<ThemeProviders>)/,
      `<${wrapper}>\n      $1`,
    );
    content = content.replace(
      /(<\/ThemeProviders>)/,
      `$1\n      </${wrapper}>`,
    );
  }

  await fs.writeFile(globalProviderPath, content);
}

async function applyTransforms(targetDir, plugins) {
  for (const plugin of plugins) {
    if (!plugin.transforms) continue;

    for (const transform of plugin.transforms) {
      const { type } = transform;

      if (type === 'move') {
        const fromPath = path.join(targetDir, transform.from);
        const toPath = path.join(targetDir, transform.to);
        if (await fs.pathExists(fromPath)) {
          await fs.ensureDir(path.dirname(toPath));
          await fs.move(fromPath, toPath, { overwrite: true });
        }
      }

      if (type === 'replace') {
        const filePath = path.join(targetDir, transform.path);
        if (transform.content) {
          await fs.writeFile(filePath, transform.content);
        }
        if (transform.contentFn) {
          if (await fs.pathExists(filePath)) {
            const existing = await fs.readFile(filePath, 'utf-8');
            const updated = transform.contentFn(existing);
            await fs.writeFile(filePath, updated);
          }
        }
      }

      if (type === 'delete') {
        const filePath = path.join(targetDir, transform.path);
        await fs.remove(filePath);
      }
    }
  }
}

// ─── Theme 주입 ───

/** 여러 후보 경로 중 존재하는 첫 tokens.css 에 theme 주입 */
/**
 * 옵셔널 카테고리 → CSS 마커 / 빌더 매핑.
 * theme 에 카테고리 키가 있을 때만 해당 마커 섹션 교체.
 */
const OPTIONAL_CSS_INJECTORS = [
  ['spacing',    'theme-space',        buildCssSpacingBlock],
  ['typography', 'theme-text',         buildCssTypographyBlock],
  ['weights',    'theme-weight',       buildCssWeightsBlock],
  ['controls',   'theme-control',      buildCssControlsBlock],
  ['borders',    'theme-border-width', buildCssBordersBlock],
  ['durations',  'theme-duration',     buildCssDurationsBlock],
  ['shadows',    'theme-shadow',       buildCssShadowsBlock],
  ['eases',      'theme-ease',         buildCssEasesBlock],
  ['gradients',  'theme-gradient',     buildCssGradientsBlock],
];

const OPTIONAL_DART_INJECTORS = [
  ['spacing',    'theme-space',        buildDartSpacingBlock],
  ['typography', 'theme-text',         buildDartTypographyBlock],
  ['weights',    'theme-weight',       buildDartWeightsBlock],
  ['controls',   'theme-control',      buildDartControlsBlock],
  ['borders',    'theme-border-width', buildDartBordersBlock],
  ['durations',  'theme-duration',     buildDartDurationsBlock],
  ['shadows',    'theme-shadow',       buildDartShadowsBlock],
  ['eases',      'theme-ease',         buildDartEasesBlock],
  ['gradients',  'theme-gradient',     buildDartGradientsBlock],
];

async function injectCssTheme(projectDir, theme) {
  if (!theme) return;
  const candidates = [
    'src/shared/styles/tokens.css',
    'src/styles/tokens.css',
  ];
  for (const rel of candidates) {
    const abs = path.join(projectDir, rel);
    if (await fs.pathExists(abs)) {
      let css = await fs.readFile(abs, 'utf-8');
      css = replaceSection(css, 'theme-colors', '/*', '*/', buildCssColorsBlock(theme));
      css = replaceSection(css, 'theme-radius', '/*', '*/', buildCssRadiusBlock(theme));
      for (const [key, marker, builder] of OPTIONAL_CSS_INJECTORS) {
        if (theme[key]) {
          css = replaceSection(css, marker, '/*', '*/', builder(theme[key]));
        }
      }
      await fs.writeFile(abs, css);
      return;
    }
  }
  throw new Error(`theme 주입 실패: tokens.css 파일을 찾을 수 없음 (${projectDir})`);
}

async function injectDartTheme(projectDir, theme) {
  if (!theme) return;
  const abs = path.join(projectDir, 'lib/sh_ui/foundation/sh_ui_tokens.dart');
  if (!(await fs.pathExists(abs))) {
    throw new Error(`theme 주입 실패: sh_ui_tokens.dart 가 없음 (${abs})`);
  }
  let dart = await fs.readFile(abs, 'utf-8');
  dart = replaceSection(dart, 'theme-colors', '//', '', buildDartColorsBlock(theme));
  dart = replaceSection(dart, 'theme-radius', '//', '', buildDartRadiusBlock(theme));
  for (const [key, marker, builder] of OPTIONAL_DART_INJECTORS) {
    if (theme[key]) {
      dart = replaceSection(dart, marker, '//', '', builder(theme[key]));
    }
  }
  await fs.writeFile(abs, dart);
}
