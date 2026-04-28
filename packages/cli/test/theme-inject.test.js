import { describe, it, expect } from 'vitest';
import {
  replaceSection,
  buildCssColorsBlock,
  buildCssRadiusBlock,
  buildDartColorsBlock,
  buildDartRadiusBlock,
} from '../src/create/theme/inject.js';

const theme = {
  light: { background: '#111111', 'background-subtle': '#FAFAFA', 'background-muted': '#F5F5F5',
    foreground: '#0A0A0A', 'foreground-muted': '#525252',
    border: '#E5E5E5', 'border-strong': '#D4D4D4',
    primary: '#171717', 'primary-foreground': '#FAFAFA', 'primary-hover': '#262626',
    danger: '#DC2626', 'danger-foreground': '#FFFFFF',
  },
  dark: { background: '#000000', 'background-subtle': '#171717', 'background-muted': '#262626',
    foreground: '#FAFAFA', 'foreground-muted': '#A3A3A3',
    border: '#262626', 'border-strong': '#404040',
    primary: '#FAFAFA', 'primary-foreground': '#171717', 'primary-hover': '#E5E5E5',
    danger: '#DC2626', 'danger-foreground': '#FFFFFF',
  },
  radius: 0.75,
};

describe('replaceSection (CSS)', () => {
  it('마커 사이를 새 내용으로 교체', () => {
    const input = [
      '/* sh-ui:theme-colors-start */',
      ':root { --old: red; }',
      '/* sh-ui:theme-colors-end */',
      ':root { --other: blue; }',
    ].join('\n');
    const out = replaceSection(input, 'theme-colors', '/*', '*/', ':root { --new: green; }');
    expect(out).toContain(':root { --new: green; }');
    expect(out).not.toContain('--old');
    expect(out).toContain('--other: blue');
  });

  it('마커 없으면 에러', () => {
    expect(() => replaceSection('no markers', 'theme-colors', '/*', '*/', 'x'))
      .toThrow(/마커 없음/);
  });
});

describe('replaceSection (Dart)', () => {
  it('dart 스타일 마커도 처리', () => {
    const input = [
      '// sh-ui:theme-radius-start',
      'defaultRadius: 8.0,',
      '// sh-ui:theme-radius-end',
    ].join('\n');
    const out = replaceSection(input, 'theme-radius', '//', '', 'defaultRadius: 12.0,');
    expect(out).toContain('defaultRadius: 12.0,');
    expect(out).not.toContain('8.0');
  });
});

describe('buildCssColorsBlock', () => {
  it(':root + .dark 두 블록을 만듦', () => {
    const css = buildCssColorsBlock(theme);
    expect(css).toContain(':root {');
    expect(css).toContain('--background: #111111;');
    expect(css).toContain('.dark {');
    expect(css).toContain('--background: #000000;');
  });
});

describe('buildCssRadiusBlock', () => {
  it('--radius 한 줄 생성', () => {
    expect(buildCssRadiusBlock(theme)).toBe('  --radius: 0.75rem;');
  });
});

describe('buildDartColorsBlock', () => {
  it('light / dark 두 정적 상수 생성', () => {
    const dart = buildDartColorsBlock(theme);
    expect(dart).toContain('static const light = ShUiColorTokens(');
    expect(dart).toContain('background: Color(0xFF111111),');
    expect(dart).toContain('static const dark = ShUiColorTokens(');
    expect(dart).toContain('background: Color(0xFF000000),');
  });
});

describe('buildDartRadiusBlock', () => {
  it('defaultRadius 라인 생성 (px 단위)', () => {
    expect(buildDartRadiusBlock(theme)).toContain('defaultRadius: 12.0,');
  });
});

describe('buildDartColorsBlock — inverse/subtle', () => {
  it('light.backgroundInverse 는 dark.background 값', () => {
    const dart = buildDartColorsBlock(theme);
    // theme.dark.background 가 "#000000" 이므로
    expect(dart).toMatch(/static const light = ShUiColorTokens\([\s\S]*?backgroundInverse: Color\(0xFF000000\)/);
  });
  it('dark.backgroundInverse 는 light.background 값', () => {
    const dart = buildDartColorsBlock(theme);
    expect(dart).toMatch(/static const dark = ShUiColorTokens\([\s\S]*?backgroundInverse: Color\(0xFF111111\)/);
  });
  it('foregroundInverse 도 light↔dark 대칭', () => {
    const dart = buildDartColorsBlock(theme);
    expect(dart).toMatch(/static const light = ShUiColorTokens\([\s\S]*?foregroundInverse: Color\(0xFFFAFAFA\)/);
    expect(dart).toMatch(/static const dark = ShUiColorTokens\([\s\S]*?foregroundInverse: Color\(0xFF0A0A0A\)/);
  });
  it('foregroundSubtle 은 고정 기본값', () => {
    const dart = buildDartColorsBlock(theme);
    expect(dart).toMatch(/static const light = ShUiColorTokens\([\s\S]*?foregroundSubtle: Color\(0xFFA3A3A3\)/);
    expect(dart).toMatch(/static const dark = ShUiColorTokens\([\s\S]*?foregroundSubtle: Color\(0xFF737373\)/);
  });
});
