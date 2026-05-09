// tokens.css 비교/병합 로직.
//
// 설계:
//   - 사용자 tokens.css 를 selector 별 블록으로 파싱 (`:root`, `.dark`,
//     `@media (...)` 안의 nested selector 까지).
//   - 같은 작업을 buildTokens 결과에도 적용해 "expected" 블록 트리 생성.
//   - 두 트리를 selector 매칭으로 비교:
//       added    — expected 에만 존재하는 변수 (사용자에게 새로 제공된 토큰)
//       removed  — current 에만 존재하는 변수 (사용자 커스텀 또는 deprecated)
//       changed  — 양쪽에 존재하지만 값이 다름 (사용자가 손댔거나 sh-ui 가 갱신)
//       unchanged— 양쪽 동일
//
// 적용(apply) 정책:
//   - added 만 자동 적용 — 사용자가 손댄 값은 건드리지 않음.
//   - 같은 selector 블록을 current 에서 찾아 닫는 `}` 바로 전에 라인 삽입.
//   - 매칭 selector 블록이 없으면 파일 끝에 신규 블록을 append.
//   - 결과는 새 텍스트 — 호출부가 파일에 쓰는지 결정.

/**
 * tokens.css 텍스트를 셀렉터 블록 트리로 파싱.
 *
 * 단순 1-pass 스캐너 — `selector { ... }` 형태의 블록을 추출하고, 중첩이면
 * inner block 도 별도 항목으로 평탄화한다 (parent selector 와 결합한 키로).
 *
 * 예:
 *   :root { --x: 1; }
 *   @media (prefers-color-scheme: dark) { :root:not(.light):not(.dark) { --x: 2; } }
 *   .dark { --x: 3; }
 *
 * → [
 *     { key: ":root", vars: { "--x": "1" } },
 *     { key: "@media (prefers-color-scheme: dark) > :root:not(.light):not(.dark)",
 *       vars: { "--x": "2" } },
 *     { key: ".dark", vars: { "--x": "3" } }
 *   ]
 */
export function parseBlocks(css) {
  const ctx = { css, i: 0, blocks: [], stack: [] };
  parseTopLevel(ctx);
  return ctx.blocks;
}

/** top-level (또는 @rule 내부) 의 selector 들을 발견할 때마다 본문 파싱. */
function parseTopLevel(ctx) {
  const { css } = ctx;
  const n = css.length;
  while (ctx.i < n) {
    const c = css[ctx.i];
    if (c === "}") return; // 부모 호출에서 닫힘 처리
    if (c === "/" && css[ctx.i + 1] === "*") {
      const end = css.indexOf("*/", ctx.i + 2);
      if (end < 0) {
        ctx.i = n;
        return;
      }
      ctx.i = end + 2;
      continue;
    }
    if (/\s/.test(c)) {
      ctx.i++;
      continue;
    }
    // selector 수집 — '{' 또는 ';' 또는 '}' 까지
    const selStart = ctx.i;
    while (ctx.i < n) {
      const ch = css[ctx.i];
      if (ch === "{" || ch === "}" || ch === ";") break;
      if (ch === "/" && css[ctx.i + 1] === "*") {
        const end = css.indexOf("*/", ctx.i + 2);
        if (end < 0) {
          ctx.i = n;
          break;
        }
        ctx.i = end + 2;
        continue;
      }
      ctx.i++;
    }
    const head = css.slice(selStart, ctx.i).trim();
    if (!head) {
      ctx.i++;
      continue;
    }
    if (css[ctx.i] === "{") {
      ctx.i++; // skip '{'
      ctx.stack.push(head);
      parseBlockBody(ctx);
      ctx.stack.pop();
      // body 끝나면 ctx.i 는 '}' 다음.
    } else {
      // ';' — top-level @import 등. 무시.
      ctx.i++;
    }
  }
}

/**
 * `{` 직후 위치부터 본문을 스캔. `--name: value;` 는 vars 로 수집하고,
 * 다른 selector 가 나오면 parseTopLevel 재귀 — 평탄화된 key 로 blocks 에 push.
 * 닫는 `}` 만나면 종료, ctx.i 는 `}` 다음을 가리킨다.
 */
