import { TOKEN_KEYS, OPTIONAL_TOKEN_KEYS } from './decode.js';

/**
 * 파일 내용에서 sh-ui:<section>-start / -end 마커 사이 내용을 교체.
 * commentOpen / commentClose 는 파일 형식에 따라 주어짐:
 *   CSS  → '/*', '*' + '/'
 *   Dart → '//', ''
 */
export const replaceSection = (content, section, commentOpen, commentClose, replacement) => {
  const startMarker = commentClose
    ? `${commentOpen} sh-ui:${section}-start ${commentClose}`
    : `${commentOpen} sh-ui:${section}-start`;
  const endMarker = commentClose
    ? `${commentOpen} sh-ui:${section}-end ${commentClose}`
    : `${commentOpen} sh-ui:${section}-end`;

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  if (startIdx < 0 || endIdx < 0 || endIdx < startIdx) {
    throw new Error(`inject 실패: 섹션 ${section} 마커 없음`);
  }

  const before = content.slice(0, startIdx + startMarker.length);
  const after = content.slice(endIdx);
  return `${before}\n${replacement}\n${after}`;
};

// ─── CSS 블록 빌더 ───

const cssColorLine = (key, value) => `  --${key}: ${value};`;

export const buildCssColorsBlock = (theme) => {
  // 옵셔널 색 토큰 — light/dark 둘 다에 정의되어 있을 때만 emit. 한쪽만 있으면 누락된 쪽은 fallback 으로
  // 디자인이 깨질 수 있어서 양쪽 정의가 일치할 때만 안전하게 내보낸다.
  const optionalKeys = OPTIONAL_TOKEN_KEYS.filter(
    (k) => k in theme.light && k in theme.dark,
  );
  const allKeys = [...TOKEN_KEYS, ...optionalKeys];

  const lightLines = allKeys.map((k) => cssColorLine(k, theme.light[k])).join('\n');
  const darkLines = allKeys.map((k) => cssColorLine(k, theme.dark[k])).join('\n');
  // 미디어쿼리 안의 다크 라인은 한 단계 더 들여쓰기 (`:root:not(...)` 안쪽).
  const darkLinesIndented = allKeys
    .map((k) => `  ${cssColorLine(k, theme.dark[k])}`)
    .join('\n');
  return [
    ':root {',
    lightLines,
    '}',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not(.light):not(.dark) {',
    darkLinesIndented,
    '  }',
    '}',
    '.dark {',
    darkLines,
    '}',
  ].join('\n');
};

export const buildCssRadiusBlock = (theme) => {
  return `  --radius: ${theme.radius}rem;`;
};

// ─── Dart 블록 빌더 ───

const toDartColor = (hex) => `Color(0xFF${hex.replace('#', '').toUpperCase()})`;

/**
 * Dart 의 ShUiColorTokens 필드 순서 + 각 필드가 어떤 소스에서 값을 가져오는지.
 *   self    — 현재 모드의 편집값
 *   inverse — 반대 모드의 편집값
 *   default — playground 가 노출하지 않음, 고정 기본값 사용
 */
/**
 * Dart ShUiColorTokens 필드 매핑. v0.37.0 부터 background-inverse / foreground-inverse /
 * foreground-subtle 도 사용자가 직접 잡으므로 모두 self 룩업.
 */
const DART_FIELD_SOURCES = [
  { field: 'background',           key: 'background' },
  { field: 'backgroundSubtle',     key: 'background-subtle' },
  { field: 'backgroundMuted',      key: 'background-muted' },
  { field: 'backgroundInverse',    key: 'background-inverse' },
  { field: 'foreground',           key: 'foreground' },
  { field: 'foregroundMuted',      key: 'foreground-muted' },
  { field: 'foregroundSubtle',     key: 'foreground-subtle' },
  { field: 'foregroundInverse',    key: 'foreground-inverse' },
  { field: 'border',               key: 'border' },
  { field: 'borderStrong',         key: 'border-strong' },
  { field: 'primary',              key: 'primary' },
  { field: 'primaryForeground',    key: 'primary-foreground' },
  { field: 'primaryHover',         key: 'primary-hover' },
  { field: 'danger',               key: 'danger' },
  { field: 'dangerForeground',     key: 'danger-foreground' },
];

const buildDartStaticConst = (mode, self) => {
  const lines = DART_FIELD_SOURCES.map(({ field, key }) =>
    `    ${field}: ${toDartColor(self[key])},`,
  ).join('\n');
  return [
    `  static const ${mode} = ShUiColorTokens(`,
    lines,
    '  );',
  ].join('\n');
};

export const buildDartColorsBlock = (theme) => {
  return [
    buildDartStaticConst('light', theme.light),
    '',
    buildDartStaticConst('dark', theme.dark),
  ].join('\n');
};

export const buildDartRadiusBlock = (theme) => {
  const px = (theme.radius * 16).toFixed(1);
  return `    defaultRadius: ${px},`;
};

// ─── 옵셔널 카테고리 빌더 (Phase 2) ───
//
// 모두 마커 사이에 들어갈 본문만 만든다. CSS 는 변수 선언 N줄, Dart 는 필드 N줄.

/* --- spacing --- */

const SPACING_KEYS = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'];

// 1rem = 16px 가정. 0 은 unit 없이 emit (CSS 권장).
// trailing zero 제거 (0.50 → 0.5, 1.00 → 1).
const toRem = (px) => {
  if (px === 0) return '0';
  return `${parseFloat((px / 16).toFixed(4))}rem`;
};

export const buildCssSpacingBlock = (spacing) =>
  SPACING_KEYS.map((k) => `  --space-${k}: ${toRem(spacing[k])};`).join('\n');

// Flutter 는 logical pixel 사용. Dart 측은 PX 그대로 유지.
export const buildDartSpacingBlock = (spacing) =>
  SPACING_KEYS.map((k) => `    s${k}: ${spacing[k].toFixed(1)},`).join('\n');

/* --- typography --- */

const TYPOGRAPHY_KEYS = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];

