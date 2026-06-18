#!/usr/bin/env node
// sh-ui registry 정합성 lint.
//
// 검사 항목:
//   B) registry.json 의 모든 컴포넌트 name 이 summaries/<plat>.json 에 키로 있어야
//      한다. 반대로 summary 에 dead key (registry 에 없는) 도 없어야 한다.
//   C) summary 텍스트에 등장하는 PascalCase / ShUi-prefix 식별자가 실제
//      컴포넌트 source 에 export 되어 있어야 한다 (휴리스틱). 불일치는 false
//      claim 으로 판단.
//
// 실행: node scripts/lint-registry.mjs
// CI 에서는 fail 시 exit 1.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// 식별자 검사에서 화이트리스트 — summary 에 자주 등장하지만 컴포넌트 export
// 가 아닌 단어들. PascalCase 라 토큰 추출에 걸리지만 검증 대상 아님.
const IDENT_WHITELIST = new Set([
  // 외부 라이브러리/프레임워크
  "Base", "UI", "React", "Flutter", "Material", "TypeScript", "Embla",
  "CodeMirror", "Tiptap", "Shiki", "WCAG", "BEM", "DOM", "HTML", "CSS",
  "JSON", "JSX", "TSX", "GFM", "XSS", "URL", "API", "SVG", "ARIA",
  // sh-ui 외부 의존
  "Provider", "Trigger", "Close", "Content", "Title", "Description",
  "Header", "Footer", "Item", "Group", "Label", "Separator", "Indicator",
  "List", "Body", "Root", "Sub", "Range", "Input", "Output", "Cell",
  // 일반 영문 PascalCase
  "Multi", "Text", "Number", "Phone", "Business", "Color", "Date", "Time",
  "File", "Page", "Tab", "Step", "Mode", "Theme", "Light", "Dark", "System",
  // sh-ui 내부 컨셉/패턴 (export 는 아님)
  "ThemeExtension", "RootLayout", "Slot",
]);

// 일반 영어 PascalCase 단어 (예: "Tooltip 의 hover/focus 표시" 의 "Tooltip" 은
// 컴포넌트명과 동일하므로 제외하면 안 됨. 여기 화이트리스트는 컴포넌트 검사
// 에서 명시적으로 자기 컴포넌트 prefix 토큰을 우선 검사하므로 false positive
// 컨트롤은 별로 필요 없음.)

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function readSource(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return "";
  }
}

// component source 에서 export 된 식별자 추출.
// `export const X = ...` / `export function X(` / `export class X` /
// `export type X` / `export interface X` / `export { X }` 모두 잡음.
function extractExports(...sources) {
  const names = new Set();
  const patterns = [
    /\bexport\s+(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+(?:type\s+)?\{\s*([^}]+)\s*\}/g,
  ];
  for (const src of sources) {
    if (!src) continue;
    for (const pat of patterns) {
      const re = new RegExp(pat.source, pat.flags);
      let m;
      while ((m = re.exec(src))) {
        if (pat.source.includes("\\{")) {
          // export { A, B as C } — 'A', 'C' 만 외부 노출
          for (const part of m[1].split(",")) {
            const local = part.trim().split(/\s+as\s+/i).pop();
            if (local) names.add(local.trim());
          }
        } else {
          names.add(m[1]);
        }
      }
    }
  }
  return names;
}

// summary 텍스트에서 PascalCase 식별자 토큰 추출.
// 코드 블록 (`...`) 안 또는 일반 텍스트 어디든.
function extractCandidates(summary) {
  const tokens = new Set();
  // PascalCase: 첫 문자가 대문자, 1~2자 다음 영문, 길이 4 이상
  const re = /\b([A-Z][a-zA-Z]{3,})\b/g;
  let m;
  while ((m = re.exec(summary))) {
    tokens.add(m[1]);
  }
  return tokens;
}

// 한 컴포넌트의 모든 source 변종 + apps/docs 카피본을 모아 export 목록 구성.
function gatherExports(plat, name) {
  if (plat === "react") {
    const variants = [
      `packages/registry/react/components/${name}/index.tsx`,
      `packages/registry/react/components/${name}/index.tailwind.tsx`,
      `packages/registry/react/components/${name}/index.module.tsx`,
      `packages/registry/react/components/${name}/index.vanilla-extract.tsx`,
      `apps/docs/components/ui/${name}/index.tsx`,
    ];
    return extractExports(
      ...variants.map((v) => readSource(resolve(ROOT, v))),
    );
  } else {
    const filename = name.replaceAll("-", "_");
    const path = `packages/registry/flutter/widgets/sh_ui_${filename}.dart`;
    const dartSrc = readSource(resolve(ROOT, path));
    // Dart: class X / mixin X / sealed class X
    const names = new Set();
    const re = /\b(?:class|mixin|enum|sealed\s+class|abstract\s+class)\s+([A-Z][\w]*)/g;
    let m;
    while ((m = re.exec(dartSrc))) names.add(m[1]);
    // top-level functions: ReturnType funcName(...)
    return names;
  }
}

