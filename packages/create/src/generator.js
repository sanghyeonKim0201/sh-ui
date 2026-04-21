import { input, select, checkbox, confirm } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPluginChoices, getPluginsByNames } from './plugins/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// ─── Create new project ───

export async function createProject() {
  const projectName = await input({
    message: '프로젝트 이름:',
    default: 'my-app',
  });

  const projectType = await select({
    message: '프로젝트 구조:',
    choices: [
      { name: '단독 (Next.js standalone)', value: 'standalone' },
      { name: '모노레포 (Turborepo + pnpm)', value: 'monorepo' },
    ],
  });

  const selectedPlugins = await checkbox({
    message: '추가 기능 선택 (Space로 선택):',
    choices: getPluginChoices(),
  });

  const plugins = getPluginsByNames(selectedPlugins);
  // priority 순서대로 정렬
  plugins.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const targetDir = path.resolve(process.cwd(), projectName);

  if (await fs.pathExists(targetDir)) {
    const overwrite = await confirm({
      message: `${projectName} 디렉토리가 이미 존재합니다. 덮어쓸까요?`,
      default: false,
    });
    if (!overwrite) {
      console.log('취소되었습니다.');
      return;
    }
    await fs.remove(targetDir);
  }

  if (projectType === 'standalone') {
    await generateStandalone(targetDir, projectName, plugins);
  } else {
    await generateMonorepo(targetDir, projectName, plugins);
  }

  console.log(`\n✅ ${projectName} 프로젝트가 생성되었습니다!`);
  console.log(`\n  cd ${projectName}`);
  console.log('  pnpm install');
  console.log('  pnpm dev\n');
}

// ─── Add app to existing monorepo ───

export async function addApp() {
  const isMonorepo = await fs.pathExists(
    path.resolve(process.cwd(), 'pnpm-workspace.yaml'),
  );
  if (!isMonorepo) {
    console.log('❌ 현재 디렉토리가 모노레포가 아닙니다. pnpm-workspace.yaml이 없습니다.');
    return;
  }

  const appName = await input({
    message: '앱 이름:',
    default: 'web',
  });

  const port = await input({
    message: '포트 번호:',
    default: '3000',
  });

  const selectedPlugins = await checkbox({
    message: '추가 기능 선택 (Space로 선택):',
    choices: getPluginChoices(),
  });

  const plugins = getPluginsByNames(selectedPlugins);
  plugins.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const appsDir = path.resolve(process.cwd(), 'apps', appName);

  if (await fs.pathExists(appsDir)) {
    console.log(`❌ apps/${appName} 디렉토리가 이미 존재합니다.`);
    return;
  }

  await generateApp(appsDir, appName, port, plugins);

  console.log(`\n✅ apps/${appName} 이 추가되었습니다!`);
  console.log('\n  pnpm install');
  console.log(`  pnpm --filter ${appName} dev\n`);
}

// ─── Add component to ui packages ───

export async function addComponent(componentName, appName) {
  const cwd = process.cwd();
  const isMonorepo = await fs.pathExists(path.join(cwd, 'pnpm-workspace.yaml'));

  if (!isMonorepo) {
    // Standalone: 현재 디렉토리에서 바로 실행
    if (!componentName) {
      componentName = await input({ message: '컴포넌트 이름:' });
    }
    console.log(`\n📦 shadcn 컴포넌트 추가: ${componentName}`);
    execSync(`npx shadcn@latest add ${componentName}`, { cwd, stdio: 'inherit' });
    console.log(`\n✅ ${componentName} 추가 완료!`);
    return;
  }

  // Monorepo: packages/ui/ui-apps/* 에서 실행
  const uiAppsDir = path.join(cwd, 'packages', 'ui', 'ui-apps');
  if (!(await fs.pathExists(uiAppsDir))) {
    console.log('❌ packages/ui/ui-apps/ 디렉토리가 없습니다.');
    return;
  }

  const entries = await fs.readdir(uiAppsDir, { withFileTypes: true });
  const uiPackages = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('ui-') && e.name !== 'ui-app-template')
    .map((e) => e.name);

  if (uiPackages.length === 0) {
    console.log('❌ ui-* 패키지가 없습니다.');
    return;
  }

  if (!componentName) {
    componentName = await input({ message: '컴포넌트 이름:' });
  }

  let targets;
  if (appName) {
    const pkgName = `ui-${appName}`;
    if (!uiPackages.includes(pkgName)) {
      console.log(`❌ packages/ui/ui-apps/${pkgName} 이 존재하지 않습니다.`);
      console.log(`   사용 가능: ${uiPackages.join(', ')}`);
      return;
    }
    targets = [pkgName];
  } else {
    const choice = await select({
      message: '어디에 추가할까요?',
      choices: [
        { name: '모든 ui 패키지', value: 'all' },
        ...uiPackages.map((name) => ({ name: `packages/ui/ui-apps/${name}`, value: name })),
      ],
    });
    targets = choice === 'all' ? uiPackages : [choice];
  }

  for (const pkg of targets) {
    const pkgDir = path.join(uiAppsDir, pkg);
    console.log(`\n📦 packages/ui/ui-apps/${pkg}에 ${componentName} 추가 중...`);
    try {
      execSync(`npx shadcn@latest add ${componentName}`, { cwd: pkgDir, stdio: 'inherit' });
      console.log(`✅ packages/ui/ui-apps/${pkg} 완료`);
    } catch (error) {
      console.log(`❌ packages/ui/ui-apps/${pkg} 실패: ${error.message}`);
    }
  }

  console.log('\n✅ 컴포넌트 추가 완료!');
}

