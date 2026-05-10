import { describe, it, expect } from 'vitest';
import { extractThemeFromDart } from '../src/theme-extract.mjs';
import { decodeTheme } from '../src/create/theme/decode.js';

const VALID_DART = `
@immutable
class ShUiColorTokens {
  final Color background;
  final Color backgroundSubtle;
  final Color backgroundMuted;
  final Color backgroundInverse;
  final Color foreground;
  final Color foregroundMuted;
  final Color foregroundSubtle;
  final Color foregroundInverse;
  final Color border;
  final Color borderStrong;
  final Color primary;
  final Color primaryForeground;
  final Color primaryHover;
  final Color danger;
  final Color dangerForeground;
  final Color dangerHover;
  final Color ring;

  const ShUiColorTokens({...});

  static const light = ShUiColorTokens(
    background: Color(0xFFFFFFFF),
    backgroundSubtle: Color(0xFFFAFAFA),
    backgroundMuted: Color(0xFFF5F5F5),
    backgroundInverse: Color(0xFF0A0A0A),
    foreground: Color(0xFF0A0A0A),
    foregroundMuted: Color(0xFF525252),
    foregroundSubtle: Color(0xFFA3A3A3),
    foregroundInverse: Color(0xFFFFFFFF),
    border: Color(0xFFE5E5E5),
    borderStrong: Color(0xFFD4D4D4),
    primary: Color(0xFF171717),
    primaryForeground: Color(0xFFFAFAFA),
    primaryHover: Color(0xFF262626),
    danger: Color(0xFFDC2626),
    dangerForeground: Color(0xFFFFFFFF),
    dangerHover: Color(0xFFB91C1C),
    ring: Color(0xFFA3A3A3),
  );

  static const dark = ShUiColorTokens(
    background: Color(0xFF0A0A0A),
    backgroundSubtle: Color(0xFF171717),
    backgroundMuted: Color(0xFF262626),
    backgroundInverse: Color(0xFFFFFFFF),
    foreground: Color(0xFFFAFAFA),
    foregroundMuted: Color(0xFFA3A3A3),
    foregroundSubtle: Color(0xFF737373),
    foregroundInverse: Color(0xFF0A0A0A),
    border: Color(0xFF262626),
    borderStrong: Color(0xFF404040),
    primary: Color(0xFFFAFAFA),
    primaryForeground: Color(0xFF171717),
    primaryHover: Color(0xFFE5E5E5),
    danger: Color(0xFFDC2626),
    dangerForeground: Color(0xFFFFFFFF),
    dangerHover: Color(0xFFEF4444),
    ring: Color(0xFF737373),
  );
}

class ShUiRadiusTokens {
  static const tokens = ShUiRadiusTokens(defaultRadius: 8.0);
}
`;

describe('extractThemeFromDart', () => {
  it('Dart 토큰 → base64 round-trip', () => {
    const { base64, theme } = extractThemeFromDart(VALID_DART);
    const decoded = decodeTheme(base64);
    expect(decoded.light.primary).toBe('#171717');
    expect(decoded.dark.primary).toBe('#FAFAFA');
    expect(decoded.radius).toBe(0.5); // 8.0 / 16
    expect(theme.light['danger-hover']).toBe('#B91C1C');
  });

  it('static const light 블록 없으면 throw', () => {
    expect(() => extractThemeFromDart('class X {}')).toThrow(/light/);
  });

  it('defaultRadius 없으면 throw', () => {
    const broken = VALID_DART.replace(/static const tokens[^;]+;/, '');
    expect(() => extractThemeFromDart(broken)).toThrow(/defaultRadius/);
  });
});
