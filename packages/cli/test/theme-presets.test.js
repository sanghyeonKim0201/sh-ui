import { describe, it, expect } from 'vitest';
import { resolveTheme, TOKEN_KEYS } from '../src/create/theme/decode.js';
import { THEME_PRESETS, THEME_PRESET_NAMES, getThemePreset } from '../src/create/theme/presets.js';

describe('THEME_PRESETS', () => {
  it('5개 프리셋이 노출된다 — neutral, slate, rose, emerald, violet', () => {
    expect(THEME_PRESET_NAMES).toEqual(['neutral', 'slate', 'rose', 'emerald', 'violet']);
  });

  it('각 프리셋은 light/dark 에 모든 TOKEN_KEYS 를 hex 로 가진다', () => {
    const HEX = /^#[0-9A-Fa-f]{6}$/;
    for (const [name, preset] of Object.entries(THEME_PRESETS)) {
      for (const mode of ['light', 'dark']) {
        for (const key of TOKEN_KEYS) {
          expect(preset[mode][key], `${name}.${mode}.${key}`).toMatch(HEX);
        }
      }
      expect(typeof preset.radius, `${name}.radius`).toBe('number');
      expect(preset.radius).toBeGreaterThanOrEqual(0);
      expect(preset.radius).toBeLessThanOrEqual(1.5);
      expect(typeof preset.label).toBe('string');
    }
  });

  it('getThemePreset — 알려진 이름이면 ThemeConfig 반환 (label 제외, 옵셔널 카테고리 포함)', () => {
    const preset = getThemePreset('rose');
    expect(preset).not.toBeNull();
    // rose 는 컨트롤 크기를 차별화 — 색·radius·controls 가 들어 있어야 함, label 은 없어야 함
    expect(preset).toHaveProperty('light');
    expect(preset).toHaveProperty('dark');
    expect(preset).toHaveProperty('radius');
    expect(preset).toHaveProperty('controls');
    expect(preset).not.toHaveProperty('label');
  });

  it('getThemePreset — neutral 은 옵셔널 카테고리 없음 (디폴트와 동일)', () => {
    const preset = getThemePreset('neutral');
    expect(preset).not.toBeNull();
    expect(Object.keys(preset).sort()).toEqual(['dark', 'light', 'radius']);
  });

  it('getThemePreset — slate 는 typography + controls 모두 차별화', () => {
    const preset = getThemePreset('slate');
    expect(preset.typography).toEqual({
      xs: 11, sm: 12, base: 14, lg: 16, xl: 18, '2xl': 21, '3xl': 26, '4xl': 32,
    });
    expect(preset.controls).toEqual({ sm: 28, md: 36, lg: 44 });
  });

  it('getThemePreset — violet 은 borders 도 차별화 (widthStrong 3px)', () => {
    const preset = getThemePreset('violet');
    expect(preset.borders).toEqual({ width: 1, widthStrong: 3 });
    expect(preset.controls).toEqual({ sm: 34, md: 42, lg: 50 });
  });

  it('getThemePreset — 모르는 이름이면 null', () => {
    expect(getThemePreset('unknown')).toBeNull();
  });
});

describe('resolveTheme', () => {
  it('프리셋 이름 → ThemeConfig 객체', () => {
    const theme = resolveTheme('emerald');
    expect(theme.light.primary).toBe('#059669');
    expect(theme.dark.primary).toBe('#34D399');
  });

  it('프리셋 오타 → 친절한 에러 (지원 목록 표시)', () => {
    expect(() => resolveTheme('rsoe')).toThrow(/알 수 없는 테마 프리셋.*neutral.*slate/);
  });

  it('정상 base64 → decodeTheme 위임', () => {
    const theme = {
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
    const b64 = Buffer.from(JSON.stringify(theme), 'utf-8').toString('base64');
    expect(resolveTheme(b64)).toEqual(theme);
  });

  it('문자열 아님 → 에러', () => {
    expect(() => resolveTheme(null)).toThrow(/문자열이 아님/);
    expect(() => resolveTheme(123)).toThrow(/문자열이 아님/);
  });
});
