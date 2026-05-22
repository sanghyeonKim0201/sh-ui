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
import { getTemplatesRoot, getRegistryRoot } from '../paths.mjs';
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

// 프로젝트/앱 이름을 디렉토리명으로 안전하게 쓸 수 있는지 검증.
// MCP (sh_ui_create_project / sh_ui_add_app) 는 LLM/외부 호출자가 임의의 문자열을 넘길 수
// 있는데, 그 값이 그대로 `path.resolve(parent, name)` 에 들어간다. 검증이 없으면 '../'
// 시퀀스로 부모 디렉토리를 벗어나 임의 위치에 파일 쓰기 / 기존 디렉토리 삭제(force+yes 경로)
// 까지 가능. 진입부에서 한 번 막아 두면 CLI 와 MCP 양쪽 모두 자동 차단.
export function validateProjectName(name, label = 'name') {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error(`${label} 가 비어있습니다.`);
  }
  if (name.length > 214) {
    throw new Error(`${label} 가 너무 깁니다 (최대 214자).`);
  }
  // 선행 '.' 차단 → '..', '.ssh', '.git' 등 숨김/특수 디렉토리 봉쇄.
  // 영숫자 + '.' + '_' + '-' 만 허용 → 경로 구분자('/', '\\'), NUL, 셸 메타문자 일괄 차단.
  if (name.startsWith('.') || !/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new Error(
      `${label} '${name}' 가 유효하지 않습니다 — ` +
      `영숫자, '_', '-', '.' 만 허용하며 '.' 로 시작할 수 없습니다 (디렉토리 이름만 허용, 경로 불가).`,
    );
  }
  return name;
}

// 방어 가드 — validateProjectName 이 이미 traversal 을 차단하지만, 파괴적 작업(`fs.remove`)
// 직전에 한 번 더 봉쇄해 향후 다른 진입점이 추가되거나 검증을 우회하는 코드 패스가 생겨도
// 부모 디렉토리 밖을 건드리지 않도록 보장. parent 의 진짜 하위가 아니면 throw.
function assertWithin(parent, child) {
  const rel = path.relative(parent, child);
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(
      `safety: 대상 경로 '${child}' 가 부모 '${parent}' 외부 또는 부모 그 자체입니다 — 처리 거부.`,
    );
  }
}

