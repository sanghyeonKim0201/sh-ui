import { describe, it, expect } from 'vitest';
import {
  resolveTheme,
  resolveThemeFromConfigs,
} from '../src/create/theme/resolveTheme.js';

describe('resolveTheme — pure merge', () => {
  it('둘 다 null/undefined → null', () => {
    expect(resolveTheme(null, null)).toBe(null);
    expect(resolveTheme(undefined, undefined)).toBe(null);
  });

  it('한쪽만 있으면 그쪽 그대로', () => {
    const core = { base: 'neutral', radius: 'md' };
    expect(resolveTheme(core, null)).toBe(core);
    const app = { base: 'rose' };
    expect(resolveTheme(null, app)).toBe(app);
  });

  it('스칼라(base/radius/mode): app 값이 core 를 override', () => {
    const core = { base: 'neutral', radius: 'md', mode: 'light-dark' };
    const app = { base: 'rose' };
    const merged = resolveTheme(core, app);
    expect(merged.base).toBe('rose');             // app override
    expect(merged.radius).toBe('md');             // core 상속
    expect(merged.mode).toBe('light-dark');       // core 상속
  });

  it('extraTokens.{root,light,dark} deep-merge — app 키 우선, 누락 키는 core 상속', () => {
    const core = {
      base: 'neutral',
      extraTokens: {
        light: { 'accent-soft': '#E7EFEB', surface: '#FFFFFF' },
        dark:  { 'accent-soft': '#1F3F35', surface: '#1C1B17' },
        root:  { 'cta-bg': '#1A332C' },
      },
    };
    const app = {
      extraTokens: {
        light: { 'accent-soft': '#FCE7F3' },       // override
        // dark/root 미제공 → core 상속
      },
    };
    const merged = resolveTheme(core, app);
    expect(merged.extraTokens.light['accent-soft']).toBe('#FCE7F3'); // app 우선
    expect(merged.extraTokens.light.surface).toBe('#FFFFFF');        // core 상속
    expect(merged.extraTokens.dark['accent-soft']).toBe('#1F3F35');  // core 전체 상속
    expect(merged.extraTokens.root['cta-bg']).toBe('#1A332C');       // core 상속
  });

  it('core 에 extraTokens 없고 app 에만 있으면 app extraTokens 그대로', () => {
    const core = { base: 'neutral' };
    const app = {
      extraTokens: { light: { surface: '#FFFFFF' } },
    };
    const merged = resolveTheme(core, app);
    expect(merged.extraTokens.light.surface).toBe('#FFFFFF');
  });

  it('resolveThemeFromConfigs — config 객체로부터 theme 추출 + 머지', () => {
    const coreConfig = {
      theme: { base: 'neutral', extraTokens: { light: { surface: '#FFFFFF' } } },
    };
    const appConfig = {
      theme: { extraTokens: { light: { 'accent-soft': '#E7EFEB' } } },
    };
    const merged = resolveThemeFromConfigs(coreConfig, appConfig);
    expect(merged.base).toBe('neutral');
    expect(merged.extraTokens.light.surface).toBe('#FFFFFF');
    expect(merged.extraTokens.light['accent-soft']).toBe('#E7EFEB');
  });

  it('config 에 theme 필드 없는 경우 안전 처리 (null/null → null)', () => {
    expect(resolveThemeFromConfigs({}, {})).toBe(null);
    expect(resolveThemeFromConfigs(null, null)).toBe(null);
  });
});
