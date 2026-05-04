import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

import { renameApp } from '../src/rename-app.mjs';

let tmpDir;

// 미니 monorepo 픽스처 — 실제 nextjs-app/ui-app-template 의 핵심 파일들만 추출.
// false-positive 검증용 'core-web-vitals' / 'safari-web-extension' 도 일부러 포함.
async function buildFixture(root, appName) {
  const APP = appName;
  const UI = `ui-${appName}`;

  await fs.outputFile(path.join(root, 'pnpm-workspace.yaml'), `packages:\n  - 'apps/*'\n  - 'packages/**'\n`);
  await fs.outputJson(path.join(root, 'package.json'), {
    name: 'monorepo',
    scripts: {
      dev: `pnpm --filter ${APP} dev`,
      build: `pnpm --filter ${APP} build`,
    },
  });
  await fs.outputFile(
    path.join(root, 'README.md'),
    `# Monorepo\n\nRun: \`pnpm --filter ${APP} dev\`\n\nAdd component: \`npx sh-ui-cli create add-component button --app ${APP}\`\n`,
  );
  await fs.outputJson(path.join(root, 'turbo.json'), {
    $schema: 'https://turborepo.org/schema.json',
    pipeline: { build: {} },
  });
  await fs.outputFile(
    path.join(root, '.github', 'workflows', 'ci.yml'),
    `name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm --filter ${APP} build\n      - run: cd apps/${APP} && pnpm test\n`,
  );

  // apps/<app>/
  await fs.outputJson(path.join(root, 'apps', APP, 'package.json'), {
    name: APP,
    dependencies: { [`@workspace/${UI}`]: 'workspace:*' },
  });
  await fs.outputFile(
    path.join(root, 'apps', APP, 'app', 'layout.tsx'),
    `import '@workspace/${UI}/globals.css';\n\nexport default function Layout({ children }) { return <html><body>{children}</body></html>; }\n`,
  );
  await fs.outputFile(
    path.join(root, 'apps', APP, 'next.config.ts'),
    `import type { NextConfig } from 'next';\nconst nextConfig: NextConfig = { transpilePackages: ['@workspace/ui-core', '@workspace/${UI}'] };\nexport default nextConfig;\n`,
  );
  await fs.outputJson(path.join(root, 'apps', APP, 'tsconfig.json'), {
    extends: '@workspace/typescript-config/nextjs.json',
    compilerOptions: {
      paths: {
        '@/*': ['./*'],
        [`@workspace/${UI}/*`]: [`../../packages/ui/ui-apps/${UI}/src/*`],
      },
    },
  });
  await fs.outputFile(
    path.join(root, 'apps', APP, 'Dockerfile'),
    `FROM node:20-alpine\nWORKDIR /app/apps/${APP}\nCMD ["pnpm", "start"]\n`,
  );
  await fs.outputFile(
    path.join(root, 'apps', APP, 'eslint.config.js'),
    // false-positive 트랩: core-web-vitals 는 ESLint 플러그인 이름이라 절대 치환되면 안 됨.
    `import next from '@next/eslint-plugin-next';\nexport default [{ rules: { ...next.configs['core-web-vitals'].rules } }];\n`,
  );
  await fs.outputFile(
    path.join(root, 'apps', APP, 'instrumentation-client.ts'),
    // false-positive 트랩: safari-web-extension 은 Sentry 필터 패턴.
    `Sentry.init({ ignoreErrors: [/safari-web-extension:/i] });\n`,
  );

  // packages/ui/ui-apps/ui-<app>/
  await fs.outputJson(path.join(root, 'packages', 'ui', 'ui-apps', UI, 'package.json'), {
    name: `@workspace/${UI}`,
    exports: {
      './globals.css': './src/styles/globals.css',
      './components/*': './src/components/*.tsx',
    },
  });
  await fs.outputJson(path.join(root, 'packages', 'ui', 'ui-apps', UI, 'tsconfig.json'), {
    extends: '@workspace/typescript-config/react-library.json',
    compilerOptions: {
      paths: { [`@workspace/${UI}/*`]: ['./src/*'] },
    },
  });
  await fs.outputJson(path.join(root, 'packages', 'ui', 'ui-apps', UI, 'sh-ui.config.json'), {
    aliases: {
      utils: `@workspace/${UI}/lib/utils`,
      components: `@workspace/${UI}/components`,
      ui: `@workspace/${UI}/components`,
    },
  });
  await fs.outputFile(
    path.join(root, 'packages', 'ui', 'ui-apps', UI, 'src', 'components', 'button', 'index.tsx'),
    `import { cn } from "@workspace/${UI}/lib/utils";\nexport function Button() { return <button className={cn('btn')} />; }\n`,
  );
  await fs.outputFile(
    path.join(root, 'packages', 'ui', 'ui-apps', UI, 'src', 'styles', 'globals.css'),
    `@import 'tailwindcss';\n@source "../../../../../../apps/**/*.{ts,tsx}";\n`,
  );
}

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `sh-ui-rename-${crypto.randomUUID()}`);
  await fs.ensureDir(tmpDir);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.remove(tmpDir);
});