export async function createProject(options = {}) {
  if (!process.stdin.isTTY) {
    assertNoTtyFlag(options.name, '<project-name> (positional)');
    assertNoTtyFlag(options.platform, '--platform');
    if (options.platform === 'next' || options.platform === 'vite') {
      assertNoTtyFlag(options.structure, '--structure');
    }
  }

  const projectName = validateProjectName(
    options.name ?? await input({
      message: '프로젝트 이름:',
      default: 'my-app',
    }),
    '프로젝트 이름',
  );

  const platform = options.platform ?? await select({
    message: '플랫폼:',
    choices: [
      { name: 'Next.js', value: 'next' },
      { name: 'Vite (SPA)', value: 'vite' },
      { name: 'Flutter', value: 'flutter' },
    ],
  });

  // i18n 옵션도 vite preset 전용. v0.92.0+.
  if (options.i18n && options.i18n !== 'none' && platform !== 'vite') {
    throw new Error(
      `i18n='${options.i18n}' 은 platform=vite 일 때만 지원합니다 (현재 platform=${platform}). --i18n none 또는 --platform vite 사용.`,
    );
  }

  // arch 결정 — platform 확정 후. 사용자가 --arch 미지정 시:
  //   - next  → DEFAULT_ARCH ('fsd')
  //   - flutter → 현재 Flutter arch 디스크립터 없음 → null. 미래에 flutter arch 추가되면
  //     해당 platform 의 첫 번째 arch 또는 별도 default 로 변경.
  // 명시한 경우 platform 호환성 검증 후 디스크립터 resolve. 잘못된 조합은 친절한 에러.
  let arch = null;
  if (platform === 'next') {
    const archName = options.arch ?? DEFAULT_ARCH;
    arch = assertArchPlatformCompat(archName, 'next');
  } else if (platform === 'vite') {
    const archName = options.arch ?? DEFAULT_ARCH;  // 'fsd' default — flat 도 호환
    arch = assertArchPlatformCompat(archName, 'vite');
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

  // inPlace — 이미 커스터마이즈된 디렉토리(루트 docs·git 보존)에 비파괴 머지.
  // generation 은 dry-run 과 동일하게 tmpdir 에서 돌린 뒤, 이미 있는 파일은
  // 건드리지 않고 새 파일만 realTargetDir 로 복사한다.
  const inPlace = options.inPlace === true && !options.dryRun;
  const realTargetDir = path.resolve(process.cwd(), projectName);

  // dry-run / inPlace 는 tmpdir 에 생성. dry-run 은 목록 출력 후 정리,
  // inPlace 는 realTargetDir 로 비파괴 머지. 일반 모드는 cwd/name 에 직접 생성.
  const targetDir = options.dryRun
    ? await fs.mkdtemp(path.join(os.tmpdir(), 'sh-ui-dry-'))
    : inPlace
      ? await fs.mkdtemp(path.join(os.tmpdir(), 'sh-ui-inplace-'))
      : realTargetDir;

  // 방어 가드 — projectName 검증을 이미 통과했어도 fs 쓰기 직전에 한 번 더 확인.
  // dry-run / inPlace 의 targetDir 는 tmpdir 이므로 실제 목적지를 검증한다.
  if (!options.dryRun) {
    assertWithin(process.cwd(), realTargetDir);
  }

  // 일반 모드만 기존 디렉토리 덮어쓰기 확인. inPlace 는 비파괴라 remove 하지 않는다.
  if (!options.dryRun && !inPlace && await fs.pathExists(targetDir)) {
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

  // finalizeProject + (inPlace 면) temp → realTargetDir 비파괴 머지.
  // 세 플랫폼 경로(flutter/vite/next)가 공통으로 호출한다.
  async function finalizeAndCommit() {
    await finalizeProject(targetDir, {
      dryRun: options.dryRun,
      // inPlace 는 temp 에서 git init 해봐야 버려지므로 스킵 — realTargetDir 의
      // 기존 .git 을 그대로 둔다 (gitignore/npmrc 복원은 finalize 안에서 수행됨).
      gitInit: inPlace ? false : options.gitInit,
      locale: options.locale,
    });
    if (inPlace) {
      await fs.ensureDir(realTargetDir);
      await fs.copy(targetDir, realTargetDir, { overwrite: false, errorOnExist: false });
      await fs.remove(targetDir);
      console.log(
        `\n  ℹ inPlace — 기존 디렉토리에 비파괴 머지 완료 (이미 있는 파일은 보존).`,
      );
    }
  }

  if (platform === 'flutter') {
    await generateFlutter(targetDir, projectName, theme, cssFramework, themeBase);
    await finalizeAndCommit();
    console.log(`\n✅ ${projectName} Flutter 프로젝트가 생성되었습니다!`);
    console.log(`\n  cd ${projectName}`);
    console.log('  flutter pub get');
    console.log('  flutter run\n');
    return;
  }

  if (platform === 'vite') {
    // vite 는 next 와 동일하게 structure 옵션을 받지만 Phase 1 에서는 standalone 만 처리.
    // monorepo 는 후속 task 에서 generateMonorepo 의 platform 분기로 연결.
    const projectType = options.structure ?? await select({
      message: '프로젝트 구조:',
      choices: [
        { name: '단독 (Vite standalone)', value: 'standalone' },
        { name: '모노레포 (Turborepo + pnpm)', value: 'monorepo' },
      ],
    });

    if (projectType === 'standalone') {
      await generateViteStandalone(targetDir, projectName, theme, cssFramework, arch, themeBase, {
        i18n: options.i18n ?? 'none',
        locales: options.locales ?? 'ko,en',
      });
    } else {
      await generateMonorepo(targetDir, projectName, [], {
        yes: options.yes, theme, css: cssFramework, arch, themeBase,
        platform: 'vite',
        i18n: options.i18n ?? 'none',
        locales: options.locales ?? 'ko,en',
        appName: options.appName ?? null,
        port: options.port ?? null,
      });
    }

    await finalizeAndCommit();

    if (options.dryRun) {
      const files = await listAllFiles(targetDir);
      console.log(`\n[DRY RUN] ${projectName} 스캐폴드 시 작성될 파일 (${files.length}개):\n`);
      for (const f of files.sort()) console.log(`  ${f}`);
      await fs.remove(targetDir);
      console.log(`\n실제 스캐폴드: --dry-run 제거 후 같은 명령 실행.`);
      return;
    }

    console.log(`\n✅ ${projectName} Vite 프로젝트가 생성되었습니다!`);
    console.log(`\n  cd ${projectName}`);
    console.log('  pnpm install');
    console.log('  pnpm dev\n');
    console.log('다음 단계 — 베이스 컴포넌트 추가 (예시):');
    console.log('  npx sh-ui-cli add button card input dialog\n');
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
  // (플러그인을 쓰려면 명시적으로 --plugins next-intl 사용)
  const selectedPluginNames = options.plugins ?? [];

  const plugins = getPluginsByNames(selectedPluginNames);
  plugins.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  if (projectType === 'standalone') {
    await generateStandalone(targetDir, projectName, plugins, theme, cssFramework, arch, themeBase);
  } else {
    await generateMonorepo(targetDir, projectName, plugins, {
      yes: options.yes, theme, css: cssFramework, arch, themeBase,
      appName: options.appName ?? null,
      port: options.port ?? null,
    });
  }

  await finalizeAndCommit();

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

  // v0.82.0+ — 다음 액션이 막막한 첫-사용 경험 보강. baseline 컴포넌트를 어디서/어떻게
  // 추가할지 1줄 가이드. monorepo 는 ui-core 가 SoT, standalone 은 cwd 자체.
  if (projectType === 'monorepo') {
    console.log('다음 단계 — 베이스 컴포넌트 추가 (예시):');
    console.log(`  cd ${projectName}/packages/ui/ui-core`);
    console.log('  npx sh-ui-cli add button card input dialog\n');
    console.log('또는 MCP: sh_ui_add_component({ names: ["button", "card", "input", "dialog"] })\n');
  } else {
    console.log('다음 단계 — 베이스 컴포넌트 추가 (예시):');
    console.log('  npx sh-ui-cli add button card input dialog\n');
  }
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

/**
 * 기존 monorepo 에 새 Next.js 앱 추가 — apps/{name}/ + packages/ui/ui-apps/ui-{name}/ 동시 생성.
 *
 * 옵션 객체 시그니처 (v0.66+) — MCP `sh_ui_add_app` 와 CLI `sh-ui add-app` 모두 같은 진입점.
 * 미지정 옵션은 TTY 면 prompt, 비대화형(MCP/CI)이면 기본값 또는 에러.
 *
 * 산출물: apps/{name}/ (Next.js + arch overlay) + packages/ui/ui-apps/ui-{name}/ (tokens-only,
 * v0.65 layout) — theme 인자 주면 ui-app 의 tokens.css 에 주입, css 인자는 컴포넌트 변종 결정.
 */
export async function addApp(options = {}) {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const isMonorepo = await fs.pathExists(path.resolve(cwd, 'pnpm-workspace.yaml'));
  if (!isMonorepo) {
    const msg = '현재 디렉토리가 모노레포가 아닙니다. pnpm-workspace.yaml 이 없습니다.';
    if (!process.stdin.isTTY) throw new Error(msg);
    console.log(`❌ ${msg}`);
    return;
  }

  // 비대화형 (MCP daemon, CI) 가드 — name 만 필수. port/plugins 는 기본값.
  if (!process.stdin.isTTY && !options.name) {
    throw new Error('비대화형 환경(TTY 없음)에서는 name 이 필요합니다.');
  }

  // platform 결정 — 명시 시 그대로, 미지정 시 기존 apps/* 의 package.json 스캔으로 추론.
  let platform = options.platform;
  if (!platform) {
    platform = await inferMonorepoPlatform(cwd);
    if (!platform) {
      // 모노레포에 아직 앱이 없거나 혼재 — 안전한 디폴트 (next 가 기존 동작).
      // 첫 앱은 user 가 명시하는 게 권장 (interactive prompt).
      if (process.stdin.isTTY) {
        platform = await select({
          message: '플랫폼:',
          choices: [
            { name: 'Next.js', value: 'next' },
            { name: 'Vite (SPA)', value: 'vite' },
          ],
        });
      } else {
        platform = 'next';
      }
    }
  }
  if (platform !== 'next' && platform !== 'vite') {
    throw new Error(
      `add-app 는 platform=next 또는 vite 만 지원 (받은 값: ${platform}). flutter 는 standalone 만 지원.`,
    );
  }
  if (options.i18n && options.i18n !== 'none' && platform !== 'vite') {
    throw new Error(
      `i18n='${options.i18n}' 은 platform=vite 일 때만 지원합니다 (현재 platform=${platform}).`,
    );
  }

  const appName = validateProjectName(
    options.name ?? await input({
      message: '앱 이름:',
      default: 'web',
    }),
    '앱 이름',
  );

  const port = options.port ?? (process.stdin.isTTY
    ? await input({ message: '포트 번호:', default: '3000' })
    : '3000');

  let plugins;
  if (options.plugins) {
    plugins = getPluginsByNames(options.plugins);
  } else if (process.stdin.isTTY) {
    const selected = await checkbox({
      message: '추가 기능 선택 (Space로 선택):',
      choices: getPluginChoices(),
    });
    plugins = getPluginsByNames(selected);
  } else {
    plugins = [];
  }
  plugins.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  // theme/css resolve — createProject 와 같은 패턴.
  let theme = null;
  let themeBase = null;
  if (options.theme) {
    theme = resolveTheme(options.theme);
    themeBase = THEME_PRESET_NAMES.includes(options.theme) ? options.theme : 'custom';
  }
  const css = options.css ?? CSS_FRAMEWORK_DEFAULT;

  const appsDir = path.resolve(cwd, 'apps', appName);
  if (await fs.pathExists(appsDir)) {
    const msg = `apps/${appName} 디렉토리가 이미 존재합니다.`;
    if (!process.stdin.isTTY) throw new Error(msg);
    console.log(`❌ ${msg}`);
    return;
  }

  // arch 는 모노레포가 처음 만들어질 때 정한 값과 같아야 한다. root config 에 별도
  // 저장 안 해 두므로 일단 DEFAULT_ARCH (fsd) fallback. 향후 root config 에 arch
  // 박아두고 여기서 읽어오는 흐름으로 개선 가능.
  const arch = assertArchPlatformCompat(DEFAULT_ARCH, platform);

  if (platform === 'vite') {
    await generateViteApp(appsDir, appName, port, arch, css, {
      i18n: options.i18n ?? 'none',
      locales: options.locales ?? 'ko,en',
    });
  } else {
    await generateApp(appsDir, appName, port, plugins, arch, css);
  }

  // monorepo 의 새 ui-app 패키지 — tokens-only role + theme 주입 + cssFramework 패치.
  // generateMonorepo 의 흐름과 정확히 동일.
  const uiAppDir = path.resolve(cwd, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  if (theme) {
    await injectCssTheme(uiAppDir, theme);
  }
  await patchShUiConfig(path.join(uiAppDir, 'sh-ui.config.json'), css, themeBase);

  console.log(`\n✅ apps/${appName} 이 추가되었습니다!`);
  console.log('\n  pnpm install');
  console.log(`  pnpm --filter ${appName} dev\n`);
}

/**
 * 모노레포의 기존 apps/* 들 package.json 을 스캔해 platform 추론.
 * - 모든 앱이 vite — 'vite'
 * - 모든 앱이 next — 'next'
 * - 혼재 또는 다른 조합 — null (user 가 명시해야 함)
 * - apps/ 가 없거나 비었으면 null
 */
async function inferMonorepoPlatform(cwd) {
  const appsDir = path.resolve(cwd, 'apps');
  if (!(await fs.pathExists(appsDir))) return null;
  const entries = await fsp.readdir(appsDir, { withFileTypes: true });
  const apps = entries.filter((e) => e.isDirectory());
  if (apps.length === 0) return null;

  const platforms = new Set();
  for (const app of apps) {
    const pkgPath = path.join(appsDir, app.name, 'package.json');
    if (!(await fs.pathExists(pkgPath))) continue;
    const pkg = await fs.readJson(pkgPath);
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    if (deps.next) platforms.add('next');
    else if (deps.vite) platforms.add('vite');
  }

  if (platforms.size === 1) return [...platforms][0];
  return null;
}

// ─── Add component to ui packages ───

/**
 * 컴포넌트/토큰 추가 오케스트레이터 — monorepo 의 어느 디렉토리에서든 의도대로 라우팅.
 *
 * **v0.67+ 시그니처**: 옵션 객체 받음. `bin/sh-ui.mjs` 가 walk-up 으로 monorepo 루트를 찾아
 * 호출하고, `add()` 를 in-process 로 호출 (npx subprocess 없음 — 외부 sh-ui-cli 설치 의존 X).
 *
 * 라우팅 (monorepo, v0.65+):
 *   - `tokens` → `packages/ui/ui-apps/ui-{hintApp 또는 app 또는 prompt 또는 단일}`
 *   - 그 외(컴포넌트/훅/lib) → `packages/ui/ui-core` 단일 SoT
 *
 * v0.64.x 호환: ui-core/sh-ui.config.json 부재 시 모든 add 는 ui-apps/ui-{app} 으로 폴백.
 *
 * @param {Object} options
 * @param {string} [options.cwd]                  monorepo 루트. 기본 process.cwd()
 * @param {string[]} options.names                추가할 이름들 (예: ['button', 'tokens'])
 * @param {string|null} [options.app]             명시적 --app 플래그 (있으면 hintApp 무시)
 * @param {string|null} [options.hintApp]         walk-up 결과의 힌트 (apps/web → 'web')
 * @param {boolean} [options.skipInstall]
 * @param {boolean} [options.diffMode]
 * @param {string} [options.onConflict]           'prompt' | 'keep' | 'overwrite'
 */
export async function addComponent(options = {}) {
  const { add } = await import('../add.mjs');

  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const names = (options.names ?? []).filter(Boolean);
  const app = options.app ?? null;
  const hintApp = options.hintApp ?? null;
  const skipInstall = options.skipInstall === true;
  const diffMode = options.diffMode === true;
  const onConflict = options.onConflict ?? 'prompt';

  if (names.length === 0) {
    if (!process.stdin.isTTY) {
      throw new Error('비대화형 환경(TTY 없음)에서는 추가할 이름이 필요합니다.');
    }
    const single = await input({ message: '컴포넌트 이름:' });
    names.push(single);
  }

  const isMonorepo = await fs.pathExists(path.join(cwd, 'pnpm-workspace.yaml'));
  if (!isMonorepo) {
    // Standalone: cwd 자체가 sh-ui.config.json 보유 — 그대로 add 호출.
    await add({ cwd, names, skipInstall, diffMode, onConflict });
    return;
  }

  const uiCoreDir = path.join(cwd, 'packages', 'ui', 'ui-core');
  const uiAppsDir = path.join(cwd, 'packages', 'ui', 'ui-apps');
  const hasUiCore = await fs.pathExists(path.join(uiCoreDir, 'sh-ui.config.json'));
  const hasUiApps = await fs.pathExists(uiAppsDir);

  if (!hasUiCore && !hasUiApps) {
    throw new Error('packages/ui/ui-core 또는 packages/ui/ui-apps/ 디렉토리가 없습니다.');
  }

  // 이름을 라우팅 그룹별로 분리: tokens → ui-app, 그 외 → ui-core.
  const tokenNames = names.filter((n) => n === 'tokens');
  const componentNames = names.filter((n) => n !== 'tokens');

  // ─── 비-tokens → ui-core (또는 v0.64.x fallback 시 ui-apps) ───
  if (componentNames.length > 0) {
    if (hasUiCore) {
      if (app) {
        console.log(
          `ℹ️  v0.65+ 에서 컴포넌트는 packages/ui/ui-core 에 단일 emit (--app ${app} 무시).`,
        );
      }
      console.log(`\n📦 packages/ui/ui-core ← ${componentNames.join(', ')}`);
      await add({ cwd: uiCoreDir, names: componentNames, skipInstall, diffMode, onConflict });
    } else {
      // v0.64.x 호환: ui-core 없으니 모든 ui-app 에 컴포넌트 직접 emit (구 동작).
      const targets = await pickUiAppTargets({ uiAppsDir, app, hintApp, kind: 'component' });
      for (const pkg of targets) {
        const pkgDir = path.join(uiAppsDir, pkg);
        console.log(`\n📦 packages/ui/ui-apps/${pkg} ← ${componentNames.join(', ')}`);
        await add({ cwd: pkgDir, names: componentNames, skipInstall, diffMode, onConflict });
      }
    }
  }

  // ─── tokens → ui-app(s) ───
  if (tokenNames.length > 0) {
    if (!hasUiApps) {
      throw new Error('tokens 추가에는 packages/ui/ui-apps/ 가 필요합니다.');
    }
    const targets = await pickUiAppTargets({ uiAppsDir, app, hintApp, kind: 'tokens' });
    for (const pkg of targets) {
      const pkgDir = path.join(uiAppsDir, pkg);
      console.log(`\n📦 packages/ui/ui-apps/${pkg} ← tokens`);
      await add({ cwd: pkgDir, names: tokenNames, skipInstall, diffMode, onConflict });
    }
  }

  console.log('\n✅ 추가 완료');
}

/**
 * monorepo 의 ui-app 패키지 후보를 정해 1+ 개 반환.
 *
 * 우선순위:
 *   1. 명시적 `--app` 플래그
 *   2. walk-up 결과의 hintApp (apps/<name>/ 또는 ui-apps/ui-<name>/ 컨텍스트)
 *   3. 단일 ui-app 만 존재 → 자동 선택
 *   4. TTY → 사용자에게 select prompt
 *   5. 비대화형 + 다중 ui-app → tokens 는 'all', 컴포넌트(v0.64.x fallback)는 throw
 */
async function pickUiAppTargets({ uiAppsDir, app, hintApp, kind }) {
  const entries = await fs.readdir(uiAppsDir, { withFileTypes: true });
  const uiPackages = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('ui-') && e.name !== 'ui-app-template')
    .map((e) => e.name);

  if (uiPackages.length === 0) {
    throw new Error('packages/ui/ui-apps/ui-* 패키지가 없습니다.');
  }

  if (app) {
    const pkgName = `ui-${app}`;
    if (!uiPackages.includes(pkgName)) {
      throw new Error(
        `packages/ui/ui-apps/${pkgName} 이 존재하지 않습니다. 사용 가능: ${uiPackages.join(', ')}`,
      );
    }
    return [pkgName];
  }

  if (hintApp) {
    const pkgName = `ui-${hintApp}`;
    if (uiPackages.includes(pkgName)) {
      return [pkgName];
    }
    // hintApp 이 가리키는 앱의 ui-패키지가 없으면 일반 흐름으로 떨어짐 (드문 케이스).
  }

  if (uiPackages.length === 1) {
    return uiPackages;
  }

  if (!process.stdin.isTTY) {
    if (kind === 'tokens') {
      // 비대화형 + 다중 ui-app + tokens: 모든 앱에 적용 (가장 안전한 기본값).
      return uiPackages;
    }
    throw new Error(
      `여러 ui-app 후보 (${uiPackages.join(', ')}) — 비대화형 환경에서는 --app 으로 명시하세요.`,
    );
  }

  const choice = await select({
    message: kind === 'tokens' ? '어느 ui 패키지에 토큰을 추가할까요?' : '어디에 추가할까요?',
    choices: [
      { name: '모든 ui 패키지', value: 'all' },
      ...uiPackages.map((name) => ({ name: `packages/ui/ui-apps/${name}`, value: name })),
    ],
  });
  return choice === 'all' ? uiPackages : [choice];
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

async function generateViteStandalone(targetDir, projectName, theme, css, arch, themeBase, { i18n = 'none', locales = 'ko,en' } = {}) {
  // 베이스 (arch-neutral) + arch 오버레이 — generateStandalone 과 같은 패턴.
  await fs.copy(path.join(TEMPLATES_DIR, 'vite-standalone'), targetDir, {
    filter: (src) => !src.includes(`${path.sep}_arch${path.sep}`) && !src.endsWith(`${path.sep}_arch`),
  });
  await ensureArchCleanup(targetDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, 'vite-standalone', '_arch', arch.name),
    targetDir,
    { overwrite: true },
  );
  // vite 는 모든 소스가 src/ 아래 — arch.paths.layouts(next 관용) 앞에 src/ 를 붙여
  // sentinel 위치를 보정한다. flat 의 components/layouts → src/components/layouts,
  // fsd 의 src/app/layouts → src/app/layouts (변화 없음 — fsd 가 이미 src/ 박혀 있음).
  const layoutsPath = arch.paths.layouts.startsWith('src/')
    ? arch.paths.layouts
    : `src/${arch.paths.layouts}`;
  const sentinelPath = path.join(targetDir, `${layoutsPath}/RootLayout.tsx`);
  if (!(await fs.pathExists(sentinelPath))) {
    throw new Error(
      `arch 오버레이 누락: vite-standalone + ${arch.name} 의 sentinel 파일(${layoutsPath}/RootLayout.tsx) 이 ${targetDir} 에 없습니다.`,
    );
  }

  // package.json — name + dep sort
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;
  if (pkg.dependencies) pkg.dependencies = sortObjectKeys(pkg.dependencies);
  if (pkg.devDependencies) pkg.devDependencies = sortObjectKeys(pkg.devDependencies);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await applyCssFrameworkVariant(targetDir, css, { isMonorepo: false, plugins: [], arch });
  await injectCssTheme(targetDir, theme);
  await patchShUiConfig(path.join(targetDir, 'sh-ui.config.json'), css, themeBase);

  if (i18n === 'react-i18next') {
    const localesArr = parseLocales(locales);
    await emitI18n(targetDir, { arch, locales: localesArr });
  }
}

/**
 * react-i18next 셋업을 emit. arch 에 따라 경로가 달라짐:
 *  - fsd: src/shared/i18n/* + src/app/providers/I18nProvider.tsx
 *  - flat: src/lib/i18n/* + src/components/providers/I18nProvider.tsx
 *
 * 1. i18n/config.ts + i18n/index.ts + locales/{locale}/common.json 생성
 * 2. providers/I18nProvider.tsx 생성 (<I18nextProvider> wrapper)
 * 3. GlobalProvider/index.tsx 를 I18nProvider 로 wrapping 하도록 rewrite
 * 4. package.json 에 i18next 패키지 deps 추가
 *
 * @param {string} targetDir — 앱 디렉토리 (standalone 이면 프로젝트 루트, monorepo 이면 apps/{name}/)
 * @param {object} opts
 * @param {object} opts.arch — arch descriptor (name + paths/aliases)
 * @param {string[]} opts.locales — 생성할 locale 코드 배열 (예: ['ko', 'en'])
 */
async function emitI18n(targetDir, { arch, locales }) {
  if (!locales || locales.length === 0) {
    throw new Error('emitI18n: locales 배열이 비어 있습니다.');
  }

  const isFsd = arch.name === 'fsd';
  const i18nDirRel = isFsd ? 'src/shared/i18n' : 'src/lib/i18n';
  const i18nAlias = isFsd ? '@/shared/i18n' : '@/lib/i18n';
  const providersDirRel = isFsd ? 'src/app/providers' : 'src/components/providers';
  const apiAlias = isFsd ? '@/shared/api/queryClient' : '@/lib/api/queryClient';

  const i18nDir = path.join(targetDir, i18nDirRel);
  await fs.ensureDir(i18nDir);
  await fs.ensureDir(path.join(i18nDir, 'locales'));

  const localesArr = JSON.stringify(locales);
  const fallbackLng = locales[0];
  const configTs = `import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// 클라이언트 측 lazy-load — 빌드 산출물에서 public/locales/{lng}/{ns}.json 경로로 fetch.
// 원본 locale 파일은 ${i18nDirRel}/locales/* 에 두고, vite-plugin-static-copy 가
// dev/build 양쪽에서 public/locales/* 로 자동 미러링한다 (vite.config.ts 참고).

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: '${fallbackLng}',
    supportedLngs: ${localesArr},
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
`;
  await fs.writeFile(path.join(i18nDir, 'config.ts'), configTs);

  await fs.writeFile(
    path.join(i18nDir, 'index.ts'),
    `export { default } from './config';\n`,
  );

  // locale 별 시드 — 같은 key 를 모든 locale 에 emit (translator 가 무엇을 채워야 하는지 즉시 보임).
  // 핵심 locale (ko, en) 만 사람-언어 값, 그 외 locale 은 영어 placeholder.
  const seedByLocale = {
    ko: { greeting: '안녕하세요', app_title: 'sh-ui 앱' },
    en: { greeting: 'Hello', app_title: 'sh-ui app' },
  };
  const fallbackSeed = { greeting: 'Hello', app_title: 'sh-ui app' };
  for (const lng of locales) {
    const localeDir = path.join(i18nDir, 'locales', lng);
    await fs.ensureDir(localeDir);
    const seed = seedByLocale[lng] ?? fallbackSeed;
    await fs.writeFile(
      path.join(localeDir, 'common.json'),
      JSON.stringify(seed, null, 2) + '\n',
    );
  }

  const providersDir = path.join(targetDir, providersDirRel);
  await fs.ensureDir(providersDir);
  const i18nProvider = `import { type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '${i18nAlias}';

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
`;
  await fs.writeFile(path.join(providersDir, 'I18nProvider.tsx'), i18nProvider);

  const globalProviderPath = path.join(targetDir, providersDirRel, 'GlobalProvider', 'index.tsx');
  const globalProvider = `import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { createQueryClient } from '${apiAlias}';
import { ThemeProvider } from '../theme/ThemeProvider';
import { I18nProvider } from '../I18nProvider';

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  return (
    <I18nProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
`;
  await fs.writeFile(globalProviderPath, globalProvider);

  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.dependencies = pkg.dependencies ?? {};
  pkg.dependencies['i18next'] = '^23.15.1';
  pkg.dependencies['i18next-browser-languagedetector'] = '^8.0.0';
  pkg.dependencies['i18next-http-backend'] = '^2.7.1';
  pkg.dependencies['react-i18next'] = '^15.1.0';
  pkg.dependencies = sortObjectKeys(pkg.dependencies);
  pkg.devDependencies = pkg.devDependencies ?? {};
  // dev/build 양쪽에서 src/shared/i18n/locales/* (또는 src/lib/i18n/locales/*) 를
  // public/locales/* 로 자동 미러 → i18next-http-backend 의 /locales/{{lng}}/{{ns}}.json 이 동작.
  pkg.devDependencies['vite-plugin-static-copy'] = '^3.2.0';
  pkg.devDependencies = sortObjectKeys(pkg.devDependencies);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  // vite.config.ts 에 vite-plugin-static-copy 삽입.
  await patchViteConfigForI18n(targetDir, { i18nDirRel });

  // 랜딩 컴포넌트 (Home.tsx 또는 fsd 의 src/app/App.tsx) 가 i18n 을 즉시 사용하도록 패치.
  // v0.94 에서 ko 시드가 '안녕하세요' 로 들어가니 첫 화면이 한국어로 떠 사용자가 i18n 동작을 즉시 인지 (피드백 #2/#3).
  await patchLandingForI18n(targetDir, { arch });
}

/**
 * i18n 활성화 시 첫 화면을 `useTranslation` 으로 바꾸어 'greeting' 키를 사용한다.
 * 이 patch 가 없으면 사용자가 i18n 셋업이 동작하는지 즉시 확인할 길이 없음.
 *
 * 대상 파일 (존재하는 첫 번째):
 *   - fsd + vite-standalone: src/app/App.tsx  (inline `<h1>Hello World</h1>`)
 *   - fsd + vite-app(monorepo): src/Home.tsx  (App.tsx 가 <Home /> import)
 *   - flat: src/Home.tsx
 *
 * 이미 useTranslation 을 쓰고 있으면 no-op (재진입 안전).
 * 형태가 예상과 다르면 silent skip — 사용자 코드를 깨뜨리지 않는 게 우선.
 */
async function patchLandingForI18n(targetDir, { arch }) {
  const candidates =
    arch.name === 'fsd'
      ? [
          path.join(targetDir, 'src/Home.tsx'),       // vite-app monorepo
          path.join(targetDir, 'src/app/App.tsx'),    // vite-standalone fsd
        ]
      : [
          path.join(targetDir, 'src/Home.tsx'),       // flat (vite-app + vite-standalone 공통)
        ];

  for (const filePath of candidates) {
    if (!(await fs.pathExists(filePath))) continue;
    let src = await fs.readFile(filePath, 'utf-8');
    if (src.includes('useTranslation')) continue; // 이미 적용됨

    // 형태가 예상과 다르면 (Hello World 가 없으면) skip.
    if (!src.includes('Hello World')) continue;

    // 1) import { useTranslation } from 'react-i18next' 를 import 블록 뒤에 (없으면 파일 맨 앞에) 추가.
    const i18nImport = `import { useTranslation } from 'react-i18next';\n`;
    const lastImportIdx = src.lastIndexOf('import ');
    if (lastImportIdx >= 0) {
      const importLineEnd = src.indexOf('\n', lastImportIdx) + 1;
      src = src.slice(0, importLineEnd) + i18nImport + src.slice(importLineEnd);
    } else {
      // import 없는 파일 (flat Home.tsx) — 파일 맨 앞에 import + 빈 줄.
      src = i18nImport + '\n' + src;
    }

    // 2) 컴포넌트 함수 본문 첫 줄에 `const { t } = useTranslation();` 추가.
    //    export default function ... () {  또는  export default function ... () {\n...return (
    //    형태를 가정. 매치 실패 시 silent skip.
    const fnMatch = src.match(/export default function \w+\s*\([^)]*\)\s*\{\n/);
    if (!fnMatch) continue;
    const insertAt = fnMatch.index + fnMatch[0].length;
    src = src.slice(0, insertAt) + `  const { t } = useTranslation();\n` + src.slice(insertAt);

    // 3) Hello World 텍스트를 {t('greeting')} 으로 치환.
    src = src.replace(/Hello World/g, "{t('greeting')}");

    await fs.writeFile(filePath, src);
  }
}

/**
 * vite.config.ts 의 `plugins: [ ... ]` 배열에서 top-level entry 들을 분리해
 * 새 entry 를 append 한 뒤 canonical 멀티라인 형태로 재방출한다.
 *
 * - balanced bracket 으로 outer `]` 를 찾으므로 `viteStaticCopy({ targets: [...] })`
 *   처럼 안쪽에 `[]` 가 있어도 안전.
 * - i18n 의 viteStaticCopy 처럼 nested `[]` 를 가진 plugin 을 append 할 때
 *   anchor 경합으로 entry 가 안쪽 배열에 inject 되던 v0.92~0.95 회귀의 원인을 제거.
 *
 * 입력 src 가 예상 형태가 아니면 (`plugins: [` 못 찾음 / unbalanced bracket)
 * `null` 을 반환 → 호출부에서 patch 포기.
 *
 * @param {string} src — vite.config.ts 전체 소스
 * @param {string} callSource — 추가할 plugin 호출 소스 (예: "viteStaticCopy({ ... })"). 선행 indent / 후행 comma 없이 entry 본문만.
 * @returns {string | null}
 */
function appendVitePluginEntry(src, callSource) {
  const openMatch = src.match(/plugins:\s*\[/);
  if (!openMatch) return null;

  // plugins: 라인의 들여쓰기 추출 → 안쪽 entry 는 한 단계(=2 space) 더 깊게.
  const pluginsLineStart = src.lastIndexOf('\n', openMatch.index) + 1;
  const pluginsIndent = src.slice(pluginsLineStart, openMatch.index).match(/^[ \t]*/)[0];
  const entryIndent = pluginsIndent + '  ';

  const arrStart = openMatch.index + openMatch[0].length; // `[` 직후
  // balanced bracket walk — `]` 깊이 0 지점이 outer 닫는 `]`.
  let depth = 1;
  let i = arrStart;
  let inStr = null;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (inStr) {
      if (ch === '\\' && i + 1 < src.length) { i += 2; continue; }
      if (ch === inStr) inStr = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; i++; continue; }
    if (ch === '[' || ch === '(' || ch === '{') depth++;
    else if (ch === ']' || ch === ')' || ch === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  if (depth !== 0) return null;
  const arrEnd = i; // outer `]` 의 인덱스

  const inner = src.slice(arrStart, arrEnd);
  const entries = splitTopLevelPluginEntries(inner);
  entries.push(callSource);

  const rebuilt =
    '\n' +
    entries.map((e) => entryIndent + e).join(',\n') +
    ',\n' +
    pluginsIndent;
  return src.slice(0, arrStart) + rebuilt + src.slice(arrEnd);
}

/**
 * plugins 배열 내부 문자열을 top-level `,` 기준으로 split.
 * `()` `[]` `{}` 와 문자열 리터럴 ('`, ', ") 안의 `,` 는 무시.
 *
 * @param {string} s
 * @returns {string[]}
 */
function splitTopLevelPluginEntries(s) {
  const entries = [];
  let depth = 0;
  let inStr = null;
  let buf = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      buf += ch;
      if (ch === '\\' && i + 1 < s.length) { buf += s[i + 1]; i++; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; buf += ch; continue; }
    if (ch === '(' || ch === '[' || ch === '{') { depth++; buf += ch; continue; }
    if (ch === ')' || ch === ']' || ch === '}') { depth--; buf += ch; continue; }
    if (ch === ',' && depth === 0) {
      const t = buf.trim();
      if (t) entries.push(t);
      buf = '';
      continue;
    }
    buf += ch;
  }
  const t = buf.trim();
  if (t) entries.push(t);
  return entries;
}

/**
 * vite.config.ts 의 plugins 배열에 vite-plugin-static-copy 호출을 삽입한다.
 * i18n 의 locale 파일 (src/shared/i18n/locales/* 등) 을 public/locales/* 로 자동 미러.
 *
 * 이미 같은 호출이 있으면 no-op. parsing 실패하면 사용자에게 수동 작업을 알리고 abort 하지 않는다.
 */
async function patchViteConfigForI18n(targetDir, { i18nDirRel }) {
  const viteConfigPath = path.join(targetDir, 'vite.config.ts');
  if (!(await fs.pathExists(viteConfigPath))) return;
  let src = await fs.readFile(viteConfigPath, 'utf-8');

  if (src.includes('vite-plugin-static-copy')) {
    return; // 이미 셋업됨 (재진입 안전).
  }

  const importLine = `import { viteStaticCopy } from 'vite-plugin-static-copy';`;
  // 다른 import 블록 뒤에 삽입.
  const lastImportIdx = src.lastIndexOf('import ');
  const insertImportAt = src.indexOf('\n', lastImportIdx) + 1;
  src = src.slice(0, insertImportAt) + importLine + '\n' + src.slice(insertImportAt);

  // entry 본문만 넘기고 indent / 후행 comma 는 helper 가 붙인다.
  const pluginCall = `viteStaticCopy({
      // i18n locale 파일을 public/locales 로 미러 — i18next-http-backend 의 loadPath 와 매칭.
      targets: [
        { src: '${i18nDirRel}/locales/*', dest: 'locales' },
      ],
    })`;

  const patched = appendVitePluginEntry(src, pluginCall);
  if (!patched) return; // 형태가 예상과 다르면 patch 포기 — config 가 깨지지 않도록.
  src = patched;

  await fs.writeFile(viteConfigPath, src);
}

/**
 * locales 인자 (string or string[]) 를 정규화. comma-separated 또는 array 모두 받음.
 * 빈 값 / 잘못된 형식이면 디폴트 ['ko', 'en'] fallback.
 */
function parseLocales(input) {
  let arr;
  if (Array.isArray(input)) arr = input;
  else if (typeof input === 'string') arr = input.split(',');
  else arr = ['ko', 'en'];
  const cleaned = arr.map((s) => s.trim().toLowerCase()).filter((s) => /^[a-z]{2}(-[a-z]{2})?$/i.test(s));
  return cleaned.length > 0 ? cleaned : ['ko', 'en'];
}

async function generateMonorepo(targetDir, projectName, plugins, { yes = false, theme, css, arch, themeBase, platform = 'next', i18n = 'none', locales = 'ko,en', appName: appNameOpt = null, port: portOpt = null } = {}) {
  await fs.copy(path.join(TEMPLATES_DIR, 'monorepo'), targetDir);

  // Update root package.json
  const rootPkgPath = path.join(targetDir, 'package.json');
  const rootPkg = await fs.readJson(rootPkgPath);
  rootPkg.name = projectName;
  await fs.writeJson(rootPkgPath, rootPkg, { spaces: 2 });

  // CLAUDE.md 의 platform 분기 placeholder 치환. AI 에이전트가 Next.js 가정으로
  // 잘못된 컨벤션을 적용하지 않도록 (v0.94.0+).
  const platformAppDesc = describeAppPlatform(platform);
  await replaceInAllFiles(targetDir, '{{PLATFORM_APP_DESCRIPTION}}', platformAppDesc);

  // Update turbo.json
  const turboPath = path.join(targetDir, 'turbo.json');
  const turbo = await fs.readJson(turboPath);
  for (const plugin of plugins) {
    if (plugin.turboEnvVars) {
      turbo.globalEnv.push(...plugin.turboEnvVars);
    }
  }
  // 템플릿 turbo.json 은 .next/** 기준이라 vite 앱에선 turbo 가 산출물을
  // 못 찾아 build 캐시가 전혀 안 잡힌다 — 플랫폼별 outputs 로 교정.
  if (platform === 'vite') {
    turbo.tasks.build.outputs = ['dist/**'];
    // vite 는 클라이언트 노출 env 가 VITE_ 접두사 관례.
    turbo.globalEnv = turbo.globalEnv.map((e) => (e === 'API_URL' ? 'VITE_API_URL' : e));
  }
  turbo.globalEnv = [...new Set(turbo.globalEnv)];
  await fs.writeJson(turboPath, turbo, { spaces: 2 });

  // Create first app — `appName` 인자가 주어지면 그대로, 아니면 yes 모드 default 'web' / 대화모드 prompt.
  // v0.96.0+ — describe_template 와 동일한 시그니처 (피드백 #3 의 API 일관성 항목).
  const appName = appNameOpt
    ? validateProjectName(appNameOpt, 'appName')
    : (yes ? 'web' : await input({
        message: '첫 번째 앱 이름:',
        default: 'web',
      }));

  const port = portOpt ?? (yes ? '3000' : await input({
    message: '포트 번호:',
    default: '3000',
  }));

  const appsDir = path.join(targetDir, 'apps', appName);
  if (platform === 'vite') {
    await generateViteApp(appsDir, appName, port, arch, css, { i18n, locales });
  } else {
    await generateApp(appsDir, appName, port, plugins, arch, css);
  }
  // generateApp 이 ui-{app} 패키지의 cssFramework 변종까지 처리. 여기선 theme + sh-ui.config.json 만.
  const uiAppDir = path.join(targetDir, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  await injectCssTheme(uiAppDir, theme);
  await patchShUiConfig(path.join(uiAppDir, 'sh-ui.config.json'), css, themeBase);

  // ui-core sh-ui.config.json 의 cssFramework 도 동일하게 맞춘다 (v0.81.0+).
  // 안 그러면 후속 add_component 호출이 plain 변종으로 fallback.
  const uiCoreConfigPath = path.join(targetDir, 'packages', 'ui', 'ui-core', 'sh-ui.config.json');
  await patchShUiConfig(uiCoreConfigPath, css, themeBase);

  // ui-core 에 utility CSS 5종 자동 설치 (v0.81.0+).
  // ui-app/globals.css 가 이 5개 파일을 @import 하므로 안 깔리면 빌드 깨짐.
  // create → dev 사이에 사용자가 매뉴얼 `add base focus-ring …` 호출 안 해도 굴러가게 함.
  await prefetchUiCoreUtilityCss(path.join(targetDir, 'packages', 'ui', 'ui-core'));
}

/**
 * v0.81.0+ — monorepo create_project 직후 ui-core 에 베이스 유틸 CSS 를 자동 emit.
 *
 * ui-app-template/src/styles/globals.css 가 `@workspace/ui-core/styles/{base,focus-ring,
 * animations,breakpoints,z-index}.css` 를 sentinel 블록 안에서 @import 하므로 이 파일들이
 * 존재해야 Tailwind v4 빌드가 깨지지 않는다. 외부 의존성 없는 5개 CSS 파일이라 registry
 * 라우팅 거치지 않고 직접 카피 — add.mjs 의 framework 매칭 / placeholder 치환 로직이
 * 필요 없다 (모두 plain CSS, 토큰 변수만 참조).
 */
async function prefetchUiCoreUtilityCss(uiCoreDir) {
  const stylesDir = path.join(uiCoreDir, 'src', 'styles');
  await fs.ensureDir(stylesDir);
  const registryRoot = getRegistryRoot('react');
  const names = ['base', 'focus-ring', 'animations', 'breakpoints', 'z-index'];
  for (const name of names) {
    const src = path.join(registryRoot, 'components', name, `${name}.css`);
    const dest = path.join(stylesDir, `${name}.css`);
    if (await fs.pathExists(src) && !(await fs.pathExists(dest))) {
      await fs.copy(src, dest);
    }
  }
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

async function generateViteApp(targetDir, appName, port, arch, css = 'tailwind', { i18n = 'none', locales = 'ko,en' } = {}) {
  // 베이스 (arch-neutral) + arch 오버레이 — generateApp 과 동일 패턴.
  await fs.copy(path.join(TEMPLATES_DIR, 'vite-app'), targetDir, {
    filter: (src) => !src.includes(`${path.sep}_arch${path.sep}`) && !src.endsWith(`${path.sep}_arch`),
  });
  await ensureArchCleanup(targetDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, 'vite-app', '_arch', arch.name),
    targetDir,
    { overwrite: true },
  );
  // vite-app 의 flat overlay 는 src/ 하위 — arch.paths.layouts(next 관용) 앞에 src/ 보정.
  // (generateViteStandalone 의 동일 인라인 가드와 같은 이유 — fsd 는 이미 src/app/layouts.)
  const layoutsPath = arch.paths.layouts.startsWith('src/')
    ? arch.paths.layouts
    : `src/${arch.paths.layouts}`;
  const sentinelPath = path.join(targetDir, `${layoutsPath}/RootLayout.tsx`);
  if (!(await fs.pathExists(sentinelPath))) {
    throw new Error(
      `arch 오버레이 누락: vite-app + ${arch.name} 의 sentinel 파일(${layoutsPath}/RootLayout.tsx) 이 ${targetDir} 에 없습니다.`,
    );
  }

  // 워크스페이스 placeholder 치환 — `ui-app-name` → `ui-{appName}`, `app-name` → `{appName}`.
  await replaceInAllFiles(targetDir, 'ui-app-name', `ui-${appName}`);
  await replaceInAllFiles(targetDir, 'app-name', appName);

  // package.json — name + dep sort
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = appName;
  if (pkg.dependencies) pkg.dependencies = sortObjectKeys(pkg.dependencies);
  if (pkg.devDependencies) pkg.devDependencies = sortObjectKeys(pkg.devDependencies);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  // vite.config.ts 의 server.port 를 사용자 지정 port 로 patch.
  // generateMonorepo 가 받은 port 가 next 의 --port 와 같은 의미로 흐른다.
  const viteCfgPath = path.join(targetDir, 'vite.config.ts');
  if (await fs.pathExists(viteCfgPath)) {
    let viteCfg = await fs.readFile(viteCfgPath, 'utf-8');
    viteCfg = viteCfg.replace(/port:\s*\d+/, `port: ${port}`);
    await fs.writeFile(viteCfgPath, viteCfg);
  }

  // ui-{appName} 패키지 생성 — generateApp 과 동일 패턴 (ui-app-template 카피 후 placeholder 치환).
  const monorepoRoot = path.resolve(targetDir, '..', '..');
  const uiPkgDir = path.join(monorepoRoot, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  if (!(await fs.pathExists(uiPkgDir))) {
    await fs.copy(path.join(TEMPLATES_DIR, 'ui-app-template'), uiPkgDir);
    await replaceInAllFiles(uiPkgDir, 'ui-app-name', `ui-${appName}`);
    await replaceInAllFiles(uiPkgDir, 'app-name', appName);
  }

  // cssFramework 변종 — vite app 디렉토리 + ui-app 패키지 양쪽.
  // 플러그인 없음 (vite 는 아직 플러그인 시스템 없음 — v0.87 스코프 밖).
  await applyCssFrameworkVariant(targetDir, css, { isMonorepo: true, plugins: [], arch });
  if (await fs.pathExists(uiPkgDir)) {
    await applyCssFrameworkVariant(uiPkgDir, css, { isMonorepo: true, plugins: [], arch, isUiPackage: true });
  }

  if (i18n === 'react-i18next') {
    const localesArr = parseLocales(locales);
    await emitI18n(targetDir, { arch, locales: localesArr });
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

  // 6) .prettierrc — tailwind plugin 제거.
  await stripTailwindFromPrettier(path.join(targetDir, '.prettierrc'));

  // 7) monorepo 인 경우 root .prettierrc 와 root package.json 도 정리 (root 의 prettier-plugin-tailwindcss).
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
 * npm publish 가 패키지 tarball 에서 strip/변형하는 dotfile 들 — 템플릿엔 점 없는
 * 이름으로 두고 스캐폴드 직후 점을 복원한다.
 *   - `.gitignore` → npm 이 strip (없으면 `.npmignore` fallback 으로 사용)
 *   - `.npmrc`     → npm 이 항상 strip (publish 시 레지스트리 토큰 유출 방지)
 * 둘 다 published CLI 엔 도착하지 않으므로 템플릿엔 `gitignore` / `npmrc` 로 둔다.
 */
const STRIPPED_DOTFILES = { gitignore: '.gitignore', npmrc: '.npmrc' };

/**
 * 스캐폴드 마무리 — strip 된 dotfile(`gitignore`/`npmrc`) 을 점 붙은 이름으로
 * 되돌리고 `git init` 실행.
 *
 * gitInit 옵션:
 *   - undefined (auto): parent 가 이미 git tree 안이면 스킵, 아니면 init. nested .git
 *     충돌 방지 — 기존 monorepo / 사용자 작업 트리 안에서 호출 시 안전.
 *   - true: 무조건 init (parent 가 git tree 안이어도). nested 가 의도된 경우.
 *   - false: 무조건 스킵.
 *
 * git init 은 dry-run 에서는 스킵하고, 실패해도(git 미설치 등) 조용히 넘어간다.
 */
async function finalizeProject(targetDir, { dryRun = false, gitInit, locale } = {}) {
  // 모노레포 / sub-app 까지 strip 된 dotfile(gitignore/npmrc) 을 점 붙은 이름으로 복원.
  // root 만 처리하면 apps/<name>/gitignore 가 그대로 남아 node_modules/dist 가 staged 된다 (v0.93.0 버그).
  await restoreStrippedDotfilesRecursive(targetDir);

  // locale 후처리 — 한국어면 globals.css 들에 Pretendard 자동 적용 (Aifice 피드백 3.1).
  // dryRun 이면 skip — globals.css 가 디스크에 안 써졌을 수 있다.
  if (!dryRun && locale === 'ko') {
    await injectLocaleFont(targetDir, 'ko');
  }

  if (dryRun) return;

  const decision = resolveGitInit(targetDir, gitInit);
  if (!decision.init) {
    if (decision.reason === 'nested') {
      console.log(
        `\n  ℹ 이미 git tree 안이라 .git 초기화를 스킵했습니다 (parent: ${decision.parentRepo}).\n` +
        `    nested git repo 가 의도된 경우 --git-init 으로 강제할 수 있습니다.`,
      );
    }
    return;
  }

  try {
    execSync('git init -q', { cwd: targetDir, stdio: 'ignore' });
  } catch {
    // git 미설치 / 권한 문제 — 스캐폴드 자체는 성공이므로 조용히 넘어간다.
  }
}

/**
 * `locale` 옵션 후처리 — locale=ko 면 스캐폴드된 모든 globals.css 에 Pretendard 폰트 적용.
 *
 * 한국어 사용자가 sh-ui 를 init 한 직후 "Pretendard 로 교체" 가 거의 100% 첫 작업이라
 * (Aifice 피드백 3.1), 이를 옵션 하나로 자동화. 적용 방식:
 *   - external-imports 마커 안에 Pretendard CDN @import 라인 prepend (Tailwind import 보다 먼저)
 *   - 파일 끝에 `body { font-family: 'Pretendard Variable', ... }` rule 추가
 *
 * idempotent: 이미 'Pretendard Variable' 문자열이 있으면 skip.
 * monorepo 도 안전 — targetDir 하위 모든 globals.css 를 재귀 스캔 (node_modules / .git / _arch 제외).
 * Flutter 는 globals.css 가 없어 자동 no-op.
 */
async function injectLocaleFont(targetDir, locale) {
  if (locale !== 'ko') return;

  const PRETENDARD_IMPORT =
    "@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');\n";
  const FONT_FAMILY_RULE =
    "\n/* sh-ui:locale=ko — Pretendard 기본 적용. 사용자 정의로 override 가능. */\n" +
    "body { font-family: 'Pretendard Variable', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }\n";
  const END_MARKER = '/* sh-ui:external-imports-end */';

  const targets = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (['node_modules', '.git', '.next', 'dist', '_arch'].includes(e.name)) continue;
        await walk(full);
      } else if (e.isFile() && e.name === 'globals.css') {
        targets.push(full);
      }
    }
  }
  await walk(targetDir);

  for (const abs of targets) {
    let css = await fs.readFile(abs, 'utf-8');
    if (css.includes("'Pretendard Variable'")) continue;
    if (!css.includes(END_MARKER)) continue; // 우리 마커 없는 파일은 안전상 건드리지 않음
    css = css.replace(END_MARKER, `${PRETENDARD_IMPORT}${END_MARKER}`);
    css += FONT_FAMILY_RULE;
    await fs.writeFile(abs, css);
  }
}

/**
 * git init 실행 여부 결정. auto 모드는 parent 가 git tree 안이면 스킵 — nested .git
 * 충돌 방지. 명시 override (true/false) 가 있으면 그대로 따른다.
 *
 * 감지: `git -C <parentDir> rev-parse --is-inside-work-tree` 출력이 "true" 면 안.
 * git 미설치 / 권한 문제 등으로 명령이 실패하면 트리 밖으로 간주 (안전 디폴트: init 시도).
 */
function resolveGitInit(targetDir, override) {
  if (override === false) return { init: false, reason: 'explicit-skip' };
  if (override === true) return { init: true, reason: 'explicit-force' };

  const parentDir = path.dirname(targetDir);
  try {
    const result = execSync('git rev-parse --is-inside-work-tree', {
      cwd: parentDir,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (result === 'true') {
      let parentRepo = parentDir;
      try {
        parentRepo = execSync('git rev-parse --show-toplevel', {
          cwd: parentDir,
          stdio: ['ignore', 'pipe', 'ignore'],
        })
          .toString()
          .trim() || parentDir;
      } catch {}
      return { init: false, reason: 'nested', parentRepo };
    }
  } catch {
    // parent 가 git tree 밖 (또는 git 미설치) — 안전 디폴트: init 시도.
  }
  return { init: true, reason: 'auto' };
}

/**
 * CLAUDE.md 의 `{{PLATFORM_APP_DESCRIPTION}}` 치환용 문장 — AI 에이전트에게 어떤 플랫폼인지
 * 정확히 전달해서 잘못된 컨벤션 (예: vite 프로젝트에 App Router 가정) 적용 방지.
 */
function describeAppPlatform(platform) {
  if (platform === 'vite') {
    return `Vite SPA (React + TypeScript). 라우트 + 비즈니스 로직. RSC / App Router 없음 — 모든 코드가 클라이언트 사이드 실행이다.`;
  }
  // 디폴트: Next.js. 향후 platform 추가 시 분기 늘릴 것.
  return 'Next.js 앱 (App Router + Server Components). 라우트 + 비즈니스 로직.';
}

async function restoreStrippedDotfilesRecursive(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // 스캐폴드 직후엔 node_modules / .git 가 없지만 방어적으로.
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      await restoreStrippedDotfilesRecursive(fullPath);
    } else if (STRIPPED_DOTFILES[entry.name]) {
      await fs.move(fullPath, path.join(dir, STRIPPED_DOTFILES[entry.name]), { overwrite: true });
    }
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
    'src/shared/styles/tokens.css',  // FSD standalone (next + vite)
    'src/styles/tokens.css',          // monorepo ui-app-template (arch-neutral)
    'src/lib/styles/tokens.css',      // flat standalone (vite)
    'lib/styles/tokens.css',          // flat standalone (next)
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