export const buildCssTypographyBlock = (typography) =>
  TYPOGRAPHY_KEYS.map((k) => `  --text-${k}: ${toRem(typography[k])};`).join('\n');

// Dart 클래스는 'xl2'/'xl3'/'xl4' 명명 규칙 사용 (숫자 prefix 회피).
const DART_TEXT_FIELD_NAMES = {
  xs: 'xs', sm: 'sm', base: 'base', lg: 'lg', xl: 'xl',
  '2xl': 'xl2', '3xl': 'xl3', '4xl': 'xl4',
};

export const buildDartTypographyBlock = (typography) =>
  TYPOGRAPHY_KEYS
    .map((k) => `    ${DART_TEXT_FIELD_NAMES[k]}: ${typography[k].toFixed(1)},`)
    .join('\n');

/* --- weights --- */

const WEIGHT_KEYS = ['regular', 'medium', 'semibold', 'bold'];

export const buildCssWeightsBlock = (weights) =>
  WEIGHT_KEYS.map((k) => `  --weight-${k}: ${weights[k]};`).join('\n');

export const buildDartWeightsBlock = (weights) =>
  WEIGHT_KEYS.map((k) => `    ${k}: FontWeight.w${weights[k]},`).join('\n');

/* --- controls --- */

const CONTROL_KEYS = ['sm', 'md', 'lg'];

export const buildCssControlsBlock = (controls) =>
  CONTROL_KEYS.map((k) => `  --control-${k}: ${toRem(controls[k])};`).join('\n');

export const buildDartControlsBlock = (controls) =>
  CONTROL_KEYS.map((k) => `    ${k}: ${controls[k].toFixed(1)},`).join('\n');

/* --- borders --- */

export const buildCssBordersBlock = (borders) => [
  `  --border-width: ${borders.width}px;`,
  `  --border-width-strong: ${borders.widthStrong}px;`,
].join('\n');

export const buildDartBordersBlock = (borders) => [
  `    normal: ${borders.width.toFixed(1)},`,
  `    strong: ${borders.widthStrong.toFixed(1)},`,
].join('\n');

/* --- durations --- */

const DURATION_KEYS = ['fast', 'base', 'slow'];

export const buildCssDurationsBlock = (durations) =>
  DURATION_KEYS.map((k) => `  --duration-${k}: ${durations[k]}ms;`).join('\n');

export const buildDartDurationsBlock = (durations) =>
  DURATION_KEYS
    .map((k) => `    ${k}: Duration(milliseconds: ${Math.round(durations[k])}),`)
    .join('\n');