function parseBlockBody(ctx) {
  const { css } = ctx;
  const n = css.length;
  const vars = {};

  while (ctx.i < n) {
    const c = css[ctx.i];
    if (c === "}") {
      ctx.i++;
      // 자기 자신의 vars 가 있으면 blocks 에 push (selector chain 그대로 join).
      if (Object.keys(vars).length > 0) {
        ctx.blocks.push({ key: ctx.stack.join(" > "), vars });
      }
      return;
    }
    if (c === "/" && css[ctx.i + 1] === "*") {
      const end = css.indexOf("*/", ctx.i + 2);
      if (end < 0) {
        ctx.i = n;
        return;
      }
      ctx.i = end + 2;
      continue;
    }
    if (/\s/.test(c)) {
      ctx.i++;
      continue;
    }
    // 변수 선언 — `--name: value;`
    if (c === "-" && css[ctx.i + 1] === "-") {
      const colonIdx = css.indexOf(":", ctx.i);
      if (colonIdx < 0) {
        ctx.i = n;
        return;
      }
      const semiIdx = findStatementEnd(css, colonIdx + 1);
      if (semiIdx < 0) {
        ctx.i = n;
        return;
      }
      const name = css.slice(ctx.i, colonIdx).trim();
      const value = css.slice(colonIdx + 1, semiIdx).trim();
      vars[name] = value;
      ctx.i = semiIdx + 1;
      continue;
    }
    // 일반 선언 또는 nested selector — `{` 또는 `;` 를 만날 때까지 스캔.
    let j = ctx.i;
    while (j < n) {
      const ch = css[j];
      if (ch === "{" || ch === "}" || ch === ";") break;
      if (ch === "/" && css[j + 1] === "*") {
        const end = css.indexOf("*/", j + 2);
        if (end < 0) {
          j = n;
          break;
        }
        j = end + 2;
        continue;
      }
      j++;
    }
    if (css[j] === "{") {
      // nested selector — 평탄화 위해 stack 에 push, parseBlockBody 재귀.
      const inner = css.slice(ctx.i, j).trim();
      ctx.i = j + 1;
      ctx.stack.push(inner);
      parseBlockBody(ctx);
      ctx.stack.pop();
      continue;
    }
    // 일반 property — 무시 (var 아닌 일반 css 선언)
    ctx.i = j + 1;
  }
  // EOF — 마무리
  if (Object.keys(vars).length > 0) {
    ctx.blocks.push({ key: ctx.stack.join(" > "), vars });
  }
}

/**
 * `;` 또는 블록 끝 `}` 위치 — 변수 선언의 종결점.
 * 괄호 깊이를 추적해 `var(--a, var(--b))` 처럼 안에 ',' 가 있어도 무사.
 */
function findStatementEnd(css, start) {
  let i = start;
  let depth = 0;
  const n = css.length;
  while (i < n) {
    const c = css[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && (c === ";" || c === "}")) return i;
    i++;
  }
  return -1;
}

/**
 * 두 블록 트리 비교. selector 키로 매칭 후 변수별 added/removed/changed 분류.
 *
 * @returns {{
 *   added: Array<{ selector: string, name: string, value: string }>,
 *   removed: Array<{ selector: string, name: string, value: string }>,
 *   changed: Array<{ selector: string, name: string, expected: string, current: string }>,
 *   unchangedCount: number
 * }}
 */
export function diffBlocks(currentBlocks, expectedBlocks) {
  const added = [];
  const removed = [];
  const changed = [];
  let unchangedCount = 0;

  // 같은 selector 가 파일에 여러 번 등장하면 (예: 색 :root 와 spacing :root 가 분리)
  // vars 를 병합해야 한다 — 단순 Map 으로는 뒤 등장이 앞을 덮어써 오탐 발생.
  const currentByKey = mergeBlocks(currentBlocks);
  const expectedByKey = mergeBlocks(expectedBlocks);

  // expected 기준 — added / changed / unchanged 분류
  for (const [key, eb] of expectedByKey) {
    const cb = currentByKey.get(key);
    if (!cb) {
      // 매칭 셀렉터 자체가 없으면 모든 expected var 가 added.
      for (const [name, value] of Object.entries(eb.vars)) {
        added.push({ selector: key, name, value });
      }
      continue;
    }
    for (const [name, eValue] of Object.entries(eb.vars)) {
      const cValue = cb.vars[name];
      if (cValue === undefined) {
        added.push({ selector: key, name, value: eValue });
      } else if (cValue !== eValue) {
        changed.push({ selector: key, name, expected: eValue, current: cValue });
      } else {
        unchangedCount++;
      }
    }
  }

  // current 기준 — removed (expected 에 없는 사용자 변수)
  for (const [key, cb] of currentByKey) {
    const eb = expectedByKey.get(key);
    if (!eb) {
      // 매칭 셀렉터가 expected 에 없음 — 사용자 커스텀 블록. removed 에 안 넣음.
      // (사용자가 의도적으로 추가했을 가능성 — 자동 제거 위험)
      continue;
    }
    for (const [name, cValue] of Object.entries(cb.vars)) {
      if (!(name in eb.vars)) {
        removed.push({ selector: key, name, value: cValue });
      }
    }
  }

  return { added, removed, changed, unchangedCount };
}

