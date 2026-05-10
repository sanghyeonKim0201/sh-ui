import { describe, it, expect } from 'vitest';
import { parseDartTokens, diffDartTokens } from '../src/tokens-diff-dart.mjs';

const SAMPLE = `
@immutable
class ShUiColorTokens {
  static const light = ShUiColorTokens(
    background: Color(0xFFFFFFFF),
    foreground: Color(0xFF0A0A0A),
    primary: Color(0xFF171717),
  );
  static const dark = ShUiColorTokens(
    background: Color(0xFF0A0A0A),
    foreground: Color(0xFFFAFAFA),
    primary: Color(0xFFFAFAFA),
  );
}
class ShUiRadiusTokens {
  static const tokens = ShUiRadiusTokens(defaultRadius: 8.0);
}
`;

describe('parseDartTokens', () => {
  it('static const 블록들을 ClassName.staticName 키로 평탄화', () => {
    const out = parseDartTokens(SAMPLE);
    expect(Object.keys(out).sort()).toEqual([
      'ShUiColorTokens.dark',
      'ShUiColorTokens.light',
      'ShUiRadiusTokens.tokens',
    ]);
    expect(out['ShUiColorTokens.light']).toEqual({
      background: 'Color(0xFFFFFFFF)',
      foreground: 'Color(0xFF0A0A0A)',
      primary: 'Color(0xFF171717)',
    });
    expect(out['ShUiRadiusTokens.tokens'].defaultRadius).toBe('8.0');
  });

  it('Duration / Cubic 같은 nested 함수 호출도 보존', () => {
    const dart = `static const tokens = ShUiDurationTokens(fast: Duration(milliseconds: 120), base: Duration(milliseconds: 160));`;
    const out = parseDartTokens(dart);
    expect(out['ShUiDurationTokens.tokens'].fast).toBe('Duration(milliseconds: 120)');
  });

  it('list literal 도 컴마 분리에 안 깨짐', () => {
    const dart = `static const tokens = ShUiShadowTokens(sm: <BoxShadow>[BoxShadow(offset: Offset(0.0, 1.0), blurRadius: 2.0, spreadRadius: 0.0, color: Color(0x14000000))]);`;
    const out = parseDartTokens(dart);
    expect(out['ShUiShadowTokens.tokens'].sm).toContain('<BoxShadow>[');
  });
});

describe('diffDartTokens', () => {
  it('block 단위 added / changed / removed 분류', () => {
    const cur = parseDartTokens(SAMPLE);
    const expected = parseDartTokens(`
      class ShUiColorTokens {
        static const light = ShUiColorTokens(
          background: Color(0xFFFFFFFF),
          foreground: Color(0xFF0A0A0A),
          primary: Color(0xFF000000),
          ring: Color(0xFFA3A3A3),
        );
        static const dark = ShUiColorTokens(
          background: Color(0xFF0A0A0A),
          foreground: Color(0xFFFAFAFA),
          primary: Color(0xFFFAFAFA),
        );
      }
      class ShUiRadiusTokens {
        static const tokens = ShUiRadiusTokens(defaultRadius: 8.0);
      }
    `);
    const d = diffDartTokens(cur, expected);
    expect(d.added).toEqual([
      { selector: 'ShUiColorTokens.light', name: 'ring', value: 'Color(0xFFA3A3A3)' },
    ]);
    expect(d.changed).toEqual([
      {
        selector: 'ShUiColorTokens.light',
        name: 'primary',
        expected: 'Color(0xFF000000)',
        current: 'Color(0xFF171717)',
      },
    ]);
    expect(d.removed).toEqual([]);
  });

  it('매칭 selector 가 한쪽에만 있으면 그쪽 fields 가 added/removed 로', () => {
    const cur = parseDartTokens(`class ShUiX { static const tokens = ShUiX(a: 1.0); }`);
    const exp = parseDartTokens(`class ShUiY { static const tokens = ShUiY(b: 2.0); }`);
    const d = diffDartTokens(cur, exp);
    expect(d.added).toEqual([{ selector: 'ShUiY.tokens', name: 'b', value: '2.0' }]);
    expect(d.removed).toEqual([{ selector: 'ShUiX.tokens', name: 'a', value: '1.0' }]);
  });
});
