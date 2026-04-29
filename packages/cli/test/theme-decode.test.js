import { describe, it, expect } from 'vitest';
import { decodeTheme } from '../src/create/theme/decode.js';

const validTheme = {
  light: {
    background: '#FFFFFF', 'background-subtle': '#FAFAFA', 'background-muted': '#F5F5F5',
    'background-inverse': '#0A0A0A',
    foreground: '#0A0A0A', 'foreground-muted': '#525252',
    'foreground-subtle': '#A3A3A3', 'foreground-inverse': '#FFFFFF',
    border: '#E5E5E5', 'border-strong': '#D4D4D4',
    primary: '#171717', 'primary-foreground': '#FAFAFA', 'primary-hover': '#262626',
    danger: '#DC2626', 'danger-foreground': '#FFFFFF',
  },
  dark: {
    background: '#0A0A0A', 'background-subtle': '#171717', 'background-muted': '#262626',
    'background-inverse': '#FFFFFF',
    foreground: '#FAFAFA', 'foreground-muted': '#A3A3A3',
    'foreground-subtle': '#737373', 'foreground-inverse': '#0A0A0A',
    border: '#262626', 'border-strong': '#404040',
    primary: '#FAFAFA', 'primary-foreground': '#171717', 'primary-hover': '#E5E5E5',
    danger: '#DC2626', 'danger-foreground': '#FFFFFF',
  },
  radius: 0.5,
};

const toBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64');

describe('decodeTheme', () => {
  it('정상 base64 → theme 객체', () => {
    const b64 = toBase64(validTheme);
    expect(decodeTheme(b64)).toEqual(validTheme);
  });

  it('잘못된 base64 → 에러', () => {
    expect(() => decodeTheme('!!!not-base64!!!')).toThrow(/theme 디코드 실패/);
  });

  it('JSON 파싱 실패 → 에러', () => {
    const b64 = Buffer.from('not json', 'utf-8').toString('base64');
    expect(() => decodeTheme(b64)).toThrow(/theme 디코드 실패/);
  });

  it('light 키 누락 → 에러 메시지가 어떤 키가 빠졌는지 알려줌', () => {
    const broken = { ...validTheme, light: { ...validTheme.light } };
    delete broken.light.background;
    const b64 = toBase64(broken);
    expect(() => decodeTheme(b64)).toThrow(/light\.background/);
  });

  it('radius 타입 오류 → 에러', () => {
    const broken = { ...validTheme, radius: 'half' };
    const b64 = toBase64(broken);
    expect(() => decodeTheme(b64)).toThrow(/radius/);
  });

  it('radius 범위 초과 → 에러', () => {
    const broken = { ...validTheme, radius: 5 };
    const b64 = toBase64(broken);
    expect(() => decodeTheme(b64)).toThrow(/radius.*범위/);
  });

  it('hex 포맷 아님 → 에러', () => {
    const broken = { ...validTheme, light: { ...validTheme.light, background: 'red' } };
    const b64 = toBase64(broken);
    expect(() => decodeTheme(b64)).toThrow(/hex/);
  });

  it('10KB 초과 입력 → 크기 상한 초과 에러', () => {
    const oversized = 'A'.repeat(10 * 1024 + 1);
    expect(() => decodeTheme(oversized)).toThrow(/theme 크기가 허용 범위/);
  });

  it('10KB 경계 — 정확히 10KB 는 크기 검사 통과 (다른 검증에서 거부될 수 있음)', () => {
    const boundary = 'A'.repeat(10 * 1024);
    // 크기는 통과하지만 JSON 파싱·스키마 검증에서 거부됨
    expect(() => decodeTheme(boundary)).toThrow(/theme 디코드 실패/);
    expect(() => decodeTheme(boundary)).not.toThrow(/크기가 허용 범위/);
  });
});

describe('decodeTheme — 옵셔널 카테고리 (Phase 2)', () => {
  const toBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64');

  it('spacing 카테고리 — 정상이면 통과', () => {
    const t = {
      ...validTheme,
      spacing: { '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '8': 32, '10': 40, '12': 48, '16': 64 },
    };
    expect(decodeTheme(toBase64(t))).toEqual(t);
  });

  it('spacing 키 누락 → 에러', () => {
    const t = { ...validTheme, spacing: { '0': 0, '1': 4 } };
    expect(() => decodeTheme(toBase64(t))).toThrow(/spacing\.2 누락/);
  });

  it('spacing 음수 → 에러', () => {
    const full = Object.fromEntries(['0','1','2','3','4','5','6','8','10','12','16'].map(k => [k, 4]));
    const t = { ...validTheme, spacing: { ...full, '4': -1 } };
    expect(() => decodeTheme(toBase64(t))).toThrow(/spacing\.4 가 음수/);
  });

  it('typography 정상 통과', () => {
    const t = {
      ...validTheme,
      typography: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 },
    };
    expect(decodeTheme(toBase64(t))).toEqual(t);
  });

  it('typography 알 수 없는 키 → 에러', () => {
    const full = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 };
    const t = { ...validTheme, typography: { ...full, '5xl': 48 } };
    expect(() => decodeTheme(toBase64(t))).toThrow(/typography\.5xl 는 알 수 없는 키/);
  });

  it('weights / controls / borders / durations 모두 통과', () => {
    const t = {
      ...validTheme,
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      controls: { sm: 32, md: 40, lg: 48 },
      borders: { width: 1, widthStrong: 2 },
      durations: { fast: 120, base: 160, slow: 200 },
    };
    expect(decodeTheme(toBase64(t))).toEqual(t);
  });

  it('카테고리 누락은 OK — 옵셔널', () => {
    expect(decodeTheme(toBase64(validTheme))).toEqual(validTheme);
  });

  it('카테고리가 객체가 아님 → 에러', () => {
    const t = { ...validTheme, spacing: 'oops' };
    expect(() => decodeTheme(toBase64(t))).toThrow(/spacing 가 객체가 아님/);
  });
});
