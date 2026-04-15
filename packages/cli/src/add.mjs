import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokensCss, buildTokensDart } from "../../tokens/build.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../..");

/** `{components}/button.tsx` 처럼 config.paths 값으로 치환 */
function resolveDest(template, config) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (m, key) => {
    const v = config.paths?.[key];
    if (!v) throw new Error(`paths.${key} 가 hyeon.config.json에 없습니다.`);
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

async function addComponent(name, config, cwd, installed) {
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
    await addOne(dep, config, cwd, installed);
  }

  for (const file of entry.files) {
    const src = resolve(REPO_ROOT, "packages/registry", config.platform, file.src);
    const dest = resolve(cwd, resolveDest(file.dest, config));
    await ensureDir(dest);
    await copyFile(src, dest);
    console.log(`✓ ${name} → ${relative(cwd, dest)}`);
  }

  const deps = entry.dependencies ?? [];
  if (deps.length > 0) {
    console.log(
      `  ⚠ '${name}'은 외부 패키지가 필요합니다. 다음을 실행하세요:\n    pnpm add ${deps.join(" ")}`,
    );
  }
}

export async function add({ cwd, names }) {
  const configPath = resolve(cwd, "hyeon.config.json");
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    throw new Error(
      "hyeon.config.json을 찾을 수 없습니다. 먼저 `hyeon init`을 실행하세요.",
    );
  }

  const installed = new Set();
  for (const name of names) {
    await addOne(name, config, cwd, installed);
  }
}

async function addOne(name, config, cwd, installed) {
  if (installed.has(name)) return;
  installed.add(name);
  if (name === "tokens") {
    await addTokens(config, cwd);
  } else {
    await addComponent(name, config, cwd, installed);
  }
}
