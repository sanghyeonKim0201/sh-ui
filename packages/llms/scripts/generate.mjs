#!/usr/bin/env node
// sh-ui llms.txt / llms-full.txt 생성기.
//
// 입력:
//   - packages/registry/react/registry.json
//   - packages/registry/flutter/registry.json
//   - packages/llms/summaries/{react,flutter}.json
//   - packages/llms/templates/intro.md
//   - packages/changelog/versions.json (최신 버전 표기용)
//
// 출력:
//   - apps/docs/public/llms.txt       — 목차형 (컴포넌트 리스트 + 링크)
//   - apps/docs/public/llms-full.txt  — 확장형 (각 컴포넌트 블록 + 설치/의존성)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

const GITHUB_REPO = "https://github.com/sanghyeonKim0201/sh-ui";
// 도메인 확정되면 이 한 줄만 교체.
const DOCS_BASE = GITHUB_REPO + "/tree/live/apps/docs/app/components";

const readJson = (p) => JSON.parse(readFileSync(join(REPO_ROOT, p), "utf8"));
const readText = (p) => readFileSync(join(REPO_ROOT, p), "utf8");

const reactRegistry = readJson("packages/registry/react/registry.json");
const flutterRegistry = readJson("packages/registry/flutter/registry.json");
const reactSummaries = readJson("packages/llms/summaries/react.json").summaries;
const flutterSummaries = readJson("packages/llms/summaries/flutter.json").summaries;
const intro = readText("packages/llms/templates/intro.md");
const versions = readJson("packages/changelog/versions.json").versions;
const latest = versions[0];

const kebabToTitle = (s) =>
  s
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const flatten = (registry, summaries) =>
  Object.values(registry.components).map((entry) => ({
    name: entry.name,
    type: entry.type,
    summary: summaries[entry.name] ?? "",
    dependencies: entry.dependencies ?? [],
    registryDependencies: entry.registryDependencies ?? [],
    files: entry.files ?? [],
  }));

const reactList = flatten(reactRegistry, reactSummaries);
const flutterList = flatten(flutterRegistry, flutterSummaries);

const byType = (items, type) => items.filter((i) => i.type === type);

// ───────── llms.txt (목차형) ─────────

const renderIndex = () => {
  const lines = [];
  lines.push(intro.trimEnd());
  lines.push("");
  lines.push(`**최신 버전**: v${latest.version} (${latest.date}) — ${latest.title}`);
  lines.push("");

  lines.push("## React Components");
  lines.push("");
  for (const item of byType(reactList, "component")) {
    const desc = item.summary || `${kebabToTitle(item.name)} 컴포넌트.`;
    lines.push(`- **${item.name}** — ${desc}`);
  }

  const reactExtras = reactList.filter((i) => i.type !== "component");
  if (reactExtras.length > 0) {
    lines.push("");
    lines.push("## React — 유틸 / 훅 / 스타일 기반");
    lines.push("");
    for (const item of reactExtras) {
      const desc = item.summary || "(summary 누락)";
      lines.push(`- **${item.name}** (${item.type}) — ${desc}`);
    }
  }

  lines.push("");
  lines.push("## Flutter Widgets");
  lines.push("");
  for (const item of flutterList) {
    const desc = item.summary || `${kebabToTitle(item.name)} 위젯.`;
    lines.push(`- **${item.name}** — ${desc}`);
  }

  lines.push("");
  lines.push("## Resources");
  lines.push("");
  lines.push(`- GitHub: ${GITHUB_REPO}`);
  lines.push(`- Docs source: ${DOCS_BASE}`);
  lines.push(`- Changelog: ${GITHUB_REPO}/blob/live/packages/changelog/versions.json`);
  lines.push(`- Full API dump: llms-full.txt`);

  return lines.join("\n") + "\n";
};

// ───────── llms-full.txt (확장형) ─────────

const renderBlock = (item, platform) => {
  const lines = [];
  lines.push(`### ${item.name}`);
  lines.push("");
  lines.push(`- Type: ${item.type}`);
  if (item.summary) lines.push(`- Summary: ${item.summary}`);
  lines.push(`- Install: \`npx sh-ui-cli add ${item.name}\``);
  if (item.dependencies.length > 0) {
    lines.push(`- npm/pub deps: ${item.dependencies.join(", ")}`);
  }
  if (item.registryDependencies.length > 0) {
    lines.push(
      `- Registry deps: ${item.registryDependencies.join(", ")} (자동 설치됨)`,
    );
  }
  if (platform === "react") {
    const hasTsx = item.files.some((f) => f.src.endsWith(".tsx"));
    if (hasTsx) lines.push(`- Import: \`@/components/ui/${item.name}\``);
  } else {
    const dart = item.files.find((f) => f.src.endsWith(".dart"));
    if (dart) {
      const base = dart.src.split("/").pop().replace(".dart", "");
      lines.push(`- Import: \`lib/widgets/${base}.dart\``);
    }
  }
  lines.push(
    `- Docs: ${DOCS_BASE}/${item.name.replace("sh-ui-", "").replace(/^sh_ui_/, "")}`,
  );
  return lines.join("\n");
};

const renderFull = () => {
  const lines = [];
  lines.push(intro.trimEnd());
  lines.push("");
  lines.push(`**최신 버전**: v${latest.version} (${latest.date}) — ${latest.title}`);
  lines.push("");
  lines.push("## React — Components");
  lines.push("");
  for (const item of byType(reactList, "component")) {
    lines.push(renderBlock(item, "react"));
    lines.push("");
  }

  const reactExtras = reactList.filter((i) => i.type !== "component");
  if (reactExtras.length > 0) {
    lines.push("## React — 유틸 / 훅 / 스타일 기반");
    lines.push("");
    for (const item of reactExtras) {
      lines.push(renderBlock(item, "react"));
      lines.push("");
    }
  }

  lines.push("## Flutter — Widgets");
  lines.push("");
  for (const item of flutterList) {
    lines.push(renderBlock(item, "flutter"));
    lines.push("");
  }

  lines.push("## 최근 릴리즈 (최대 5개)");
  lines.push("");
  for (const v of versions.slice(0, 5)) {
    lines.push(`### v${v.version} — ${v.title} (${v.date})`);
    for (const h of v.highlights ?? []) {
      lines.push(`- ${h}`);
    }
    if (v.url) lines.push(`- Release: ${v.url}`);
    lines.push("");
  }

  lines.push("## Resources");
  lines.push("");
  lines.push(`- GitHub: ${GITHUB_REPO}`);
  lines.push(`- Changelog source: packages/changelog/versions.json`);

  return lines.join("\n") + "\n";
};

// ───────── 출력 ─────────

const outDir = join(REPO_ROOT, "apps/docs/public");
mkdirSync(outDir, { recursive: true });

const indexPath = join(outDir, "llms.txt");
const fullPath = join(outDir, "llms-full.txt");

writeFileSync(indexPath, renderIndex(), "utf8");
writeFileSync(fullPath, renderFull(), "utf8");

// 커버리지 경고 (summary 누락 컴포넌트 표시).
const missing = [
  ...reactList.filter((i) => !i.summary).map((i) => `react/${i.name}`),
  ...flutterList.filter((i) => !i.summary).map((i) => `flutter/${i.name}`),
];

console.log(`[llms] ${indexPath}`);
console.log(`[llms] ${fullPath}`);
if (missing.length > 0) {
  console.warn(`[llms] summary 누락: ${missing.join(", ")}`);
}