/** 같은 selector key 의 vars 를 병합. 뒤 등장이 앞 값을 덮어쓰는 CSS cascade 룰 따름. */
function mergeBlocks(blocks) {
  const out = new Map();
  for (const b of blocks) {
    const prev = out.get(b.key);
    if (!prev) {
      out.set(b.key, { key: b.key, vars: { ...b.vars } });
    } else {
      Object.assign(prev.vars, b.vars);
    }
  }
  return out;
}

/**
 * added 변수만 current text 에 incremental insert.
 *
 * 정책:
 *   - 같은 selector 블록을 current 에서 찾아 닫는 `}` 바로 전에 한 줄 추가.
 *   - 매칭 블록이 없으면 파일 끝에 새 블록을 한 번 append (selector 별로 묶음).
 *   - changed / removed 는 건드리지 않음 (사용자 의도 보존).
 *
 * @returns {string} 새로운 css 텍스트
 */
export function applyAdditions(currentText, added) {
  if (added.length === 0) return currentText;

  // selector 별로 묶기
  const bySelector = new Map();
  for (const a of added) {
    if (!bySelector.has(a.selector)) bySelector.set(a.selector, []);
    bySelector.get(a.selector).push(a);
  }

  let result = currentText;
  const orphans = [];

  for (const [selector, items] of bySelector) {
    const inserted = tryInsertIntoExistingBlock(result, selector, items);
    if (inserted !== null) {
      result = inserted;
    } else {
      orphans.push({ selector, items });
    }
  }

  if (orphans.length > 0) {
    result += "\n\n/* sh-ui upgrade — added */\n";
    for (const { selector, items } of orphans) {
      const segments = selector.split(" > ");
      if (segments.length > 1) {
        // nested — 첫 segment 가 outer (@media 등), 마지막이 inner selector.
        const outer = segments[0];
        const inner = segments[segments.length - 1];
        result += `${outer} {\n  ${inner} {\n`;
        for (const it of items) result += `    ${it.name}: ${it.value};\n`;
        result += "  }\n}\n";
      } else {
        // 단순 selector 또는 @rule — 그대로 한 블록.
        result += `${selector} {\n`;
        for (const it of items) result += `  ${it.name}: ${it.value};\n`;
        result += "}\n";
      }
    }
  }

  return result;
}

/**
 * current 안에서 같은 셀렉터 블록을 찾아 닫는 `}` 직전에 라인 삽입.
 * 못 찾으면 null 반환 — 호출부가 orphan 처리.
 */
function tryInsertIntoExistingBlock(currentText, selector, items) {
  // selector 가 nested 인 경우 — 단순화 위해 마지막 segment 만으로 매칭.
  // 예: "@media (...) > :root:not(.light):not(.dark)" → ":root:not(.light):not(.dark)"
  const segments = selector.split(" > ");
  const target = segments[segments.length - 1];

  // target { 의 첫 매칭. selector 정확 일치 (공백 정규화).
  const targetNormalized = target.replace(/\s+/g, " ").trim();
  const re = new RegExp(
    `(${escapeRegex(targetNormalized).replace(/ /g, "\\s+")})\\s*\\{`,
    "g",
  );
  let m;
  while ((m = re.exec(currentText))) {
    const blockStart = m.index + m[0].length;
    // 이 블록의 닫는 `}` 찾기 — 깊이 추적
    const closeIdx = findMatchingBrace(currentText, blockStart);
    if (closeIdx < 0) continue;
    // 닫기 직전 위치에 줄 삽입.
    // 들여쓰기 — 마지막 의미 있는 줄의 들여쓰기 따르기.
    const indent = detectIndent(currentText, closeIdx);
    const insertion = items
      .map((it) => `${indent}${it.name}: ${it.value};`)
      .join("\n") + "\n";
    return (
      currentText.slice(0, closeIdx) + insertion + currentText.slice(closeIdx)
    );
  }
  return null;
}

function findMatchingBrace(text, start) {
  let depth = 1;
  let i = start;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      if (end < 0) return -1;
      i = end + 2;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

function detectIndent(text, closeIdx) {
  // 닫는 `}` 직전 줄의 들여쓰기 추출.
  // 한 줄 위로 올라가 마지막 의미있는 줄 시작점 찾기.
  let i = closeIdx - 1;
  while (i >= 0 && text[i] !== "\n") i--;
  // i 는 직전 줄의 \n. 다음 줄 시작에서 공백 카운트.
  let j = i + 1;
  let indent = "";
  while (j < closeIdx && (text[j] === " " || text[j] === "\t")) {
    indent += text[j];
    j++;
  }
  return indent || "  ";
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
