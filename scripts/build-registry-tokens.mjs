#!/usr/bin/env node
// 컴포넌트별 토큰 의존성을 자동 추출해 tokens-used.json 으로 출력.
//
// 입력:
//   packages/registry/react/registry.json — 컴포넌트 매니페스트
//   packages/registry/react/components/<name>/* — 각 컴포넌트의 소스 파일
//
// 출력:
//   packages/registry/react/tokens-used.json
//   { "$generated": "...", "components": { "<name>": { "<framework>": ["--var", ...] } } }
//
// 추출 방식:
//   각 file 엔트리의 frameworks 필드로 framework 그룹 결정.
//   파일을 읽어 var(--*) 패턴을 grep 해 토큰 변수명을 모은다.
//   framework 필드가 없는 파일은 모든 framework 그룹에 union.
//
// 용도:
//   - sh-ui add <component> 시 destination tokens.css 가 컴포넌트가 요구하는
//     변수를 모두 정의하는지 검증 (silent breakage 방지).
//   - sh-ui doctor 가 설치된 컴포넌트와 tokens.css 사이의 정합성 검사.
//
// 실행: node scripts/build-registry-tokens.mjs
//       (CI 에서 drift 검출용으로 --check 도 지원)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// 추출 대상 framework 목록. registry.json 의 file.frameworks 와 같은 값.
const FRAMEWORKS = ["plain", "tailwind", "css-modules", "vanilla-extract"];

/**
 * Base UI 가 anchor 포지셔닝/사이즈 측정 시 런타임에 set 하는 CSS 변수들.
 * tokens.css 에 정의될 필요가 없으므로 검사 대상에서 제외.
 * (Base UI 출처: @base-ui-components/react Popover/Select/Combobox/Tabs/Accordion 등)
 */
const RUNTIME_VARS = new Set([
  // 포지셔닝 (Popover/Select/Combobox/DropdownMenu/ContextMenu)
  "--transform-origin",
  "--anchor-width",
  "--available-height",
  // Tabs indicator
  "--active-tab-width",
  "--active-tab-height",
  "--active-tab-left",
  "--active-tab-top",
  // Accordion 패널 높이 — Base UI 가 측정해서 주입
  "--accordion-panel-height",
  // Shiki 가 syntax highlighting 적용 시 inline-style 로 주입
  "--shiki-light",
  "--shiki-dark",
  "--shiki-light-bg",
  "--shiki-dark-bg",
]);

/**
 * 텍스트에서 fallback 없는 var(--name) 만 추출 — 즉 진짜 외부 의존성.
 *
 * `var(--foo)`            → 필수 — tokens.css 에 정의돼야 함
 * `var(--foo, 1rem)`      → optional — fallback 있어 정의 안 돼도 OK
 * `var(--foo, var(--bar))` → outer 는 optional (fallback 존재).
 *                            내부 var(--bar) 는 우리가 fallback 으로 들어왔는지
 *                            top-level 에서 들어왔는지 구분이 어려운데, 단순히
 *                            top-level "var(--name)" 만 카운트하기 위해 정규식
 *                            대신 단순 stack 파싱으로 처리.
 */
function extractUsedVars(text) {
  const out = new Set();
  let i = 0;
  const n = text.length;
  while (i < n) {
    const idx = text.indexOf("var(", i);
    if (idx < 0) break;
    // 이름 파싱
    let j = idx + 4;
    while (j < n && /\s/.test(text[j])) j++;
    let nameStart = j;
    while (j < n && /[-a-zA-Z0-9_]/.test(text[j])) j++;
    const name = text.slice(nameStart, j);
    if (!name.startsWith("--")) {
      i = idx + 4;
      continue;
    }
    // 다음 의미 있는 char 가 ',' 면 fallback 존재 → optional 로 간주.
    let k = j;
    while (k < n && /\s/.test(text[k])) k++;
    const hasFallback = text[k] === ",";
    if (!hasFallback) out.add(name);
    i = j;
  }
  return out;
}

/**
 * 텍스트 내 `--name:` 선언 추출. var(--name) 참조는 lookbehind 로 제외.
 * 컴포넌트가 자기 파일 안에서 정의하는 내부 변수는 tokens.css 의존이 아니다 —
 * 사용 집합에서 빼서 외부 의존성만 남긴다.
 */
