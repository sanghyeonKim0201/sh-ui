import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

// `validateProjectName` 단위 + `createProject`/`addApp` 진입부의 path traversal
// 회귀 가드. MCP / CLI 모두 진입부에서 막히는지 확인.

vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
  checkbox: vi.fn(),
  confirm: vi.fn(),
}));

const { createProject, addApp, validateProjectName } = await import(
  '../src/create/generator.js'
);

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(
    os.tmpdir(),
    `sh-ui-name-validation-${crypto.randomUUID()}`,
  );
  await fs.ensureDir(tmpDir);
  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  // 비대화형 환경 — 검증 실패 시 throw 가 prompt 우회로 즉시 표면화.
  Object.defineProperty(process.stdin, 'isTTY', {
    value: false,
    configurable: true,
  });
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.remove(tmpDir);
});

describe('validateProjectName', () => {
  it.each([
    'my-app',
    'my_app',
    'app1',
    'a.b.c',
    'sh-ui',
    'A',
  ])('허용: %s', (name) => {
    expect(() => validateProjectName(name)).not.toThrow();
  });

  it.each([
    // path traversal
    '..',
    '../foo',
    'foo/..',
    'a/b',
    'a\\b',
    // 절대경로
    '/etc/passwd',
    // 선행 dot (숨김 디렉토리)
    '.ssh',
    '.git',
    '.bashrc',
    // 셸 메타문자
    'foo;rm -rf /',
    'foo$(id)',
    'foo bar',
    'foo|bar',
    'foo`whoami`',
    // NUL 바이트
    'foo\x00bar',
    // 빈 값
    '',
  ])('차단: %s', (name) => {
    expect(() => validateProjectName(name)).toThrow();
  });

  it('214 자 초과 차단', () => {
    expect(() => validateProjectName('a'.repeat(215))).toThrow(/너무 깁/);
  });

  it('비-문자열 차단', () => {
    expect(() => validateProjectName(null)).toThrow();
    expect(() => validateProjectName(undefined)).toThrow();
    expect(() => validateProjectName(123)).toThrow();
  });
});

describe('createProject — path traversal 가드', () => {
  it('name 에 ../ 가 있으면 진입 즉시 throw — tmpDir 외부에 파일이 생성되지 않음', async () => {
    await expect(
      createProject({
        name: '../evil-payload',
        platform: 'next',
        structure: 'standalone',
        yes: true,
      }),
    ).rejects.toThrow();

    // tmpDir 의 부모에 evil-payload 가 만들어지지 않았어야 함.
    const parent = path.dirname(tmpDir);
    expect(await fs.pathExists(path.join(parent, 'evil-payload'))).toBe(false);
  });

  it('name 이 선행 dot 이면 거부 (.ssh 같은 숨김 디렉토리 보호)', async () => {
    await expect(
      createProject({
        name: '.ssh',
        platform: 'next',
        structure: 'standalone',
        yes: true,
      }),
    ).rejects.toThrow(/유효하지 않/);
  });

  it('name 이 절대경로면 거부', async () => {
    await expect(
      createProject({
        name: '/tmp/payload',
        platform: 'next',
        structure: 'standalone',
        yes: true,
      }),
    ).rejects.toThrow();
  });
});

describe('addApp — path traversal 가드', () => {
  beforeEach(async () => {
    // addApp 은 pnpm-workspace.yaml 이 있는 디렉토리에서만 진행 — 모노레포 가드.
    await fs.writeFile(path.join(tmpDir, 'pnpm-workspace.yaml'), '');
  });

  it('name 에 ../ 가 있으면 거부', async () => {
    await expect(
      addApp({ name: '../escape', cwd: tmpDir }),
    ).rejects.toThrow();
    const parent = path.dirname(tmpDir);
    expect(await fs.pathExists(path.join(parent, 'escape'))).toBe(false);
  });

  it('name 이 선행 dot 이면 거부', async () => {
    await expect(
      addApp({ name: '.hidden', cwd: tmpDir }),
    ).rejects.toThrow(/유효하지 않/);
  });
});
