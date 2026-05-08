import { input, select, checkbox, confirm } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import * as fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/**
 * Node native fs/promises 위에 얹은 fs-extra 호환 슬림 어댑터.
 *
 * 왜 직접 어댑터를 두는가:
 *   1. fs-extra v11 이 long-running 프로세스(MCP daemon) 에서 internal state 를
 *      누적시켜 directory filter / recursive copy 가 부분 실패하는 회귀가 보고됨.
 *      Node 24 의 native `fs.cp` 는 그런 모듈 단위 캐시가 없어 안전.
 *   2. 의존성 1개 제거 — 부트 시간/번들 크기 이득.
 *
 * 의도적으로 fs-extra 의 API 표면 일부만 재현 — 사용처(generator.js) 에서 쓰는 메서드만.
 * `move` 는 cross-device 시 `rename` 이 EXDEV 를 던지므로 copy+remove fallback 포함.
 */
const fs = {
  ...fsp,
  /** 파일/디렉토리 존재 여부 — fs-extra `pathExists` 동등. */
  pathExists: async (p) => {
    try {
      await fsp.access(p);
      return true;
    } catch {
      return false;
    }
  },
  /** JSON 파일 읽기 — fs-extra `readJson` 동등. */
  readJson: async (p) => JSON.parse(await fsp.readFile(p, 'utf-8')),
  /** JSON 파일 쓰기 — fs-extra `writeJson` 동등 (`spaces` 만 지원). */
  writeJson: async (p, obj, opts = {}) => {
    const indent = opts.spaces ?? 2;
    await fsp.writeFile(p, JSON.stringify(obj, null, indent) + '\n');
  },
  /** 재귀 삭제 — fs-extra `remove` 동등. 없으면 무시. */
  remove: async (p) => fsp.rm(p, { recursive: true, force: true }),
  /** 디렉토리 보장 (mkdir -p) — fs-extra `ensureDir` 동등. */
  ensureDir: async (p) => fsp.mkdir(p, { recursive: true }),
  /**
   * 재귀 복사 — fs-extra `copy` 의 핵심 옵션 (`filter`, `overwrite`) 만 지원.
   * Node `fs.cp` 의 `force/errorOnExist` 조합으로 fs-extra 의 `overwrite` 시맨틱 재현:
   *   - overwrite: true  → force=true  (기존 파일 덮어씀)
   *   - overwrite: false → force=false + errorOnExist=false (기존 파일 스킵, 충돌 throw 없음)
   */
  copy: async (src, dest, opts = {}) => {
    const overwrite = opts.overwrite ?? false;
    return fsp.cp(src, dest, {
      recursive: true,
      filter: opts.filter,
      force: overwrite,
      errorOnExist: false,
    });
  },
  /**
   * 이동 — fs-extra `move` 동등. 같은 파일시스템이면 `rename`, cross-device 면 copy+remove.
   * `overwrite: true` 시 기존 dest 를 먼저 제거.
   */
  move: async (src, dest, opts = {}) => {
    if (opts.overwrite) {
      await fsp.rm(dest, { recursive: true, force: true });
    }
    try {
      await fsp.rename(src, dest);
    } catch (e) {
      if (e.code !== 'EXDEV') throw e;
      // cross-device — fallback: copy + remove src.
      await fsp.cp(src, dest, { recursive: true, force: true, errorOnExist: false });
      await fsp.rm(src, { recursive: true, force: true });
    }
  },
};
import { getPluginChoices, getPluginsByNames } from './plugins/index.js';
import {
  assertArchPlatformCompat,
  getArchesForPlatform,
  DEFAULT_ARCH,
} from './architectures/index.js';
import { resolveTheme } from './theme/decode.js';
import { THEME_PRESETS, THEME_PRESET_NAMES, getThemePreset } from './theme/presets.js';
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
 * 템플릿 복사 직후 sh-ui.config.json 의 cssFramework + theme.base 필드를 갱신.
 *
 * Flutter 는 cssFramework 가 의미 없으므로 platform=flutter 면 필드 자체를 안 쓴다.
 * Next.js 는 plain/tailwind/css-modules 따라 컴포넌트 변종 결정 + base 파일도 분기 emit.
 *
 * themeBase 는 사용자가 고른 프리셋 이름(neutral/slate/rose/emerald/violet) 또는
 * 커스텀 base64 였을 때 'custom'. null 이면 템플릿 기본값 유지.
 */
