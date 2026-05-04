import { describe, it, expect } from 'vitest';
import { encodeTheme } from '../src/create/theme/encode.js';
import { decodeTheme } from '../src/create/theme/decode.js';

const validTheme = {
  light: {
    background: '#FFFFFF', 'background-subtle': '#FAFAFA', 'background-muted': '#F5F5F5',
    'background-inverse': '#0A0A0A',
    foreground: '#0A0A0A', 'foreground-muted': '#525252',
    'foreground-subtle': '#A3A3A3', 'foreground-inverse': '#FFFFFF',
    border: '#E5E5E5', 'border-strong': '#D4D4D4',
    primary: '#7C3AED', 'primary-foreground': '#F5F3FF', 'primary-hover': '#6D28D9',
    danger: '#DC2626', 'danger-foreground': '#FFFFFF',
  },
  dark: {
    background: '#0E0F11', 'background-subtle': '#15171B', 'background-muted': '#272930',
    'background-inverse': '#FFFFFF',
    foreground: '#E2E2E5', 'foreground-muted': '#8A8B92',
    'foreground-subtle': '#5C5D63', 'foreground-inverse': '#0E0F11',
    border: '#232429', 'border-strong': '#34353B',
    primary: '#8B7FD6', 'primary-foreground': '#F5F3FF', 'primary-hover': '#A095E0',
    danger: '#E5484D', 'danger-foreground': '#FFFFFF',
  },
  radius: 0.625,
};

describe('encodeTheme', () => {
  it('정상 입력 → base64 문자열', () => {
    const b64 = encodeTheme(validTheme);
    expect(typeof b64).toBe('string');
    expect(b64.length).toBeGreaterThan(0);
  });

  it('round-trip — encode → decode 결과가 입력과 동일', () => {
    const b64 = encodeTheme(validTheme);
    expect(decodeTheme(b64)).toEqual(validTheme);
  });

  it('객체가 아닌 입력 → 에러', () => {
    expect(() => encodeTheme(null)).toThrow(/객체가 아님/);
    expect(() => encodeTheme('foo')).toThrow(/객체가 아님/);
    expect(() => encodeTheme([])).toThrow(/객체가 아님/);
  });

  it('스키마에 안 맞는 입력 → 디코더가 거부 (round-trip 검증)', () => {
    // 키 누락
    const broken = { ...validTheme, light: { ...validTheme.light } };
    delete broken.light.primary;
    expect(() => encodeTheme(broken)).toThrow(/light\.primary/);

    // hex 형식 위배
    const badHex = {
      ...validTheme,
      dark: { ...validTheme.dark, primary: 'rebeccapurple' },
    };
    expect(() => encodeTheme(badHex)).toThrow(/hex/);

    // radius 범위 초과
    const badRadius = { ...validTheme, radius: 9 };
    expect(() => encodeTheme(badRadius)).toThrow(/radius/);
  });

  it('옵셔널 색 토큰 포함 round-trip', () => {
    const t = {
      ...validTheme,
      light: { ...validTheme.light, success: '#16A34A', warning: '#D97706', info: '#0EA5E9' },
      dark: { ...validTheme.dark, success: '#22C55E', warning: '#F59E0B', info: '#38BDF8' },
    };
    expect(decodeTheme(encodeTheme(t))).toEqual(t);
  });

  it('옵셔널 카테고리(spacing 등) 포함 round-trip', () => {
    const t = {
      ...validTheme,
      spacing: { '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '8': 32, '10': 40, '12': 48, '16': 64 },
    };
    expect(decodeTheme(encodeTheme(t))).toEqual(t);
  });
});
