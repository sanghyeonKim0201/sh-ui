// addTokens preset 가드 회귀 테스트.
//
// v0.67.1 fix: theme.base 가 CLI 의 풍부한 preset (rose/emerald/violet) 일 때
// buildTokens 의 primitives.json 에 그 색 스케일이 없어 `해석 실패: {color.rose.50}` 로
// throw 하던 회귀를 수정. 이 case 도 'custom' 과 동일하게 tokens.css 보존하도록 가드 확장.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const { add } = await import('../src/add.mjs');

let tmpDir;

async function writeFile(p, content) {
  await fsp.mkdir(path.dirname(p), { recursive: true });
  await fsp.writeFile(p, content);
}

async function readFile(p) {
  return fsp.readFile(p, 'utf-8');
}

async function makeProjectWithBase(root, base, withTokensCss) {
  await writeFile(path.join(root, 'sh-ui.config.json'), JSON.stringify({
    platform: 'react',
    cssFramework: 'plain',
    theme: { base, radius: 'md', mode: 'light-dark' },
    paths: {
      tokens: 'src/styles/tokens.css',
      styles: 'src/styles',
      components: 'src/components',
      utils: 'src/lib/utils.ts',
    },
    aliases: {
      components: '@/src/components',
      utils: '@/src/lib/utils',
    },
  }, null, 2) + '\n');
  if (withTokensCss) {
    await writeFile(
      path.join(root, 'src', 'styles', 'tokens.css'),
      `/* sentinel — 보존 검증용 */\n:root { --primary: #E11D48; }\n`,
    );
  }
}

describe('addTokens preset guard (v0.67.1)', () => {
  beforeEach(async () => {
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'sh-ui-tokens-'));
  });

  afterEach(async () => {
    await fsp.rm(tmpDir, { recursive: true, force: true });
  });

  it("'rose' preset + 기존 tokens.css → 보존 (throw X, sentinel 유지)", async () => {
    await makeProjectWithBase(tmpDir, 'rose', true);
    await add({ cwd: tmpDir, names: ['tokens'], skipInstall: true });
    const content = await readFile(path.join(tmpDir, 'src', 'styles', 'tokens.css'));
    expect(content).toContain('/* sentinel — 보존 검증용 */');
    expect(content).toContain('--primary: #E11D48');
  });

  it("'emerald' preset + 기존 tokens.css → 보존", async () => {
    await makeProjectWithBase(tmpDir, 'emerald', true);
    await add({ cwd: tmpDir, names: ['tokens'], skipInstall: true });
    const content = await readFile(path.join(tmpDir, 'src', 'styles', 'tokens.css'));
    expect(content).toContain('/* sentinel — 보존 검증용 */');
  });

  it("'violet' preset + tokens.css 없음 → 친절한 에러 (preset 사용법 안내)", async () => {
    await makeProjectWithBase(tmpDir, 'violet', false);
    await expect(
      add({ cwd: tmpDir, names: ['tokens'], skipInstall: true }),
    ).rejects.toThrow(/violet.*preset.*아직 없습니다/);
  });

  it("'custom' preset → 기존 'custom' 가드 그대로 보존", async () => {
    await makeProjectWithBase(tmpDir, 'custom', true);
    await add({ cwd: tmpDir, names: ['tokens'], skipInstall: true });
    const content = await readFile(path.join(tmpDir, 'src', 'styles', 'tokens.css'));
    expect(content).toContain('/* sentinel — 보존 검증용 */');
  });

  it("'neutral' preset (buildable) → 정상 빌드 + tokens.css 작성", async () => {
    await makeProjectWithBase(tmpDir, 'neutral', false);
    await add({ cwd: tmpDir, names: ['tokens'], skipInstall: true });
    const content = await readFile(path.join(tmpDir, 'src', 'styles', 'tokens.css'));
    // buildTokens 산출물엔 :root 와 dark 블록 + 주요 카테고리 변수가 있어야.
    expect(content).toContain(':root');
    expect(content).toContain('--space-0');
  });

  it("'slate' preset (buildable) → 정상 빌드", async () => {
    await makeProjectWithBase(tmpDir, 'slate', false);
    await add({ cwd: tmpDir, names: ['tokens'], skipInstall: true });
    const content = await readFile(path.join(tmpDir, 'src', 'styles', 'tokens.css'));
    expect(content).toContain(':root');
  });
});
