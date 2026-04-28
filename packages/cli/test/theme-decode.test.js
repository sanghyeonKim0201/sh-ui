import { describe, it, expect } from 'vitest';
import { decodeTheme } from '../src/create/theme/decode.js';

const validTheme = {
  light: {
    background: '#FFFFFF', 'background-subtle': '#FAFAFA', 'background-muted': '#F5F5F5',
    foreground: '#0A0A0A', 'foreground-muted': '#525252',
    border: '#E5E5E5', 'border-strong': '#D4D4D4',
    primary: '#171717', 'primary-foreground': '#FAFAFA', 'primary-hover': '#262626',
    danger: '#DC2626', 'danger-foreground': '#FFFFFF',
  },
  dark: {
    background: '#0A0A0A', 'background-subtle': '#171717', 'background-muted': '#262626',
    foreground: '#FAFAFA', 'foreground-muted': '#A3A3A3',
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
