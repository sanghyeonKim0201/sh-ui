import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { doctor } from '../src/doctor.mjs';

let tmpDir;
let exitSpy;
let logBuffer;
let originalLog;
let originalError;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sh-ui-doctor-'));
  logBuffer = [];
  originalLog = console.log;
  originalError = console.error;
  console.log = (...args) => logBuffer.push(args.join(' '));
  console.error = (...args) => logBuffer.push(args.join(' '));
  // exit 스파이 — process.exit 을 throw 로 바꿔 doctor 흐름이 흐트러지지 않도록.
  exitSpy = process.exit;
  process.exit = (code) => {
    throw new Error(`__exit:${code}`);
  };
});

afterEach(async () => {
  process.exit = exitSpy;
  console.log = originalLog;
  console.error = originalError;
  await fs.remove(tmpDir);
});

function output() {
  return logBuffer.join('\n');
}

const VALID_CONFIG = {
  platform: 'react',
  cssFramework: 'plain',
  theme: { base: 'neutral', radius: 'md', mode: 'light-dark' },
  paths: {
    tokens: 'src/styles/tokens.css',
    components: 'src/components/ui',
    utils: 'src/lib/utils.ts',
  },
  aliases: { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui' },
};

describe('sh-ui doctor', () => {
  it('config 누락 시 fail 후 exit 1', async () => {
    let exitCode = null;
    try {
      await doctor({ cwd: tmpDir });
    } catch (e) {
      const m = /__exit:(\d+)/.exec(e.message);
      if (m) exitCode = Number(m[1]);
    }
    expect(exitCode).toBe(1);
    expect(output()).toContain('sh-ui.config.json');
  });

  it('tokens.css 누락이면 fail 표시', async () => {
    await fs.writeJson(
      path.join(tmpDir, 'sh-ui.config.json'),
      VALID_CONFIG,
      { spaces: 2 },
    );
    let exitCode = null;
    try {
      await doctor({ cwd: tmpDir });
    } catch (e) {
      const m = /__exit:(\d+)/.exec(e.message);
      if (m) exitCode = Number(m[1]);
    }
    expect(exitCode).toBe(1);
    expect(output()).toMatch(/paths\.tokens.*src\/styles\/tokens\.css/);
    expect(output()).toContain('파일이 없습니다');
  });

  it('cssEntry 가 tokens.css 를 import 하면 ok', async () => {
    await fs.writeJson(
      path.join(tmpDir, 'sh-ui.config.json'),
      { ...VALID_CONFIG, paths: { ...VALID_CONFIG.paths, cssEntry: 'app/globals.css' } },
      { spaces: 2 },
    );
    await fs.outputFile(
      path.join(tmpDir, 'src/styles/tokens.css'),
      ':root { --space-2: 0.5rem; --radius: 0.5rem; }\n',
    );
    await fs.outputFile(
      path.join(tmpDir, 'app/globals.css'),
      "@import '../src/styles/tokens.css';\nbody { background: red; }\n",
    );
    try {
      await doctor({ cwd: tmpDir });
    } catch {
      // exit 던질 수 있음 — 검증은 출력 기반
    }
    expect(output()).toContain('tokens.css 를 import 합니다');
  });

  it('cssEntry 에 import 없으면 warn', async () => {
    await fs.writeJson(
      path.join(tmpDir, 'sh-ui.config.json'),
      { ...VALID_CONFIG, paths: { ...VALID_CONFIG.paths, cssEntry: 'app/globals.css' } },
      { spaces: 2 },
    );
    await fs.outputFile(
      path.join(tmpDir, 'src/styles/tokens.css'),
      ':root { --space-2: 0.5rem; }\n',
    );
    await fs.outputFile(
      path.join(tmpDir, 'app/globals.css'),
      'body { background: red; }\n',
    );
    try {
      await doctor({ cwd: tmpDir });
    } catch {}
    expect(output()).toMatch(/import 하는 줄이 보이지 않습니다/);
  });
});
