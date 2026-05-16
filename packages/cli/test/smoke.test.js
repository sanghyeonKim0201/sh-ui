import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

// @inquirer/prompts 전체 모듈 모킹 — 각 테스트에서 mockResolvedValueOnce 큐 주입
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
  checkbox: vi.fn(),
  confirm: vi.fn(),
}));

// 모킹된 함수를 가져와 각 테스트에서 답변 큐를 세팅
const prompts = await import('@inquirer/prompts');
const { createProject, addApp } = await import('../src/create/generator.js');
const { TOKEN_KEYS } = await import('../src/create/theme/decode.js');

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `sh-ui-cli-create-${crypto.randomUUID()}`);
  await fs.ensureDir(tmpDir);
  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  // vitest 는 TTY 가 없으므로 prompt-기반 시나리오를 검증하려면 TTY 를 흉내낸다.
  Object.defineProperty(process.stdin, 'isTTY', {
    value: true,
    configurable: true,
  });
});

afterEach(async () => {
  vi.restoreAllMocks();
  // 모든 prompt 모의 초기화
  prompts.input.mockReset();
  prompts.select.mockReset();
  prompts.checkbox.mockReset();
  prompts.confirm.mockReset();
  await fs.remove(tmpDir);
});

describe('sh-ui create smoke tests', () => {
  // 테스트 케이스는 이후 태스크에서 추가
  it('scenario 1 — standalone, no plugins', async () => {
    prompts.input.mockResolvedValueOnce('my-app');
    prompts.select
      .mockResolvedValueOnce('next')         // platform
      .mockResolvedValueOnce('plain')         // cssFramework
      .mockResolvedValueOnce('__none__')      // theme
      .mockResolvedValueOnce('standalone');   // structure
    prompts.checkbox.mockResolvedValueOnce([]);

    await createProject();

    const projectDir = path.join(tmpDir, 'my-app');
    expect(await fs.pathExists(projectDir)).toBe(true);

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe('my-app');

    expect(await fs.pathExists(path.join(projectDir, 'pnpm-workspace.yaml'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'next.config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'app'))).toBe(true);
  });
  it('scenario V1 — vite standalone, fsd arch, tailwind, no theme', async () => {
    await createProject({
      name: 'my-vite-app',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-app');
    expect(await fs.pathExists(projectDir)).toBe(true);

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe('my-vite-app');
    expect(pkg.devDependencies.vite).toBeDefined();
    expect(pkg.devDependencies['@tailwindcss/vite']).toBeDefined();
    expect(pkg.devDependencies.next).toBeUndefined();

    expect(await fs.pathExists(path.join(projectDir, 'index.html'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'vite.config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'next.config.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/app/main.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/main.tsx'))).toBe(false); // v0.89.0+ FSD-pure: 루트 entry 없음
    expect(await fs.pathExists(path.join(projectDir, 'src/shared/styles/tokens.css'))).toBe(true);

    const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
    expect(cfg.platform).toBe('react');
    expect(cfg.cssFramework).toBe('tailwind');
    expect(cfg.paths.tokens).toBe('src/shared/styles/tokens.css');
  });

  it('scenario V2 — vite standalone, flat arch', async () => {
    await createProject({
      name: 'my-vite-flat',
      platform: 'vite',
      structure: 'standalone',
      arch: 'flat',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-flat');
    const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
    expect(cfg.paths.tokens).toBe('src/lib/styles/tokens.css');
    expect(await fs.pathExists(path.join(projectDir, 'src/lib/styles/tokens.css'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/components/layouts/RootLayout.tsx'))).toBe(true);
  });

  it('scenario V3 — vite standalone, fsd, with rose theme', async () => {
    await createProject({
      name: 'my-vite-themed',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      theme: 'rose',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-themed');
    const tokens = await fs.readFile(
      path.join(projectDir, 'src/shared/styles/tokens.css'),
      'utf-8',
    );
    // rose preset 의 primary 색은 #E11D48
    expect(tokens).toContain('#E11D48');

    const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
    expect(cfg.theme.base).toBe('rose');
  });

  it('scenario V4 — vite standalone, flat, with violet theme', async () => {
    await createProject({
      name: 'my-vite-flat-themed',
      platform: 'vite',
      structure: 'standalone',
      arch: 'flat',
      css: 'tailwind',
      theme: 'violet',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-flat-themed');
    const tokens = await fs.readFile(
      path.join(projectDir, 'src/lib/styles/tokens.css'),
      'utf-8',
    );
    // violet preset 의 primary 색은 #7C3AED
    expect(tokens).toContain('#7C3AED');
  });

  // v0.86.1+ — 회귀 가드 (docs/solutions/developer-experience/vite-scaffolder-smoke-test-must-run-build).
  // vite.config.ts 가 tsconfigPaths 플러그인을 와이어링하지 않으면 typecheck 는 통과하지만
  // 실제 `pnpm build` 가 Rollup 의 `@/*` 해석 실패로 깨진다. 빌드를 직접 돌리는 비용은
  // smoke 에서 과한 부담이라, 구조 단언으로 번들러↔tsconfig 계약을 핀고정.
  it('scenario V5 — vite.config.ts 가 tsconfigPaths 플러그인을 와이어링 (build 회귀 가드)', async () => {
    await createProject({
      name: 'v-paths',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });
    const viteCfg = await fs.readFile(
      path.join(tmpDir, 'v-paths', 'vite.config.ts'),
      'utf-8',
    );
    expect(viteCfg).toContain('tsconfigPaths');
    expect(viteCfg).toContain("from 'vite-tsconfig-paths'");
    // package.json 에 vite-tsconfig-paths 가 실제로 깔리는지도 확인.
    const pkg = await fs.readJson(path.join(tmpDir, 'v-paths', 'package.json'));
    expect(pkg.devDependencies['vite-tsconfig-paths']).toBeDefined();
    // eslint.config.js 에서 globals 를 import 한다면 package.json 에 dep 도 있어야 한다.
    expect(pkg.devDependencies.globals).toBeDefined();
  });

  // v0.87.0+ — vite monorepo (apps/{name} + packages/ui/ui-core 공유).
  it('scenario V6 — vite monorepo, fsd, web app', async () => {
    await createProject({
      name: 'my-vite-mono',
      platform: 'vite',
      structure: 'monorepo',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-mono');
    expect(await fs.pathExists(projectDir)).toBe(true);

    // 모노레포 루트 산출물
    expect(await fs.pathExists(path.join(projectDir, 'pnpm-workspace.yaml'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'turbo.json'))).toBe(true);

    // vite app
    expect(await fs.pathExists(path.join(projectDir, 'apps/web/vite.config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'apps/web/index.html'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'apps/web/next.config.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'apps/web/src/main.tsx'))).toBe(true);

    const appPkg = await fs.readJson(path.join(projectDir, 'apps/web/package.json'));
    expect(appPkg.name).toBe('web');
    expect(appPkg.devDependencies.vite).toBeDefined();
    expect(appPkg.dependencies['@workspace/ui-core']).toBeDefined();
    expect(appPkg.dependencies['@workspace/ui-web']).toBeDefined();

    // ui-core 단일 SoT
    expect(await fs.pathExists(path.join(projectDir, 'packages/ui/ui-core/src'))).toBe(true);

    // ui-{appName} — tokens-only 패키지
    expect(await fs.pathExists(path.join(projectDir, 'packages/ui/ui-apps/ui-web/sh-ui.config.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'packages/ui/ui-apps/ui-web/src/styles/tokens.css'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'packages/ui/ui-apps/ui-web/src/styles/globals.css'))).toBe(true);

    // tsconfig.app.json 의 workspace alias 가 치환됐는지 — ui-app-name 잔존 금지.
    const tsApp = await fs.readFile(path.join(projectDir, 'apps/web/tsconfig.app.json'), 'utf-8');
    expect(tsApp).toContain('@workspace/ui-web/*');
    expect(tsApp).not.toContain('ui-app-name');

    // ui-app sh-ui.config.json 에 tokens-only role 확인
    const uiAppCfg = await fs.readJson(path.join(projectDir, 'packages/ui/ui-apps/ui-web/sh-ui.config.json'));
    expect(uiAppCfg.role).toBe('tokens-only');

    // #1 회귀 가드 — vite 모노레포 turbo build outputs 가 .next/** 잔재가 아니라 dist/**.
    // (smoke 는 toolchain 을 안 돌리므로 구조 단언으로 캐시-사망 회귀를 잡는다.)
    const turbo = await fs.readJson(path.join(projectDir, 'turbo.json'));
    expect(turbo.tasks.build.outputs).toEqual(['dist/**']);
    expect(turbo.globalEnv).not.toContain('API_URL');
    expect(turbo.globalEnv).toContain('VITE_API_URL');

    // #2 회귀 가드 — vitest 4 는 vite ^6||^7||^8 필요. vite 가 5.x 면 test 가 startup 에서 죽음.
    const viteMajor = parseInt(appPkg.devDependencies.vite.match(/\d+/)[0], 10);
    const vitestMajor = parseInt(appPkg.devDependencies.vitest.match(/\d+/)[0], 10);
    if (vitestMajor >= 4) expect(viteMajor).toBeGreaterThanOrEqual(6);

    // #4 회귀 가드 — ThemeProvider 가 effect 안에서 setState 안 함 (set-state-in-effect).
    const tp = await fs.readFile(
      path.join(projectDir, 'apps/web/src/app/providers/theme/ThemeProvider.tsx'),
      'utf-8',
    );
    expect(tp).toContain('useSyncExternalStore');
    expect(tp).not.toContain('setResolvedTheme');

    // #5 회귀 가드 — tsc -b 가 config 산출물 / tsbuildinfo 를 소스 옆에 흘리지 않음.
    const tsNode = await fs.readJson(path.join(projectDir, 'apps/web/tsconfig.node.json'));
    expect(tsNode.compilerOptions.noEmit).toBe(true);
    expect(tsNode.compilerOptions.tsBuildInfoFile).toContain('node_modules/.tmp');
    const tsAppJson = await fs.readJson(path.join(projectDir, 'apps/web/tsconfig.app.json'));
    expect(tsAppJson.compilerOptions.tsBuildInfoFile).toContain('node_modules/.tmp');
    const gi = await fs.readFile(path.join(projectDir, 'apps/web/.gitignore'), 'utf-8');
    expect(gi).toContain('*.tsbuildinfo');
  });

  it('scenario V21 — vite + monorepo + observability=sentry — turbo globalEnv 에 SENTRY_* 선언', async () => {
    // #3 회귀 가드 — vite sentry 는 플러그인 turboEnvVars 훅을 안 타므로 generateMonorepo
    // 가 직접 turbo.globalEnv 에 넣어줘야 한다. 안 그러면 깨끗한 scaffold 가
    // turbo/no-undeclared-env-vars 로 lint clean 이 아님.
    await createProject({
      name: 'v-mono-sentry',
      platform: 'vite',
      structure: 'monorepo',
      arch: 'fsd',
      css: 'tailwind',
      observability: 'sentry',
      yes: true,
    });
    const projectDir = path.join(tmpDir, 'v-mono-sentry');
    const turbo = await fs.readJson(path.join(projectDir, 'turbo.json'));
    for (const v of ['MODE', 'SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_AUTH_TOKEN']) {
      expect(turbo.globalEnv).toContain(v);
    }
    // 중복 없이 (Set dedupe 회귀 가드).
    expect(new Set(turbo.globalEnv).size).toBe(turbo.globalEnv.length);
    // sentry 모듈도 app 에 들어갔는지 (monorepo 경로의 emitSentry 회귀 가드).
    expect(
      await fs.pathExists(path.join(projectDir, 'apps/web/src/shared/observability/sentry.ts')),
    ).toBe(true);
  });

  it('scenario V7a — vite standalone + tauri:true emits src-tauri/ shell', async () => {
    await createProject({
      name: 'my-vite-tauri',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      tauri: true,
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-tauri');

    // 8개 tauri-shell 파일이 모두 존재해야 함
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri/Cargo.toml'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri/build.rs'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri/tauri.conf.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri/src/main.rs'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri/src/lib.rs'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri/capabilities/default.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri/.gitignore'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri/README.md'))).toBe(true);
  });

  it('scenario V7b — placeholder 치환 + bundle ID + crate name 동시 검증', async () => {
    await createProject({
      name: 'My-Cool.App',          // 하이픈 + 점 + 대문자 — snake_case 변환 케이스
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      tauri: true,
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'My-Cool.App');
    const cargo = await fs.readFile(path.join(projectDir, 'src-tauri/Cargo.toml'), 'utf-8');
    expect(cargo).toContain('name = "my_cool_app"');         // crate name = snake_case
    expect(cargo).toContain('name = "my_cool_app_lib"');     // lib name = snake_case + _lib
    expect(cargo).not.toContain('{{');                       // 치환 누락 없음

    const conf = await fs.readJson(path.join(projectDir, 'src-tauri/tauri.conf.json'));
    expect(conf.productName).toBe('My-Cool.App');            // 원본 그대로 (UI 표시용)
    expect(conf.identifier).toBe('app.my_cool_app.dev');     // 식별자도 snake_case
    // v0.88.0+ —  "//-identifier" sentinel 제거 (Tauri 2.x 의 strict schema 가 unknown top-level 거부).
    // 프로덕션 식별자 교체 안내는 README 의 TODO 콜아웃으로 유지.
    expect(conf['//-identifier']).toBeUndefined();
  });

  it('scenario V7c — vite package.json + vite.config.ts 가 Tauri 친화적으로 패치', async () => {
    await createProject({
      name: 'tauri-patches',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      tauri: true,
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'tauri-patches');

    // package.json scripts + deps
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.scripts.tauri).toBe('tauri');
    expect(pkg.scripts['tauri:dev']).toBe('tauri dev');
    expect(pkg.scripts['tauri:build']).toBe('tauri build');
    expect(pkg.dependencies['@tauri-apps/api']).toBeDefined();
    expect(pkg.dependencies['@tauri-apps/plugin-opener']).toBeDefined();
    expect(pkg.devDependencies['@tauri-apps/cli']).toBeDefined();

    // vite.config.ts — Tauri 권장 설정
    const viteCfg = await fs.readFile(path.join(projectDir, 'vite.config.ts'), 'utf-8');
    expect(viteCfg).toContain('clearScreen: false');
    expect(viteCfg).toContain('strictPort: true');
    expect(viteCfg).toContain('port: 5173');
    // v0.86.0 의 tsconfigPaths 회귀 가드 — Tauri 패치가 plugin 을 떼어내면 안 됨
    expect(viteCfg).toContain('tsconfigPaths');

    // .gitignore 에 src-tauri/target 추가
    const gitignore = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('src-tauri/target');
  });

  it('scenario V12 — vite + monorepo + tauri (v0.90.0+) — src-tauri/ 가 apps/{name}/ 안', async () => {
    await createProject({
      name: 'my-mono-tauri',
      platform: 'vite',
      structure: 'monorepo',
      arch: 'fsd',
      css: 'tailwind',
      tauri: true,
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-mono-tauri');
    const appDir = path.join(projectDir, 'apps/web');

    // monorepo 구조
    expect(await fs.pathExists(path.join(projectDir, 'pnpm-workspace.yaml'))).toBe(true);
    expect(await fs.pathExists(path.join(appDir, 'vite.config.ts'))).toBe(true);

    // tauri shell 이 app 안
    expect(await fs.pathExists(path.join(appDir, 'src-tauri/Cargo.toml'))).toBe(true);
    expect(await fs.pathExists(path.join(appDir, 'src-tauri/tauri.conf.json'))).toBe(true);
    expect(await fs.pathExists(path.join(appDir, 'src-tauri/src/main.rs'))).toBe(true);

    // dev URL 이 app port (default 3000) 와 일치
    const conf = await fs.readJson(path.join(appDir, 'src-tauri/tauri.conf.json'));
    expect(conf.build.devUrl).toBe('http://localhost:3000');

    // app package.json 에 tauri scripts/deps
    const appPkg = await fs.readJson(path.join(appDir, 'package.json'));
    expect(appPkg.scripts['tauri:dev']).toBe('tauri dev');
    expect(appPkg.devDependencies['@tauri-apps/cli']).toBeDefined();
    expect(appPkg.dependencies['@tauri-apps/api']).toBeDefined();

    // app vite.config.ts 의 Tauri 권장 설정 + port 3000
    const viteCfg = await fs.readFile(path.join(appDir, 'vite.config.ts'), 'utf-8');
    expect(viteCfg).toContain('clearScreen: false');
    expect(viteCfg).toContain('strictPort: true');
    expect(viteCfg).toContain('port: 3000');

    // crate name = appName snake_case (this case: 'web' is already valid)
    const cargo = await fs.readFile(path.join(appDir, 'src-tauri/Cargo.toml'), 'utf-8');
    expect(cargo).toContain('name = "web"');
    expect(cargo).toContain('name = "web_lib"');

    // 루트엔 src-tauri 없어야 함 (monorepo + tauri 의 핵심 — app 안에 emit)
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri'))).toBe(false);
  });

  it('scenario V13 — vite monorepo + add-app + tauri (v0.91.0+)', async () => {
    // 1) 먼저 vite monorepo create
    await createProject({
      name: 'mono-v13',
      platform: 'vite',
      structure: 'monorepo',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    const monoDir = path.join(tmpDir, 'mono-v13');

    // 2) add-app — platform 미지정 (추론 기대) + tauri:true
    await addApp({
      cwd: monoDir,
      name: 'admin',
      port: '3001',
      plugins: [],
      tauri: true,
    });

    const adminDir = path.join(monoDir, 'apps/admin');

    // admin 앱이 vite 로 생성됐는지 확인 (next 가 아니라)
    const adminPkg = await fs.readJson(path.join(adminDir, 'package.json'));
    expect(adminPkg.devDependencies.vite).toBeDefined();
    expect(adminPkg.devDependencies.next).toBeUndefined();

    // tauri shell 이 admin 앱 안
    expect(await fs.pathExists(path.join(adminDir, 'src-tauri/Cargo.toml'))).toBe(true);
    expect(await fs.pathExists(path.join(adminDir, 'src-tauri/tauri.conf.json'))).toBe(true);

    // devUrl 이 admin 의 port (3001) 와 일치
    const conf = await fs.readJson(path.join(adminDir, 'src-tauri/tauri.conf.json'));
    expect(conf.build.devUrl).toBe('http://localhost:3001');

    // vite.config.ts port 도 3001
    const viteCfg = await fs.readFile(path.join(adminDir, 'vite.config.ts'), 'utf-8');
    expect(viteCfg).toContain('port: 3001');

    // crate name = appName snake_case
    const cargo = await fs.readFile(path.join(adminDir, 'src-tauri/Cargo.toml'), 'utf-8');
    expect(cargo).toContain('name = "admin"');
    expect(cargo).toContain('name = "admin_lib"');

    // 첫 앱 (web) 은 그대로
    expect(await fs.pathExists(path.join(monoDir, 'apps/web/vite.config.ts'))).toBe(true);
  });

  it('scenario V14 — add-app + tauri + platform=next 는 명시적 에러', async () => {
    await createProject({
      name: 'mono-v14',
      platform: 'next',
      structure: 'monorepo',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    await expect(
      addApp({
        cwd: path.join(tmpDir, 'mono-v14'),
        name: 'admin',
        port: '3001',
        platform: 'next',
        tauri: true,
      }),
    ).rejects.toThrow(/tauri.*vite/);
  });

  it('scenario V7e — vite + tauri:false (또는 미지정) 은 src-tauri/ 안 emit (회귀 가드)', async () => {
    await createProject({
      name: 'no-tauri',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      // tauri 옵션 미지정 — 기본 false
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'no-tauri');
    expect(await fs.pathExists(path.join(projectDir, 'src-tauri'))).toBe(false);

    // package.json 에도 tauri 관련 추가 없어야 함
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.scripts.tauri).toBeUndefined();
    expect(pkg.dependencies['@tauri-apps/api']).toBeUndefined();
    expect(pkg.devDependencies['@tauri-apps/cli']).toBeUndefined();
  });

  it('scenario V8 — vite index.html 에 viewport-fit + theme-color meta 포함 (v0.88.1+ 모바일/Tauri)', async () => {
    await createProject({
      name: 'v-mobile',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    const indexHtml = await fs.readFile(
      path.join(tmpDir, 'v-mobile', 'index.html'),
      'utf-8',
    );
    expect(indexHtml).toContain('viewport-fit=cover');
    expect(indexHtml).toMatch(/<meta name="theme-color"[^>]*media="\(prefers-color-scheme: dark\)"/);
    expect(indexHtml).toMatch(/<meta name="theme-color"[^>]*media="\(prefers-color-scheme: light\)"/);
  });

  it('scenario V9 — vite globals.css 에 WebView reset 블록 포함 (fsd + flat 양쪽)', async () => {
    // fsd
    await createProject({
      name: 'v-webview-fsd',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });
    const fsdGlobals = await fs.readFile(
      path.join(tmpDir, 'v-webview-fsd', 'src/shared/styles/globals.css'),
      'utf-8',
    );
    expect(fsdGlobals).toContain('sh-ui:webview-base-start');
    expect(fsdGlobals).toContain('-webkit-tap-highlight-color: transparent');
    expect(fsdGlobals).toContain('touch-action: manipulation');
    // 텍스트 입력 영역 복원 가드 — 빠지면 사용자가 input 에 텍스트 셀렉트 못 하는 회귀
    expect(fsdGlobals).toMatch(/input,\s*\n\s*textarea/);

    // flat
    await createProject({
      name: 'v-webview-flat',
      platform: 'vite',
      structure: 'standalone',
      arch: 'flat',
      css: 'tailwind',
      yes: true,
    });
    const flatGlobals = await fs.readFile(
      path.join(tmpDir, 'v-webview-flat', 'src/lib/styles/globals.css'),
      'utf-8',
    );
    expect(flatGlobals).toContain('sh-ui:webview-base-start');
    expect(flatGlobals).toContain('touch-action: manipulation');
  });

  it('scenario V10 — vite + fsd (v0.89.0+ FSD-pure): entry 가 src/app/main.tsx, index.html 도 그쪽 가리킴', async () => {
    await createProject({
      name: 'v-fsd-pure',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'v-fsd-pure');

    // entry 가 app layer 안
    expect(await fs.pathExists(path.join(projectDir, 'src/app/main.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/app/App.tsx'))).toBe(true);
    // 루트 entry 부재 — opinionated 폴더 미생성 확인
    expect(await fs.pathExists(path.join(projectDir, 'src/main.tsx'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/App.tsx'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/Home.tsx'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/components'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/hooks'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/lib'))).toBe(false);

    // index.html 이 새 entry 가리킴
    const indexHtml = await fs.readFile(path.join(projectDir, 'index.html'), 'utf-8');
    expect(indexHtml).toContain('/src/app/main.tsx');
    expect(indexHtml).not.toContain('/src/main.tsx"');  // 따옴표 포함 — substring 매칭 회피
  });

  it('scenario V11 — vite + flat (v0.89.0+): 루트 entry 유지 (Vite 컨벤션)', async () => {
    await createProject({
      name: 'v-flat-entry',
      platform: 'vite',
      structure: 'standalone',
      arch: 'flat',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'v-flat-entry');

    // flat 은 Vite 컨벤션 유지 — 루트 entry
    expect(await fs.pathExists(path.join(projectDir, 'src/main.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/App.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/Home.tsx'))).toBe(true);

    // index.html 은 루트 entry 가리킴
    const indexHtml = await fs.readFile(path.join(projectDir, 'index.html'), 'utf-8');
    expect(indexHtml).toContain('/src/main.tsx');
  });

  it('scenario V7f — tauri:true + platform=next 는 명시적 에러 (CLI 가드)', async () => {
    await expect(
      createProject({
        name: 'next-tauri-fail',
        platform: 'next',
        structure: 'standalone',
        css: 'tailwind',
        tauri: true,
        yes: true,
      }),
    ).rejects.toThrow(/tauri.*vite/);
  });

  it('scenario V15 — vite standalone + i18n=react-i18next + locales=ko,en (v0.92.0+)', async () => {
    await createProject({
      name: 'v-i18n',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      i18n: 'react-i18next',
      locales: 'ko,en',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'v-i18n');

    expect(await fs.pathExists(path.join(projectDir, 'src/shared/i18n/config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/shared/i18n/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/shared/i18n/locales/ko/common.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/shared/i18n/locales/en/common.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/app/providers/I18nProvider.tsx'))).toBe(true);

    const cfg = await fs.readFile(path.join(projectDir, 'src/shared/i18n/config.ts'), 'utf-8');
    expect(cfg).toContain("import LanguageDetector from 'i18next-browser-languagedetector'");
    expect(cfg).toContain("import HttpBackend from 'i18next-http-backend'");
    expect(cfg).toContain("fallbackLng: 'ko'");
    expect(cfg).toContain('supportedLngs: ["ko","en"]');

    const gp = await fs.readFile(path.join(projectDir, 'src/app/providers/GlobalProvider/index.tsx'), 'utf-8');
    expect(gp).toContain("import { I18nProvider } from '../I18nProvider'");
    expect(gp).toContain('<I18nProvider>');

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies['i18next']).toBeDefined();
    expect(pkg.dependencies['react-i18next']).toBeDefined();
    expect(pkg.dependencies['i18next-browser-languagedetector']).toBeDefined();
    expect(pkg.dependencies['i18next-http-backend']).toBeDefined();
  });

  it('scenario V16 — vite + i18n=none (default) — i18n 파일 안 들어감 (회귀 가드)', async () => {
    await createProject({
      name: 'v-no-i18n',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'v-no-i18n');
    expect(await fs.pathExists(path.join(projectDir, 'src/shared/i18n'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/app/providers/I18nProvider.tsx'))).toBe(false);

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies['i18next']).toBeUndefined();
    expect(pkg.dependencies['react-i18next']).toBeUndefined();

    const gp = await fs.readFile(path.join(projectDir, 'src/app/providers/GlobalProvider/index.tsx'), 'utf-8');
    expect(gp).not.toContain('I18nProvider');
  });

  it('scenario V17 — vite + flat + i18n=react-i18next — lib/i18n + components/providers 경로', async () => {
    await createProject({
      name: 'v-i18n-flat',
      platform: 'vite',
      structure: 'standalone',
      arch: 'flat',
      css: 'tailwind',
      i18n: 'react-i18next',
      locales: 'ko,en,ja',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'v-i18n-flat');

    expect(await fs.pathExists(path.join(projectDir, 'src/lib/i18n/config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/lib/i18n/locales/ja/common.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/components/providers/I18nProvider.tsx'))).toBe(true);

    // v0.94.0+: non-core locale (ja) 은 영어 fallback seed 를 받는다 (이전엔 빈 객체).
    // translator 가 채워야 할 key 가 즉시 보이도록.
    const jaJson = await fs.readJson(path.join(projectDir, 'src/lib/i18n/locales/ja/common.json'));
    expect(jaJson).toEqual({ greeting: 'Hello', app_title: 'sh-ui app' });

    // 핵심 locale (ko, en) 은 사람-언어 시드.
    const koJson = await fs.readJson(path.join(projectDir, 'src/lib/i18n/locales/ko/common.json'));
    expect(koJson.greeting).toBe('안녕하세요');
    expect(koJson.app_title).toBe('sh-ui 앱');
    const enJson = await fs.readJson(path.join(projectDir, 'src/lib/i18n/locales/en/common.json'));
    expect(enJson.greeting).toBe('Hello');

    const cfg = await fs.readFile(path.join(projectDir, 'src/lib/i18n/config.ts'), 'utf-8');
    expect(cfg).toContain("fallbackLng: 'ko'");

    // v0.94.0+: vite-plugin-static-copy 자동 설치 + vite.config 패치 검증.
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.devDependencies['vite-plugin-static-copy']).toBeTruthy();
    const viteCfg = await fs.readFile(path.join(projectDir, 'vite.config.ts'), 'utf-8');
    expect(viteCfg).toContain('vite-plugin-static-copy');
    expect(viteCfg).toContain('locales');
  });

  it('scenario V18 — vite + observability=sentry (v0.93.0+)', async () => {
    await createProject({
      name: 'v-sentry', platform: 'vite', structure: 'standalone', arch: 'fsd',
      css: 'tailwind', observability: 'sentry', yes: true,
    });
    const dir = path.join(tmpDir, 'v-sentry');
    expect(await fs.pathExists(path.join(dir, 'src/shared/observability/sentry.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(dir, 'src/shared/observability/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(dir, 'src/app/providers/SentryProvider.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(dir, '.env.example'))).toBe(true);
    const sentryTs = await fs.readFile(path.join(dir, 'src/shared/observability/sentry.ts'), 'utf-8');
    expect(sentryTs).toContain("import * as Sentry from '@sentry/react'");
    expect(sentryTs).toContain('import.meta.env.VITE_SENTRY_DSN');
    expect(sentryTs).toContain('replaysSessionSampleRate: 0');
    const gp = await fs.readFile(path.join(dir, 'src/app/providers/GlobalProvider/index.tsx'), 'utf-8');
    expect(gp).toContain("import { SentryProvider } from '../SentryProvider'");
    expect(gp).toContain('<SentryProvider>');
    expect(gp.indexOf('<SentryProvider>')).toBeLessThan(gp.indexOf('<ThemeProvider>'));
    const pkg = await fs.readJson(path.join(dir, 'package.json'));
    expect(pkg.dependencies['@sentry/react']).toBeDefined();
    expect(pkg.devDependencies['@sentry/vite-plugin']).toBeDefined();
    const viteCfg = await fs.readFile(path.join(dir, 'vite.config.ts'), 'utf-8');
    expect(viteCfg).toContain("import { sentryVitePlugin } from '@sentry/vite-plugin'");
    expect(viteCfg).toContain('sentryVitePlugin(');
    expect(viteCfg).toContain('sourcemap: true');
    const env = await fs.readFile(path.join(dir, '.env.example'), 'utf-8');
    expect(env).toContain('VITE_SENTRY_DSN');
    expect(env).toContain('SENTRY_AUTH_TOKEN');
  });

  it('scenario V19 — vite + observability=none (default) — Sentry 파일 안 들어감', async () => {
    await createProject({
      name: 'v-no-sentry', platform: 'vite', structure: 'standalone', arch: 'fsd',
      css: 'tailwind', yes: true,
    });
    const dir = path.join(tmpDir, 'v-no-sentry');
    expect(await fs.pathExists(path.join(dir, 'src/shared/observability'))).toBe(false);
    expect(await fs.pathExists(path.join(dir, 'src/app/providers/SentryProvider.tsx'))).toBe(false);
    const pkg = await fs.readJson(path.join(dir, 'package.json'));
    expect(pkg.dependencies['@sentry/react']).toBeUndefined();
    const gp = await fs.readFile(path.join(dir, 'src/app/providers/GlobalProvider/index.tsx'), 'utf-8');
    expect(gp).not.toContain('SentryProvider');
  });

  it('scenario V20 — vite + i18n + sentry — wrapper 순서 Sentry > I18n > Theme > Query', async () => {
    await createProject({
      name: 'v-stack', platform: 'vite', structure: 'standalone', arch: 'fsd',
      css: 'tailwind', i18n: 'react-i18next', locales: 'ko,en', observability: 'sentry', yes: true,
    });
    const gp = await fs.readFile(path.join(tmpDir, 'v-stack/src/app/providers/GlobalProvider/index.tsx'), 'utf-8');
    expect(gp).toContain("import { I18nProvider } from '../I18nProvider'");
    expect(gp).toContain("import { SentryProvider } from '../SentryProvider'");
    const sentryIdx = gp.indexOf('<SentryProvider>');
    const i18nIdx = gp.indexOf('<I18nProvider>');
    const themeIdx = gp.indexOf('<ThemeProvider>');
    expect(sentryIdx).toBeLessThan(i18nIdx);
    expect(i18nIdx).toBeLessThan(themeIdx);

    // v0.95.x 회귀 가드 — i18n 의 viteStaticCopy targets 배열 안에 sentryVitePlugin 이
    // inject 되던 패치 anchor 경합 (feedback #3 P0).
    // sentryVitePlugin 은 plugins 배열의 top-level entry 여야 하고,
    // viteStaticCopy 의 `targets: [ ... ]` 안에 들어가서는 안 된다.
    const viteCfg = await fs.readFile(path.join(tmpDir, 'v-stack/vite.config.ts'), 'utf-8');
    // viteStaticCopy 호출이 sentryVitePlugin 보다 먼저 등장 (append 순서)
    expect(viteCfg.indexOf('viteStaticCopy(')).toBeLessThan(viteCfg.indexOf('sentryVitePlugin('));
    // targets: [ ... ] 안에 sentryVitePlugin 이 있으면 안 됨.
    const targetsMatch = viteCfg.match(/targets:\s*\[[\s\S]*?\]/);
    expect(targetsMatch).not.toBeNull();
    expect(targetsMatch[0]).not.toContain('sentryVitePlugin');
    // viteStaticCopy({ ... }) 가 닫힌 뒤에 sentryVitePlugin 이 옴.
    expect(viteCfg).toMatch(/viteStaticCopy\(\{[\s\S]*?\}\),\s*\n\s*sentryVitePlugin\(/);

    // 회귀 가드 — vite 메이저를 올릴 때 vite-plugin-static-copy peer 가 같이 안
    // 따라오면 i18n 프로젝트가 pnpm install 에서 unmet peer → build/dev 깨짐.
    const scPkg = await fs.readJson(path.join(tmpDir, 'v-stack/package.json'));
    const scStatic = parseInt(
      scPkg.devDependencies['vite-plugin-static-copy'].match(/\d+/)[0], 10,
    );
    const scVite = parseInt(scPkg.devDependencies.vite.match(/\d+/)[0], 10);
    if (scVite >= 7) expect(scStatic).toBeGreaterThanOrEqual(3);
  });

  it('scenario V20b — sh_ui_create_project 의 appName 인자 (피드백 #3 — describe_template 와 1:1 일치)', async () => {
    // 사용자가 첫 앱 이름을 'web' 외로 시작하려면 12+ 파일 손 rename 이 필요했음.
    // appName='admin' 으로 한 번에 생성되어야 한다.
    await createProject({
      name: 'cp-app', platform: 'vite', structure: 'monorepo', arch: 'fsd',
      css: 'tailwind',
      appName: 'admin',
      port: '4200',
      yes: true,
    });
    const root = path.join(tmpDir, 'cp-app');
    expect(await fs.pathExists(path.join(root, 'apps/admin/package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(root, 'apps/web'))).toBe(false);
    expect(await fs.pathExists(path.join(root, 'packages/ui/ui-apps/ui-admin/package.json'))).toBe(true);
    const appPkg = await fs.readJson(path.join(root, 'apps/admin/package.json'));
    expect(appPkg.name).toBe('admin');
    // port 도 같이 전달 — vite.config.ts 의 server.port 가 사용자 값으로.
    const viteCfg = await fs.readFile(path.join(root, 'apps/admin/vite.config.ts'), 'utf-8');
    expect(viteCfg).toContain('4200');
  });

  it('scenario V20d — vite + i18n 켜면 Home.tsx / App.tsx 가 useTranslation 사용 (피드백 #2/#3)', async () => {
    // vite-standalone + fsd → src/app/App.tsx 패치 검증
    await createProject({
      name: 'v-i18n-fsd', platform: 'vite', structure: 'standalone', arch: 'fsd',
      css: 'tailwind', i18n: 'react-i18next', locales: 'ko,en', yes: true,
    });
    const appFsd = await fs.readFile(path.join(tmpDir, 'v-i18n-fsd/src/app/App.tsx'), 'utf-8');
    expect(appFsd).toContain("import { useTranslation } from 'react-i18next'");
    expect(appFsd).toContain('const { t } = useTranslation();');
    expect(appFsd).toContain("{t('greeting')}");
    expect(appFsd).not.toContain('Hello World');

    // vite-standalone + flat → src/Home.tsx 패치 검증
    await createProject({
      name: 'v-i18n-flat', platform: 'vite', structure: 'standalone', arch: 'flat',
      css: 'tailwind', i18n: 'react-i18next', locales: 'ko,en', yes: true,
    });
    const homeFlat = await fs.readFile(path.join(tmpDir, 'v-i18n-flat/src/Home.tsx'), 'utf-8');
    expect(homeFlat).toContain("import { useTranslation } from 'react-i18next'");
    expect(homeFlat).toContain("{t('greeting')}");
    expect(homeFlat).not.toContain('Hello World');

    // vite + i18n 안 켜면 Hello World 그대로 (회귀 가드)
    await createProject({
      name: 'v-no-i18n', platform: 'vite', structure: 'standalone', arch: 'fsd',
      css: 'tailwind', yes: true,
    });
    const noI18n = await fs.readFile(path.join(tmpDir, 'v-no-i18n/src/app/App.tsx'), 'utf-8');
    expect(noI18n).toContain('Hello World');
    expect(noI18n).not.toContain('useTranslation');
  });

  it('scenario V20c — appName 미지정 시 default web (호환 유지)', async () => {
    await createProject({
      name: 'cp-default-app', platform: 'vite', structure: 'monorepo', arch: 'fsd',
      css: 'tailwind', yes: true,
    });
    expect(await fs.pathExists(path.join(tmpDir, 'cp-default-app/apps/web/package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'cp-default-app/packages/ui/ui-apps/ui-web'))).toBe(true);
  });

  it('scenario V20a — vite monorepo + tauri + i18n + sentry 동시 ON (all-options 회귀 가드)', async () => {
    // ai-org 시나리오 — feedback #3 에서 emit 깨지던 조합.
    // 모든 옵션이 동시에 켜져도 vite.config.ts 가 깨지지 않아야 한다.
    await createProject({
      name: 'all-on', platform: 'vite', structure: 'monorepo', arch: 'fsd',
      css: 'tailwind', tauri: true,
      i18n: 'react-i18next', locales: 'ko,en',
      observability: 'sentry',
      yes: true,
    });
    const appDir = path.join(tmpDir, 'all-on/apps/web');
    expect(await fs.pathExists(path.join(appDir, 'src-tauri/Cargo.toml'))).toBe(true);
    expect(await fs.pathExists(path.join(appDir, 'src/shared/i18n/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(appDir, 'src/shared/observability/sentry.ts'))).toBe(true);

    const viteCfg = await fs.readFile(path.join(appDir, 'vite.config.ts'), 'utf-8');
    // i18n 의 viteStaticCopy 와 sentry 의 sentryVitePlugin 모두 plugins 의 top-level entry.
    expect(viteCfg).toContain('viteStaticCopy(');
    expect(viteCfg).toContain('sentryVitePlugin(');
    expect(viteCfg.indexOf('viteStaticCopy(')).toBeLessThan(viteCfg.indexOf('sentryVitePlugin('));
    const targetsMatch = viteCfg.match(/targets:\s*\[[\s\S]*?\]/);
    expect(targetsMatch).not.toBeNull();
    expect(targetsMatch[0]).not.toContain('sentryVitePlugin');
    // build.sourcemap 도 같이 들어가 있어야 — server 분기 정상.
    expect(viteCfg).toContain('build: { sourcemap: true }');
    // GlobalProvider 순서 검증.
    const gp = await fs.readFile(path.join(appDir, 'src/app/providers/GlobalProvider/index.tsx'), 'utf-8');
    expect(gp.indexOf('<SentryProvider>')).toBeLessThan(gp.indexOf('<I18nProvider>'));
  });

  it('scenario 2 — monorepo, no plugins', async () => {
    prompts.input
      .mockResolvedValueOnce('my-mono')   // 프로젝트 이름
      .mockResolvedValueOnce('web')        // 첫 번째 앱 이름
      .mockResolvedValueOnce('3000');      // 포트
    prompts.select
      .mockResolvedValueOnce('next')         // platform
      .mockResolvedValueOnce('plain')         // cssFramework
      .mockResolvedValueOnce('__none__')      // theme
      .mockResolvedValueOnce('monorepo');     // structure
    prompts.checkbox.mockResolvedValueOnce([]);

    await createProject();

    const monoDir = path.join(tmpDir, 'my-mono');
    expect(await fs.pathExists(path.join(monoDir, 'pnpm-workspace.yaml'))).toBe(true);
    expect(await fs.pathExists(path.join(monoDir, 'turbo.json'))).toBe(true);
    expect(await fs.pathExists(path.join(monoDir, 'apps', 'web', 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(monoDir, 'packages', 'ui', 'ui-apps', 'ui-web'))).toBe(true);

    const rootPkg = await fs.readJson(path.join(monoDir, 'package.json'));
    expect(rootPkg.name).toBe('my-mono');

    const appPkg = await fs.readJson(path.join(monoDir, 'apps', 'web', 'package.json'));
    expect(appPkg.name).toBe('web');
    expect(appPkg.scripts.dev).toContain('-p 3000');

    // v0.65: ui-core 가 컴포넌트 SoT — sh-ui.config.json + components/hooks 디렉토리
    const uiCoreDir = path.join(monoDir, 'packages', 'ui', 'ui-core');
    expect(await fs.pathExists(path.join(uiCoreDir, 'sh-ui.config.json'))).toBe(true);
    expect(await fs.pathExists(path.join(uiCoreDir, 'src', 'components'))).toBe(true);
    expect(await fs.pathExists(path.join(uiCoreDir, 'src', 'hooks'))).toBe(true);
    const uiCoreCfg = await fs.readJson(path.join(uiCoreDir, 'sh-ui.config.json'));
    expect(uiCoreCfg.role).toBeUndefined();
    expect(uiCoreCfg.paths?.components).toBe('src/components');

    // v0.65: ui-app 은 tokens-only role 마커
    const uiAppCfg = await fs.readJson(
      path.join(monoDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'sh-ui.config.json'),
    );
    expect(uiAppCfg.role).toBe('tokens-only');
    expect(uiAppCfg.paths?.tokens).toBe('src/styles/tokens.css');
    expect(uiAppCfg.paths?.components).toBeUndefined();

    // apps/web 이 ui-core 를 의존성 + paths 로 갖고 있어야 — 사용자가 ui-core
    // 컴포넌트 import 시 deps 수동 추가 필요 없도록 (templates 누락 회귀 가드)
    expect(appPkg.dependencies?.['@workspace/ui-core']).toBe('workspace:*');
    expect(appPkg.dependencies?.['@workspace/ui-web']).toBe('workspace:*');
    const appTsconfig = await fs.readJson(path.join(monoDir, 'apps', 'web', 'tsconfig.json'));
    expect(appTsconfig.compilerOptions?.paths?.['@workspace/ui-core/*']).toEqual([
      '../../packages/ui/ui-core/src/*',
    ]);
  });
  it('scenario 3 — standalone + sentry + next-intl', async () => {
    // 플러그인은 이제 prompt 가 없고 --plugins 플래그로만 지정
    await createProject({
      name: 'my-app',
      platform: 'next',
      structure: 'standalone',
      plugins: ['sentry', 'next-intl'],
    });

    const projectDir = path.join(tmpDir, 'my-app');

    // dependencies 패치 확인
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies['@sentry/nextjs']).toBeDefined();
    expect(pkg.dependencies['next-intl']).toBeDefined();

    // .env.example 에 Sentry 키 추가 확인
    const envExample = await fs.readFile(path.join(projectDir, '.env.example'), 'utf-8');
    expect(envExample).toContain('SENTRY_ORG=');

    // next.config.ts 에 플러그인 반영 확인
    const nextConfig = await fs.readFile(path.join(projectDir, 'next.config.ts'), 'utf-8');
    expect(nextConfig).toContain('withSentryConfig');
    expect(nextConfig).toContain('createNextIntlPlugin');

    // next-intl transforms: app/page.tsx → app/[locale]/page.tsx
    expect(await fs.pathExists(path.join(projectDir, 'app', 'page.tsx'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'app', '[locale]', 'page.tsx'))).toBe(true);

    // Next 16 호환: app/layout.tsx 는 사라지고 [locale]/layout.tsx 가 root 역할.
    // - app/layout.tsx 가 패스스루로 남으면 Next 16 이 "Missing <html>/<body>" 에러를 던진다.
    // - globals.css side-effect import 는 새 root([locale]/layout.tsx) 로 이전돼 있어야 Tailwind 가 동작.
    expect(await fs.pathExists(path.join(projectDir, 'app', 'layout.tsx'))).toBe(false);
    const localeLayout = await fs.readFile(
      path.join(projectDir, 'app', '[locale]', 'layout.tsx'),
      'utf-8',
    );
    // v0.59.9 회귀 가드: globals.css import 의 상대 경로가 새 위치 기준으로 보정돼야 한다.
    // 원본 app/layout.tsx 의 `./globals.css` 는 app/[locale]/layout.tsx 로 이동하면서
    // `../globals.css` 가 돼야 하고, 그렇지 않으면 prod 빌드(`next build`) 가 모듈 미해결로 죽는다.
    expect(localeLayout).toContain("import '../globals.css';");
    expect(localeLayout).not.toContain("import './globals.css';");
    expect(localeLayout).toContain('RootLayout');
    expect(localeLayout).toContain('params');

    // RootLayout 본체는 html/body 를 가진다 (Next 16 root layout 요건)
    const rootLayout = await fs.readFile(
      path.join(projectDir, 'src', 'app', 'layouts', 'RootLayout.tsx'),
      'utf-8',
    );
    expect(rootLayout).toContain('<html');
    expect(rootLayout).toContain('<body>');
  });
  it('scenario 4 — addApp in monorepo', async () => {
    // minimal monorepo fixture: pnpm-workspace.yaml 만 필요
    await fs.writeFile(
      path.join(tmpDir, 'pnpm-workspace.yaml'),
      "packages:\n  - 'apps/*'\n  - 'packages/*'\n",
    );

    prompts.input
      .mockResolvedValueOnce('admin')   // 앱 이름
      .mockResolvedValueOnce('3001');    // 포트
    prompts.select.mockResolvedValueOnce('next'); // platform (v0.91.0+ — apps/ 비어있어 추론 불가)
    prompts.checkbox.mockResolvedValueOnce([]);

    await addApp();

    const appDir = path.join(tmpDir, 'apps', 'admin');
    expect(await fs.pathExists(path.join(appDir, 'package.json'))).toBe(true);

    const appPkg = await fs.readJson(path.join(appDir, 'package.json'));
    expect(appPkg.name).toBe('admin');
    expect(appPkg.scripts.dev).toContain('-p 3001');

    // ui-app-template 이 ui-admin 으로 복사됐는지
    expect(
      await fs.pathExists(path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-admin')),
    ).toBe(true);

    // v0.65: 새로 추가된 ui-app 도 tokens-only role 마커 — 컴포넌트 디렉토리 없음
    const uiAdminCfg = await fs.readJson(
      path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-admin', 'sh-ui.config.json'),
    );
    expect(uiAdminCfg.role).toBe('tokens-only');
    expect(
      await fs.pathExists(path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-admin', 'src', 'components')),
    ).toBe(false);
  });
  it('scenario 4b — addApp 옵션 객체 (비대화형 — MCP/CI 경로)', async () => {
    // v0.66: addApp 이 옵션 객체를 받아 MCP sh_ui_add_app 와 CLI 양쪽이 같은 진입점 사용.
    // 핵심 검증: name/port/css 옵션이 prompt 없이 전달되고 결과물에 반영되는지.
    await fs.writeFile(
      path.join(tmpDir, 'pnpm-workspace.yaml'),
      "packages:\n  - 'apps/*'\n  - 'packages/*'\n",
    );

    await addApp({
      name: 'studio',
      port: '4000',
      plugins: [],
      css: 'plain',
      platform: 'next',
    });

    const appPkg = await fs.readJson(path.join(tmpDir, 'apps', 'studio', 'package.json'));
    expect(appPkg.name).toBe('studio');
    expect(appPkg.scripts.dev).toContain('-p 4000');

    const uiPkgCfg = await fs.readJson(
      path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-studio', 'sh-ui.config.json'),
    );
    expect(uiPkgCfg.role).toBe('tokens-only');
    expect(uiPkgCfg.cssFramework).toBe('plain');

    // prompt 가 호출되지 않았어야 함 — 옵션 객체로 모두 전달.
    expect(prompts.input).not.toHaveBeenCalled();
    expect(prompts.checkbox).not.toHaveBeenCalled();
  });
  it('scenario 4c — addApp 비대화형 + name 누락 → 에러', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'pnpm-workspace.yaml'),
      "packages:\n  - 'apps/*'\n  - 'packages/*'\n",
    );
    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });
    try {
      await expect(addApp({ port: '3000' })).rejects.toThrow(/name/);
    } finally {
      Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });
    }
  });
  it('scenario 5 — flutter standalone', async () => {
    prompts.input.mockResolvedValueOnce('my-flutter-app');
    prompts.select
      .mockResolvedValueOnce('flutter')   // platform
      .mockResolvedValueOnce('__none__'); // theme

    await createProject();

    const projectDir = path.join(tmpDir, 'my-flutter-app');
    expect(await fs.pathExists(path.join(projectDir, 'pubspec.yaml'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'lib', 'main.dart'))).toBe(true);
    expect(
      await fs.pathExists(
        path.join(projectDir, 'lib', 'sh_ui', 'foundation', 'sh_ui_tokens.dart'),
      ),
    ).toBe(true);

    const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
    expect(cfg.platform).toBe('flutter');

    const pub = await fs.readFile(path.join(projectDir, 'pubspec.yaml'), 'utf-8');
    expect(pub).toContain('name: my-flutter-app');

    const mainDart = await fs.readFile(
      path.join(projectDir, 'lib', 'main.dart'),
      'utf-8',
    );
    expect(mainDart).toContain("title: 'my-flutter-app'");
  });

  it('scenario 6 — 모든 플래그 (inquirer 호출 없음)', async () => {
    // prompts 는 mock 된 상태 — 아무 mockResolvedValue 도 세팅 안 함
    await createProject({
      name: 'flaggy',
      platform: 'next',
      structure: 'standalone',
      plugins: ['sentry'],
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'flaggy');
    expect(await fs.pathExists(projectDir)).toBe(true);
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe('flaggy');
    expect(pkg.dependencies['@sentry/nextjs']).toBeDefined();

    // inquirer 는 한 번도 호출되지 않았어야 함
    expect(prompts.input).not.toHaveBeenCalled();
    expect(prompts.select).not.toHaveBeenCalled();
    expect(prompts.checkbox).not.toHaveBeenCalled();
  });

  it('scenario 6b — --css 명시 시 cssFramework 프롬프트 우회', async () => {
    await createProject({
      name: 'css-flag',
      platform: 'next',
      structure: 'standalone',
      css: 'plain',
      yes: true,
    });

    const cfg = await fs.readJson(path.join(tmpDir, 'css-flag', 'sh-ui.config.json'));
    expect(cfg.cssFramework).toBe('plain');
    // --yes + 모든 플래그 → 어떤 select 도 호출되지 않아야
    expect(prompts.select).not.toHaveBeenCalled();
  });

  it('scenario 6c — flutter → cssFramework 프롬프트 스킵 (개념상 무의미)', async () => {
    prompts.input.mockResolvedValueOnce('my-flutter');
    prompts.select
      .mockResolvedValueOnce('flutter')   // platform
      .mockResolvedValueOnce('__none__'); // theme — cssFramework 프롬프트는 없음

    await createProject();

    // Flutter 는 cssFramework 프롬프트를 띄우지 않으므로 select 호출은 정확히 2회
    expect(prompts.select).toHaveBeenCalledTimes(2);
    const cfg = await fs.readJson(path.join(tmpDir, 'my-flutter', 'sh-ui.config.json'));
    // Flutter 는 cssFramework 필드 자체를 두지 않는다 (v0.59.10+).
    expect(cfg.cssFramework).toBeUndefined();
    expect(cfg.platform).toBe('flutter');
  });

  it('scenario 7 — 부분 플래그 (name, platform 만 제공, 나머지는 프롬프트)', async () => {
    prompts.select
      .mockResolvedValueOnce('plain')        // cssFramework
      .mockResolvedValueOnce('__none__')    // theme
      .mockResolvedValueOnce('standalone'); // structure
    prompts.checkbox.mockResolvedValueOnce([]); // plugins

    await createProject({
      name: 'partial',
      platform: 'next',
    });

    const projectDir = path.join(tmpDir, 'partial');
    expect(await fs.pathExists(projectDir)).toBe(true);

    // name / platform 은 프롬프트 우회
    expect(prompts.input).not.toHaveBeenCalled();
    // cssFramework + theme + structure 세 번
    expect(prompts.select).toHaveBeenCalledTimes(3);
  });

  it('scenario 8 — theme 주입 (Next.js standalone)', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = { light: red, dark: blue, radius: 1 };
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'themed',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: themeB64,
      yes: true,
    });

    const cssPath = path.join(tmpDir, 'themed', 'src', 'shared', 'styles', 'tokens.css');
    const css = await fs.readFile(cssPath, 'utf-8');

    expect(css).toMatch(/:root\s*\{[^}]*--background:\s*#FF0000/s);
    expect(css).toMatch(/\.dark\s*\{[^}]*--background:\s*#0000FF/s);
    expect(css).toContain('--radius: 1rem;');
    expect(css).toContain('--space-0: 0;');
  });

  it('scenario 9 — theme 주입 (Flutter)', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = { light: red, dark: blue, radius: 0.75 };
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'flutter-themed',
      platform: 'flutter',
      theme: themeB64,
      yes: true,
    });

    const dartPath = path.join(
      tmpDir, 'flutter-themed', 'lib', 'sh_ui', 'foundation', 'sh_ui_tokens.dart',
    );
    const dart = await fs.readFile(dartPath, 'utf-8');

    expect(dart).toMatch(/static const light = ShUiColorTokens\([\s\S]*?background: Color\(0xFFFF0000\)/);
    expect(dart).toMatch(/static const dark = ShUiColorTokens\([\s\S]*?background: Color\(0xFF0000FF\)/);
    expect(dart).toContain('defaultRadius: 12.0,');
    expect(dart).toContain('class ShUiSpacingTokens');
  });

  it('scenario 10 — theme 없음: 템플릿 기본값 유지', async () => {
    await createProject({
      name: 'no-theme',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      yes: true,
    });

    const cssPath = path.join(tmpDir, 'no-theme', 'src', 'shared', 'styles', 'tokens.css');
    const css = await fs.readFile(cssPath, 'utf-8');
    expect(css).toContain('--background: #FFFFFF;');
    expect(css).toContain('--radius: 0.5rem;');
  });

  it('scenario 11 — 잘못된 theme base64 → 에러', async () => {
    // 50자 초과 + base64 알파벳 밖 문자 — 프리셋 휴리스틱 통과 후 decodeTheme 가 거부
    await expect(
      createProject({
        name: 'bad-theme',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        theme: '!'.repeat(60),
        yes: true,
      }),
    ).rejects.toThrow(/theme 디코드 실패/);
  });

  it('scenario 11b — 짧은 오타 → 프리셋 안내 에러', async () => {
    await expect(
      createProject({
        name: 'typo-theme',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        theme: 'rsoe',
        yes: true,
      }),
    ).rejects.toThrow(/알 수 없는 테마 프리셋.*neutral.*slate/);
  });

  it('scenario 11d — 옵셔널 카테고리 (spacing) 주입', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = {
      light: red, dark: blue, radius: 0.5,
      spacing: { '0': 0, '1': 8, '2': 16, '3': 24, '4': 32, '5': 40, '6': 48, '8': 64, '10': 80, '12': 96, '16': 128 },
    };
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'spaced',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: themeB64,
      yes: true,
    });

    const cssPath = path.join(tmpDir, 'spaced', 'src', 'shared', 'styles', 'tokens.css');
    const css = await fs.readFile(cssPath, 'utf-8');
    // spacing 마커 사이 새 값 — 디폴트 4 가 8 로 바뀜
    expect(css).toContain('--space-1: 0.5rem;');
    expect(css).toContain('--space-16: 8rem;');
    // 다른 카테고리(text 등)는 그대로
    expect(css).toContain('--text-xs: 0.75rem;');
  });

  it('scenario 11e — 카테고리 누락 시 템플릿 디폴트 유지', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = { light: red, dark: blue, radius: 0.5 }; // 옵셔널 카테고리 모두 없음
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'minimal',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: themeB64,
      yes: true,
    });

    const cssPath = path.join(tmpDir, 'minimal', 'src', 'shared', 'styles', 'tokens.css');
    const css = await fs.readFile(cssPath, 'utf-8');
    // 색은 주입됐고
    expect(css).toMatch(/:root\s*\{[^}]*--background:\s*#FF0000/s);
    // 다른 카테고리는 디폴트 그대로
    expect(css).toContain('--space-1: 0.25rem;');
    expect(css).toContain('--text-base: 1rem;');
    expect(css).toContain('--weight-bold: 700;');
  });

  it('scenario 11f — Flutter 옵셔널 카테고리 주입 (typography)', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = {
      light: red, dark: blue, radius: 0.5,
      typography: { xs: 10, sm: 13, base: 15, lg: 17, xl: 19, '2xl': 22, '3xl': 28, '4xl': 34 },
    };
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'flutter-typed',
      platform: 'flutter',
      theme: themeB64,
      yes: true,
    });

    const dartPath = path.join(
      tmpDir, 'flutter-typed', 'lib', 'sh_ui', 'foundation', 'sh_ui_tokens.dart',
    );
    const dart = await fs.readFile(dartPath, 'utf-8');
    expect(dart).toContain('xs: 10.0,');
    expect(dart).toContain('xl4: 34.0,');
    // 다른 카테고리(spacing 등) 디폴트
    expect(dart).toContain('s4: 16.0,');
  });

  it('scenario 11g — Phase 3 shadow 주입 (Next + Flutter)', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = {
      light: red, dark: blue, radius: 0.5,
      shadows: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.2)',
        md: '0 6px 16px rgba(0, 0, 0, 0.25)',
        lg: '0 12px 32px rgba(0, 0, 0, 0.3)',
        xl: '0 20px 64px rgba(0, 0, 0, 0.35)',
      },
    };
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'shadowed',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: themeB64,
      yes: true,
    });

    const css = await fs.readFile(
      path.join(tmpDir, 'shadowed', 'src', 'shared', 'styles', 'tokens.css'), 'utf-8',
    );
    expect(css).toContain('--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);');
    expect(css).toContain('--shadow-xl: 0 20px 64px rgba(0, 0, 0, 0.35);');
  });

  it('scenario 11h — Phase 3 ease 주입 (Flutter — Cubic 변환)', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = {
      light: red, dark: blue, radius: 0.5,
      eases: {
        standard: 'cubic-bezier(0.5, 0, 0.5, 1)',
        emphasized: 'ease-in-out',
      },
    };
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'eased',
      platform: 'flutter',
      theme: themeB64,
      yes: true,
    });

    const dart = await fs.readFile(
      path.join(tmpDir, 'eased', 'lib', 'sh_ui', 'foundation', 'sh_ui_tokens.dart'), 'utf-8',
    );
    expect(dart).toContain('standard: Cubic(0.5, 0, 0.5, 1),');
    // ease-in-out 는 Cubic(0.42, 0, 0.58, 1) 로 매핑
    expect(dart).toContain('emphasized: Cubic(0.42, 0, 0.58, 1),');
  });

  it('scenario 11i — Phase 3 gradient 주입 (CSS + Dart 변환)', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = {
      light: red, dark: blue, radius: 0.5,
      gradients: {
        primary: 'linear-gradient(45deg, #FF0000 0%, #0000FF 100%)',
        surface: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
        overlay: 'linear-gradient(180deg, #000000 0%, #1F1F1F 100%)',
      },
    };
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'grad',
      platform: 'flutter',
      theme: themeB64,
      yes: true,
    });

    const dart = await fs.readFile(
      path.join(tmpDir, 'grad', 'lib', 'sh_ui', 'foundation', 'sh_ui_tokens.dart'), 'utf-8',
    );
    // 45deg primary → end ≈ (0.707, -0.707)
    expect(dart).toMatch(/primary: LinearGradient\(begin: Alignment\(-0\.707, 0\.707\), end: Alignment\(0\.707, -0\.707\)/);
    expect(dart).toContain('Color(0xFFFF0000), Color(0xFF0000FF)');
  });

  it('scenario 11j — Phase 4: rose 프리셋이 control-md 44px 까지 주입', async () => {
    await createProject({
      name: 'rose-controls',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: 'rose',
      yes: true,
    });
    const css = await fs.readFile(
      path.join(tmpDir, 'rose-controls', 'src', 'shared', 'styles', 'tokens.css'), 'utf-8',
    );
    // rose 의 controls = { sm: 36, md: 44, lg: 52 } 가 주입되어 디폴트 32/40/48 을 덮어씀
    expect(css).toContain('--control-sm: 2.25rem;');
    expect(css).toContain('--control-md: 2.75rem;');
    expect(css).toContain('--control-lg: 3.25rem;');
    // typography 는 미정의 — 디폴트 그대로
    expect(css).toContain('--text-base: 1rem;');
  });

  it('scenario 11k — Phase 4: slate 프리셋이 typography + controls 둘 다 차별화', async () => {
    await createProject({
      name: 'slate-dense',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: 'slate',
      yes: true,
    });
    const css = await fs.readFile(
      path.join(tmpDir, 'slate-dense', 'src', 'shared', 'styles', 'tokens.css'), 'utf-8',
    );
    // slate typography 14px 본문 + 작은 컨트롤
    expect(css).toContain('--text-base: 0.875rem;');
    expect(css).toContain('--text-xs: 0.6875rem;');
    expect(css).toContain('--control-md: 2.25rem;');
  });

  it('scenario 11l — Phase 4: violet 프리셋이 borders.widthStrong 3px 까지 차별화', async () => {
    await createProject({
      name: 'violet-borders',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: 'violet',
      yes: true,
    });
    const css = await fs.readFile(
      path.join(tmpDir, 'violet-borders', 'src', 'shared', 'styles', 'tokens.css'), 'utf-8',
    );
    expect(css).toContain('--border-width: 1px;');
    expect(css).toContain('--border-width-strong: 3px;');
    expect(css).toContain('--control-md: 2.625rem;');
  });

  it('scenario 11m — Phase 4: neutral / emerald 는 카테고리 차별화 없음 (디폴트 유지)', async () => {
    await createProject({
      name: 'neutral-baseline',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: 'neutral',
      yes: true,
    });
    const css = await fs.readFile(
      path.join(tmpDir, 'neutral-baseline', 'src', 'shared', 'styles', 'tokens.css'), 'utf-8',
    );
    // neutral 은 디폴트 — 그대로 유지
    expect(css).toContain('--control-md: 2.25rem;');
    expect(css).toContain('--text-base: 1rem;');
    expect(css).toContain('--border-width-strong: 2px;');
  });

  it('scenario 11c — 프리셋 이름 → 토큰 주입', async () => {
    await createProject({
      name: 'preset-rose',
      platform: 'next',
      structure: 'standalone',
      plugins: [],
      theme: 'rose',
      yes: true,
    });

    const cssPath = path.join(tmpDir, 'preset-rose', 'src', 'shared', 'styles', 'tokens.css');
    const css = await fs.readFile(cssPath, 'utf-8');
    // rose 프리셋의 light primary 색
    expect(css).toMatch(/:root\s*\{[^}]*--primary:\s*#E11D48/s);
    // dark primary
    expect(css).toMatch(/\.dark\s*\{[^}]*--primary:\s*#FB7185/s);
    // rose radius 0.75
    expect(css).toContain('--radius: 0.75rem;');
  });

  it('scenario 12 — theme 주입 (monorepo) → ui-web 패키지에 반영', async () => {
    const red = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#FF0000']));
    const blue = Object.fromEntries(TOKEN_KEYS.map((k) => [k, '#0000FF']));
    const theme = { light: red, dark: blue, radius: 0.25 };
    const themeB64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');

    await createProject({
      name: 'mono-themed',
      platform: 'next',
      structure: 'monorepo',
      plugins: [],
      theme: themeB64,
      yes: true, // web/3000 기본값으로 비대화형 진행
    });

    // monorepo 의 테마는 apps/web 이 아니라 packages/ui/ui-apps/ui-web 에 주입
    const cssPath = path.join(
      tmpDir,
      'mono-themed',
      'packages',
      'ui',
      'ui-apps',
      'ui-web',
      'src',
      'styles',
      'tokens.css',
    );
    const css = await fs.readFile(cssPath, 'utf-8');

    expect(css).toMatch(/:root\s*\{[^}]*--background:\s*#FF0000/s);
    expect(css).toMatch(/\.dark\s*\{[^}]*--background:\s*#0000FF/s);
    expect(css).toContain('--radius: 0.25rem;');
    // 마커 바깥 토큰(spacing 등) 는 그대로
    expect(css).toContain('--space-0: 0;');

    // v0.65: 테마는 ui-app 만 — ui-core 는 컴포넌트 SoT 라 tokens.css 보유 안 함
    const uiCoreTokens = path.join(
      tmpDir,
      'mono-themed',
      'packages',
      'ui',
      'ui-core',
      'src',
      'styles',
      'tokens.css',
    );
    expect(await fs.pathExists(uiCoreTokens)).toBe(false);
  });

  describe('비대화형 환경 가드 (no-TTY)', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdin, 'isTTY', {
        value: false,
        configurable: true,
      });
    });

    it('name 누락 → 에러', async () => {
      await expect(createProject({ platform: 'next', structure: 'standalone' }))
        .rejects.toThrow(/<project-name>/);
    });

    it('--platform 누락 → 에러', async () => {
      await expect(createProject({ name: 'x' }))
        .rejects.toThrow(/--platform/);
    });

    it('next 인데 --structure 누락 → 에러', async () => {
      await expect(createProject({ name: 'x', platform: 'next' }))
        .rejects.toThrow(/--structure/);
    });

    it('flutter 는 --structure 불필요', async () => {
      await expect(createProject({
        name: 'flutter-no-tty',
        platform: 'flutter',
        yes: true,
      })).resolves.not.toThrow();
      const projectDir = path.join(tmpDir, 'flutter-no-tty');
      expect(await fs.pathExists(projectDir)).toBe(true);
    });

    it('필수 플래그 모두 제공 → 성공', async () => {
      await expect(createProject({
        name: 'no-tty-app',
        platform: 'next',
        structure: 'standalone',
        yes: true,
      })).resolves.not.toThrow();
      const projectDir = path.join(tmpDir, 'no-tty-app');
      expect(await fs.pathExists(projectDir)).toBe(true);
    });
  });

  // ─── 플러그인 구조 검증 (v0.32.0 의 src/proxy.ts 같은 회귀 차단) ───

  describe('plugin structure assertions', () => {
    it('auth-jwt: proxy.ts 는 root 에 있어야 한다 (src/proxy.ts 금지)', async () => {
      await createProject({
        name: 'auth-app',
        platform: 'next',
        structure: 'standalone',
        plugins: ['auth-jwt'],
        yes: true,
      });

      const projectDir = path.join(tmpDir, 'auth-app');

      // root proxy.ts 존재
      expect(await fs.pathExists(path.join(projectDir, 'proxy.ts'))).toBe(true);
      // src/proxy.ts 는 절대 안 됨 — Next 16 이 인식 못 함
      expect(await fs.pathExists(path.join(projectDir, 'src', 'proxy.ts'))).toBe(false);

      // 핵심 파일들 동반
      expect(await fs.pathExists(path.join(projectDir, 'src', 'shared', 'api', 'refreshSession.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, 'src', 'shared', 'api', 'withAuthRetry.ts'))).toBe(true);
    });

    it('auth-jwt + next-intl: proxy.ts 가 합성 (intl + 인증 가드)', async () => {
      await createProject({
        name: 'combo-app',
        platform: 'next',
        structure: 'standalone',
        plugins: ['auth-jwt', 'next-intl'],
        yes: true,
      });

      const proxyPath = path.join(tmpDir, 'combo-app', 'proxy.ts');
      expect(await fs.pathExists(proxyPath)).toBe(true);

      const content = await fs.readFile(proxyPath, 'utf-8');
      // intl 미들웨어
      expect(content).toContain('createIntlMiddleware');
      // 인증 가드 (토큰 존재 체크)
      expect(content).toContain('accessToken');
      // locale prefix 처리
      expect(content).toContain('stripLocalePrefix');
    });

    it('sentry: observability.ts 가 베이스를 덮어쓴다 (Sentry import 포함)', async () => {
      await createProject({
        name: 'sentry-app',
        platform: 'next',
        structure: 'standalone',
        plugins: ['sentry'],
        yes: true,
      });

      const obsPath = path.join(
        tmpDir, 'sentry-app', 'src', 'shared', 'api', 'observability.ts',
      );
      const content = await fs.readFile(obsPath, 'utf-8');
      expect(content).toContain("@sentry/nextjs");
      expect(content).toContain('captureApiError');
    });

    it('베이스 (플러그인 없음): observability.ts 는 no-op', async () => {
      await createProject({
        name: 'bare-app',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        yes: true,
      });

      const obsPath = path.join(
        tmpDir, 'bare-app', 'src', 'shared', 'api', 'observability.ts',
      );
      const content = await fs.readFile(obsPath, 'utf-8');
      // 베이스는 Sentry import 없음
      expect(content).not.toContain('@sentry/nextjs');
      // axios 도 없어야 함 (v0.32.0 이후)
      expect(content).not.toContain('axios');
    });

    it('베이스: http.ts 는 isomorphic fetch (axios 아님)', async () => {
      await createProject({
        name: 'http-check',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        yes: true,
      });

      const httpPath = path.join(tmpDir, 'http-check', 'src', 'shared', 'api', 'http.ts');
      const content = await fs.readFile(httpPath, 'utf-8');
      expect(content).not.toContain('axios');
      expect(content).toContain('serverFetch');
      expect(content).toContain('clientFetch');
    });

    it('package.json 에 axios 가 들어있지 않다', async () => {
      await createProject({
        name: 'no-axios',
        platform: 'next',
        structure: 'standalone',
        plugins: ['sentry', 'auth-jwt', 'next-intl'],
        yes: true,
      });

      const pkg = await fs.readJson(
        path.join(tmpDir, 'no-axios', 'package.json'),
      );
      expect(pkg.dependencies?.axios).toBeUndefined();
      expect(pkg.devDependencies?.axios).toBeUndefined();
    });
  });

  // ─── --dry-run 검증 ───

  describe('dry-run 모드', () => {
    it('파일을 cwd 에 쓰지 않는다', async () => {
      await createProject({
        name: 'never-written',
        platform: 'next',
        structure: 'standalone',
        plugins: ['auth-jwt'],
        yes: true,
        dryRun: true,
      });

      const projectDir = path.join(tmpDir, 'never-written');
      expect(await fs.pathExists(projectDir)).toBe(false);
    });
  });

  // ─── git 초기화 + .gitignore 자동 생성 ───
  //
  // npm publish 는 패키지 안의 `.gitignore` 를 strip 하므로 템플릿엔 `gitignore`
  // 로 두고 스캐폴드 시 dot-prefix 를 붙인다 — 사용자에게 도착해야 한다.

  describe('git 초기화', () => {
    it('standalone — .gitignore 와 .git/ 둘 다 생성', async () => {
      await createProject({
        name: 'with-git',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        yes: true,
      });

      const projectDir = path.join(tmpDir, 'with-git');
      expect(await fs.pathExists(path.join(projectDir, '.gitignore'))).toBe(true);
      // 우회용 원본은 남아있으면 안 됨
      expect(await fs.pathExists(path.join(projectDir, 'gitignore'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, '.git'))).toBe(true);

      const gi = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8');
      expect(gi).toContain('node_modules');
      expect(gi).toContain('.next/');
      expect(gi).toContain('.claude/settings.local.json');
    });

    it('monorepo — 루트에 .gitignore 와 .git/ 생성 (Turbo 항목 포함)', async () => {
      await createProject({
        name: 'mono-git',
        platform: 'next',
        structure: 'monorepo',
        plugins: [],
        yes: true,
      });

      const monoDir = path.join(tmpDir, 'mono-git');
      expect(await fs.pathExists(path.join(monoDir, '.gitignore'))).toBe(true);
      expect(await fs.pathExists(path.join(monoDir, '.git'))).toBe(true);

      const gi = await fs.readFile(path.join(monoDir, '.gitignore'), 'utf-8');
      expect(gi).toContain('.turbo');
    });

    // v0.94.0+ 회귀 가드 — monorepo + vite 시 apps/<name>/gitignore 도 dot-prefix 되어야 한다.
    // 이전엔 root 만 rename 해서 apps/web/gitignore 가 남았다 (node_modules / dist 가 git staged 될 위험).
    it('monorepo + vite — apps/<name>/.gitignore 도 dot-prefix 된다', async () => {
      await createProject({
        name: 'mono-vite-gitignore',
        platform: 'vite',
        structure: 'monorepo',
        plugins: [],
        yes: true,
      });

      const monoDir = path.join(tmpDir, 'mono-vite-gitignore');
      const appDir = path.join(monoDir, 'apps', 'web');
      expect(await fs.pathExists(path.join(monoDir, '.gitignore'))).toBe(true);
      expect(await fs.pathExists(path.join(appDir, '.gitignore'))).toBe(true);
      // 우회용 원본은 sub-app 에도 남아있으면 안 된다.
      expect(await fs.pathExists(path.join(monoDir, 'gitignore'))).toBe(false);
      expect(await fs.pathExists(path.join(appDir, 'gitignore'))).toBe(false);

      const appGi = await fs.readFile(path.join(appDir, '.gitignore'), 'utf-8');
      expect(appGi).toContain('node_modules');
      expect(appGi).toContain('dist');
    });

    it('flutter — .gitignore 와 .git/ 생성 (Flutter 패턴 포함)', async () => {
      await createProject({
        name: 'flutter-git',
        platform: 'flutter',
        yes: true,
      });

      const projectDir = path.join(tmpDir, 'flutter-git');
      expect(await fs.pathExists(path.join(projectDir, '.gitignore'))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, '.git'))).toBe(true);

      const gi = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8');
      expect(gi).toContain('.dart_tool/');
    });

    it('dry-run — git init 도 .gitignore 도 cwd 에 남지 않는다', async () => {
      await createProject({
        name: 'dry-git',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        yes: true,
        dryRun: true,
      });

      expect(await fs.pathExists(path.join(tmpDir, 'dry-git'))).toBe(false);
    });
  });

  // ─── arch=flat 매트릭스 ───
  //
  // Layer 3 부터 --arch flat 지원. 베이스 템플릿이 _arch/{fsd,flat}/ 오버레이로
  // 분리됐고, 플러그인은 arch.paths/aliases 만 보고 flat 경로로 emit.
  // 핵심 회귀 가드:
  //   - flat 에는 src/ 가 절대 없어야 함 (FSD 슬라이스 부재가 flat 의 본질)
  //   - lib/ + components/ 가 있어야 함
  //   - 플러그인 산출물이 flat 경로로 떨어져야 함
  //   - tsconfig 의 paths 가 scoped (@/lib/*, @/components/*)
  //   - 어떤 파일에도 @/src/ import 가 남아있지 않아야 함

  describe('arch=flat 매트릭스', () => {
    async function readAllSources(dir) {
      const out = [];
      async function walk(d) {
        const entries = await fs.readdir(d, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(d, e.name);
          if (e.isDirectory()) {
            if (e.name === 'node_modules' || e.name === '.git' || e.name === '.next') continue;
            await walk(full);
          } else if (e.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx'))) {
            out.push({ path: full, content: await fs.readFile(full, 'utf-8') });
          }
        }
      }
      await walk(dir);
      return out;
    }

    it('flat standalone — 플러그인 없음 — src/ 부재, lib/components 존재, scoped tsconfig', async () => {
      await createProject({
        name: 'flat-bare',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        arch: 'flat',
        yes: true,
      });
      const dir = path.join(tmpDir, 'flat-bare');
      expect(await fs.pathExists(path.join(dir, 'src'))).toBe(false);
      expect(await fs.pathExists(path.join(dir, 'lib'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'components'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'components', 'layouts', 'RootLayout.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'components', 'providers', 'GlobalProvider', 'index.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'lib', 'api', 'http.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'lib', 'styles', 'tokens.css'))).toBe(true);

      const tsconfig = await fs.readJson(path.join(dir, 'tsconfig.json'));
      expect(tsconfig.compilerOptions.paths['@/lib/*']).toEqual(['./lib/*']);
      expect(tsconfig.compilerOptions.paths['@/components/*']).toEqual(['./components/*']);
      // @/app/* alias 제외 — Next.js routes 에선 alias 사용 안 됨.
      expect(tsconfig.compilerOptions.paths['@/app/*']).toBeUndefined();
      expect(tsconfig.compilerOptions.paths['@/*']).toBeUndefined();
    });

    it('flat standalone — @/src/ import 가 어떤 .ts/.tsx 파일에도 남아있지 않음', async () => {
      await createProject({
        name: 'flat-no-src',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        arch: 'flat',
        yes: true,
      });
      const sources = await readAllSources(path.join(tmpDir, 'flat-no-src'));
      const violators = sources.filter((s) => /@\/src\//.test(s.content));
      if (violators.length > 0) {
        // 디버깅용 — 어디에 남아있는지 보이게
        const detail = violators.map((v) => v.path.replace(tmpDir, '')).join('\n');
        throw new Error(`@/src/ import 가 남아있음:\n${detail}`);
      }
      expect(violators).toEqual([]);
    });

    it('flat standalone — globals.css 의 tokens import 가 실재하는 파일을 가리킴', async () => {
      // v0.59.7 회귀: 베이스 globals.css 가 fsd 경로(`../src/shared/styles/tokens.css`)를
      // 하드코딩하고 _arch/flat/app/globals.css 오버라이드가 없어, flat standalone 빌드 시
      // tailwindcss 가 토큰 파일을 못 찾고 폭발했다. .css 상대 import 까지 가드.
      await createProject({
        name: 'flat-globals',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        arch: 'flat',
        yes: true,
      });
      const dir = path.join(tmpDir, 'flat-globals');
      const globals = await fs.readFile(path.join(dir, 'app', 'globals.css'), 'utf-8');
      expect(globals).toContain("'../lib/styles/tokens.css'");
      expect(globals).not.toContain("'../src/shared/styles/tokens.css'");
      expect(await fs.pathExists(path.join(dir, 'lib', 'styles', 'tokens.css'))).toBe(true);
    });

    it('flat standalone — sentry — observability 와 FallbackBoundary 가 flat 경로로', async () => {
      await createProject({
        name: 'flat-sentry',
        platform: 'next',
        structure: 'standalone',
        plugins: ['sentry'],
        arch: 'flat',
        yes: true,
      });
      const dir = path.join(tmpDir, 'flat-sentry');
      expect(await fs.pathExists(path.join(dir, 'lib', 'api', 'observability.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'components', 'common', 'FallbackBoundary', 'index.tsx'))).toBe(true);
      // FSD 경로엔 없어야 함
      expect(await fs.pathExists(path.join(dir, 'src'))).toBe(false);

      // FallbackBoundary 가 ApiError 를 flat alias 로 import
      const fb = await fs.readFile(
        path.join(dir, 'components', 'common', 'FallbackBoundary', 'index.tsx'),
        'utf-8',
      );
      expect(fb).toContain("from '@/lib/api/error'");
    });

    it('flat standalone — next-intl — i18n 설정이 lib/config/i18n 으로', async () => {
      await createProject({
        name: 'flat-intl',
        platform: 'next',
        structure: 'standalone',
        plugins: ['next-intl'],
        arch: 'flat',
        yes: true,
      });
      const dir = path.join(tmpDir, 'flat-intl');
      expect(await fs.pathExists(path.join(dir, 'lib', 'config', 'i18n', 'routing.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'lib', 'config', 'i18n', 'request.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'lib', 'config', 'i18n', 'messages', 'ko.json'))).toBe(true);

      // [locale]/layout.tsx 는 flat alias 로 RootLayout import
      const localeLayout = await fs.readFile(
        path.join(dir, 'app', '[locale]', 'layout.tsx'),
        'utf-8',
      );
      expect(localeLayout).toContain("from '@/components/layouts/RootLayout'");

      // RootLayout 은 flat alias 로 GlobalProvider + i18n routing import
      const rootLayout = await fs.readFile(
        path.join(dir, 'components', 'layouts', 'RootLayout.tsx'),
        'utf-8',
      );
      expect(rootLayout).toContain("from '@/components/providers'");
      expect(rootLayout).toContain("from '@/lib/config/i18n/routing'");

      // next.config.ts 의 createNextIntlPlugin 경로도 flat 기준
      const nextConfig = await fs.readFile(path.join(dir, 'next.config.ts'), 'utf-8');
      expect(nextConfig).toContain("'./lib/config/i18n/request.ts'");
    });

    it('flat standalone — auth-jwt — refreshSession 등이 lib/api 로, BFF 가 flat alias 로', async () => {
      await createProject({
        name: 'flat-auth',
        platform: 'next',
        structure: 'standalone',
        plugins: ['auth-jwt'],
        arch: 'flat',
        yes: true,
      });
      const dir = path.join(tmpDir, 'flat-auth');
      expect(await fs.pathExists(path.join(dir, 'lib', 'api', 'refreshSession.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'lib', 'api', 'withAuthRetry.ts'))).toBe(true);

      const bff = await fs.readFile(
        path.join(dir, 'app', 'api', 'proxy', '[...path]', 'route.ts'),
        'utf-8',
      );
      expect(bff).toContain("from '@/lib/api/observability'");
      expect(bff).toContain("from '@/lib/api/refreshSession'");
    });

    it('flat standalone — sentry + next-intl + auth-jwt 셋 다 — proxy 병합 + 모든 산출물 flat 경로', async () => {
      await createProject({
        name: 'flat-all',
        platform: 'next',
        structure: 'standalone',
        plugins: ['sentry', 'next-intl', 'auth-jwt'],
        arch: 'flat',
        yes: true,
      });
      const dir = path.join(tmpDir, 'flat-all');

      // 병합된 proxy.ts 는 flat alias 로 i18n routing import
      const proxy = await fs.readFile(path.join(dir, 'proxy.ts'), 'utf-8');
      expect(proxy).toContain("from '@/lib/config/i18n/routing'");
      expect(proxy).toContain('createIntlMiddleware');
      expect(proxy).toContain('accessToken');

      // src/ 절대 부재
      expect(await fs.pathExists(path.join(dir, 'src'))).toBe(false);

      // 모든 산출물이 flat 경로
      expect(await fs.pathExists(path.join(dir, 'lib', 'api', 'observability.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'lib', 'api', 'refreshSession.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'lib', 'config', 'i18n', 'routing.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'components', 'common', 'FallbackBoundary', 'index.tsx'))).toBe(true);

      // 어디에도 @/src/ import 없음
      const sources = await readAllSources(dir);
      const violators = sources.filter((s) => /@\/src\//.test(s.content));
      expect(violators).toEqual([]);
    });

    it('flat monorepo — apps/web 에 flat 구조 + 플러그인 산출물', async () => {
      await createProject({
        name: 'flat-mono',
        platform: 'next',
        structure: 'monorepo',
        plugins: ['sentry', 'next-intl', 'auth-jwt'],
        arch: 'flat',
        yes: true,
      });
      const webDir = path.join(tmpDir, 'flat-mono', 'apps', 'web');
      expect(await fs.pathExists(path.join(webDir, 'src'))).toBe(false);
      expect(await fs.pathExists(path.join(webDir, 'lib', 'api', 'observability.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(webDir, 'components', 'layouts', 'RootLayout.tsx'))).toBe(true);

      const sources = await readAllSources(webDir);
      const violators = sources.filter((s) => /@\/src\//.test(s.content));
      expect(violators).toEqual([]);
    });
  });

  // ─── arch=mes 매트릭스 ───
  //
  // MES (백오피스) 프리셋 — 페이지 격리 구조. src/pages/<name>/ 가 자기완결,
  // 페이지 끼리는 import 안 함. flat 과 달리 모든 코드가 src/ 아래에 있고,
  // app/ 라우트는 한 줄 위임으로 src/pages/<name>/ 에 연결.

  describe('arch=mes 매트릭스', () => {
    it('mes standalone — src/{pages,components,hooks,lib} 구조 (페이지 격리 슬롯만)', async () => {
      await createProject({
        name: 'mes-bare',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        arch: 'mes',
        yes: true,
      });
      const dir = path.join(tmpDir, 'mes-bare');

      // 페이지 격리 구조: 모든 코드가 src/ 아래
      expect(await fs.pathExists(path.join(dir, 'src'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'pages'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'components', 'layouts', 'RootLayout.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'hooks', 'useAppMutation.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'lib', 'api', 'http.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'lib', 'styles', 'tokens.css'))).toBe(true);

      // flat 의 root-level lib/components 는 부재
      expect(await fs.pathExists(path.join(dir, 'lib'))).toBe(false);
      expect(await fs.pathExists(path.join(dir, 'components'))).toBe(false);

      // src/pages/sign-in/ — 슬롯 레이아웃 예시 (동작하는 코드 X, 컨벤션만).
      // 새 페이지 추가 시 이 폴더 복사 → 이름 교체.
      expect(await fs.pathExists(path.join(dir, 'app', 'sign-in', 'page.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'pages', 'sign-in', 'index.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'pages', 'sign-in', 'api.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'pages', 'sign-in', 'hooks.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'pages', 'sign-in', 'schema.ts'))).toBe(true);

      const routePage = await fs.readFile(path.join(dir, 'app', 'sign-in', 'page.tsx'), 'utf-8');
      expect(routePage).toContain("from '@/pages/sign-in'");

      // tsconfig 는 catch-all @/* → ./src/*
      const tsconfig = await fs.readJson(path.join(dir, 'tsconfig.json'));
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*']);
    });

    it('mes standalone — globals.css 의 tokens import 가 src/lib/styles 를 가리킴', async () => {
      // flat 의 v0.59.7 회귀와 같은 클래스의 가드 — base globals.css 가 fsd 경로를
      // 박고 있으므로 mes overlay 의 globals.css 가 src/lib/styles/tokens.css 로
      // 정확히 덮어쓰는지 확인.
      await createProject({
        name: 'mes-globals',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        arch: 'mes',
        yes: true,
      });
      const dir = path.join(tmpDir, 'mes-globals');
      const globals = await fs.readFile(path.join(dir, 'app', 'globals.css'), 'utf-8');
      expect(globals).toContain("'../src/lib/styles/tokens.css'");
      expect(globals).not.toContain("'../src/shared/styles/tokens.css'");
      expect(globals).not.toContain("'../lib/styles/tokens.css'");
    });
  });

  // ─── FSD 회귀 가드 — Layer 1~3 변경 후에도 v0.57 까지의 출력과 동일해야 함 ───

  describe('arch=fsd 회귀 가드', () => {
    it('fsd standalone — src/ 존재, components/lib 부재', async () => {
      await createProject({
        name: 'fsd-keep',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        arch: 'fsd',
        yes: true,
      });
      const dir = path.join(tmpDir, 'fsd-keep');
      expect(await fs.pathExists(path.join(dir, 'src'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'app', 'layouts', 'RootLayout.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(dir, 'src', 'shared', 'api', 'http.ts'))).toBe(true);
      // flat 디렉토리는 없어야 함
      expect(await fs.pathExists(path.join(dir, 'lib'))).toBe(false);
      expect(await fs.pathExists(path.join(dir, 'components'))).toBe(false);

      const tsconfig = await fs.readJson(path.join(dir, 'tsconfig.json'));
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./*']);
    });

    it('fsd standalone — arch 미지정 시 fsd 가 default', async () => {
      await createProject({
        name: 'fsd-default',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        // arch 미지정
        yes: true,
      });
      const dir = path.join(tmpDir, 'fsd-default');
      expect(await fs.pathExists(path.join(dir, 'src'))).toBe(true);
    });
  });
});
