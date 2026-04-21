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
const { createProject, addApp } = await import('../src/generator.js');

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `sh-ui-create-${crypto.randomUUID()}`);
  await fs.ensureDir(tmpDir);
  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
  vi.spyOn(console, 'log').mockImplementation(() => {});
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

describe('@sh-ui/create smoke tests', () => {
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
    prompts.input.mockResolvedValueOnce('my-app');
    prompts.select
      .mockResolvedValueOnce('next')         // platform
      .mockResolvedValueOnce('standalone');   // structure
    prompts.checkbox.mockResolvedValueOnce(['sentry', 'next-intl']);

    await createProject();

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
});