// ─── Generators ───

async function generateStandalone(targetDir, projectName, plugins) {
  await fs.copy(path.join(TEMPLATES_DIR, 'nextjs-standalone'), targetDir);

  // Update package.json
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;
  for (const plugin of plugins) {
    if (plugin.dependencies) {
      Object.assign(pkg.dependencies, plugin.dependencies);
    }
    if (plugin.devDependencies) {
      Object.assign(pkg.devDependencies, plugin.devDependencies);
    }
  }
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await writeNextConfig(targetDir, plugins, { isMonorepo: false });
  await appendEnvVars(path.join(targetDir, '.env.example'), plugins);
  await writePluginFiles(targetDir, plugins);
  await composeProviders(targetDir, plugins);
  await applyTransforms(targetDir, plugins);
}

async function generateMonorepo(targetDir, projectName, plugins) {
  await fs.copy(path.join(TEMPLATES_DIR, 'monorepo'), targetDir);

  // Update root package.json
  const rootPkgPath = path.join(targetDir, 'package.json');
  const rootPkg = await fs.readJson(rootPkgPath);
  rootPkg.name = projectName;
  await fs.writeJson(rootPkgPath, rootPkg, { spaces: 2 });

  // Update turbo.json
  const turboPath = path.join(targetDir, 'turbo.json');
  const turbo = await fs.readJson(turboPath);
  for (const plugin of plugins) {
    if (plugin.turboEnvVars) {
      turbo.globalEnv.push(...plugin.turboEnvVars);
    }
  }
  await fs.writeJson(turboPath, turbo, { spaces: 2 });

  // Create first app
  const appName = await input({
    message: '첫 번째 앱 이름:',
    default: 'web',
  });

  const port = await input({
    message: '포트 번호:',
    default: '3000',
  });

  const appsDir = path.join(targetDir, 'apps', appName);
  await generateApp(appsDir, appName, port, plugins);
}

async function generateApp(targetDir, appName, port, plugins) {
  await fs.copy(path.join(TEMPLATES_DIR, 'nextjs-app'), targetDir);

  // Replace ui-app-name placeholder with actual app name in all files
  await replaceInAllFiles(targetDir, 'ui-app-name', `ui-${appName}`);
  await replaceInAllFiles(targetDir, 'app-name', appName);

  // Update package.json
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = appName;
  pkg.scripts.dev = `next dev -p ${port} --turbopack`;
  for (const plugin of plugins) {
    if (plugin.dependencies) {
      Object.assign(pkg.dependencies, plugin.dependencies);
    }
    if (plugin.devDependencies) {
      Object.assign(pkg.devDependencies, plugin.devDependencies);
    }
  }
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await writeNextConfig(targetDir, plugins, { isMonorepo: true, appName });

  // Update Dockerfile
  const dockerPath = path.join(targetDir, 'Dockerfile');
  if (await fs.pathExists(dockerPath)) {
    let dockerfile = await fs.readFile(dockerPath, 'utf-8');
    dockerfile = dockerfile.replace(/EXPOSE \d+/, `EXPOSE ${port}`);
    dockerfile = dockerfile.replace(/ENV PORT=\d+/, `ENV PORT=${port}`);
    await fs.writeFile(dockerPath, dockerfile);
  }

  // Create packages/ui/ui-apps/ui-{appName}/ from ui-app-template
  const monorepoRoot = path.resolve(targetDir, '..', '..');
  const uiPkgDir = path.join(monorepoRoot, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  if (!(await fs.pathExists(uiPkgDir))) {
    await fs.copy(path.join(TEMPLATES_DIR, 'ui-app-template'), uiPkgDir);
    await replaceInAllFiles(uiPkgDir, 'ui-app-name', `ui-${appName}`);
    await replaceInAllFiles(uiPkgDir, 'app-name', appName);
  }

  await appendEnvVars(path.join(targetDir, '.env.example'), plugins);
  await writePluginFiles(targetDir, plugins);
  await composeProviders(targetDir, plugins);
  await applyTransforms(targetDir, plugins);
}

// ─── Helpers ───

async function replaceInAllFiles(dir, search, replace) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      await replaceInAllFiles(fullPath, search, replace);
    } else {
      const content = await fs.readFile(fullPath, 'utf-8');
      if (content.includes(search)) {
        await fs.writeFile(fullPath, content.replaceAll(search, replace));
      }
    }
  }
}

