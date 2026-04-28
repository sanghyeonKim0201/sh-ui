#!/usr/bin/env node
// 출고 직전(`prepublishOnly`) 모노레포 데이터를 packages/cli/data/ 로 복사.
//
// 복사 대상:
//   packages/registry/{react,flutter}/  (node_modules·package.json·vitest 제외)
//   packages/tokens/{build.mjs,src/}
//   packages/llms/summaries/{react,flutter}.json
//   packages/changelog/versions.json
//
// 결과: paths.mjs 가 출고 모드를 자동 감지해 `data/` 를 사용한다.

import { cp, mkdir, rm, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = resolve(__dirname, "..");
const PACKAGES = resolve(CLI_ROOT, "..");
const DATA = resolve(CLI_ROOT, "data");

/** node_modules·테스트·패키지 메타는 제외하고 복사 */
function registryFilter(src) {
  const skip = ["node_modules", "package.json", "vitest.config.ts", "vitest.setup.ts"];
  return !skip.some((s) => src.endsWith("/" + s) || src.endsWith("\\" + s));
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function copyRegistry(platform) {
  const from = resolve(PACKAGES, "registry", platform);
  const to = resolve(DATA, "registry", platform);
  if (!existsSync(from)) throw new Error(`레지스트리 원본 없음: ${from}`);
  await ensureDir(dirname(to));
  await cp(from, to, { recursive: true, filter: registryFilter });
}

async function copyTokens() {
  const from = resolve(PACKAGES, "tokens");
  const to = resolve(DATA, "tokens");
  if (!existsSync(from)) throw new Error(`tokens 원본 없음: ${from}`);
  await ensureDir(to);
  await copyFile(resolve(from, "build.mjs"), resolve(to, "build.mjs"));
  await cp(resolve(from, "src"), resolve(to, "src"), { recursive: true });
}

async function copySummaries() {
  const from = resolve(PACKAGES, "llms", "summaries");
  const to = resolve(DATA, "summaries");
  await ensureDir(to);
  for (const platform of ["react", "flutter"]) {
    const file = `${platform}.json`;
    await copyFile(resolve(from, file), resolve(to, file));
  }
}

async function copyVersions() {
  const from = resolve(PACKAGES, "changelog", "versions.json");
  const to = resolve(DATA, "changelog", "versions.json");
  await ensureDir(dirname(to));
  await copyFile(from, to);
}

async function main() {
  if (existsSync(DATA)) await rm(DATA, { recursive: true, force: true });
  await ensureDir(DATA);

  await copyRegistry("react");
  await copyRegistry("flutter");
  await copyTokens();
  await copySummaries();
  await copyVersions();

  console.log("✓ data/ 번들 완료");
}

main().catch((err) => {
  console.error(`✗ data 복사 실패: ${err.message}`);
  process.exit(1);
});
