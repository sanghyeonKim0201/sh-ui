import { describe, it, expect } from 'vitest';
import { extractThemeFromCss } from '../src/theme-extract.mjs';
import { decodeTheme } from '../src/create/theme/decode.js';

const VALID_TOKENS_CSS = `
:root {
  --background: #FFFFFF;
  --background-subtle: #FAFAFA;
  --background-muted: #F5F5F5;
  --background-inverse: #0A0A0A;
  --foreground: #0A0A0A;
  --foreground-muted: #525252;
  --foreground-subtle: #A3A3A3;
  --foreground-inverse: #FFFFFF;
  --border: #E5E5E5;
  --border-strong: #D4D4D4;
  --primary: #171717;
  --primary-foreground: #FAFAFA;
  --primary-hover: #262626;
  --danger: #DC2626;
  --danger-foreground: #FFFFFF;
  --danger-hover: #B91C1C;
  --ring: #A3A3A3;
  --radius: 0.5rem;
}
.dark {
  --background: #0A0A0A;
  --background-subtle: #171717;
  --background-muted: #262626;
  --background-inverse: #FFFFFF;
  --foreground: #FAFAFA;
  --foreground-muted: #A3A3A3;
  --foreground-subtle: #737373;
  --foreground-inverse: #0A0A0A;
  --border: #262626;
  --border-strong: #404040;
  --primary: #FAFAFA;
  --primary-foreground: #171717;
  --primary-hover: #E5E5E5;
  --danger: #DC2626;
  --danger-foreground: #FFFFFF;
  --danger-hover: #EF4444;
  --ring: #737373;
}
`;

describe('extractThemeFromCss', () => {
  it('정상 tokens.css → base64 round-trip 통과', () => {
    const { base64, theme } = extractThemeFromCss(VALID_TOKENS_CSS);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);
    // round-trip — decodeTheme 가 같은 모양으로 복원하는지
    const decoded = decodeTheme(base64);
    expect(decoded.light.primary).toBe('#171717');
    expect(decoded.dark.primary).toBe('#FAFAFA');
    expect(decoded.radius).toBe(0.5);
    expect(theme.light['danger-hover']).toBe('#B91C1C');
    expect(theme.dark.ring).toBe('#737373');
  });

  it(':root 가 없으면 throw', () => {
    expect(() => extractThemeFromCss('.dark { --x: 1; }')).toThrow(/:root/);
  });

  it('.dark 가 없으면 throw (light-only 모드 미지원)', () => {
    expect(() =>
      extractThemeFromCss(VALID_TOKENS_CSS.replace(/\.dark\s*\{[^}]*\}/, '')),
    ).toThrow(/\.dark/);
  });

  it('필수 키가 hex 가 아니면 안내 에러', () => {
    const broken = VALID_TOKENS_CSS.replace(
      '--primary: #171717;',
      '--primary: color-mix(in srgb, #000, white);',
    );
    expect(() => extractThemeFromCss(broken)).toThrow(/light\.primary/);
    expect(() => extractThemeFromCss(broken)).toThrow(/upgrade --replace/);
  });

  it('--radius 누락 시 throw', () => {
    const broken = VALID_TOKENS_CSS.replace('--radius: 0.5rem;', '');
    expect(() => extractThemeFromCss(broken)).toThrow(/--radius/);
  });

  it('옵셔널 키는 양쪽 다 있어야 emit (한쪽만이면 둘 다 skip)', () => {
    // light 에만 ring 두고 dark 에서 제거
    const partial = VALID_TOKENS_CSS.replace(/\n  --ring: #737373;/, '');
    const { theme } = extractThemeFromCss(partial);
    expect(theme.light.ring).toBeUndefined();
    expect(theme.dark.ring).toBeUndefined();
  });
});
