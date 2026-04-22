import { TOKEN_KEYS } from './decode.js';

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
  const lightLines = TOKEN_KEYS.map((k) => cssColorLine(k, theme.light[k])).join('\n');
  const darkLines = TOKEN_KEYS.map((k) => cssColorLine(k, theme.dark[k])).join('\n');
  return [
    ':root {',
    lightLines,
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
const DART_FIELD_SOURCES = [
  { field: 'background',           source: { kind: 'self', key: 'background' } },
  { field: 'backgroundSubtle',     source: { kind: 'self', key: 'background-subtle' } },
  { field: 'backgroundMuted',      source: { kind: 'self', key: 'background-muted' } },
  { field: 'backgroundInverse',    source: { kind: 'inverse', key: 'background' } },
  { field: 'foreground',           source: { kind: 'self', key: 'foreground' } },
  { field: 'foregroundMuted',      source: { kind: 'self', key: 'foreground-muted' } },
  { field: 'foregroundSubtle',     source: { kind: 'default' } },
  { field: 'foregroundInverse',    source: { kind: 'inverse', key: 'foreground' } },
  { field: 'border',               source: { kind: 'self', key: 'border' } },
  { field: 'borderStrong',         source: { kind: 'self', key: 'border-strong' } },
  { field: 'primary',              source: { kind: 'self', key: 'primary' } },
  { field: 'primaryForeground',    source: { kind: 'self', key: 'primary-foreground' } },
  { field: 'primaryHover',         source: { kind: 'self', key: 'primary-hover' } },
  { field: 'danger',               source: { kind: 'self', key: 'danger' } },
  { field: 'dangerForeground',     source: { kind: 'self', key: 'danger-foreground' } },
];

const DART_DEFAULTS = {
  light: { foregroundSubtle: '0xFFA3A3A3' },
  dark:  { foregroundSubtle: '0xFF737373' },
};

const buildDartStaticConst = (mode, self, opposite) => {
  const lines = DART_FIELD_SOURCES.map(({ field, source }) => {
    switch (source.kind) {
      case 'self':
        return `    ${field}: ${toDartColor(self[source.key])},`;
      case 'inverse':
        return `    ${field}: ${toDartColor(opposite[source.key])},`;
      case 'default':
        return `    ${field}: Color(${DART_DEFAULTS[mode][field]}),`;
    }
  }).join('\n');
  return [
    `  static const ${mode} = ShUiColorTokens(`,
    lines,
    '  );',
  ].join('\n');
};

export const buildDartColorsBlock = (theme) => {
  return [
    buildDartStaticConst('light', theme.light, theme.dark),
    '',
    buildDartStaticConst('dark', theme.dark, theme.light),
  ].join('\n');
};

export const buildDartRadiusBlock = (theme) => {
  const px = (theme.radius * 16).toFixed(1);
  return `    defaultRadius: ${px},`;
};
