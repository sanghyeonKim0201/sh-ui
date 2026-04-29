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
  it('scenario 2 — monorepo, no plugins', async () => {
    prompts.input
      .mockResolvedValueOnce('my-mono')   // 프로젝트 이름
      .mockResolvedValueOnce('web')        // 첫 번째 앱 이름
      .mockResolvedValueOnce('3000');      // 포트
    prompts.select
      .mockResolvedValueOnce('next')         // platform
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
  });
  it('scenario 5 — flutter standalone', async () => {
    prompts.input.mockResolvedValueOnce('my-flutter-app');
    prompts.select.mockResolvedValueOnce('flutter');

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

  it('scenario 7 — 부분 플래그 (name, platform 만 제공, 나머지는 프롬프트)', async () => {
    prompts.select.mockResolvedValueOnce('standalone'); // structure
    prompts.checkbox.mockResolvedValueOnce([]);          // plugins

    await createProject({
      name: 'partial',
      platform: 'next',
    });

    const projectDir = path.join(tmpDir, 'partial');
    expect(await fs.pathExists(projectDir)).toBe(true);

    // name / platform 은 프롬프트 우회
    expect(prompts.input).not.toHaveBeenCalled();
    // structure 는 프롬프트 호출됨 (select 1 번)
    expect(prompts.select).toHaveBeenCalledTimes(1);
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
    expect(css).toContain('--space-0: 0px;');
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
    await expect(
      createProject({
        name: 'bad-theme',
        platform: 'next',
        structure: 'standalone',
        plugins: [],
        theme: 'not-valid-base64!!!',
        yes: true,
      }),
    ).rejects.toThrow(/theme 디코드 실패/);
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
    expect(css).toContain('--space-0: 0px;');
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
});
