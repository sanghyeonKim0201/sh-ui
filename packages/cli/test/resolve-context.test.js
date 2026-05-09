// findShUiContext walk-up 동작 검증.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const { findShUiContext } = await import('../src/resolve-context.mjs');

let tmpDir;

async function writeFile(p, content) {
  await fsp.mkdir(path.dirname(p), { recursive: true });
  await fsp.writeFile(p, content);
}

describe('findShUiContext', () => {
  beforeEach(async () => {
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'sh-ui-ctx-'));
  });

  afterEach(async () => {
    await fsp.rm(tmpDir, { recursive: true, force: true });
  });

  it('config — sh-ui.config.json 이 cwd 에 있으면 그대로 standalone 인식', async () => {
    await writeFile(path.join(tmpDir, 'sh-ui.config.json'), '{}');
    const ctx = findShUiContext(tmpDir);
    expect(ctx).toEqual({ kind: 'config', root: tmpDir });
  });

  it('config — sh-ui.config.json 이 부모에 있으면 walk-up 으로 발견', async () => {
    await writeFile(path.join(tmpDir, 'sh-ui.config.json'), '{}');
    await fsp.mkdir(path.join(tmpDir, 'src', 'components'), { recursive: true });
    const ctx = findShUiContext(path.join(tmpDir, 'src', 'components'));
    expect(ctx).toEqual({ kind: 'config', root: tmpDir });
  });

  it('monorepo — pnpm-workspace.yaml 발견 + apps/<name> hintApp 추출', async () => {
    await writeFile(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n');
    await fsp.mkdir(path.join(tmpDir, 'apps', 'web', 'src'), { recursive: true });
    const ctx = findShUiContext(path.join(tmpDir, 'apps', 'web', 'src'));
    expect(ctx).toEqual({ kind: 'monorepo', root: tmpDir, hintApp: 'web' });
  });

  it('monorepo — packages/ui/ui-apps/ui-<name> hintApp 추출', async () => {
    await writeFile(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
    const start = path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-admin', 'src');
    await fsp.mkdir(start, { recursive: true });
    const ctx = findShUiContext(start);
    expect(ctx).toEqual({ kind: 'monorepo', root: tmpDir, hintApp: 'admin' });
  });

  it('monorepo — 루트에서 직접 실행 시 hintApp = null', async () => {
    await writeFile(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages: []\n');
    const ctx = findShUiContext(tmpDir);
    expect(ctx).toEqual({ kind: 'monorepo', root: tmpDir, hintApp: null });
  });

  it('monorepo — packages/ui/ui-core 에서는 자체 sh-ui.config.json 이 우선 매칭 (config 인식)', async () => {
    await writeFile(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages: []\n');
    const uiCore = path.join(tmpDir, 'packages', 'ui', 'ui-core');
    await writeFile(path.join(uiCore, 'sh-ui.config.json'), '{}');
    const ctx = findShUiContext(path.join(uiCore, 'src', 'components'));
    expect(ctx).toEqual({ kind: 'config', root: uiCore });
  });

  it('아무것도 없으면 null', async () => {
    const ctx = findShUiContext(tmpDir);
    expect(ctx).toBeNull();
  });
});
