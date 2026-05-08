#!/usr/bin/env node
// registry plain 변종 → apps/docs 카피본 동기화.
//
// `packages/registry/react/components/<name>/index.tsx` 를 정식 source 로 보고,
// `apps/docs/components/ui/<name>/index.tsx` 를 다음 변환을 적용해 덮어쓴다:
//   - `import { cn } from "@SH_UI_UTILS@";` → 인라인 `function cx(...)` 정의
//   - `cn(` → `cx(`
//
// styles.css 가 있으면 1:1 복사.
//
// 사용:
//   node scripts/sync-docs.mjs           # 변경 사항만 dry-run 으로 출력
//   node scripts/sync-docs.mjs --write   # 실제 덮어쓰기

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");

// docs 카피본에 박을 인라인 cx 함수 정의. registry 의 cn import 자리에 들어간다.
const CX_FN = `function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}`;

function transform(src) {
  let out = src;
  // import { cn } from "@SH_UI_UTILS@"; — 라인 자체를 cx 함수 정의로 교체
  out = out.replace(
    /^[ \t]*import\s+\{\s*cn\s*\}\s+from\s+"@SH_UI_UTILS@";\s*$/m,
    CX_FN,
  );
  // cn( → cx(
  out = out.replaceAll("cn(", "cx(");
  return out;
}

function readSource(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

const docsRoot = resolve(ROOT, "apps/docs/components/ui");
const components = readdirSync(docsRoot).filter((name) =>
  existsSync(resolve(docsRoot, name, "index.tsx")),
);

const changes = [];

for (const name of components) {
  const registryIndex = resolve(
    ROOT,
    `packages/registry/react/components/${name}/index.tsx`,
  );
  const docsIndex = resolve(ROOT, `apps/docs/components/ui/${name}/index.tsx`);

  const regSrc = readSource(registryIndex);
  if (!regSrc) {
    console.warn(`⚠ ${name}: registry source 없음, 건너뜀.`);
    continue;
  }

  const transformed = transform(regSrc);
  const currentDocs = readSource(docsIndex);

  if (currentDocs !== transformed) {
    changes.push({ path: docsIndex, name: `${name}/index.tsx` });
    if (WRITE) writeFileSync(docsIndex, transformed);
  }

  // styles.css 동기화
  const regStyles = resolve(
    ROOT,
    `packages/registry/react/components/${name}/styles.css`,
  );
  const docsStyles = resolve(ROOT, `apps/docs/components/ui/${name}/styles.css`);
  if (existsSync(regStyles) && existsSync(docsStyles)) {
    const r = readSource(regStyles);
    const d = readSource(docsStyles);
    if (r !== d) {
      changes.push({ path: docsStyles, name: `${name}/styles.css` });
      if (WRITE) writeFileSync(docsStyles, r);
    }
  }
}

if (changes.length === 0) {
  console.log("✓ 모든 docs 카피본이 registry 와 동기화 상태 (변경 없음).");
  process.exit(0);
}

if (WRITE) {
  console.log(`✓ ${changes.length}개 파일 동기화 완료:`);
  for (const c of changes) console.log("  " + c.name);
} else {
  console.log(`다음 ${changes.length}개 파일이 동기화 대상 (dry-run):`);
  for (const c of changes) console.log("  " + c.name);
  console.log("\n실제로 적용하려면 --write 플래그 추가.");
}
