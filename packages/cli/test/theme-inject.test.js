import { describe, it, expect } from 'vitest';
import {
  replaceSection,
  buildCssColorsBlock,
  buildCssRadiusBlock,
  buildCssSpacingBlock,
  buildCssTypographyBlock,
  buildCssWeightsBlock,
  buildCssControlsBlock,
  buildCssBordersBlock,
  buildCssDurationsBlock,
  buildCssShadowsBlock,
  buildCssEasesBlock,
  buildCssGradientsBlock,
  buildDartColorsBlock,
  buildDartRadiusBlock,
  buildDartSpacingBlock,
  buildDartTypographyBlock,
  buildDartWeightsBlock,
  buildDartControlsBlock,
  buildDartBordersBlock,
  buildDartDurationsBlock,
  buildDartShadowsBlock,
  buildDartEasesBlock,
  buildDartGradientsBlock,
  cssShadowToDartList,
  cssEaseToDartCubic,
  cssGradientToDartLinear,
} from '../src/create/theme/inject.js';

const theme = {
  light: { background: '#111111', 'background-subtle': '#FAFAFA', 'background-muted': '#F5F5F5',
    'background-inverse': '#222222',
    foreground: '#0A0A0A', 'foreground-muted': '#525252',
    'foreground-subtle': '#888888', 'foreground-inverse': '#EEEEEE',
    border: '#E5E5E5', 'border-strong': '#D4D4D4',
    primary: '#171717', 'primary-foreground': '#FAFAFA', 'primary-hover': '#262626',
    danger: '#DC2626', 'danger-foreground': '#FFFFFF',
  },
  dark: { background: '#000000', 'background-subtle': '#171717', 'background-muted': '#262626',
    'background-inverse': '#DDDDDD',
    foreground: '#FAFAFA', 'foreground-muted': '#A3A3A3',
    'foreground-subtle': '#666666', 'foreground-inverse': '#111111',
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

  it('옵셔널 색 토큰이 light/dark 둘 다에 있으면 emit', () => {
    const themed = {
      ...theme,
      light: { ...theme.light, success: '#16A34A', warning: '#D97706', info: '#0EA5E9' },
      dark: { ...theme.dark, success: '#22C55E', warning: '#F59E0B', info: '#38BDF8' },
    };
    const css = buildCssColorsBlock(themed);
    expect(css).toContain('--success: #16A34A;');
    expect(css).toContain('--success: #22C55E;');
    expect(css).toContain('--warning: #D97706;');
    expect(css).toContain('--info: #38BDF8;');
  });

  it('옵셔널 색 토큰이 한쪽 모드만 있으면 emit 안 함 (양쪽 동기화 안전 가드)', () => {
    const onlyLight = {
      ...theme,
      light: { ...theme.light, success: '#16A34A' },
    };
    const css = buildCssColorsBlock(onlyLight);
    expect(css).not.toContain('--success');
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

describe('Phase 2 — 옵셔널 카테고리 빌더', () => {
  const spacing = { '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '8': 32, '10': 40, '12': 48, '16': 64 };
  const typography = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 };
  const weights = { regular: 400, medium: 500, semibold: 600, bold: 700 };
  const controls = { sm: 32, md: 40, lg: 48 };
  const borders = { width: 1, widthStrong: 2 };
  const durations = { fast: 120, base: 160, slow: 200 };

  it('CSS spacing 11줄', () => {
    const block = buildCssSpacingBlock(spacing);
    expect(block.split('\n')).toHaveLength(11);
    expect(block).toContain('--space-0: 0;');
    expect(block).toContain('--space-16: 4rem;');
  });

  it('CSS typography 8줄', () => {
    const block = buildCssTypographyBlock(typography);
    expect(block.split('\n')).toHaveLength(8);
    expect(block).toContain('--text-xs: 0.75rem;');
    expect(block).toContain('--text-4xl: 2.25rem;');
  });

  it('CSS weights / controls / borders / durations', () => {
    expect(buildCssWeightsBlock(weights)).toContain('--weight-regular: 400;');
    expect(buildCssControlsBlock(controls)).toContain('--control-md: 2.5rem;');
    expect(buildCssBordersBlock(borders)).toContain('--border-width: 1px;');
    expect(buildCssBordersBlock(borders)).toContain('--border-width-strong: 2px;');
    expect(buildCssDurationsBlock(durations)).toContain('--duration-fast: 120ms;');
  });

  it('Dart spacing — sN 명명 + 소수점 1자리', () => {
    const block = buildDartSpacingBlock(spacing);
    expect(block).toContain('s0: 0.0,');
    expect(block).toContain('s16: 64.0,');
  });

  it('Dart typography — xl/xl2/xl3/xl4 (숫자 prefix 회피)', () => {
    const block = buildDartTypographyBlock(typography);
    expect(block).toContain('xs: 12.0,');
    expect(block).toContain('xl2: 24.0,');
    expect(block).toContain('xl4: 36.0,');
  });

  it('Dart weights — FontWeight.wXXX 형식', () => {
    const block = buildDartWeightsBlock(weights);
    expect(block).toContain('regular: FontWeight.w400,');
    expect(block).toContain('bold: FontWeight.w700,');
  });

  it('Dart durations — Duration(milliseconds: N)', () => {
    const block = buildDartDurationsBlock(durations);
    expect(block).toContain('fast: Duration(milliseconds: 120),');
    expect(block).toContain('slow: Duration(milliseconds: 200),');
  });

  it('Dart controls / borders — 소수점 1자리', () => {
    expect(buildDartControlsBlock(controls)).toContain('md: 40.0,');
    expect(buildDartBordersBlock(borders)).toContain('normal: 1.0,');
    expect(buildDartBordersBlock(borders)).toContain('strong: 2.0,');
  });
});

describe('Phase 3 — string 카테고리 빌더 + 파서', () => {
  /* shadow */
  it('CSS shadow — 디폴트 4종 그대로 통과', () => {
    const shadows = {
      sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
      md: '0 4px 12px rgba(0, 0, 0, 0.12)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.18)',
    };
    const css = buildCssShadowsBlock(shadows);
    expect(css).toContain('--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);');
    expect(css).toContain('--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.18);');
  });

  it('cssShadowToDartList — rgba alpha → ARGB hex', () => {
    // rgba(0,0,0,0.08) 의 alpha = 0.08 * 255 ≈ 20 = 0x14
    expect(cssShadowToDartList('0 1px 2px rgba(0, 0, 0, 0.08)'))
      .toBe('<BoxShadow>[BoxShadow(offset: Offset(0.0, 1.0), blurRadius: 2.0, spreadRadius: 0.0, color: Color(0x14000000))]');
  });

  it('cssShadowToDartList — spread 인자 인식', () => {
    expect(cssShadowToDartList('1px 2px 3px 4px #FF0000'))
      .toContain('spreadRadius: 4.0');
    expect(cssShadowToDartList('1px 2px 3px 4px #FF0000'))
      .toContain('color: Color(0xFFFF0000)');
  });

  it('cssShadowToDartList — 다중 shadow 콤마 분리', () => {
    const out = cssShadowToDartList('0 1px 2px #000000, 0 4px 8px rgba(0, 0, 0, 0.5)');
    expect(out).toMatch(/^<BoxShadow>\[BoxShadow.*BoxShadow.*\]$/);
    expect(out).toContain('Color(0xFF000000)');
    expect(out).toContain('Color(0x80000000)'); // 0.5 * 255 = 127.5 → 128 = 0x80
  });

  it('cssShadowToDartList — 잘못된 형식 → 에러', () => {
    expect(() => cssShadowToDartList('not a shadow')).toThrow(/shadow/);
    expect(() => cssShadowToDartList('1px 2px')).toThrow(/토큰 수/);
  });

  /* ease */
  it('cssEaseToDartCubic — cubic-bezier 4 인자', () => {
    expect(cssEaseToDartCubic('cubic-bezier(0.4, 0, 0.2, 1)'))
      .toBe('Cubic(0.4, 0, 0.2, 1)');
  });

  it('cssEaseToDartCubic — named easing', () => {
    expect(cssEaseToDartCubic('ease-in-out')).toBe('Cubic(0.42, 0, 0.58, 1)');
    expect(cssEaseToDartCubic('linear')).toBe('Cubic(0, 0, 1, 1)');
  });

  it('cssEaseToDartCubic — 미지원 형식 → 에러', () => {
    expect(() => cssEaseToDartCubic('steps(4)')).toThrow(/cubic-bezier/);
  });

  /* gradient */
  it('cssGradientToDartLinear — 135deg 디폴트 primary', () => {
    const out = cssGradientToDartLinear('linear-gradient(135deg, #171717 0%, #525252 100%)');
    // 135deg → end = (sin135, -cos135) = (0.707, 0.707)
    expect(out).toContain('end: Alignment(0.707, 0.707)');
    expect(out).toContain('begin: Alignment(-0.707, -0.707)');
    expect(out).toContain('Color(0xFF171717)');
    expect(out).toContain('Color(0xFF525252)');
    expect(out).toContain('stops: <double>[0.00, 1.00]');
  });

  it('cssGradientToDartLinear — 0deg = 위로', () => {
    const out = cssGradientToDartLinear('linear-gradient(0deg, #FFFFFF 0%, #000000 100%)');
    // 0deg → end = topCenter (0, -1), begin = bottomCenter (0, 1)
    expect(out).toContain('begin: Alignment(0, 1)');
    expect(out).toContain('end: Alignment(0, -1)');
  });

  it('cssGradientToDartLinear — 180deg = 아래로', () => {
    const out = cssGradientToDartLinear('linear-gradient(180deg, #FFFFFF 0%, #000000 100%)');
    // 180deg → end = bottomCenter (0, 1), begin = topCenter (0, -1)
    expect(out).toContain('begin: Alignment(0, -1)');
    expect(out).toContain('end: Alignment(0, 1)');
  });

  it('cssGradientToDartLinear — 인자 부족 / 잘못된 angle → 에러', () => {
    expect(() => cssGradientToDartLinear('linear-gradient(135deg)')).toThrow(/인자 부족/);
    expect(() => cssGradientToDartLinear('linear-gradient(45, #fff 0%, #000 100%)')).toThrow(/<angle>deg/);
  });

  /* CSS pass-through builders */
  it('buildCssEasesBlock / buildCssGradientsBlock — 문자열 그대로', () => {
    const eases = { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.2, 0, 0, 1)' };
    expect(buildCssEasesBlock(eases)).toContain('--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);');
    const gradients = {
      primary: 'linear-gradient(135deg, #171717 0%, #525252 100%)',
      surface: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
      overlay: 'linear-gradient(180deg, #000000 0%, #1F1F1F 100%)',
    };
    expect(buildCssGradientsBlock(gradients))
      .toContain('--gradient-primary: linear-gradient(135deg, #171717 0%, #525252 100%);');
  });

  it('buildDart{Shadows,Eases,Gradients}Block — 4 카테고리 모두 변환', () => {
    expect(buildDartShadowsBlock({
      sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
      md: '0 4px 12px rgba(0, 0, 0, 0.12)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.18)',
    })).toContain('sm: <BoxShadow>[BoxShadow(');
    expect(buildDartEasesBlock({
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    })).toContain('standard: Cubic(0.4, 0, 0.2, 1),');
    expect(buildDartGradientsBlock({
      primary: 'linear-gradient(135deg, #171717 0%, #525252 100%)',
      surface: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
      overlay: 'linear-gradient(180deg, #000000 0%, #1F1F1F 100%)',
    })).toContain('primary: LinearGradient(begin:');
  });
});

describe('buildDartColorsBlock — inverse/subtle (v0.37.0+ direct self lookup)', () => {
  it('backgroundInverse 는 self 모드의 background-inverse 값을 그대로 사용', () => {
    const dart = buildDartColorsBlock(theme);
    expect(dart).toMatch(/static const light = ShUiColorTokens\([\s\S]*?backgroundInverse: Color\(0xFF222222\)/);
    expect(dart).toMatch(/static const dark = ShUiColorTokens\([\s\S]*?backgroundInverse: Color\(0xFFDDDDDD\)/);
  });
  it('foregroundInverse 도 self 룩업', () => {
    const dart = buildDartColorsBlock(theme);
    expect(dart).toMatch(/static const light = ShUiColorTokens\([\s\S]*?foregroundInverse: Color\(0xFFEEEEEE\)/);
    expect(dart).toMatch(/static const dark = ShUiColorTokens\([\s\S]*?foregroundInverse: Color\(0xFF111111\)/);
  });
  it('foregroundSubtle 도 self 룩업 (0.36.0 까지의 고정 기본값 폐기)', () => {
    const dart = buildDartColorsBlock(theme);
    expect(dart).toMatch(/static const light = ShUiColorTokens\([\s\S]*?foregroundSubtle: Color\(0xFF888888\)/);
    expect(dart).toMatch(/static const dark = ShUiColorTokens\([\s\S]*?foregroundSubtle: Color\(0xFF666666\)/);
  });
});
