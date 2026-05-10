// Flutter sh_ui_tokens.dart 와 buildTokensDart 결과를 비교한다.
//
// Dart 의 토큰 파일 구조:
//   class ShUiColorTokens { final Color background; ...
//     static const light = ShUiColorTokens(
//       background: Color(0xFFFFFFFF),
//       ...
//     );
//     static const dark = ShUiColorTokens(...);
//   }
//   class ShUiSpacingTokens { ...
//     static const tokens = ShUiSpacingTokens(s0: 0.0, s1: 4.0, ...);
//   }
//
// 비교 단위는 `<ClassName>.<staticName>` (예: ShUiColorTokens.light) — 그 안의
// field: value 맵으로 평탄화 후 added / changed / removed 분류.
//
// Apply 정책:
//   Dart 클래스에 새 필드 추가는 (1) class field 선언, (2) constructor 파라미터,
//   (3) 모든 static const 인스턴스화 — 3 군데 동기 수정 필요. 위험성/구현 복잡도가
//   CSS 마커 기반과 비교 불가. v1 Flutter 는 --replace 만 지원, --apply 는 안내 에러.

/**
 * `static const NAME = ClassName(...)` 블록들을 추출.
 * @returns { [`ClassName.staticName`]: { field: rawValue } }
 */
export function parseDartTokens(dartText) {
  const out = {};
  // 의도적으로 단순 — `static const NAME = ClassName(...)` 의 본문 (마지막 `;` 까지) 을 캡처.
  // 본문엔 nested 함수 호출 (Color(0x...), Cubic(...), Duration(...)) 이 가능하므로
  // 간단한 깊이 카운터로 닫는 `)` 매칭.
  const re = /static\s+const\s+([a-zA-Z_]\w*)\s*=\s*(ShUi[A-Z]\w*)\s*\(/g;
  let m;
  while ((m = re.exec(dartText))) {
    const staticName = m[1];
    const className = m[2];
    const bodyStart = m.index + m[0].length;
    const bodyEnd = findClosingParen(dartText, bodyStart);
    if (bodyEnd < 0) continue;
    const body = dartText.slice(bodyStart, bodyEnd);
    const fields = parseDartFieldList(body);
    if (Object.keys(fields).length === 0) continue;
    out[`${className}.${staticName}`] = fields;
  }
  return out;
}

function findClosingParen(text, start) {
  let depth = 1;
  let i = start;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

/**
 * `field: value, field: value, ...` 본문을 { field: value-string } 으로.
 * 값은 trim 된 raw 문자열 — `Color(0xFF...)`, `0.5`, `Duration(milliseconds: 120)`,
 * `Cubic(0.4, 0, 0.2, 1)`, `<BoxShadow>[...]` 등 그대로 보존.
 */
function parseDartFieldList(body) {
  const out = {};
  const items = splitByTopLevelComma(body);
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const colonIdx = findTopLevelColon(trimmed);
    if (colonIdx < 0) continue;
    const field = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (field && value) out[field] = value;
  }
  return out;
}

/** 깊이 0 콤마로 split. (), [], {} 안의 콤마는 보호. */
function splitByTopLevelComma(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (c === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** 깊이 0 의 첫 ':' — `field: Color(0x...)` 형식 분리용. */
function findTopLevelColon(text) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (c === ":" && depth === 0) return i;
  }
  return -1;
}

/**
 * 두 Dart 토큰 트리 비교. CSS 측 diffBlocks 와 같은 결과 모양.
 */
export function diffDartTokens(currentTokens, expectedTokens) {
  const added = [];
  const removed = [];
  const changed = [];
  let unchangedCount = 0;

  const allKeys = new Set([
    ...Object.keys(currentTokens),
    ...Object.keys(expectedTokens),
  ]);

  for (const blockKey of allKeys) {
    const cur = currentTokens[blockKey] ?? {};
    const exp = expectedTokens[blockKey] ?? {};
    const fieldKeys = new Set([...Object.keys(cur), ...Object.keys(exp)]);
    for (const field of fieldKeys) {
      const cv = cur[field];
      const ev = exp[field];
      if (cv === undefined && ev !== undefined) {
        added.push({ selector: blockKey, name: field, value: ev });
      } else if (ev === undefined && cv !== undefined) {
        removed.push({ selector: blockKey, name: field, value: cv });
      } else if (cv !== ev) {
        changed.push({ selector: blockKey, name: field, expected: ev, current: cv });
      } else {
        unchangedCount++;
      }
    }
  }
  return { added, removed, changed, unchangedCount };
}