async function writeNextConfig(targetDir, plugins, { isMonorepo, appName }) {
  const imports = [`import type { NextConfig } from 'next';`];
  const preExport = [];
  let configBody;

  if (isMonorepo) {
    const uiPkgName = `ui-${appName ?? 'app'}`;
    configBody = `const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@workspace/ui-core', '@workspace/${uiPkgName}'],
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};`;
  } else {
    configBody = `const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};`;
  }

  for (const plugin of plugins) {
    if (plugin.imports) imports.push(...plugin.imports);
    if (plugin.preExport) preExport.push(...plugin.preExport);
  }

  let exportExpr = 'nextConfig';
  for (const plugin of plugins) {
    if (plugin.wrapExport) {
      exportExpr = plugin.wrapExport(exportExpr);
    }
  }

  const lines = [imports.join('\n'), '', configBody];

  if (preExport.length > 0) {
    lines.push('', preExport.join('\n'));
  }

  lines.push('', `export default ${exportExpr};`, '');

  await fs.writeFile(path.join(targetDir, 'next.config.ts'), lines.join('\n'));
}

async function appendEnvVars(envPath, plugins) {
  const additions = [];
  for (const plugin of plugins) {
    if (plugin.envVars && plugin.envVars.length > 0) {
      additions.push('', ...plugin.envVars);
    }
  }
  if (additions.length > 0) {
    const existing = await fs.readFile(envPath, 'utf-8');
    await fs.writeFile(envPath, existing.trimEnd() + '\n' + additions.join('\n') + '\n');
  }
}

async function writePluginFiles(targetDir, plugins) {
  for (const plugin of plugins) {
    if (plugin.files) {
      for (const [filePath, content] of Object.entries(plugin.files)) {
        const fullPath = path.join(targetDir, filePath);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, content);
      }
    }
  }
}

async function composeProviders(targetDir, plugins) {
  const extraImports = [];
  const wrappers = [];

  for (const plugin of plugins) {
    if (plugin.providerImports) extraImports.push(...plugin.providerImports);
    if (plugin.providerWrappers) wrappers.push(...plugin.providerWrappers);
  }

  if (extraImports.length === 0 && wrappers.length === 0) return;

  const globalProviderPath = path.join(targetDir, 'src/app/providers/GlobalProvider/index.tsx');
  if (!(await fs.pathExists(globalProviderPath))) return;

  let content = await fs.readFile(globalProviderPath, 'utf-8');

  // import 추가 (파일 최상단에)
  for (const imp of extraImports) {
    if (!content.includes(imp)) {
      content = imp + '\n' + content;
    }
  }

  // wrapper 적용: <ThemeProviders> 바깥쪽에 감싸기
  for (const wrapper of wrappers) {
    if (content.includes(`<${wrapper}>`)) continue;
    content = content.replace(
      /(<ThemeProviders>)/,
      `<${wrapper}>\n      $1`,
    );
    content = content.replace(
      /(<\/ThemeProviders>)/,
      `$1\n      </${wrapper}>`,
    );
  }

  await fs.writeFile(globalProviderPath, content);
}

async function applyTransforms(targetDir, plugins) {
  for (const plugin of plugins) {
    if (!plugin.transforms) continue;

    for (const transform of plugin.transforms) {
      const { type } = transform;

      if (type === 'move') {
        const fromPath = path.join(targetDir, transform.from);
        const toPath = path.join(targetDir, transform.to);
        if (await fs.pathExists(fromPath)) {
          await fs.ensureDir(path.dirname(toPath));
          await fs.move(fromPath, toPath, { overwrite: true });
        }
      }

      if (type === 'replace') {
        const filePath = path.join(targetDir, transform.path);
        if (transform.content) {
          await fs.writeFile(filePath, transform.content);
        }
        if (transform.contentFn) {
          if (await fs.pathExists(filePath)) {
            const existing = await fs.readFile(filePath, 'utf-8');
            const updated = transform.contentFn(existing);
            await fs.writeFile(filePath, updated);
          }
        }
      }

      if (type === 'delete') {
        const filePath = path.join(targetDir, transform.path);
        await fs.remove(filePath);
      }
    }
  }
}