// ─── Phase 3 — string 카테고리: shadow / ease / gradient ───
//
// CSS 측은 사용자가 입력한 문자열을 거의 그대로 흘려보내고, Dart 측은 파서를 거쳐
// BoxShadow / Cubic / LinearGradient 로 변환. 파서는 형식 위배 시 throw.

/* --- 공통 유틸 --- */

/** 괄호 깊이 0 인 위치에서만 콤마로 split. rgba(0,0,0,0.5) 같은 것을 보호. */
const splitTopLevelByComma = (str) => {
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) {
      parts.push(str.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(str.slice(start).trim());
  return parts.filter(Boolean);
};

/** 공백 split — 단 괄호 안은 그룹 유지. */
const tokenizeSpaceAware = (str) => {
  const tokens = [];
  let depth = 0, start = 0;
  const flush = (end) => {
    const t = str.slice(start, end).trim();
    if (t) tokens.push(t);
  };
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (/\s/.test(c) && depth === 0) {
      flush(i);
      start = i + 1;
    }
  }
  flush(str.length);
  return tokens;
};

const cssLengthToPx = (s, ctx) => {
  const m = s.match(/^(-?[\d.]+)(?:px)?$/);
  if (!m) throw new Error(`${ctx}: 길이 단위 오류 — '${s}'`);
  return parseFloat(m[1]);
};

