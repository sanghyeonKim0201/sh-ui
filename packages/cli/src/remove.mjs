import { readFile, rm, rmdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { getRegistryRoot } from "./paths.mjs";
import { removeSection, isStyleFile, stripStylesImport, isTsxFile } from "./css-bundle.mjs";

/** registry file 엔트리가 현재 cssFramework 와 호환되는지 (add.mjs 와 동일 규칙). */
function frameworkMatches(entry, cssFramework) {
  if (!entry.frameworks) return true;
  return entry.frameworks.includes(cssFramework);
}

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
  const registryPath = resolve(getRegistryRoot(platform), "registry.json");
  return JSON.parse(await readFile(registryPath, "utf8"));
}

/**
 * 설치된 파일이 레지스트리 원본과 동일한지(= 사용자가 수정하지 않았는지).
 * bundled 모드에서 .tsx 는 add 시 `import "./styles.css";` 가 제거된 상태로 저장됐으므로
 * 비교 전에 같은 변환을 src 에 적용해 false positive 회피.
 */
async function isUnmodified(srcAbs, destAbs, { transform } = {}) {
  try {
    let src = await readFile(srcAbs, "utf8");
    if (transform) src = transform(src);
    const dest = await readFile(destAbs, "utf8");
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

    const registryRoot = getRegistryRoot(config.platform);
    const bundled = config.cssStrategy === "bundled";
    const cssFramework = config.cssFramework ?? "plain";
    const seenDest = new Set();
    for (const file of entry.files) {
      if (!frameworkMatches(file, cssFramework)) continue;
      // bundled 모드에선 CSS 파일이 sh-ui-components.css 내 섹션이라 개별 파일이 없음.
      // .tsx 만 일반 삭제 흐름을 타고, 섹션 제거는 별도 단계에서 처리.
      if (bundled && isStyleFile(file)) continue;
      const srcAbs = resolve(registryRoot, file.src);
      const destAbs = resolve(cwd, resolveDest(file.dest, config));
      // 같은 dest 가 여러 file 변종에서 나올 수 있음 (예: index.tsx 와 index.tailwind.tsx
      // 가 동일 dest 로 매핑) — 한 번만 처리.
      if (seenDest.has(destAbs)) continue;
      seenDest.add(destAbs);

      if (!existsSync(destAbs)) continue;

      // dest 는 add 시 substitutePlaceholders + (bundled.tsx 면) stripStylesImport 가
      // 적용된 채로 저장됐다. unmodified 비교는 같은 변환을 src 에 먹여 false positive 회피.
      const transform = (text) => {
        let out = text;
        if (config.aliases?.utils) {
          out = out.replaceAll("@SH_UI_UTILS@", config.aliases.utils);
        }
        if (bundled && isTsxFile(file)) out = stripStylesImport(out);
        return out;
      };
      const unmodified = await isUnmodified(srcAbs, destAbs, { transform });
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

  // bundled 모드 — 각 컴포넌트의 CSS 섹션을 번들에서 제거.
  if (config.cssStrategy === "bundled" && config.paths?.cssBundle) {
    const bundlePath = resolve(cwd, config.paths.cssBundle);
    if (existsSync(bundlePath)) {
      let text = await readFile(bundlePath, "utf8");
      let removedAny = false;
      for (const name of names) {
        const next = removeSection(text, name);
        if (next !== text) {
          text = next;
          removedAny = true;
          console.log(`✓ 번들 섹션 제거: ${name} → ${relative(cwd, bundlePath)}`);
        }
      }
      if (removedAny) await writeFile(bundlePath, text, "utf8");
    }
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