function extractDefinedVars(text) {
  const re = /(?<!var\(\s*)(--[a-zA-Z0-9_-]+)\s*:/g;
  const out = new Set();
  let m;
  while ((m = re.exec(text))) out.add(m[1]);
  return out;
}

/**
 * registry.json 의 한 file 엔트리가 적용되는 framework 목록.
 * frameworks 필드가 없으면 모든 framework 에 적용 (registry 의 기본 의미).
 */
function fileFrameworks(file) {
  if (file.frameworks && file.frameworks.length > 0) return file.frameworks;
  return FRAMEWORKS.slice();
}

function buildForPlatform(platform) {
  const platformDir = resolve(ROOT, "packages/registry", platform);
  const registryPath = resolve(platformDir, "registry.json");
  if (!existsSync(registryPath)) {
    return null;
  }
  const registry = JSON.parse(readFileSync(registryPath, "utf-8"));

  const components = {};

  for (const [name, entry] of Object.entries(registry.components ?? {})) {
    if (entry.type && entry.type !== "component") {
      // utils / base / focus-ring 같은 raw 토큰만 쓰는 entry 도 동일하게 처리.
      // type 이 "registry-item" 같은 것도 포함 — 일관성을 위해 모두 스캔.
    }
    // framework → { used: Set, defined: Set }. 후자는 컴포넌트가 자체 정의한 내부
    // 변수 — tokens.css 가 책임지지 않으므로 외부 의존성에서 뺀다.
    const grouped = Object.fromEntries(
      FRAMEWORKS.map((f) => [f, { used: new Set(), defined: new Set() }]),
    );

    for (const file of entry.files ?? []) {
      const filePath = resolve(platformDir, file.src);
      if (!existsSync(filePath)) continue;
      const text = readFileSync(filePath, "utf-8");
      const used = extractUsedVars(text);
      const defined = extractDefinedVars(text);
      const frameworks = fileFrameworks(file);
      for (const fw of frameworks) {
        if (!(fw in grouped)) continue;
        for (const v of used) grouped[fw].used.add(v);
        for (const v of defined) grouped[fw].defined.add(v);
      }
    }

    // 외부 의존 = 사용 집합 - (자체 정의 ∪ 런타임 변수). 정렬된 배열로 직렬화.
    // 빈 배열도 명시적으로 남겨 "이 framework 는 토큰 의존 없음" 을 신호.
    const obj = {};
    for (const fw of FRAMEWORKS) {
      const { used, defined } = grouped[fw];
      const external = [...used]
        .filter((v) => !defined.has(v) && !RUNTIME_VARS.has(v))
        .sort();
      obj[fw] = external;
    }
    components[name] = obj;
  }

  return components;
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");

  let exitCode = 0;

  for (const platform of ["react"]) {
    // Flutter 는 토큰을 ShUiTokens.<field> 로 참조 — CSS var() 와 추출 방식이
    // 달라 별도 도구 필요. Phase A 는 React 만.
    const components = buildForPlatform(platform);
    if (!components) continue;

    const out = {
      $description:
        "컴포넌트별 토큰 의존성 (var(--*) 추출). build-registry-tokens.mjs 가 자동 생성.",
      $generated: new Date().toISOString(),
      components,
    };
    const outPath = resolve(
      ROOT,
      `packages/registry/${platform}/tokens-used.json`,
    );
    const next = JSON.stringify(out, null, 2) + "\n";

    if (checkOnly) {
      const existing = existsSync(outPath) ? readFileSync(outPath, "utf-8") : "";
      // $generated 타임스탬프는 매 실행마다 바뀌므로 그 줄을 빼고 비교.
      const stripGenerated = (s) => s.replace(/^\s*"\$generated":.*\n/m, "");
      if (stripGenerated(existing) !== stripGenerated(next)) {
        console.error(
          `✘ ${platform}: tokens-used.json 이 컴포넌트 CSS 와 동기화돼 있지 않습니다.\n` +
            `  실행: node scripts/build-registry-tokens.mjs`,
        );
        exitCode = 1;
      } else {
        console.log(`✓ ${platform}: tokens-used.json 동기 상태`);
      }
    } else {
      writeFileSync(outPath, next, "utf-8");
      const total = Object.values(components).reduce(
        (n, fwMap) => n + Object.values(fwMap).reduce((m, list) => m + list.length, 0),
        0,
      );
      console.log(
        `✓ ${platform}: ${Object.keys(components).length} 컴포넌트, ${total} 토큰 참조 → ${outPath}`,
      );
    }
  }

  process.exit(exitCode);
}

main();
