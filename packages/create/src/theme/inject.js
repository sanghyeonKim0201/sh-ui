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
const toCamel = (key) => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const dartColorLine = (key, value) => `    ${toCamel(key)}: ${toDartColor(value)},`;

export const buildDartColorsBlock = (theme) => {
  const lightLines = TOKEN_KEYS.map((k) => dartColorLine(k, theme.light[k])).join('\n');
  const darkLines = TOKEN_KEYS.map((k) => dartColorLine(k, theme.dark[k])).join('\n');
  return [
    '  static const light = ShUiColorTokens(',
    lightLines,
    '  );',
    '',
    '  static const dark = ShUiColorTokens(',
    darkLines,
    '  );',
  ].join('\n');
};

export const buildDartRadiusBlock = (theme) => {
  const px = (theme.radius * 16).toFixed(1);
  return `    defaultRadius: ${px},`;
};
