#!/usr/bin/env node
// sh-ui registry vs apps/docs 듀얼카피 drift lint.
//
// 검사 항목:
//   A) `packages/registry/react/components/<name>/index.tsx` (plain 변종) 와
//      `apps/docs/components/ui/<name>/index.tsx` 가 동일해야 한다.
//      단 다음 변환은 docs 카피본의 정상 차이로 허용:
//        - registry: `import { cn } from "@SH_UI_UTILS@";`
//          docs:     `function cx(...args: (string | undefined | false)[]) { return args.filter(Boolean).join(" "); }`
//        - registry: `cn(`  →  docs: `cx(`
//      styles.css 는 그대로 비교 (변환 없음).
//
// 이 외의 차이가 있으면 한쪽이 stale 로 간주, CI 실패.
//
// 실행: node scripts/lint-dual-copy.mjs

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readSource(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

// 양쪽 source 를 동일한 정규화 형태로 만들어 의미 있는 drift 만 남긴다.
//   - `import { cn } from "@SH_UI_UTILS@";` 라인 제거 (registry 에만 있음)
//   - inline cx 함수 정의 제거 (docs 에만 있음, signature 두 형태 허용)
//   - `cn(` → `cx(` (registry 의 cn 호출을 docs 와 정렬)
//   - 줄 끝 공백 trim, 연속 빈 줄 1개로 압축, 양 끝 trim
function normalize(src) {
  let out = src;
  // import { cn } from "@SH_UI_UTILS@"; — 라인 + 트레일링 newline 까지 통째 제거
  out = out.replace(/^[ \t]*import\s+\{\s*cn\s*\}\s+from\s+"@SH_UI_UTILS@";\s*\n/gm, "");
  // inline cx 함수 — 블록 + 트레일링 newline 까지 (signature 두 형태)
  out = out.replace(
    /function cx\(\.\.\.args:\s*\(string\s*\|\s*undefined\s*\|\s*false(?:\s*\|\s*null)?\)\[\]\)\s*\{\s*return args\.filter\(Boolean\)\.join\(" "\);\s*\}\s*\n/g,
    "",
  );
  // cn( → cx(
  out = out.replaceAll("cn(", "cx(");
  // 각 줄 trailing whitespace 제거
  out = out
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n");
  // 연속 빈 줄 2+ 를 1로 압축 (blank line normalize)
  out = out.replace(/\n{2,}/g, "\n\n");
  return out.trim();
}

const normalizeRegistryToDocs = normalize;
const normalizeDocs = normalize;

function diffLines(a, b) {
  const al = a.split("\n");
  const bl = b.split("\n");
  const max = Math.max(al.length, bl.length);
  const out = [];
  for (let i = 0; i < max; i++) {
    if (al[i] !== bl[i]) {
      out.push(
        `  line ${i + 1}:\n    registry: ${JSON.stringify(al[i] ?? "<EOF>").slice(0, 120)}\n    docs:     ${JSON.stringify(bl[i] ?? "<EOF>").slice(0, 120)}`,
      );
      if (out.length >= 5) {
        out.push("  ... (more diffs)");
        break;
      }
    }
  }
  return out;
}

// 현재 알려진 drift — 의도적으로 통과시킬 항목. v0.64.6 에서 sync-docs.mjs
// 로 전수 동기화 후 비워졌고, 향후 의도적 drift 가 생기면 여기에 추가.
//
// 항목 형식: 'component' (전체 컴포넌트) 또는 'component/styles.css' (특정 파일).
const BASELINE_DRIFTS = new Set([]);

const errors = [];
const baselineHits = new Set();

// docs 디렉토리에 있는 컴포넌트 목록 — 듀얼카피가 존재하는 것만 검사 대상.
const docsRoot = resolve(ROOT, "apps/docs/components/ui");
const docsComponents = readdirSync(docsRoot).filter((name) =>
  existsSync(resolve(docsRoot, name, "index.tsx")),
);

for (const name of docsComponents) {
  const registryPath = resolve(
    ROOT,
    `packages/registry/react/components/${name}/index.tsx`,
  );
  const docsPath = resolve(ROOT, `apps/docs/components/ui/${name}/index.tsx`);

  const regSrc = readSource(registryPath);
  const docsSrc = readSource(docsPath);

  if (!regSrc) {
    errors.push(
      `[A] ${name}: docs 카피본은 있는데 registry source 가 없음 (${registryPath}).`,
    );
    continue;
  }
  if (!docsSrc) {
    errors.push(
      `[A] ${name}: registry source 는 있는데 docs 카피본이 없음 (${docsPath}).`,
    );
    continue;
  }

  const normalized = normalizeRegistryToDocs(regSrc).trim();
  const docsNormalized = normalizeDocs(docsSrc).trim();

  if (normalized !== docsNormalized) {
    if (BASELINE_DRIFTS.has(name)) {
      baselineHits.add(name);
    } else {
      const diff = diffLines(normalized, docsNormalized);
      errors.push(
        `[A] ${name}: registry 와 docs 카피본 drift 검출.\n${diff.join("\n")}`,
      );
    }
  }

  // styles.css 도 1:1 동일해야 함 (있는 경우).
  const regStyles = readSource(
    resolve(ROOT, `packages/registry/react/components/${name}/styles.css`),
  );
  const docsStyles = readSource(
    resolve(ROOT, `apps/docs/components/ui/${name}/styles.css`),
  );
  if (regStyles != null && docsStyles != null) {
    if (regStyles.trim() !== docsStyles.trim()) {
      const key = `${name}/styles.css`;
      if (BASELINE_DRIFTS.has(key)) {
        baselineHits.add(key);
      } else {
        const diff = diffLines(regStyles.trim(), docsStyles.trim());
        errors.push(
          `[A] ${key}: registry 와 docs 카피본 drift 검출.\n${diff.join("\n")}`,
        );
      }
    }
  }
}

// 베이스라인 stale entry — 더 이상 drift 없는데 baseline 에 남아있으면 제거하라고 알림
const stale = [...BASELINE_DRIFTS].filter((k) => !baselineHits.has(k));
if (stale.length) {
  console.warn(
    `⚠ baseline 에 남아있지만 현재 drift 없는 항목 (cleanup 완료, BASELINE_DRIFTS 에서 제거할 것):\n  ${stale.join(", ")}\n`,
  );
}

if (errors.length) {
  console.error(`✘ ${errors.length} new drift error(s):\n`);
  for (const e of errors) console.error(e + "\n");
  console.error(
    "이 컴포넌트들은 이번 변경으로 새로 drift 가 생긴 것. registry 와 apps/docs 카피본을 동기화하거나, 의도적인 drift 라면 BASELINE_DRIFTS 에 추가.",
  );
  process.exit(1);
}

console.log(
  `✓ 듀얼카피 drift 검사 통과 (${docsComponents.length} components, ${baselineHits.size} baseline 적용 / ${BASELINE_DRIFTS.size} baseline 등록).`,
);