// 컴포넌트 prefix (PascalCase). card → "Card", "ShUiCard" / dropdown-menu →
// "DropdownMenu", "ShUiDropdownMenu" / app-shell → "AppShell", "ShUiAppShell".
function componentPrefixes(name) {
  const pascal = name
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
  return [pascal, `ShUi${pascal}`];
}

const errors = [];
const warnings = [];

for (const plat of ["react", "flutter"]) {
  const registry = readJson(
    resolve(ROOT, `packages/registry/${plat}/registry.json`),
  );
  const summaries = readJson(
    resolve(ROOT, `packages/llms/summaries/${plat}.json`),
  );

  // registry.json 의 components 는 { name → entry } 맵.
  const registryEntries = Object.entries(registry.components);
  const registryNames = new Set(registryEntries.map(([name]) => name));
  const summaryKeys = new Set(Object.keys(summaries.summaries));

  // ─── B-1: registry 에 있는데 summary 에 없는 컴포넌트 ───
  // (utility 류 — utils, base, breakpoints, focus-ring, z-index, animations,
  // form 같은 것들은 summary 가 비어도 OK. registry 에서 type === 'component'
  // 만 필수 적용.)
  for (const [name, entry] of registryEntries) {
    if (entry.type === "component" && !summaryKeys.has(name)) {
      errors.push(
        `[B] ${plat}: registry.json 의 component '${name}' 에 해당하는 ` +
          `summary 키가 packages/llms/summaries/${plat}.json 에 없음.`,
      );
    }
  }

  // ─── B-2: summary 에 있는데 registry 에 없는 dead key ───
  for (const key of summaryKeys) {
    if (!registryNames.has(key)) {
      errors.push(
        `[B] ${plat}: summary key '${key}' 가 registry.json 에 등록돼 있지 ` +
          `않음 (오타 또는 삭제된 컴포넌트의 잔재).`,
      );
    }
  }

  // ─── C: summary 의 식별자 토큰이 실제 export 목록에 있어야 함 ───
  for (const [name, summary] of Object.entries(summaries.summaries)) {
    if (!registryNames.has(name)) continue; // B 에서 이미 잡음
    if (typeof summary !== "string" || !summary) continue;

    const exportSet = gatherExports(plat, name);
    const prefixes = componentPrefixes(name);
    const candidates = extractCandidates(summary);

    for (const tok of candidates) {
      if (IDENT_WHITELIST.has(tok)) continue;
      if (exportSet.has(tok)) continue;

      // 컴포넌트 자기 prefix 로 시작하는 토큰만 false claim 후보로 본다 —
      // "Card" / "CardHeader" / "ShUiCard" 류. 다른 PascalCase (예: "Linear")
      // 는 일반 영문일 가능성 높아 무시.
      const isOwnPrefixed = prefixes.some(
        (p) => tok === p || tok.startsWith(p),
      );
      if (!isOwnPrefixed) continue;

      // 부정 컨텍스트 — "X 아님 / X 아닌 / X 이름 아님 / X 클래스 아님 /
      // X 가 아니라 / not X / X != Y" 등은 의도된 negation. summary 작성자가
      // "이 이름이 아니다" 라고 명시한 경우라 false claim 으로 보지 않음.
      const negationPatterns = [
        new RegExp(`\`?${tok}\`?[^.]{0,40}(?:아닙니다|아님|아닌|아니라|아니다)`),
        new RegExp(`\`?${tok}\`?[^.]{0,40}(?:실재 X|실재 안|실재하지 않)`),
        new RegExp(`(?:not|instead of)\\s+\`?${tok}\``, "i"),
      ];
      if (negationPatterns.some((p) => p.test(summary))) continue;

      errors.push(
        `[C] ${plat}/${name}: summary 의 '${tok}' 가 source 의 export 에 없음 — ` +
          `false claim 가능성. summary: "${summary.slice(0, 80)}..."`,
      );
    }
  }
}

if (warnings.length) {
  console.warn("⚠ warnings:");
  for (const w of warnings) console.warn("  " + w);
}

if (errors.length) {
  console.error(`✘ ${errors.length} error(s):\n`);
  for (const e of errors) console.error("  " + e);
  console.error("");
  process.exit(1);
}

console.log("✓ registry/summary 정합성 OK");
