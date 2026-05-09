// migrate-v065.mjs 테스트 — 가짜 v0.64 monorepo 픽스처에서 dryRun + apply 시나리오 검증.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const { migrateToV065 } = await import('../src/migrate-v065.mjs');

let tmpDir;

async function writeFile(p, content) {
  await fsp.mkdir(path.dirname(p), { recursive: true });
  await fsp.writeFile(p, content);
}

async function fileExists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * v0.64.x 모노레포 픽스처 — packages/ui/ui-apps/ui-{app}/src/{components,hooks,lib} 에
 * 컴포넌트가 emit 된 상태. ui-core 는 minimal (lib/utils.ts 만).
 */
async function makeV064Fixture(root, opts = {}) {
  const apps = opts.apps ?? ['web', 'admin'];
  const components = opts.components ?? ['button', 'card'];
  const customComponentByApp = opts.customComponentByApp ?? {};

  await writeFile(
    path.join(root, 'pnpm-workspace.yaml'),
    "packages:\n  - 'apps/*'\n  - 'packages/*'\n  - 'packages/ui/*'\n  - 'packages/ui/ui-apps/*'\n",
  );

  // ui-core: v0.64 minimal (sh-ui.config.json 없음, lib/utils.ts 만)
  await writeFile(
    path.join(root, 'packages', 'ui', 'ui-core', 'package.json'),
    JSON.stringify({
      name: '@workspace/ui-core',
      version: '0.0.0',
      type: 'module',
      private: true,
      dependencies: {
        'class-variance-authority': '^0.7.1',
        clsx: '^2.1.1',
        'tailwind-merge': '^3.5.0',
      },
      exports: { './lib/*': './src/lib/*.ts' },
    }, null, 2) + '\n',
  );
  await writeFile(
    path.join(root, 'packages', 'ui', 'ui-core', 'src', 'lib', 'utils.ts'),
    `export function cn(...args: any[]) { return args.join(' '); }\n`,
  );

  for (const app of apps) {
    const uiApp = `ui-${app}`;
    const appDir = path.join(root, 'apps', app);
    const uiPkgDir = path.join(root, 'packages', 'ui', 'ui-apps', uiApp);

    // apps/{app}/page.tsx — import 재작성 대상.
    await writeFile(
      path.join(appDir, 'src', 'app', 'page.tsx'),
      `import { Button } from '@workspace/${uiApp}/components/button';\nimport { Card } from '@workspace/${uiApp}/components/card';\nimport { cn } from '@workspace/${uiApp}/lib/utils';\n\nexport default function Page() { return <Button />; }\n`,
    );

    // ui-app: v0.64 layout — components, hooks, lib 디렉토리 보유
    await writeFile(
      path.join(uiPkgDir, 'sh-ui.config.json'),
      JSON.stringify({
        platform: 'react',
        cssFramework: 'plain',
        theme: { base: 'neutral', radius: 'md', mode: 'light-dark' },
        paths: {
          tokens: 'src/styles/tokens.css',
          styles: 'src/styles',
          components: 'src/components',
          utils: 'src/lib/utils.ts',
        },
        aliases: {
          components: `@workspace/${uiApp}/components`,
          utils: `@workspace/${uiApp}/lib/utils`,
          ui: `@workspace/${uiApp}/components`,
        },
      }, null, 2) + '\n',
    );

    await writeFile(
      path.join(uiPkgDir, 'package.json'),
      JSON.stringify({
        name: `@workspace/${uiApp}`,
        version: '0.0.0',
        type: 'module',
        private: true,
        dependencies: {
          '@workspace/ui-core': 'workspace:*',
          react: '^19.2.4',
        },
        exports: {
          './globals.css': './src/styles/globals.css',
          './components/*': './src/components/*.tsx',
          './hooks/*': './src/hooks/*.ts',
          './lib/*': './src/lib/*.ts',
        },
      }, null, 2) + '\n',
    );

    await writeFile(
      path.join(uiPkgDir, 'src', 'styles', 'tokens.css'),
      ':root { --space-0: 0; }\n',
    );

    for (const c of components) {
      const customForApp = customComponentByApp[app]?.[c];
      const content = customForApp ?? `export function ${c.charAt(0).toUpperCase() + c.slice(1)}() { return null; }\n`;
      await writeFile(
        path.join(uiPkgDir, 'src', 'components', c, 'index.tsx'),
        content,
      );
    }

    // utils.ts (모든 ui-app 동일 내용)
    await writeFile(
      path.join(uiPkgDir, 'src', 'lib', 'utils.ts'),
      `export function cn(...args: any[]) { return args.join(' '); }\n`,
    );
  }
}

