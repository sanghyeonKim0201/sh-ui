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
 * 크로스컴포넌트 상대 import 매칭 정규식 생성 (호출마다 새 RegExp — lastIndex 상태 회피).
 *
 * 매칭: `... from "../<comp>..."` / `... from "../<comp>/index.tsx"` 형태.
 *   - group1: `from` 키워드 + 공백 (re-export `export {…} from` 도 포함)
 *   - group2: 따옴표
 *   - 리터럴 `../` 다음 negative-lookahead `(?!\.)` — `../../` / `../.x` 는 제외
 *     (sh-ui 컴포넌트는 항상 형제 디렉터리라 정확히 한 단계 `../`)
 *   - group3: 컴포넌트 경로 (따옴표/개행 없음, subpath 포함 가능: `form/types`)
 * 같은 디렉터리(`./styles.css` 등)와 side-effect import(`import "..."`)는 매칭 안 됨.
 */
function crossComponentImportRe() {
  return /(\bfrom\s+)(["'])\.\.\/(?!\.)([^"'\n]+)\2/g;
}

/**
 * 컴포넌트 소스에 다른 sh-ui 컴포넌트를 가리키는 상대 import 가 있는지.
 * add 시 aliases.components 미설정을 사전 차단하는 게이트로 사용.
 */
export function hasCrossComponentImport(content) {
  return crossComponentImportRe().test(content);
}

/**
 * registry 컴포넌트의 크로스컴포넌트 상대 import 를 사용자 config 의
 * `aliases.components` 경유 모듈 스펙으로 재작성.
 *
 * 왜: registry 소스는 가독성을 위해 형제 컴포넌트를 `import … from "../popover"`
 * 처럼 상대경로로 적는다. 이게 그대로 소비자 프로젝트에 emit 되면
 * `moduleResolution: "NodeNext"`/`"Node16"` 환경에서 깨진다 — NodeNext 는
 * 확장자 없는/디렉터리 상대 import 를 허용하지 않고, 과거 일부 버전이 emit 한
 * `"../popover/index.tsx"` 는 명시적 `.tsx` 확장자라 TS5097 로 막힌다. 소비자는
 * `allowImportingTsExtensions`+`noEmit` 같은 침습적 tsconfig 변경을 강요당한다.
 * `@SH_UI_UTILS@` 가 `aliases.utils` 로 치환되는 것과 동일하게, 크로스컴포넌트
 * import 도 add 시점에 `aliases.components` 로 재작성하면 Bundler/NodeNext
 * 양쪽에서 소비자 tsconfig 변경 없이 resolve 된다.
 *
 * 변환 규칙: `../<rest>` → `<componentsAlias>/<rest>` (선행 `../` 제거),
 * 그리고 말미의 `/index`(+`.tsx|.ts|.jsx|.js`)는 제거 — `../popover`,
 * `../popover/index.tsx`, `../form/types` 가 모두 동일하게
 * `<alias>/popover`, `<alias>/form/types` 로 정규화된다.
 *
 * `componentsAlias` 가 falsy 면 그대로 반환 (remove.mjs 의 best-effort 재생 replay
 * 처럼 alias 미설정 컨텍스트에서 throw 하지 않기 위함 — 검증/차단은 add.mjs 책임).
 *
 * @param {string} content 컴포넌트 소스
 * @param {string} componentsAlias 예: `@workspace/ui-core/components`
 * @returns {string} 재작성된 소스
 */
export function rewriteCrossComponentImports(content, componentsAlias) {
  if (!componentsAlias) return content;
  return content.replace(
    crossComponentImportRe(),
    (_m, fromKw, quote, spec) => {
      const rest = spec.replace(/\/index(\.[tj]sx?)?$/, "");
      return `${fromKw}${quote}${componentsAlias}/${rest}${quote}`;
    },
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
