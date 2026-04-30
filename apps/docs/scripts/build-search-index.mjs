#!/usr/bin/env node
// (docs)/**/page.tsx 를 파싱해 검색 인덱스를 만든다.
// 출력: apps/docs/public/search-index.json — { records: SearchRecord[] }

import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = join(__dirname, "..");
const PAGES_ROOT = join(DOCS_ROOT, "app", "(docs)");
const OUT_PATH = join(DOCS_ROOT, "public", "search-index.json");

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4"]);
// StringLiteral / JSX attr 중 노이즈 컷용 — 대부분 className/style/href 등
const NOISE_ATTRS = new Set([
  "className", "class", "style", "href", "src", "id", "key", "ref",
  "type", "role", "value", "language", "code", "slot", "as",
  "size", "variant", "color", "rel", "target", "alt", "title",
  "aria-label", "aria-labelledby", "aria-describedby", "data-testid",
  "showLineNumbers",
]);

function walkPages(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkPages(full, acc);
    else if (entry === "page.tsx") acc.push(full);
  }
  return acc;
}

function fileToUrl(filePath) {
  // .../app/(docs)/components/button/page.tsx → /components/button
  // .../app/(docs)/page.tsx → /
  const rel = relative(PAGES_ROOT, filePath).split(sep).slice(0, -1);
  if (rel.length === 0) return "/";
  return "/" + rel.join("/");
}

function getJsxTagName(node) {
  const opening = ts.isJsxElement(node) ? node.openingElement : node;
  const name = opening?.tagName;
  if (!name) return null;
  if (ts.isIdentifier(name)) return name.text;
  return null;
}

function collectJsxTextChildren(node) {
  // JsxElement 자식들에서 JsxText 와 단순 string expression 을 모은다.
  const parts = [];
  const children = ts.isJsxElement(node) ? node.children : [];
  for (const child of children) {
    if (ts.isJsxText(child)) {
      const t = child.text.replace(/\s+/g, " ").trim();
      if (t) parts.push(t);
    } else if (ts.isJsxExpression(child) && child.expression && ts.isStringLiteral(child.expression)) {
      parts.push(child.expression.text.trim());
    } else if (ts.isJsxElement(child) || ts.isJsxFragment(child)) {
      parts.push(collectJsxTextChildren(child));
    }
  }
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

// 의미 있는 텍스트만 통과 — 문장 같은 한국어/영어 텍스트.
function isMeaningful(s) {
  if (!s) return false;
  if (s.length < 3) return false;
  // 모두 영숫자/언더스코어/하이픈 한 단어면 식별자로 간주 → 제외
  if (/^[A-Za-z0-9_\-./@]+$/.test(s)) return false;
  return true;
}

function extractFromFile(filePath) {
  const src = readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  let title = "";
  const headings = [];
  const bodyParts = [];

  function walk(node) {
    // 헤딩
    if (ts.isJsxElement(node)) {
      const tag = getJsxTagName(node);
      if (tag && HEADING_TAGS.has(tag)) {
        const text = collectJsxTextChildren(node);
        if (text) {
          if (tag === "h1" && !title) title = text;
          else headings.push(text);
        }
      }
    }

    // JSX 본문 텍스트
    if (ts.isJsxText(node)) {
      const t = node.text.replace(/\s+/g, " ").trim();
      if (t) bodyParts.push(t);
    }

    // 객체 리터럴 안의 description/name/title/label 같은 의미 있는 string —
    // components/page.tsx 의 groups 배열 등을 잡기 위함.
    if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.initializer)) {
      const propName = ts.isIdentifier(node.name)
        ? node.name.text
        : ts.isStringLiteral(node.name)
          ? node.name.text
          : "";
      if (
        propName === "description" ||
        propName === "name" ||
        propName === "title" ||
        propName === "label" ||
        propName === "summary"
      ) {
        const v = node.initializer.text.trim();
        if (isMeaningful(v)) bodyParts.push(v);
      }
    }

    // JSX prop 중 사람이 읽는 내용 — placeholder, helperText 등은 잡고, className/style 은 제외.
    if (ts.isJsxAttribute(node) && node.name && ts.isIdentifier(node.name)) {
      const name = node.name.text;
      if (!NOISE_ATTRS.has(name) && node.initializer) {
        let raw = "";
        if (ts.isStringLiteral(node.initializer)) raw = node.initializer.text;
        else if (
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression &&
          ts.isStringLiteral(node.initializer.expression)
        ) {
          raw = node.initializer.expression.text;
        }
        const v = raw.trim();
        if (isMeaningful(v)) bodyParts.push(v);
      }
    }

    ts.forEachChild(node, walk);
  }

  walk(sf);

  const url = fileToUrl(filePath);
  if (!title) {
    // 디렉터리명을 fallback 으로
    const segs = url.split("/").filter(Boolean);
    title = segs.length ? segs[segs.length - 1] : "Home";
  }

  const body = bodyParts.join(" ").replace(/\s+/g, " ").trim();
  return { id: url, url, title, headings, body };
}

function main() {
  const files = walkPages(PAGES_ROOT);
  const records = files.map(extractFromFile);
  // 안정 정렬 — url 알파벳 순
  records.sort((a, b) => a.url.localeCompare(b.url));

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify({ records }, null, 0));
  console.log(`[build-search-index] ${records.length} pages → ${relative(DOCS_ROOT, OUT_PATH)}`);
}

main();
