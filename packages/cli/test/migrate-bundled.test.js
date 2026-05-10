import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { runMigrateBundled } from '../src/migrate-bundled.mjs';

let tmpDir;
let originalLog;
let logs;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sh-ui-migrate-bundled-'));
  logs = [];
  originalLog = console.log;
  console.log = (...args) => logs.push(args.join(' '));
});

afterEach(async () => {
  console.log = originalLog;
  await fs.remove(tmpDir);
});

const baseConfig = {
  platform: 'react',
  cssFramework: 'plain',
  theme: { base: 'neutral', radius: 'md', mode: 'light-dark' },
  paths: {
    tokens: 'src/styles/tokens.css',
    styles: 'src/styles',
    components: 'src/components/ui',
    utils: 'src/lib/utils.ts',
  },
  aliases: { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui' },
};

async function setup(extra = {}) {
  await fs.writeJson(
    path.join(tmpDir, 'sh-ui.config.json'),
    { ...baseConfig, ...extra },
    { spaces: 2 },
  );
  await fs.outputFile(
    path.join(tmpDir, 'src/components/ui/button/styles.css'),
    '.sh-ui-button { color: red; }\n',
  );
  await fs.outputFile(
    path.join(tmpDir, 'src/components/ui/button/index.tsx'),
    'import "./styles.css";\nexport const Button = () => null;\n',
  );
  await fs.outputFile(
    path.join(tmpDir, 'src/components/ui/card/styles.css'),
    '.sh-ui-card { padding: 1rem; }\n',
  );
  await fs.outputFile(
    path.join(tmpDir, 'src/components/ui/card/index.tsx'),
    'import "./styles.css";\nexport const Card = () => null;\n',
  );
}

describe('migrate-bundled', () => {
  it('dry-run 은 파일을 건드리지 않고 plan 만 출력', async () => {
    await setup();
    await runMigrateBundled({ cwd: tmpDir, apply: false });
    expect(await fs.pathExists(path.join(tmpDir, 'src/components/ui/button/styles.css'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/styles/sh-ui-components.css'))).toBe(false);
    const config = await fs.readJson(path.join(tmpDir, 'sh-ui.config.json'));
    expect(config.cssStrategy).toBeUndefined();
  });

  it('--apply 시 styles.css 삭제 + bundle 생성 + .tsx import 제거 + config 갱신', async () => {
    await setup();
    await runMigrateBundled({ cwd: tmpDir, apply: true });

    // styles.css 들 삭제
    expect(await fs.pathExists(path.join(tmpDir, 'src/components/ui/button/styles.css'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/components/ui/card/styles.css'))).toBe(false);

    // bundle 에 양쪽 섹션
    const bundle = await fs.readFile(path.join(tmpDir, 'src/styles/sh-ui-components.css'), 'utf8');
    expect(bundle).toContain('sh-ui:component:button-start');
    expect(bundle).toContain('.sh-ui-button { color: red; }');
    expect(bundle).toContain('sh-ui:component:card-start');
    expect(bundle).toContain('.sh-ui-card { padding: 1rem; }');

    // .tsx import 제거
    const buttonTsx = await fs.readFile(
      path.join(tmpDir, 'src/components/ui/button/index.tsx'),
      'utf8',
    );
    expect(buttonTsx).not.toContain('./styles.css');
    expect(buttonTsx).toContain('export const Button');

    // config 갱신
    const config = await fs.readJson(path.join(tmpDir, 'sh-ui.config.json'));
    expect(config.cssStrategy).toBe('bundled');
    expect(config.paths.cssBundle).toBe('src/styles/sh-ui-components.css');
  });

  it('이미 bundled 면 noop', async () => {
    await setup({ cssStrategy: 'bundled' });
    await runMigrateBundled({ cwd: tmpDir, apply: true });
    // styles.css 가 그대로 — 마이그레이션 안 일어났음
    expect(await fs.pathExists(path.join(tmpDir, 'src/components/ui/button/styles.css'))).toBe(true);
  });

  it('cssFramework 가 plain 외이면 throw', async () => {
    await setup({ cssFramework: 'tailwind' });
    await expect(runMigrateBundled({ cwd: tmpDir, apply: true })).rejects.toThrow(/plain/);
  });

  it('--bundle <path> 로 위치 지정 가능', async () => {
    await setup();
    await runMigrateBundled({
      cwd: tmpDir,
      apply: true,
      bundleArg: 'app/sh-ui.css',
    });
    expect(await fs.pathExists(path.join(tmpDir, 'app/sh-ui.css'))).toBe(true);
    const config = await fs.readJson(path.join(tmpDir, 'sh-ui.config.json'));
    expect(config.paths.cssBundle).toBe('app/sh-ui.css');
  });
});
