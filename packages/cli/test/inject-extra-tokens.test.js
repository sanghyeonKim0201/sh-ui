import { describe, it, expect } from 'vitest';
import { buildCssColorsBlock } from '../src/create/theme/inject.js';

// 최소 theme — TOKEN_KEYS 9개만 (필수). 확장은 extraTokens 로.
const minimalTheme = () => ({
  light: {
    background: '#FAFAFA',
    'background-subtle': '#F2F2F2',
    'background-muted': '#E8E8E8',
    'background-inverse': '#181818',
    foreground: '#1A1A1A',
    'foreground-muted': '#666666',
    'foreground-subtle': '#9A9A9A',
    'foreground-inverse': '#F5F5F5',
    border: '#E4E4E4',
    'border-strong': '#D2D2D2',
    primary: '#2F5D4F',
    'primary-foreground': '#FAFAFA',
    'primary-hover': '#264C40',
    danger: '#B83A2A',
    'danger-foreground': '#FAFAFA',
    ring: '#2F5D4F',
  },
  dark: {
    background: '#14130F',
    'background-subtle': '#1C1B17',
    'background-muted': '#25241F',
    'background-inverse': '#FAF7F2',
    foreground: '#F2EFE8',
    'foreground-muted': '#9A958C',
    'foreground-subtle': '#6B6661',
    'foreground-inverse': '#14130F',
    border: '#2E2C26',
    'border-strong': '#403D35',
    primary: '#5BA886',
    'primary-foreground': '#14130F',
    'primary-hover': '#6FB897',
    danger: '#D85A4A',
    'danger-foreground': '#14130F',
    ring: '#5BA886',
  },
});

describe('buildCssColorsBlock — extraTokens emit (v0.111.0+)', () => {
  it('extraTokens 없으면 기존 동작 유지 (회귀 가드)', () => {
    const out = buildCssColorsBlock(minimalTheme());
    expect(out).toContain(':root {');
    expect(out).toContain('--background: #FAFAFA;');
    expect(out).toContain('.dark {');
    // 외부 토큰이 없어야 함
    expect(out).not.toMatch(/--accent-soft:/);
    expect(out).not.toMatch(/--cta-bg:/);
  });

  it('extraTokens.light → :root 에 emit', () => {
    const theme = {
      ...minimalTheme(),
      extraTokens: {
        light: { 'accent-soft': '#E7EFEB', surface: '#FFFFFF' },
      },
    };
    const out = buildCssColorsBlock(theme);
    // light 블록(:root) 안에 들어가야 한다
    const rootBlock = out.match(/:root \{[^}]*\}/)?.[0] ?? '';
    expect(rootBlock).toContain('--accent-soft: #E7EFEB;');
    expect(rootBlock).toContain('--surface: #FFFFFF;');
  });

  it('extraTokens.dark → @media dark + .dark 양쪽에 emit', () => {
    const theme = {
      ...minimalTheme(),
      extraTokens: {
        dark: { 'accent-soft': '#1F3F35' },
      },
    };
    const out = buildCssColorsBlock(theme);
    // @media dark 블록 내부
    const mediaBlock = out.match(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\n  \}\n\}/)?.[0] ?? '';
    expect(mediaBlock).toContain('--accent-soft: #1F3F35;');
    // .dark 블록 내부
    const darkBlock = out.match(/\.dark \{[^}]*\}/)?.[0] ?? '';
    expect(darkBlock).toContain('--accent-soft: #1F3F35;');
  });

  it('extraTokens.root → :root 에만 emit (dark 블록 어디에도 없음 — cascade 의도)', () => {
    const theme = {
      ...minimalTheme(),
      extraTokens: {
        root: { 'cta-bg': '#1A332C', 'cta-fg': '#F2EFE8' },
      },
    };
    const out = buildCssColorsBlock(theme);
    const rootBlock = out.match(/:root \{[^}]*\}/)?.[0] ?? '';
    expect(rootBlock).toContain('--cta-bg: #1A332C;');
    expect(rootBlock).toContain('--cta-fg: #F2EFE8;');
    // dark 어디에도 없어야 (mode-independent, light 의 :root 정의가 cascade 됨)
    const mediaBlock = out.match(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\n  \}\n\}/)?.[0] ?? '';
    expect(mediaBlock).not.toContain('--cta-bg:');
    const darkBlock = out.match(/\.dark \{[^}]*\}/)?.[0] ?? '';
    expect(darkBlock).not.toContain('--cta-bg:');
  });

  it("키에 '--' 접두가 있어도 안전 (slice 처리)", () => {
    const theme = {
      ...minimalTheme(),
      extraTokens: {
        light: { '--surface': '#FFFFFF' },  // 사용자가 -- 붙여서 적어도
      },
    };
    const out = buildCssColorsBlock(theme);
    // 중복 -- 없이 한 번만
    expect(out).toContain('--surface: #FFFFFF;');
    expect(out).not.toContain('----surface');
  });
});
