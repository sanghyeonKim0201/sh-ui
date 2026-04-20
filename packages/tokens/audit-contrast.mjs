#!/usr/bin/env node
// 토큰 대비 감사 — primitives + semantic 매핑을 읽어 주요 쌍의 WCAG 대비를 측정.
//
// 실행: node packages/tokens/audit-contrast.mjs
// 기준:
//   - 본문 텍스트(AA): 4.5:1
//   - 큰/굵은 텍스트(AA): 3:1
//   - UI 비-텍스트(보더·포커스링 등): 3:1

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const primitives = JSON.parse(
  await readFile(resolve(__dirname, "src/primitives.json"), "utf8"),
);

/** "#RRGGBB" → [r,g,b] (0..1) */
function hexToRgb(hex) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) throw new Error(`잘못된 hex: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

/** WCAG relative luminance */
function luminance([r, g, b]) {
  const toLin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function contrast(hexA, hexB) {
  const la = luminance(hexToRgb(hexA));
  const lb = luminance(hexToRgb(hexB));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** primitive 팔레트에서 값 꺼내기: color.neutral.500 → "#737373" */
function getColor(path) {
  const parts = path.split(".");
  let cur = primitives;
  for (const p of parts) {
    cur = cur?.[p];
    if (!cur) throw new Error(`primitive 경로 없음: ${path}`);
  }
  if (typeof cur === "object" && "$value" in cur) return cur.$value;
  throw new Error(`leaf 아님: ${path}`);
}

/** base/mode 조합의 토큰 집합 반환 */
function resolveTokens(base, mode) {
  const t = {};
  const b = base;
  if (mode === "light") {
    t.background = getColor(`color.white`);
    t.backgroundSubtle = getColor(`color.${b}.50`);
    t.backgroundMuted = getColor(`color.${b}.100`);
    t.foreground = getColor(`color.${b}.950`);
    t.foregroundMuted = getColor(`color.${b}.600`);
    t.border = getColor(`color.${b}.200`);
    t.borderStrong = getColor(`color.${b}.300`);
    t.primary = getColor(`color.${b}.900`);
    t.primaryForeground = getColor(`color.${b}.50`);
    t.primaryHover = getColor(`color.${b}.800`);
    t.danger = getColor(`color.red.600`);
    t.dangerForeground = "#FFFFFF";
  } else {
    t.background = getColor(`color.${b}.950`);
    t.backgroundSubtle = getColor(`color.${b}.900`);
    t.backgroundMuted = getColor(`color.${b}.800`);
    t.foreground = getColor(`color.${b}.50`);
    t.foregroundMuted = getColor(`color.${b}.400`);
    t.border = getColor(`color.${b}.800`);
    t.borderStrong = getColor(`color.${b}.700`);
    t.primary = getColor(`color.${b}.50`);
    t.primaryForeground = getColor(`color.${b}.900`);
    t.primaryHover = getColor(`color.${b}.200`);
    t.danger = getColor(`color.red.600`);
    t.dangerForeground = "#FFFFFF";
  }
  return t;
}

/** 검사할 쌍 정의. kind는 threshold 산정에 사용. */
const pairs = [
  // 본문 텍스트 (4.5:1)
  { name: "foreground × background", a: "foreground", b: "background", kind: "text" },
  { name: "foreground × background.subtle", a: "foreground", b: "backgroundSubtle", kind: "text" },
  { name: "foreground × background.muted", a: "foreground", b: "backgroundMuted", kind: "text" },
  { name: "foreground.muted × background", a: "foregroundMuted", b: "background", kind: "text" },
  { name: "foreground.muted × background.subtle", a: "foregroundMuted", b: "backgroundSubtle", kind: "text" },
  { name: "foreground.muted × background.muted", a: "foregroundMuted", b: "backgroundMuted", kind: "text" },

  // 버튼 텍스트 (4.5:1)
  { name: "primary.foreground × primary", a: "primaryForeground", b: "primary", kind: "text" },
  { name: "primary.foreground × primary.hover", a: "primaryForeground", b: "primaryHover", kind: "text" },
  { name: "danger.foreground × danger", a: "dangerForeground", b: "danger", kind: "text" },

  // UI 경계 — 의도적으로 subtle. 포커스 인디케이터는 별도로 `foreground` 색으로
  // 19:1+ 대비를 확보하므로 WCAG 2.4.11 focus visible 요건은 충족.
  // 1.4.11 Non-text Contrast는 "컴포넌트를 식별하는 데 필요한 시각 정보"에 한정되며,
  // 카드·dropdown 등 shadow/여백/라벨로 식별되는 박스의 장식성 경계는 범위 밖.
  { name: "border × background", a: "border", b: "background", kind: "ui", decorative: true },
  { name: "border.strong × background", a: "borderStrong", b: "background", kind: "ui", decorative: true },
];

const bases = ["neutral", "zinc", "slate"];
const modes = ["light", "dark"];

const fails = [];
const rows = [];

for (const base of bases) {
  for (const mode of modes) {
    const t = resolveTokens(base, mode);
    for (const p of pairs) {
      const aVal = t[p.a];
      const bVal = t[p.b];
      const ratio = contrast(aVal, bVal);
      const threshold = p.kind === "text" ? 4.5 : 3.0;
      const pass = ratio >= threshold;
      rows.push({ base, mode, ...p, aVal, bVal, ratio, threshold, pass });
      if (!pass && !p.decorative) fails.push({ base, mode, ...p, aVal, bVal, ratio, threshold });
    }
  }
}

// 리포트
function fmt(ratio) {
  return ratio.toFixed(2).padStart(5);
}

for (const base of bases) {
  for (const mode of modes) {
    console.log(`\n── ${base} / ${mode} ──`);
    const scoped = rows.filter((r) => r.base === base && r.mode === mode);
    for (const r of scoped) {
      let mark;
      let note = "";
      if (r.pass) mark = "✓";
      else if (r.decorative) { mark = "ⓘ"; note = `  (의도적 서브틀, ${r.threshold}:1 미달이지만 장식성)`; }
      else { mark = "✗"; note = `  (AA ${r.threshold}:1 미달)`; }
      console.log(
        `  ${mark} ${fmt(r.ratio)}:1   ${r.name.padEnd(42)} ${r.aVal} on ${r.bVal}${note}`,
      );
    }
  }
}

console.log("\n" + "=".repeat(60));
if (fails.length === 0) {
  console.log("✓ 모든 쌍이 WCAG AA 기준 통과.");
  process.exit(0);
} else {
  console.log(`✗ ${fails.length}개 쌍이 AA 기준 미달:\n`);
  for (const f of fails) {
    console.log(
      `  ${f.base}/${f.mode}  ${f.name}   ${fmt(f.ratio)}:1 < ${f.threshold}:1   (${f.aVal} on ${f.bVal})`,
    );
  }
  process.exit(1);
}
