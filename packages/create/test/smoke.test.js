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
    prompts.select.mockResolvedValueOnce('standalone');
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
  it.todo('scenario 2 — monorepo, no plugins');
  it.todo('scenario 3 — standalone + sentry + next-intl');
  it.todo('scenario 4 — addApp in monorepo');
});
