import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { getRegistryRoot } from "./paths.mjs";

export const HELP_TEXT = `sh-ui list — 현재 설치된 컴포넌트 목록 표시

사용법:
  sh-ui list

옵션:
  --all   설치되지 않은 컴포넌트까지 모두 표시

예:
  sh-ui list
  sh-ui list --all
`;

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

/** 해당 컴포넌트의 파일 중 하나라도 존재하면 "설치됨"으로 간주. */
function isInstalled(entry, config, cwd) {
  for (const file of entry.files) {
    const dest = resolve(cwd, resolveDest(file.dest, config));
    if (existsSync(dest)) return true;
  }
  return false;
}

export async function list({ cwd, all = false }) {
  const config = await loadConfig(cwd);
  const registry = await loadRegistry(config.platform);
  const entries = Object.entries(registry.components ?? {});

  const rows = [];
  for (const [name, entry] of entries) {
    try {
      rows.push({
        name,
        installed: isInstalled(entry, config, cwd),
        files: entry.files.map((f) => resolveDest(f.dest, config)),
      });
    } catch {
      // 이 config에서 해석 불가한 paths placeholder가 있는 엔트리는 스킵
      // (예: base.css는 {styles} 경로를 쓰는데 기본 config엔 paths.styles 없음)
    }
  }

  const installed = rows.filter((r) => r.installed);
  const available = rows.filter((r) => !r.installed);

  console.log(`플랫폼: ${config.platform}\n`);

  if (installed.length === 0) {
    console.log("설치된 컴포넌트 없음. `sh-ui add <name>`으로 시작하세요.");
  } else {
    console.log(`설치됨 (${installed.length}개):`);
    for (const r of installed) {
      console.log(`  ✓ ${r.name}`);
      for (const f of r.files) console.log(`      ${relative(cwd, resolve(cwd, f))}`);
    }
  }

  if (all) {
    console.log(`\n설치 가능 (${available.length}개):`);
    for (const r of available) console.log(`  · ${r.name}`);
  } else if (available.length > 0) {
    console.log(
      `\n설치 가능한 컴포넌트 ${available.length}개 더 있음. 전체 목록은 \`sh-ui list --all\`.`,
    );
  }
}