/** CSS color → { r, g, b, a } (a ∈ 0..255). #RRGGBB / #RRGGBBAA / rgb() / rgba() 지원. */
const parseCssColor = (s, ctx) => {
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 0xff,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16),
      };
    }
    throw new Error(`${ctx}: hex 색은 #RRGGBB 또는 #RRGGBBAA 만 지원 — '${s}'`);
  }
  const m = s.match(/^rgba?\(\s*([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(',').map((p) => p.trim());
    if (parts.length < 3 || parts.length > 4) {
      throw new Error(`${ctx}: rgb/rgba 인자 수 오류 — '${s}'`);
    }
    const r = parseInt(parts[0], 10);
    const g = parseInt(parts[1], 10);
    const b = parseInt(parts[2], 10);
    const a = parts[3] !== undefined ? Math.round(parseFloat(parts[3]) * 255) : 0xff;
    if ([r, g, b, a].some((n) => Number.isNaN(n))) {
      throw new Error(`${ctx}: rgb/rgba 숫자 파싱 실패 — '${s}'`);
    }
    return { r, g, b, a };
  }
  throw new Error(`${ctx}: 색 형식 미지원 (#hex / rgb() / rgba() 만) — '${s}'`);
};

const colorToARGBHex = ({ a, r, g, b }) => {
  const v = (((a & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)) >>> 0;
  return v.toString(16).toUpperCase().padStart(8, '0');
};

/* --- shadow --- */

const SHADOW_KEYS = ['sm', 'md', 'lg', 'xl'];

export const buildCssShadowsBlock = (shadows) =>
  [
    ...SHADOW_KEYS.map((k) => `  --shadow-${k}: ${shadows[k]};`),
    `  --shadow-menu: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05);`,
  ].join('\n');

const parseSingleBoxShadow = (s) => {
  const tokens = tokenizeSpaceAware(s);
  if (tokens.length < 4 || tokens.length > 5) {
    throw new Error(`shadow: 토큰 수 4~5 (offset-x offset-y blur [spread] color) — '${s}'`);
  }
  const offsetX = cssLengthToPx(tokens[0], 'shadow.offset-x');
  const offsetY = cssLengthToPx(tokens[1], 'shadow.offset-y');
  const blur = cssLengthToPx(tokens[2], 'shadow.blur');
  let spread = 0;
  let colorStr;
  if (tokens.length === 4) {
    colorStr = tokens[3];
  } else {
    spread = cssLengthToPx(tokens[3], 'shadow.spread');
    colorStr = tokens[4];
  }
  const color = parseCssColor(colorStr, 'shadow.color');
  return { offsetX, offsetY, blur, spread, color };
};

export const cssShadowToDartList = (cssValue) => {
  const items = splitTopLevelByComma(cssValue).map(parseSingleBoxShadow);
  const dartItems = items.map((it) => {
    const hex = colorToARGBHex(it.color);
    return `BoxShadow(offset: Offset(${it.offsetX.toFixed(1)}, ${it.offsetY.toFixed(1)}), blurRadius: ${it.blur.toFixed(1)}, spreadRadius: ${it.spread.toFixed(1)}, color: Color(0x${hex}))`;
  });
  return `<BoxShadow>[${dartItems.join(', ')}]`;
};

export const buildDartShadowsBlock = (shadows) =>
  SHADOW_KEYS.map((k) => `    ${k}: ${cssShadowToDartList(shadows[k])},`).join('\n');

/* --- ease --- */

const EASE_KEYS = ['standard', 'emphasized'];

const NAMED_EASES = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};

export const buildCssEasesBlock = (eases) =>
  EASE_KEYS.map((k) => `  --ease-${k}: ${eases[k]};`).join('\n');

export const cssEaseToDartCubic = (cssValue) => {
  const trimmed = cssValue.trim();
  if (NAMED_EASES[trimmed]) {
    const [x1, y1, x2, y2] = NAMED_EASES[trimmed];
    return `Cubic(${x1}, ${y1}, ${x2}, ${y2})`;
  }
  const m = trimmed.match(/^cubic-bezier\(([^)]+)\)$/);
  if (!m) throw new Error(`ease: cubic-bezier(...) 또는 named easing 만 — '${cssValue}'`);
  const nums = m[1].split(',').map((s) => parseFloat(s.trim()));
  if (nums.length !== 4 || nums.some((n) => Number.isNaN(n))) {
    throw new Error(`ease: cubic-bezier 인자 4개 숫자 필요 — '${cssValue}'`);
  }
  return `Cubic(${nums.join(', ')})`;
};

export const buildDartEasesBlock = (eases) =>
  EASE_KEYS.map((k) => `    ${k}: ${cssEaseToDartCubic(eases[k])},`).join('\n');

/* --- gradient --- */

const GRADIENT_KEYS = ['primary', 'surface', 'overlay'];

export const buildCssGradientsBlock = (gradients) =>
  GRADIENT_KEYS.map((k) => `  --gradient-${k}: ${gradients[k]};`).join('\n');

/**
 * CSS gradient 의 deg → Flutter Alignment(begin, end).
 * CSS 0deg=위쪽, 시계방향. Flutter Alignment 의 +y 는 아래.
 */
const angleToBeginEnd = (deg) => {
  const rad = (deg * Math.PI) / 180;
  const ex = Math.sin(rad);
  const ey = -Math.cos(rad);
  const round3 = (v) => parseFloat(v.toFixed(3));
  return {
    begin: [round3(-ex), round3(-ey)],
    end: [round3(ex), round3(ey)],
  };
};

export const cssGradientToDartLinear = (cssValue) => {
  const trimmed = cssValue.trim();
  const m = trimmed.match(/^linear-gradient\(([\s\S]+)\)$/);
  if (!m) throw new Error(`gradient: linear-gradient(...) 만 — '${cssValue}'`);
  const parts = splitTopLevelByComma(m[1]);
  if (parts.length < 3) throw new Error(`gradient: 인자 부족 (각도 + 스톱 ≥ 2) — '${cssValue}'`);
  const angleM = parts[0].match(/^(-?[\d.]+)deg$/);
  if (!angleM) throw new Error(`gradient: 첫 인자가 <angle>deg 아님 — '${parts[0]}'`);
  const angle = parseFloat(angleM[1]);
  const stops = parts.slice(1).map((s) => {
    const tokens = tokenizeSpaceAware(s);
    if (tokens.length !== 2) throw new Error(`gradient: 스톱 형식 '<color> <pos>%' — '${s}'`);
    const color = parseCssColor(tokens[0], 'gradient.stop.color');
    const pm = tokens[1].match(/^([\d.]+)%$/);
    if (!pm) throw new Error(`gradient: 스톱 위치 % 형식 — '${tokens[1]}'`);
    return { color, position: parseFloat(pm[1]) };
  });
  const { begin, end } = angleToBeginEnd(angle);
  const colorList = stops.map((st) => `Color(0x${colorToARGBHex(st.color)})`).join(', ');
  const stopList = stops.map((st) => (st.position / 100).toFixed(2)).join(', ');
  return `LinearGradient(begin: Alignment(${begin[0]}, ${begin[1]}), end: Alignment(${end[0]}, ${end[1]}), colors: <Color>[${colorList}], stops: <double>[${stopList}])`;
};

export const buildDartGradientsBlock = (gradients) =>
  GRADIENT_KEYS.map((k) => `    ${k}: ${cssGradientToDartLinear(gradients[k])},`).join('\n');
