#!/usr/bin/env node
// [locale]/(docs)/**/page.tsx 를 파싱해 검색 인덱스를 만든다.
// 출력: apps/docs/public/search-index.json — { records: SearchRecord[] }
// 1차에서는 기본 로케일(ko) 인덱스만 빌드. 페이지가 useTranslations("ns") 를 쓰면
// messages/ko/{ns→filename}.json 의 문자열 값을 본문에 합쳐서 검색 가능하게 한다.

import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = join(__dirname, "..");
const PAGES_ROOT = join(DOCS_ROOT, "app", "[locale]", "(docs)");
const MESSAGES_ROOT = join(DOCS_ROOT, "messages", "ko");
const OUT_PATH = join(DOCS_ROOT, "public", "search-index.json");

// next-intl namespace → messages/{locale}/{filename}.json
// i18n/request.ts 의 매핑과 동기화 유지.
const NS_TO_FILE = {
  common: "common",
  sidebar: "sidebar",
  search: "search",
  chrome: "chrome",
  landing: "landing",
  gettingStarted: "getting-started",
};

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

// HTML 엔티티 디코드 — page.tsx 안의 &lt;nav&gt; · &quot; · &amp; 등을 평문으로.
function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

// 의미 있는 텍스트만 통과 — 문장 같은 한국어/영어 텍스트.
function isMeaningful(s) {
  if (!s) return false;
  if (s.length < 3) return false;
  // 모두 영숫자/언더스코어/하이픈 한 단어면 식별자로 간주 → 제외
  if (/^[A-Za-z0-9_\-./@]+$/.test(s)) return false;
  return true;
}

// JSON 값에서 마크업 태그를 평문으로.
function stripTags(s) {
  return s.replace(/<\/?[A-Za-z][^>]*>/g, "");
}

// messages/ko/{file}.json 의 모든 string 값을 재귀 수집.
const messagesCache = new Map();
function loadMessageStrings(file) {
  if (messagesCache.has(file)) return messagesCache.get(file);
  const path = join(MESSAGES_ROOT, `${file}.json`);
  if (!existsSync(path)) {
    messagesCache.set(file, []);
    return [];
  }
  const json = JSON.parse(readFileSync(path, "utf8"));
  const out = [];
  const walk = (v) => {
    if (typeof v === "string") {
      const s = stripTags(v).replace(/\s+/g, " ").trim();
      if (s) out.push(s);
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(json);
  messagesCache.set(file, out);
  return out;
}

// useTranslations("ns") / getTranslations({namespace: "ns"}) 호출에서 ns 추출.
function detectNamespaces(src) {
  const namespaces = new Set();
  const useRe = /useTranslations\(\s*["'`]([^"'`]+)["'`]/g;
  const getRe = /namespace:\s*["'`]([^"'`]+)["'`]/g;
  for (const m of src.matchAll(useRe)) namespaces.add(m[1].split(".")[0]);
  for (const m of src.matchAll(getRe)) namespaces.add(m[1].split(".")[0]);
  return [...namespaces];
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

  // useTranslations("ns") 가 있으면 messages/ko/{ns→file}.json 의 string 값들도 포함.
  for (const ns of detectNamespaces(src)) {
    const file = NS_TO_FILE[ns];
    if (!file) continue;
    bodyParts.push(...loadMessageStrings(file));
  }

  const url = fileToUrl(filePath);
  if (!title) {
    // 디렉터리명을 fallback 으로
    const segs = url.split("/").filter(Boolean);
    title = segs.length ? segs[segs.length - 1] : "Home";
  }

  const body = decodeEntities(bodyParts.join(" ").replace(/\s+/g, " ").trim());
  const decodedHeadings = headings.map(decodeEntities);
  const decodedTitle = decodeEntities(title);
  return { id: url, url, title: decodedTitle, headings: decodedHeadings, body };
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
