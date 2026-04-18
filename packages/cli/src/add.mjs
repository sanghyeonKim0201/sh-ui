import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { buildTokensCss, buildTokensDart } from "../../tokens/build.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../..");

/** `{components}/button.tsx` 처럼 config.paths 값으로 치환 */
function resolveDest(template, config) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (m, key) => {
    const v = config.paths?.[key];
    if (!v) throw new Error(`paths.${key} 가 sh-ui.config.json에 없습니다.`);
    return v;
  });
}

async function ensureDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

/** 특수 컴포넌트: 설정으로 토큰 파일 생성 */
async function addTokens(config, cwd) {
  const destRel = config.paths?.tokens;
  if (!destRel) throw new Error("paths.tokens 가 설정에 없습니다.");
  const dest = resolve(cwd, destRel);
  await ensureDir(dest);

  const content =
    config.platform === "react"
      ? await buildTokensCss(config)
      : await buildTokensDart(config);

  await writeFile(dest, content, "utf8");
  console.log(`✓ tokens → ${relative(cwd, dest)}`);
}

async function addComponent(name, config, cwd, installed, pendingDeps) {
  const registryPath = resolve(
    REPO_ROOT,
    "packages/registry",
    config.platform,
    "registry.json",
  );
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  const entry = registry.components?.[name];
  if (!entry) {
    throw new Error(
      `'${name}' 컴포넌트를 ${config.platform} 레지스트리에서 찾을 수 없습니다.`,
    );
  }

  for (const dep of entry.registryDependencies ?? []) {
    await addOne(dep, config, cwd, installed, pendingDeps);
  }

  for (const file of entry.files) {
    const src = resolve(REPO_ROOT, "packages/registry", config.platform, file.src);
    const dest = resolve(cwd, resolveDest(file.dest, config));
    await ensureDir(dest);
    await copyFile(src, dest);
    console.log(`✓ ${name} → ${relative(cwd, dest)}`);
  }

  for (const dep of entry.dependencies ?? []) {
    pendingDeps.add(dep);
  }
}

/** lockfile 존재로 패키지 매니저 감지. 없으면 npm. */
function detectPackageManager(cwd) {
  if (existsSync(resolve(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (
    existsSync(resolve(cwd, "bun.lockb")) ||
    existsSync(resolve(cwd, "bun.lock"))
  ) {
    return "bun";
  }
  if (existsSync(resolve(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

/** 이미 package.json에 있는 의존성은 제외. */
async function filterMissingDeps(deps, cwd) {
  try {
    const pkg = JSON.parse(
      await readFile(resolve(cwd, "package.json"), "utf8"),
    );
    const have = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
      ...(pkg.peerDependencies ?? {}),
      ...(pkg.optionalDependencies ?? {}),
    };
    return deps.filter((d) => !(d in have));
  } catch {
    return deps;
  }
}

function runInstall(pm, deps, cwd) {
  const addCmd = pm === "npm" ? "install" : "add";
  const args = [addCmd, ...deps];
  console.log(`\n외부 패키지 설치: ${pm} ${args.join(" ")}`);
  // Windows는 .cmd/.bat 파일을 실행하려면 shell이 필요하지만,
  // Unix에선 args 이스케이프 경고를 피하려고 shell을 끈다.
  const isWin = process.platform === "win32";
  return new Promise((ok, bad) => {
    const child = spawn(pm, args, { cwd, stdio: "inherit", shell: isWin });
    child.on("exit", (code) =>
      code === 0 ? ok() : bad(new Error(`${pm} exited with code ${code}`)),
    );
    child.on("error", bad);
  });
}

export async function add({ cwd, names, skipInstall = false }) {
  const configPath = resolve(cwd, "sh-ui.config.json");
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    throw new Error(
      "sh-ui.config.json을 찾을 수 없습니다. 먼저 `sh-ui init`을 실행하세요.",
    );
  }

  const installed = new Set();
  const pendingDeps = new Set();
  for (const name of names) {
    await addOne(name, config, cwd, installed, pendingDeps);
  }

  if (pendingDeps.size === 0) return;

  const deps = [...pendingDeps];
  const missing = await filterMissingDeps(deps, cwd);

  if (missing.length === 0) {
    console.log(
      `\n외부 패키지 모두 이미 설치됨: ${deps.join(", ")}`,
    );
    return;
  }

  if (skipInstall) {
    const pm = detectPackageManager(cwd);
    const addCmd = pm === "npm" ? "install" : "add";
    console.log(
      `\n  ⚠ 외부 패키지 필요. 다음을 실행하세요:\n    ${pm} ${addCmd} ${missing.join(" ")}`,
    );
    return;
  }

  const pm = detectPackageManager(cwd);
  try {
    await runInstall(pm, missing, cwd);
  } catch (err) {
    const addCmd = pm === "npm" ? "install" : "add";
    console.error(
      `\n✗ 자동 설치 실패 (${err.message}). 수동으로 실행하세요:\n    ${pm} ${addCmd} ${missing.join(" ")}`,
    );
    throw err;
  }
}

async function addOne(name, config, cwd, installed, pendingDeps) {
  if (installed.has(name)) return;
  installed.add(name);
  if (name === "tokens") {
    await addTokens(config, cwd);
  } else {
    await addComponent(name, config, cwd, installed, pendingDeps);
  }
}