describe('migrate-v065', () => {
  beforeEach(async () => {
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'sh-ui-migrate-test-'));
  });

  afterEach(async () => {
    await fsp.rm(tmpDir, { recursive: true, force: true });
  });

  it('dryRun — plan 텍스트만 반환, 파일 변경 X', async () => {
    await makeV064Fixture(tmpDir);
    const { plan, summary } = await migrateToV065({ cwd: tmpDir, dryRun: true });

    expect(plan.conflicts).toHaveLength(0);
    expect(plan.moves.length).toBeGreaterThan(0);
    expect(summary).toContain('DRY RUN');
    expect(summary).toContain('파일 이동');

    // 실제 파일 변경 없는지 확인 — ui-web/src/components/button 그대로.
    expect(
      await fileExists(
        path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'src', 'components', 'button', 'index.tsx'),
      ),
    ).toBe(true);
    // ui-core 에 sh-ui.config.json 도 안 생김.
    expect(
      await fileExists(path.join(tmpDir, 'packages', 'ui', 'ui-core', 'sh-ui.config.json')),
    ).toBe(false);
  });

  it('apply — 컴포넌트가 ui-core 로 이동 + ui-app role 마커 + import 재작성', async () => {
    await makeV064Fixture(tmpDir, { apps: ['web', 'admin'], components: ['button', 'card'] });
    const { plan, summary } = await migrateToV065({ cwd: tmpDir, dryRun: false });

    expect(plan.conflicts).toHaveLength(0);
    expect(summary).toContain('마이그레이션 완료');

    // 1. ui-core 에 sh-ui.config.json + components 이전.
    expect(
      await fileExists(path.join(tmpDir, 'packages', 'ui', 'ui-core', 'sh-ui.config.json')),
    ).toBe(true);
    expect(
      await fileExists(
        path.join(tmpDir, 'packages', 'ui', 'ui-core', 'src', 'components', 'button', 'index.tsx'),
      ),
    ).toBe(true);
    expect(
      await fileExists(
        path.join(tmpDir, 'packages', 'ui', 'ui-core', 'src', 'components', 'card', 'index.tsx'),
      ),
    ).toBe(true);

    // 2. ui-app 의 components 디렉토리 정리 (비어있으면 디렉토리 자체 제거).
    expect(
      await fileExists(
        path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'src', 'components'),
      ),
    ).toBe(false);
    expect(
      await fileExists(
        path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-admin', 'src', 'components'),
      ),
    ).toBe(false);

    // 3. ui-app sh-ui.config.json 에 role: tokens-only + components/utils paths/aliases 제거.
    const webCfg = JSON.parse(
      await fsp.readFile(
        path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'sh-ui.config.json'),
        'utf-8',
      ),
    );
    expect(webCfg.role).toBe('tokens-only');
    expect(webCfg.paths.components).toBeUndefined();
    expect(webCfg.paths.utils).toBeUndefined();
    expect(webCfg.paths.tokens).toBe('src/styles/tokens.css');
    expect(webCfg.aliases?.components).toBeUndefined();

    // 4. ui-app package.json exports 정리.
    const webPkg = JSON.parse(
      await fsp.readFile(
        path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'package.json'),
        'utf-8',
      ),
    );
    expect(webPkg.exports['./components/*']).toBeUndefined();
    expect(webPkg.exports['./hooks/*']).toBeUndefined();
    expect(webPkg.exports['./lib/*']).toBeUndefined();
    expect(webPkg.exports['./globals.css']).toBe('./src/styles/globals.css');

    // 5. apps/web/src/app/page.tsx 의 import 재작성.
    const pageContent = await fsp.readFile(
      path.join(tmpDir, 'apps', 'web', 'src', 'app', 'page.tsx'),
      'utf-8',
    );
    expect(pageContent).toContain('@workspace/ui-core/components/button');
    expect(pageContent).toContain('@workspace/ui-core/components/card');
    expect(pageContent).toContain('@workspace/ui-core/lib/utils');
    expect(pageContent).not.toContain('@workspace/ui-web/components/');

    // 6. ui-core/package.json exports 갱신.
    const corePkg = JSON.parse(
      await fsp.readFile(
        path.join(tmpDir, 'packages', 'ui', 'ui-core', 'package.json'),
        'utf-8',
      ),
    );
    expect(corePkg.exports['./components/*']).toBe('./src/components/*.tsx');
    expect(corePkg.exports['./hooks/*']).toBe('./src/hooks/*.ts');
  });

  it('컨텐츠 충돌 — 같은 logical path 다른 내용이면 abort', async () => {
    await makeV064Fixture(tmpDir, {
      apps: ['web', 'admin'],
      components: ['button'],
      customComponentByApp: {
        admin: { button: 'export function Button() { return <div>ADMIN CUSTOM</div>; }\n' },
      },
    });
    await expect(migrateToV065({ cwd: tmpDir, dryRun: false }))
      .rejects.toThrow(/abort.*충돌/);

    // abort 시 ui-core 에 sh-ui.config.json 안 만들어졌어야 함.
    expect(
      await fileExists(path.join(tmpDir, 'packages', 'ui', 'ui-core', 'sh-ui.config.json')),
    ).toBe(false);
    // ui-app 의 components 도 그대로.
    expect(
      await fileExists(
        path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'src', 'components', 'button', 'index.tsx'),
      ),
    ).toBe(true);
  });

  it('이미 v0.65 — moves/패치 0 + no-op summary', async () => {
    await makeV064Fixture(tmpDir, { apps: ['web'], components: [] });
    // ui-app 을 v0.65 형태로 미리 변경.
    const cfgPath = path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'sh-ui.config.json');
    await fsp.writeFile(cfgPath, JSON.stringify({
      platform: 'react',
      cssFramework: 'plain',
      role: 'tokens-only',
      theme: { base: 'neutral', radius: 'md', mode: 'light-dark' },
      paths: { tokens: 'src/styles/tokens.css', styles: 'src/styles' },
    }, null, 2) + '\n');
    const pkgPath = path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'package.json');
    const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf-8'));
    delete pkg.exports['./components/*'];
    delete pkg.exports['./hooks/*'];
    delete pkg.exports['./lib/*'];
    await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    // ui-app 의 src/components/.gitkeep 만 남기고 컴포넌트 제거 (이미 마이그레이션됨 시뮬레이션).
    await fsp.rm(
      path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'src', 'components'),
      { recursive: true, force: true },
    );
    await fsp.rm(
      path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'src', 'hooks'),
      { recursive: true, force: true },
    );
    await fsp.rm(
      path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-web', 'src', 'lib'),
      { recursive: true, force: true },
    );
    // ui-core 에도 v0.65 config 미리.
    await fsp.writeFile(
      path.join(tmpDir, 'packages', 'ui', 'ui-core', 'sh-ui.config.json'),
      JSON.stringify({ platform: 'react', cssFramework: 'plain' }, null, 2) + '\n',
    );

    // 사용자 코드 import 도 미리 ui-core 로.
    await fsp.writeFile(
      path.join(tmpDir, 'apps', 'web', 'src', 'app', 'page.tsx'),
      `import { Button } from '@workspace/ui-core/components/button';\n`,
    );

    const { plan, summary } = await migrateToV065({ cwd: tmpDir, dryRun: true });
    expect(plan.moves).toHaveLength(0);
    expect(plan.appConfigPatches).toHaveLength(0);
    expect(plan.appPackageJsonPatches).toHaveLength(0);
    expect(plan.importRewrites).toHaveLength(0);
    expect(summary).toContain('변경 사항 없음');
  });

  it('skipImportRewrite — apps/* import 재작성 생략', async () => {
    await makeV064Fixture(tmpDir, { apps: ['web'], components: ['button'] });
    const { plan } = await migrateToV065({ cwd: tmpDir, dryRun: true, skipImportRewrite: true });
    expect(plan.importRewrites).toHaveLength(0);
    // 다른 plan 항목은 그대로 있어야.
    expect(plan.moves.length).toBeGreaterThan(0);
  });

  it('monorepo 가 아니면 즉시 에러', async () => {
    await expect(migrateToV065({ cwd: tmpDir, dryRun: true }))
      .rejects.toThrow(/pnpm-workspace.yaml/);
  });
});