async function patchShUiConfig(configPath, cssFramework, themeBase) {
  if (!(await fs.pathExists(configPath))) return;
  const config = await fs.readJson(configPath);
  // Flutter 는 cssFramework 무관 — 필드 자체를 두지 않는다.
  if (config.platform === 'flutter') {
    delete config.cssFramework;
  } else {
    config.cssFramework = cssFramework ?? CSS_FRAMEWORK_DEFAULT;
  }
  if (themeBase != null) {
    config.theme = config.theme ?? {};
    config.theme.base = themeBase;
  }
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

  // arch 결정 — platform 확정 후. 사용자가 --arch 미지정 시:
  //   - next  → DEFAULT_ARCH ('fsd')
  //   - flutter → 현재 Flutter arch 디스크립터 없음 → null. 미래에 flutter arch 추가되면
  //     해당 platform 의 첫 번째 arch 또는 별도 default 로 변경.
  // 명시한 경우 platform 호환성 검증 후 디스크립터 resolve. 잘못된 조합은 친절한 에러.
  let arch = null;
  if (platform === 'next') {
    const archName = options.arch ?? DEFAULT_ARCH;
    arch = assertArchPlatformCompat(archName, 'next');
  } else if (platform === 'flutter' && options.arch) {
    arch = assertArchPlatformCompat(options.arch, 'flutter');
  }

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
  // themeBase: 'neutral'|'slate'|'rose'|'emerald'|'violet'|'custom'|null.
  // sh-ui.config.json 의 theme.base 가 실제 사용된 팔레트를 반영하게 한다 (이전엔 항상 템플릿 기본값으로 남아 있던 문제).
  let themeBase = null;
  if (options.theme) {
    theme = resolveTheme(options.theme);
    themeBase = THEME_PRESET_NAMES.includes(options.theme) ? options.theme : 'custom';
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
    if (choice !== NONE) {
      theme = getThemePreset(choice);
      themeBase = choice;
    }
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
    await generateFlutter(targetDir, projectName, theme, cssFramework, themeBase);
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
    await generateStandalone(targetDir, projectName, plugins, theme, cssFramework, arch, themeBase);
  } else {
    await generateMonorepo(targetDir, projectName, plugins, { yes: options.yes, theme, css: cssFramework, arch, themeBase });
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

  // addApp 은 기존 monorepo 의 새 앱 추가 — arch 는 일관성을 위해 모노레포가 처음
  // 만들어질 때 정한 값과 같아야 한다. 현재는 root sh-ui.config.json 등에 별도 저장
  // 안 해 두므로 일단 DEFAULT_ARCH (fsd) 로 fallback. 향후 root config 에 arch 박아두고
  // 여기서 읽어오는 흐름으로 개선 가능.
  const arch = assertArchPlatformCompat(DEFAULT_ARCH, 'next');

  await generateApp(appsDir, appName, port, plugins, arch);

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

async function generateFlutter(targetDir, projectName, theme, css, themeBase) {
  await fs.copy(path.join(TEMPLATES_DIR, 'flutter-standalone'), targetDir);
  await replaceInAllFiles(targetDir, '{{project_name}}', projectName);
  await injectDartTheme(targetDir, theme);
  await patchShUiConfig(path.join(targetDir, 'sh-ui.config.json'), css, themeBase);
}

async function generateStandalone(targetDir, projectName, plugins, theme, css, arch, themeBase) {
  // 베이스 (arch-neutral) + arch 오버레이 — generateApp 과 같은 패턴.
  await fs.copy(path.join(TEMPLATES_DIR, 'nextjs-standalone'), targetDir, {
    filter: (src) => !src.includes(`${path.sep}_arch${path.sep}`) && !src.endsWith(`${path.sep}_arch`),
  });
  await ensureArchCleanup(targetDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, 'nextjs-standalone', '_arch', arch.name),
    targetDir,
    { overwrite: true },
  );
  await assertArchOverlayApplied(targetDir, arch);

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
  // 플러그인 deps 가 알파벳 정렬을 깨므로 마지막에 정렬해서 일관된 출력 보장.
  if (pkg.dependencies) pkg.dependencies = sortObjectKeys(pkg.dependencies);
  if (pkg.devDependencies) pkg.devDependencies = sortObjectKeys(pkg.devDependencies);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await writeNextConfig(targetDir, plugins, { isMonorepo: false, arch });
  await appendEnvVars(path.join(targetDir, '.env.example'), plugins);
  await writePluginFiles(targetDir, plugins, arch);
  await composeProviders(targetDir, plugins, arch);
  await applyTransforms(targetDir, plugins, arch);
  await applyCssFrameworkVariant(targetDir, css, { isMonorepo: false, plugins, arch });
  await injectCssTheme(targetDir, theme);
  await patchShUiConfig(path.join(targetDir, 'sh-ui.config.json'), css, themeBase);
}

async function generateMonorepo(targetDir, projectName, plugins, { yes = false, theme, css, arch, themeBase } = {}) {
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
  await generateApp(appsDir, appName, port, plugins, arch, css);
  // generateApp 이 ui-{app} 패키지의 cssFramework 변종까지 처리. 여기선 theme + sh-ui.config.json 만.
  const uiAppDir = path.join(targetDir, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  await injectCssTheme(uiAppDir, theme);
  await patchShUiConfig(path.join(uiAppDir, 'sh-ui.config.json'), css, themeBase);
}

async function generateApp(targetDir, appName, port, plugins, arch, css = 'tailwind') {
  // 베이스 템플릿 (arch-neutral 파일들) 만 카피 — _arch/ 디렉토리는 스킵.
  // 그 후 선택된 arch 의 오버레이를 위에 머지해 arch-coupled 파일들 (layout.tsx,
  // src/ 또는 lib+components/, tsconfig.json paths 블록 등) 을 떨어뜨린다.
  await fs.copy(path.join(TEMPLATES_DIR, 'nextjs-app'), targetDir, {
    filter: (src) => !src.includes(`${path.sep}_arch${path.sep}`) && !src.endsWith(`${path.sep}_arch`),
  });
  await ensureArchCleanup(targetDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, 'nextjs-app', '_arch', arch.name),
    targetDir,
    { overwrite: true },
  );
  await assertArchOverlayApplied(targetDir, arch);

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
  if (pkg.dependencies) pkg.dependencies = sortObjectKeys(pkg.dependencies);
  if (pkg.devDependencies) pkg.devDependencies = sortObjectKeys(pkg.devDependencies);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await writeNextConfig(targetDir, plugins, { isMonorepo: true, appName, arch });

  // Create packages/ui/ui-apps/ui-{appName}/ from ui-app-template
  const monorepoRoot = path.resolve(targetDir, '..', '..');
  const uiPkgDir = path.join(monorepoRoot, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  if (!(await fs.pathExists(uiPkgDir))) {
    await fs.copy(path.join(TEMPLATES_DIR, 'ui-app-template'), uiPkgDir);
    await replaceInAllFiles(uiPkgDir, 'ui-app-name', `ui-${appName}`);
    await replaceInAllFiles(uiPkgDir, 'app-name', appName);
  }

  await appendEnvVars(path.join(targetDir, '.env.example'), plugins);
  await writePluginFiles(targetDir, plugins, arch);
  await composeProviders(targetDir, plugins, arch);
  await applyTransforms(targetDir, plugins, arch);
  // monorepo 의 cssFramework 변종은 web app 디렉토리 + ui-app 패키지 디렉토리 양쪽에 적용.
  await applyCssFrameworkVariant(targetDir, css, { isMonorepo: true, plugins, arch });
  if (await fs.pathExists(uiPkgDir)) {
    await applyCssFrameworkVariant(uiPkgDir, css, { isMonorepo: true, plugins, arch, isUiPackage: true });
  }
}

/**
 * 베이스 템플릿 카피 직후 `_arch/` 잔여 정리.
 *
 * `fs.copy` 의 `filter` 가 어떤 환경(특히 long-running MCP daemon — fs-extra v11
 * 내부 캐시가 누적될 때) 에서 디렉토리 제외에 실패해 `_arch/{flat,fsd}/...` 가
 * 그대로 사용자 프로젝트에 들어가는 회귀가 보고됐다. 베이스 카피 직후 이 헬퍼가
 * 명시적으로 `_arch/` 를 제거해 필터 실패와 무관하게 항상 깨끗한 상태를 보장한다.
 *
 * 정상 케이스에서는 no-op (디렉토리가 이미 없으므로).
 */
async function ensureArchCleanup(targetDir) {
  const archDir = path.join(targetDir, '_arch');
  if (await fs.pathExists(archDir)) {
    await fs.remove(archDir);
  }
}

/**
 * arch 오버레이 카피 직후 핵심 파일이 떨어졌는지 검증.
 *
 * 오버레이가 부분적으로만 동작하는 회귀(같은 fs-extra 회귀와 짝을 이뤄
 * 두 번째 `fs.copy` 가 src/{app,entities,...} 를 빠뜨리는 케이스) 가 발생하면
 * 곧바로 알아챌 수 있도록 sentinel 파일 존재 검사. 실패하면 명확한 메시지로
 * throw — 한참 뒤 plugin transform 의 ENOENT 로 노출되는 것보다 진단이 쉽다.
 */
async function assertArchOverlayApplied(targetDir, arch) {
  const sentinel = `${arch.paths.layouts}/RootLayout.tsx`;
  const sentinelPath = path.join(targetDir, sentinel);
  if (!(await fs.pathExists(sentinelPath))) {
    throw new Error(
      `arch 오버레이 누락: ${arch.name} 의 sentinel 파일(${sentinel}) 이 ${targetDir} 에 없습니다. ` +
      `오버레이 카피가 정상적으로 동작하지 않은 것으로 보입니다. ` +
      `(MCP daemon 환경이라면 daemon 재시작 후 재시도 — long-running fs-extra 인스턴스의 internal state 회귀 의심.)`
    );
  }
}

// ─── Helpers ───

/**
 * 객체의 key 를 알파벳 순으로 정렬한 새 객체 반환. package.json deps 같이 사용자가
 * 자주 보는 필드의 일관된 출력에 사용.
 */
function sortObjectKeys(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * cssFramework 별 base 파일 변환.
 *
 * 베이스 템플릿은 'tailwind' 기준으로 emit 되어 있다 (글로벌 css, postcss config,
 * package.json deps, page.tsx, error.tsx 등 모두 Tailwind 가정). cssFramework 가
 * 'plain' 또는 'css-modules' 면 이 함수가 후처리로 Tailwind 의존성을 제거하고
 * inline-style / .module.css 변종으로 교체한다.
 *
 * 'tailwind' 일 때는 no-op (현재 기본값).
 */
async function applyCssFrameworkVariant(targetDir, cssFramework, { isMonorepo, plugins, arch, isUiPackage = false } = {}) {
  if (cssFramework === 'tailwind') return;
  if (cssFramework !== 'plain' && cssFramework !== 'css-modules') return;

  // 1) package.json — Tailwind deps 제거.
  const pkgPath = path.join(targetDir, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    const TAILWIND_DEPS = ['tailwindcss', '@tailwindcss/postcss', 'prettier-plugin-tailwindcss'];
    let changed = false;
    for (const key of TAILWIND_DEPS) {
      if (pkg.dependencies && key in pkg.dependencies) {
        delete pkg.dependencies[key];
        changed = true;
      }
      if (pkg.devDependencies && key in pkg.devDependencies) {
        delete pkg.devDependencies[key];
        changed = true;
      }
    }
    if (changed) await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }

  // 2) postcss.config.mjs — Tailwind plugin 제거. plain/cssmodules 둘 다 비움.
  // (Next.js 가 css-modules 는 자동 처리)
  const postcssPath = path.join(targetDir, 'postcss.config.mjs');
  if (await fs.pathExists(postcssPath)) {
    if (isUiPackage) {
      // ui 패키지의 postcss.config.mjs 는 host app 의 것을 re-export — 비워두면 안 됨.
      // 비-tailwind 일 땐 빈 plugins 객체로 교체.
      await fs.writeFile(postcssPath, `const config = {\n  plugins: {},\n};\n\nexport default config;\n`);
    } else {
      await fs.writeFile(postcssPath, `const config = {\n  plugins: {},\n};\n\nexport default config;\n`);
    }
  }

  // 3) globals.css — Tailwind import + @theme inline 제거. 토큰 import + 기본 reset 만.
  const globalsCandidates = [
    path.join(targetDir, 'app/globals.css'),
    path.join(targetDir, 'src/styles/globals.css'),
  ];
  for (const globals of globalsCandidates) {
    if (await fs.pathExists(globals)) {
      // tokens.css 위치 결정 — globals.css 와 같은 directory 내 또는 인접.
      // standalone fsd: app/globals.css 와 src/shared/styles/tokens.css → '../src/shared/styles/tokens.css'
      // standalone flat: app/globals.css 와 lib/styles/tokens.css → '../lib/styles/tokens.css'
      // ui-app-template (monorepo ui pkg): src/styles/globals.css ↔ src/styles/tokens.css → './tokens.css'
      // 기존 globals.css 의 import 줄을 보존해 그대로 사용 (이미 정확한 상대경로).
      const existing = await fs.readFile(globals, 'utf-8');
      const tokenImport = existing
        .split('\n')
        .find((l) => /@import\s+['"][^'"]+tokens\.css['"]/.test(l));
      const newContent = `${tokenImport ?? "@import './tokens.css';"}

/* Plain CSS — Tailwind 미사용. tokens.css 의 변수만 노출. */
body {
  margin: 0;
  min-height: 100vh;
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  background: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
`;
      await fs.writeFile(globals, newContent);
    }
  }

  // 4) ui 패키지면 여기까지. host app 의 page/error 변환은 host 디렉토리에서만.
  if (isUiPackage) return;

  // 5) page.tsx — Tailwind 클래스 → inline-style (plain) 또는 .module.css (cssmodules).
  // 위치는 plugin 활성 여부에 따라 달라짐.
  const intlActive = plugins?.some((p) => p.name === 'next-intl');
  const pageCandidates = intlActive
    ? [path.join(targetDir, 'app/[locale]/page.tsx')]
    : [path.join(targetDir, 'app/page.tsx')];

  for (const pagePath of pageCandidates) {
    if (!(await fs.pathExists(pagePath))) continue;
    if (cssFramework === 'plain') {
      await fs.writeFile(pagePath, `export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.25rem', fontWeight: 700, margin: 0 }}>
        Hello World
      </h1>
    </main>
  );
}
`);
    } else {
      // css-modules
      const dir = path.dirname(pagePath);
      await fs.writeFile(path.join(dir, 'page.module.css'), `.main {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
}
`);
      await fs.writeFile(pagePath, `import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Hello World</h1>
    </main>
  );
}
`);
    }
  }

  // 6) sentry plugin 의 error.tsx 변환 — Tailwind 클래스가 박혀있어서 plain/cssmodules 에서 작동 안 함.
  // intl + sentry 면 nextIntl 이 [locale]/error.tsx 를 i18n-aware 로 replace 하므로 그것도 변환.
  const sentryActive = plugins?.some((p) => p.name === 'sentry');
  if (sentryActive) {
    const errorCandidates = intlActive
      ? [path.join(targetDir, 'app/[locale]/error.tsx')]
      : [path.join(targetDir, 'app/error.tsx')];
    for (const errPath of errorCandidates) {
      if (!(await fs.pathExists(errPath))) continue;
      const useI18n = intlActive;
      await fs.writeFile(errPath, buildErrorTsxNonTailwind({ useI18n, cssFramework, arch }));
      if (cssFramework === 'css-modules') {
        await fs.writeFile(
          path.join(path.dirname(errPath), 'error.module.css'),
          buildErrorModuleCss(),
        );
      }
    }
  }

  // 7) .prettierrc — tailwind plugin 제거.
  await stripTailwindFromPrettier(path.join(targetDir, '.prettierrc'));

  // 8) monorepo 인 경우 root .prettierrc 와 root package.json 도 정리 (root 의 prettier-plugin-tailwindcss).
  // applyCssFrameworkVariant 는 apps/web 마다 호출되지만 root 정리는 1회면 충분 — idempotent 라 OK.
  if (isMonorepo && !isUiPackage) {
    const monorepoRoot = path.resolve(targetDir, '..', '..');
    await stripTailwindFromPrettier(path.join(monorepoRoot, '.prettierrc'));
    const rootPkgPath = path.join(monorepoRoot, 'package.json');
    if (await fs.pathExists(rootPkgPath)) {
      const rootPkg = await fs.readJson(rootPkgPath);
      const TAILWIND_DEPS = ['prettier-plugin-tailwindcss'];
      let changed = false;
      for (const key of TAILWIND_DEPS) {
        if (rootPkg.devDependencies && key in rootPkg.devDependencies) {
          delete rootPkg.devDependencies[key];
          changed = true;
        }
      }
      if (changed) await fs.writeJson(rootPkgPath, rootPkg, { spaces: 2 });
    }
  }
}

async function stripTailwindFromPrettier(prettierPath) {
  if (!(await fs.pathExists(prettierPath))) return;
  const c = await fs.readJson(prettierPath);
  if (!Array.isArray(c.plugins)) return;
  c.plugins = c.plugins.filter((p) => p !== 'prettier-plugin-tailwindcss');
  if (c.plugins.length === 0) delete c.plugins;
  await fs.writeJson(prettierPath, c, { spaces: 2 });
}

/**
 * sentry 의 error.tsx 를 plain/cssmodules 로 변환한 콘텐츠 생성.
 * useI18n=true 면 next-intl 의 useTranslations + Link 사용.
 */
function buildErrorTsxNonTailwind({ useI18n, cssFramework, arch }) {
  const i18nImports = useI18n
    ? `import { useTranslations } from 'next-intl';\n`
    : '';
  const configAlias = arch ? arch.aliases.config : '@/src/shared/config';
  const linkImport = useI18n
    ? `import { Link } from '${configAlias}/i18n/navigation';\n`
    : `import Link from 'next/link';\n`;
  const tHook = useI18n ? `  const t = useTranslations('error');\n` : '';
  const titleText = useI18n ? `{t('title')}` : `오류가 발생했습니다`;
  const descText = useI18n
    ? `{t('description')}`
    : `예상치 못한 오류가 발생했습니다. 다시 시도해주세요.`;
  const fallback = useI18n ? `t('unexpectedError')` : `'알 수 없는 오류'`;
  const tryAgain = useI18n ? `{t('button.tryAgain')}` : `다시 시도`;
  const goHome = useI18n ? `{t('button.goHome')}` : `홈으로 이동`;

  if (cssFramework === 'css-modules') {
    return `'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
${i18nImports}${linkImport}import { useEffect } from 'react';

import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
${tHook}  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconRow}>
          <div className={styles.iconCircle}>
            <AlertTriangle className={styles.icon} />
          </div>
        </div>

        <h2 className={styles.title}>${titleText}</h2>
        <p className={styles.description}>${descText}</p>

        <div className={styles.errorBox}>
          <p className={styles.errorText}>{error.message || ${fallback}}</p>
        </div>

        <div className={styles.actions}>
          <button onClick={reset} className={styles.primaryButton}>
            <RefreshCw className={styles.buttonIcon} />
            ${tryAgain}
          </button>

          <Link href='/' className={styles.secondaryButton}>
            <Home className={styles.buttonIcon} />
            ${goHome}
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className={styles.digest}>
            <p className={styles.digestText}>Error ID: {error.digest}</p>
          </div>
        )}
      </div>
    </div>
  );
}
`;
  }

  // plain — inline style (토큰 var 활용)
  return `'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
${i18nImports}${linkImport}import { useEffect } from 'react';

const wrapper: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 16px',
};
const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 448,
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--background)',
  padding: 24,
  boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.15))',
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
${tHook}  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div style={wrapper}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle style={{ width: 32, height: 32, color: 'var(--danger)' }} />
          </div>
        </div>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--foreground)',
            margin: '0 0 8px',
          }}
        >
          ${titleText}
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--foreground-muted)',
            textAlign: 'center',
            margin: '0 0 24px',
          }}
        >
          ${descText}
        </p>

        <div
          style={{
            borderRadius: 6,
            border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
            background: 'color-mix(in srgb, var(--danger) 5%, transparent)',
            padding: 12,
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--danger)', margin: 0 }}>
            {error.message || ${fallback}}
          </p>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={reset}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            ${tryAgain}
          </button>

          <Link
            href='/'
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <Home style={{ width: 16, height: 16 }} />
            ${goHome}
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <div
            style={{
              marginTop: 16,
              borderRadius: 6,
              background: 'var(--background-subtle)',
              padding: 12,
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--foreground-subtle)', margin: 0 }}>
              Error ID: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

function buildErrorModuleCss() {
  return `.wrapper {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.card {
  width: 100%;
  max-width: 448px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--background);
  padding: 24px;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.15));
}

.iconRow {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.iconCircle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 32px;
  height: 32px;
  color: var(--danger);
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: var(--foreground);
  margin: 0 0 8px;
}

.description {
  font-size: 14px;
  color: var(--foreground-muted);
  text-align: center;
  margin: 0 0 24px;
}

.errorBox {
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  background: color-mix(in srgb, var(--danger) 5%, transparent);
  padding: 12px;
}

.errorText {
  font-size: 14px;
  color: var(--danger);
  margin: 0;
}

.actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primaryButton,
.secondaryButton {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}

.primaryButton {
  border: none;
  background: var(--primary);
  color: var(--primary-foreground);
}

.secondaryButton {
  border: 1px solid var(--border);
  color: var(--foreground);
  background: transparent;
}

.buttonIcon {
  width: 16px;
  height: 16px;
}

.digest {
  margin-top: 16px;
  border-radius: 6px;
  background: var(--background-subtle);
  padding: 12px;
}

.digestText {
  font-size: 12px;
  color: var(--foreground-subtle);
  margin: 0;
}
`;
}

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

async function writeNextConfig(targetDir, plugins, { isMonorepo, appName, arch }) {
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
    const pluginPreExport = resolveArchField(plugin.preExport, arch);
    if (pluginPreExport) preExport.push(...pluginPreExport);
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

/**
 * 플러그인 manifest 의 함수형 필드를 arch 디스크립터로 평가해 정적 값으로 변환.
 * Layer 1 에서는 모든 플러그인이 정적이라 사실상 no-op 분기. Layer 2 에서 플러그인이
 * `files: (arch) => ({...})` 형태로 전환되면 이 헬퍼가 함수를 호출해 평가한다.
 *
 * arch 가 null (flutter 경로) 일 때는 함수형 필드는 빈 값으로 fallback —
 * Flutter 에는 next-arch 가 없으므로 이런 플러그인이 호출되지 않아야 정상이지만
 * 방어적 처리.
 */
function resolveArchField(field, arch) {
  if (typeof field === 'function') return field(arch);
  return field;
}

async function writePluginFiles(targetDir, plugins, arch) {
  for (const plugin of plugins) {
    const files = resolveArchField(plugin.files, arch);
    if (files) {
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(targetDir, filePath);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, content);
      }
    }
  }

  // auth-jwt + next-intl 동시 활성화 시 proxy.ts 병합
  // (각 플러그인이 단독으로 깐 proxy.ts 를 합친 버전으로 덮어쓴다)
  // i18n routing import 는 arch.aliases.config 기준 — FSD 면 @/src/shared/config,
  // flat 이면 @/lib/config 로 해석.
  const names = new Set(plugins.map((p) => p.name));
  if (names.has('auth-jwt') && names.has('next-intl')) {
    const configAlias = arch ? arch.aliases.config : '@/src/shared/config';
    const mergedProxy = `import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from '${configAlias}/i18n/routing';

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

async function composeProviders(targetDir, plugins, arch) {
  const extraImports = [];
  const wrappers = [];

  for (const plugin of plugins) {
    const providerImports = resolveArchField(plugin.providerImports, arch);
    const providerWrappers = resolveArchField(plugin.providerWrappers, arch);
    if (providerImports) extraImports.push(...providerImports);
    if (providerWrappers) wrappers.push(...providerWrappers);
  }

  if (extraImports.length === 0 && wrappers.length === 0) return;

  // GlobalProvider 위치는 arch.paths.providers 기준 — Layer 2 에서 플러그인이
  // arch.aliases.providers 를 import 에 사용하게 되면 이 경로도 일관됨.
  // arch 미지정 (legacy) 시 FSD 디폴트 fallback.
  const providersDir = arch ? arch.paths.providers : 'src/app/providers';
  const globalProviderPath = path.join(targetDir, providersDir, 'GlobalProvider', 'index.tsx');
  if (!(await fs.pathExists(globalProviderPath))) return;

  let content = await fs.readFile(globalProviderPath, 'utf-8');

  // import 추가 (파일 최상단에)
  for (const imp of extraImports) {
    if (!content.includes(imp)) {
      content = imp + '\n' + content;
    }
  }

  // wrapper 적용: <ThemeProvider>...</ThemeProvider> 블록 전체를 잡아 새 wrapper 로 감싼다.
  // 인덴트 일관성 보장 — 단순 prefix 삽입으로는 내부 라인의 들여쓰기가 wrapper 추가
  // 깊이만큼 따라 들어가지 않아 들쭉날쭉했다 (v0.59.x 까지의 이슈).
  // 이제는 블록을 통째로 매칭해 내부 모든 줄에 +2 spaces, 같은 인덴트 레벨에 wrapper
  // 태그를 두고 재구성한다.
  const blockRegex = /([ \t]*)(<ThemeProvider>[\s\S]*?<\/ThemeProvider>)/;
  for (const wrapper of wrappers) {
    if (content.includes(`<${wrapper}>`)) continue;
    const match = content.match(blockRegex);
    if (!match) continue;
    const [, indent, block] = match;
    // 블록 내부 모든 줄에 2 space 추가. 첫 줄은 아래 템플릿의 prefix 가 처리하므로
    // newline 뒤에만 spaces 를 끼워넣는다.
    const indentedBlock = block.replace(/\n/g, '\n  ');
    const replacement = [
      `${indent}<${wrapper}>`,
      `${indent}  ${indentedBlock}`,
      `${indent}</${wrapper}>`,
    ].join('\n');
    content = content.replace(blockRegex, replacement);
  }

  await fs.writeFile(globalProviderPath, content);
}

async function applyTransforms(targetDir, plugins, arch) {
  for (const plugin of plugins) {
    const transforms = resolveArchField(plugin.transforms, arch);
    if (!transforms) continue;

    for (const transform of transforms) {
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
    'src/shared/styles/tokens.css',  // FSD standalone
    'src/styles/tokens.css',          // monorepo ui-app-template (arch-neutral)
    'lib/styles/tokens.css',          // flat standalone
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