describe('renameApp — 정상 시나리오', () => {
  it('web → dashboard 로 변경: 디렉토리 이동 + 모든 패턴 치환', async () => {
    await buildFixture(tmpDir, 'web');

    const result = await renameApp({
      cwd: tmpDir,
      oldName: 'web',
      newName: 'dashboard',
      yes: true,
      skipInstall: true,
    });

    // 디렉토리 이동
    expect(await fs.pathExists(path.join(tmpDir, 'apps', 'web'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'apps', 'dashboard'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-dashboard'))).toBe(true);

    // package.json name 갱신
    const appPkg = await fs.readJson(path.join(tmpDir, 'apps', 'dashboard', 'package.json'));
    expect(appPkg.name).toBe('dashboard');
    expect(appPkg.dependencies['@workspace/ui-dashboard']).toBe('workspace:*');
    expect(appPkg.dependencies['@workspace/ui-web']).toBeUndefined();

    const uiPkg = await fs.readJson(path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-dashboard', 'package.json'));
    expect(uiPkg.name).toBe('@workspace/ui-dashboard');

    // import 치환
    const layout = await fs.readFile(path.join(tmpDir, 'apps', 'dashboard', 'app', 'layout.tsx'), 'utf-8');
    expect(layout).toContain('@workspace/ui-dashboard/globals.css');
    expect(layout).not.toContain('ui-web');

    const button = await fs.readFile(
      path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-dashboard', 'src', 'components', 'button', 'index.tsx'),
      'utf-8',
    );
    expect(button).toContain('@workspace/ui-dashboard/lib/utils');

    // tsconfig paths
    const appTs = await fs.readJson(path.join(tmpDir, 'apps', 'dashboard', 'tsconfig.json'));
    expect(appTs.compilerOptions.paths['@workspace/ui-dashboard/*']).toEqual(['../../packages/ui/ui-apps/ui-dashboard/src/*']);
    expect(appTs.compilerOptions.paths['@workspace/ui-web/*']).toBeUndefined();

    // next.config transpilePackages
    const nextCfg = await fs.readFile(path.join(tmpDir, 'apps', 'dashboard', 'next.config.ts'), 'utf-8');
    expect(nextCfg).toContain("'@workspace/ui-dashboard'");
    expect(nextCfg).not.toContain('ui-web');

    // Dockerfile WORKDIR
    const dockerfile = await fs.readFile(path.join(tmpDir, 'apps', 'dashboard', 'Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('/app/apps/dashboard');
    expect(dockerfile).not.toContain('apps/web');

    // sh-ui.config aliases
    const shConfig = await fs.readJson(path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-dashboard', 'sh-ui.config.json'));
    expect(shConfig.aliases.utils).toBe('@workspace/ui-dashboard/lib/utils');

    // 루트 README 의 --filter / --app
    const readme = await fs.readFile(path.join(tmpDir, 'README.md'), 'utf-8');
    expect(readme).toContain('--filter dashboard');
    expect(readme).toContain('--app dashboard');
    expect(readme).not.toContain('--filter web');

    // 루트 package.json scripts
    const rootPkg = await fs.readJson(path.join(tmpDir, 'package.json'));
    expect(rootPkg.scripts.dev).toContain('--filter dashboard');

    // .github/workflows
    const wf = await fs.readFile(path.join(tmpDir, '.github', 'workflows', 'ci.yml'), 'utf-8');
    expect(wf).toContain('--filter dashboard');
    expect(wf).toContain('cd apps/dashboard');
    expect(wf).not.toContain('apps/web');

    // 결과 객체
    expect(result.moves).toHaveLength(2);
    expect(result.edits.length).toBeGreaterThan(0);
  });

  it('false-positive 회피: core-web-vitals / safari-web-extension 보존', async () => {
    await buildFixture(tmpDir, 'web');

    await renameApp({ cwd: tmpDir, oldName: 'web', newName: 'dashboard', yes: true, skipInstall: true });

    const eslintCfg = await fs.readFile(path.join(tmpDir, 'apps', 'dashboard', 'eslint.config.js'), 'utf-8');
    expect(eslintCfg).toContain('core-web-vitals'); // 절대 변경되면 안 됨

    const sentry = await fs.readFile(path.join(tmpDir, 'apps', 'dashboard', 'instrumentation-client.ts'), 'utf-8');
    expect(sentry).toContain('safari-web-extension'); // 절대 변경되면 안 됨
  });
});

describe('renameApp — dry-run', () => {
  it('파일 변경 없이 매트릭스만 반환', async () => {
    await buildFixture(tmpDir, 'web');

    const result = await renameApp({
      cwd: tmpDir,
      oldName: 'web',
      newName: 'dashboard',
      yes: true,
      dryRun: true,
    });

    // 디렉토리 그대로
    expect(await fs.pathExists(path.join(tmpDir, 'apps', 'web'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'apps', 'dashboard'))).toBe(false);

    // 매트릭스는 채워져 있음
    expect(result.moves.length).toBeGreaterThan(0);
    expect(result.edits.length).toBeGreaterThan(0);
  });
});

describe('renameApp — 검증 에러', () => {
  it('pnpm-workspace.yaml 없으면 에러', async () => {
    await fs.outputFile(path.join(tmpDir, 'apps', 'web', 'package.json'), '{}');
    await expect(
      renameApp({ cwd: tmpDir, oldName: 'web', newName: 'dashboard', yes: true }),
    ).rejects.toThrow(/pnpm 모노레포/);
  });

  it('apps/<old> 가 없으면 에러', async () => {
    await fs.outputFile(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages:\n');
    await expect(
      renameApp({ cwd: tmpDir, oldName: 'ghost', newName: 'dashboard', yes: true }),
    ).rejects.toThrow(/apps\/ghost/);
  });

  it('apps/<new> 가 이미 있으면 에러', async () => {
    await buildFixture(tmpDir, 'web');
    await fs.outputFile(path.join(tmpDir, 'apps', 'taken', 'package.json'), '{}');
    await expect(
      renameApp({ cwd: tmpDir, oldName: 'web', newName: 'taken', yes: true }),
    ).rejects.toThrow(/apps\/taken/);
  });

  it('old === new 면 에러', async () => {
    await buildFixture(tmpDir, 'web');
    await expect(
      renameApp({ cwd: tmpDir, oldName: 'web', newName: 'web', yes: true }),
    ).rejects.toThrow(/같습니다/);
  });

  it('newName 이 영숫자/하이픈 외 문자면 에러', async () => {
    await buildFixture(tmpDir, 'web');
    await expect(
      renameApp({ cwd: tmpDir, oldName: 'web', newName: 'has space', yes: true }),
    ).rejects.toThrow(/영숫자/);
  });
});
