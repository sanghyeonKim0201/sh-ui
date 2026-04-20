import { readFile, rm, rmdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../..");

function resolveDest(template, config) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (m, key) => {
    const v = config.paths?.[key];
    if (!v) throw new Error(`paths.${key} 가 sh-ui.config.json에 없습니다.`);
    return v;
  });
}

async function loadConfig(cwd) {
  const configPath = resolve(cwd, "sh-ui.config.json");
  try {
    return JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    throw new Error(
      "sh-ui.config.json을 찾을 수 없습니다. 먼저 `sh-ui init`을 실행하세요.",
    );
  }
}

async function loadRegistry(platform) {
  const registryPath = resolve(
    REPO_ROOT,
    "packages/registry",
    platform,
    "registry.json",
  );
  return JSON.parse(await readFile(registryPath, "utf8"));
}

/** 설치된 파일이 레지스트리 원본과 동일한지(= 사용자가 수정하지 않았는지). */
async function isUnmodified(srcAbs, destAbs) {
  try {
    const [src, dest] = await Promise.all([
      readFile(srcAbs, "utf8"),
      readFile(destAbs, "utf8"),
    ]);
    return src === dest;
  } catch {
    return false;
  }
}

/** 디렉터리가 비어 있으면 지운다. 상위로 올라가며 반복. */
async function pruneEmptyDirs(startDir, stopAt) {
  let dir = startDir;
  while (dir.startsWith(stopAt) && dir !== stopAt) {
    try {
      const entries = await readdir(dir);
      if (entries.length > 0) return;
      await rmdir(dir);
    } catch {
      return;
    }
    dir = dirname(dir);
  }
}

export async function remove({ cwd, names, force = false, dryRun = false }) {
  const config = await loadConfig(cwd);
  const registry = await loadRegistry(config.platform);

  const plannedDeletes = [];
  const modifiedBlocked = [];
  const missingNames = [];

  for (const name of names) {
    const entry = registry.components?.[name];
    if (!entry) {
      missingNames.push(name);
      continue;
    }

    for (const file of entry.files) {
      const srcAbs = resolve(REPO_ROOT, "packages/registry", config.platform, file.src);
      const destAbs = resolve(cwd, resolveDest(file.dest, config));

      if (!existsSync(destAbs)) continue;

      const unmodified = await isUnmodified(srcAbs, destAbs);
      if (!unmodified && !force) {
        modifiedBlocked.push({ name, dest: destAbs });
        continue;
      }
      plannedDeletes.push({ name, dest: destAbs, unmodified });
    }
  }

  if (missingNames.length > 0) {
    for (const n of missingNames) {
      console.error(`✗ '${n}' 은(는) ${config.platform} 레지스트리에 없습니다.`);
    }
  }

  if (modifiedBlocked.length > 0) {
    console.error("\n⚠ 사용자가 수정한 파일이 있어 삭제를 건너뜁니다:");
    for (const f of modifiedBlocked) {
      console.error(`    ${relative(cwd, f.dest)}  (${f.name})`);
    }
    console.error(
      "\n  --force 를 붙이면 수정된 파일도 삭제합니다. (원본 복구 불가)",
    );
  }

  if (plannedDeletes.length === 0) {
    if (modifiedBlocked.length > 0 || missingNames.length > 0) {
      process.exit(1);
    }
    console.log("삭제할 파일이 없습니다.");
    return;
  }

  if (dryRun) {
    console.log("\n── 삭제 미리보기 (dry-run) ──");
    for (const d of plannedDeletes) {
      const tag = d.unmodified ? "" : " ⚠ 수정됨";
      console.log(`  - ${relative(cwd, d.dest)}${tag}`);
    }
    console.log("\n실제로 삭제하려면 --dry-run 없이 다시 실행.");
    return;
  }

  const touchedDirs = new Set();
  for (const d of plannedDeletes) {
    await rm(d.dest);
    console.log(`✓ 삭제: ${relative(cwd, d.dest)}`);
    touchedDirs.add(dirname(d.dest));
  }

  // 컴포넌트 폴더가 비면 정리 (paths.components 상위까지)
  const componentsRoot = config.paths?.components
    ? resolve(cwd, config.paths.components)
    : cwd;
  for (const dir of touchedDirs) {
    await pruneEmptyDirs(dir, componentsRoot);
  }

  if (missingNames.length > 0 || modifiedBlocked.length > 0) process.exit(1);
}
