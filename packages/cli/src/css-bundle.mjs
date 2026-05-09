// `cssStrategy: "bundled"` 모드에서 컴포넌트 CSS 를 단일 파일에 마커 기반 섹션으로 누적.
//
// 섹션 포맷:
//   /* sh-ui:component:button-start */
//   .sh-ui-button { ... }
//   /* sh-ui:component:button-end */
//
// add 시 섹션을 append/replace, remove 시 섹션 제거. 마커 사이의 내용만 sh-ui 가 관리하고
// 파일의 다른 부분 (사용자가 추가한 custom CSS) 은 그대로 둔다.

const SEC_START = (name) => `/* sh-ui:component:${name}-start */`;
const SEC_END = (name) => `/* sh-ui:component:${name}-end */`;

/**
 * bundle 텍스트에서 컴포넌트 섹션을 append 하거나 replace.
 * 동일 이름 섹션이 이미 있으면 그 안의 내용만 교체.
 *
 * @param {string} bundleText 현재 번들 파일 내용 (없으면 빈 문자열)
 * @param {string} name 컴포넌트 이름 (예: "button")
 * @param {string} css 컴포넌트의 CSS (마커 제외)
 * @returns {string} 갱신된 번들 텍스트
 */
export function upsertSection(bundleText, name, css) {
  const start = SEC_START(name);
  const end = SEC_END(name);
  const startIdx = bundleText.indexOf(start);
  const endIdx = bundleText.indexOf(end);
  const trimmed = css.trim();
  const block = `${start}\n${trimmed}\n${end}`;

  if (startIdx >= 0 && endIdx > startIdx) {
    return (
      bundleText.slice(0, startIdx) +
      block +
      bundleText.slice(endIdx + end.length)
    );
  }

  // append — 기존 내용이 있으면 빈 줄 한 개로 분리.
  const sep = bundleText.length === 0
    ? ""
    : bundleText.endsWith("\n\n")
      ? ""
      : bundleText.endsWith("\n")
        ? "\n"
        : "\n\n";
  return bundleText + sep + block + "\n";
}

/**
 * bundle 텍스트에서 컴포넌트 섹션 제거. 없으면 그대로 반환.
 */
export function removeSection(bundleText, name) {
  const start = SEC_START(name);
  const end = SEC_END(name);
  const startIdx = bundleText.indexOf(start);
  const endIdx = bundleText.indexOf(end);
  if (startIdx < 0 || endIdx <= startIdx) return bundleText;
  // 섹션 + 다음 줄바꿈 한 번까지 제거 (중복 빈 줄 방지).
  let cutEnd = endIdx + end.length;
  if (bundleText[cutEnd] === "\n") cutEnd++;
  return bundleText.slice(0, startIdx) + bundleText.slice(cutEnd);
}

/**
 * bundle 텍스트에서 등록된 컴포넌트 이름 목록 추출 (시작 마커 기준).
 */
export function listSections(bundleText) {
  const re = /\/\*\s*sh-ui:component:([a-z0-9-]+)-start\s*\*\//g;
  const out = [];
  let m;
  while ((m = re.exec(bundleText))) out.push(m[1]);
  return out;
}

/**
 * 컴포넌트 .tsx 의 `import "./styles.css";` 라인을 제거.
 * 번들 모드에서는 styles.css 가 없으므로 이 import 는 빌드 깨뜨림.
 *
 * 다양한 quote / 공백을 허용. 다른 import 는 보존.
 */
export function stripStylesImport(tsxText) {
  // import "./styles.css"; / import './styles.css' / import "./styles.module.css" 등
  // 줄 끝 newline 은 있을 수도/없을 수도 있어 (?:\n|$) 로 처리.
  return tsxText.replace(
    /^[ \t]*import\s+['"]\.\/styles\.(?:module\.)?css['"];?\s*(?:\n|$)/gm,
    "",
  );
}

/**
 * registry 의 file 엔트리가 CSS 변종인지 (bundled 모드에서 별도 처리 대상).
 */
export function isStyleFile(file) {
  const src = file?.src ?? "";
  return /\.(css|module\.css|css\.ts)$/.test(src);
}

/**
 * registry 의 file 엔트리가 .tsx 변종인지 (stripStylesImport 적용 대상).
 */
export function isTsxFile(file) {
  const src = file?.src ?? "";
  return /\.tsx$/.test(src);
}
