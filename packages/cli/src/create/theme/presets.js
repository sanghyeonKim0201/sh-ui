// 프로젝트 스캐폴드용 테마 프리셋. 사용자가 --theme <name> 또는 대화형 프롬프트에서
// 고르면 generator 가 tokens.css / sh_ui_tokens.dart 에 그대로 주입한다.
//
// 색은 shadcn/ui · Tailwind 팔레트를 참고해 light/dark 모두 충분한 명도 대비를 갖도록 잡았다.
// radius 만 살짝 변주해 프리셋 별 인상 차이를 더했다 (slate=0.375 sharp, rose=0.75 round, …).
//
// 새 프리셋을 추가하면 cli-args.js 의 VALID_THEME_PRESETS 에도 자동 반영된다 (이 파일에서 derive).

const NEUTRAL_LIGHT = {
  'background': '#FFFFFF',
  'background-subtle': '#FAFAFA',
  'background-muted': '#F5F5F5',
  'background-inverse': '#0A0A0A',
  'foreground': '#0A0A0A',
  'foreground-muted': '#525252',
  'foreground-subtle': '#A3A3A3',
  'foreground-inverse': '#FFFFFF',
  'border': '#E5E5E5',
  'border-strong': '#D4D4D4',
  'primary': '#171717',
  'primary-foreground': '#FAFAFA',
  'primary-hover': '#262626',
  // accent — 디폴트는 primary 와 동일. 사용자가 분리하고 싶을 때만 별 값으로 override.
  'accent': '#171717',
  'accent-foreground': '#FAFAFA',
  'accent-hover': '#262626',
  'danger': '#DC2626',
  'danger-foreground': '#FFFFFF',
  'danger-hover': '#B91C1C',
  'ring': '#A3A3A3',
  'success': '#16A34A',
  'success-foreground': '#FFFFFF',
  'warning': '#D97706',
  'warning-foreground': '#FFFFFF',
  'info': '#2563EB',
  'info-foreground': '#FFFFFF',
  'sidebar-bg': '#FAFAFA',
  'sidebar-fg': '#0A0A0A',
  'sidebar-border': '#E5E5E5',
  'sidebar-accent': '#F5F5F5',
  'sidebar-accent-fg': '#0A0A0A',
};

const NEUTRAL_DARK = {
  'background': '#0A0A0A',
  'background-subtle': '#171717',
  'background-muted': '#262626',
  'background-inverse': '#FFFFFF',
  'foreground': '#FAFAFA',
  'foreground-muted': '#A3A3A3',
  'foreground-subtle': '#737373',
  'foreground-inverse': '#0A0A0A',
  'border': '#262626',
  'border-strong': '#404040',
  'primary': '#FAFAFA',
  'primary-foreground': '#171717',
  'primary-hover': '#E5E5E5',
  // accent — 디폴트는 primary 와 동일. 사용자가 분리하고 싶을 때만 별 값으로 override.
  'accent': '#FAFAFA',
  'accent-foreground': '#171717',
  'accent-hover': '#E5E5E5',
  'danger': '#DC2626',
  'danger-foreground': '#FFFFFF',
  'danger-hover': '#EF4444',
  'ring': '#737373',
  'success': '#22C55E',
  'success-foreground': '#052E16',
  'warning': '#F59E0B',
  'warning-foreground': '#451A03',
  'info': '#3B82F6',
  'info-foreground': '#172554',
  'sidebar-bg': '#171717',
  'sidebar-fg': '#FAFAFA',
  'sidebar-border': '#262626',
  'sidebar-accent': '#262626',
  'sidebar-accent-fg': '#FAFAFA',
};

export const THEME_PRESETS = {
  neutral: {
    label: '뉴트럴 — 흑백 강조 (sh-ui 기본)',
    light: NEUTRAL_LIGHT,
    dark: NEUTRAL_DARK,
    radius: 0.5,
  },
  slate: {
    label: '슬레이트 — 차분한 슬레이트 + 인디고 (정보 밀도)',
    light: {
      'background': '#FFFFFF',
      'background-subtle': '#F8FAFC',
      'background-muted': '#F1F5F9',
      'background-inverse': '#0F172A',
      'foreground': '#0F172A',
      'foreground-muted': '#475569',
      'foreground-subtle': '#94A3B8',
      'foreground-inverse': '#F1F5F9',
      'border': '#E2E8F0',
      'border-strong': '#CBD5E1',
      'primary': '#4F46E5',
      'primary-foreground': '#FFFFFF',
      'primary-hover': '#4338CA',
      'accent': '#4F46E5',
      'accent-foreground': '#FFFFFF',
      'accent-hover': '#4338CA',
      'danger': '#DC2626',
      'danger-foreground': '#FFFFFF',
      'danger-hover': '#B91C1C',
      'ring': '#94A3B8',
      'success': '#16A34A',
      'success-foreground': '#FFFFFF',
      'warning': '#D97706',
      'warning-foreground': '#FFFFFF',
      'info': '#2563EB',
      'info-foreground': '#FFFFFF',
      'sidebar-bg': '#F8FAFC',
      'sidebar-fg': '#0F172A',
      'sidebar-border': '#E2E8F0',
      'sidebar-accent': '#F1F5F9',
      'sidebar-accent-fg': '#0F172A',
    },
    dark: {
      'background': '#0F172A',
      'background-subtle': '#1E293B',
      'background-muted': '#334155',
      'background-inverse': '#FFFFFF',
      'foreground': '#F1F5F9',
      'foreground-muted': '#94A3B8',
      'foreground-subtle': '#64748B',
      'foreground-inverse': '#0F172A',
      'border': '#334155',
      'border-strong': '#475569',
      'primary': '#818CF8',
      'primary-foreground': '#1E1B4B',
      'primary-hover': '#A5B4FC',
      'accent': '#818CF8',
      'accent-foreground': '#1E1B4B',
      'accent-hover': '#A5B4FC',
      'danger': '#F87171',
      'danger-foreground': '#450A0A',
      'danger-hover': '#FCA5A5',
      'ring': '#64748B',
      'success': '#22C55E',
      'success-foreground': '#052E16',
      'warning': '#F59E0B',
      'warning-foreground': '#451A03',
      'info': '#60A5FA',
      'info-foreground': '#172554',
      'sidebar-bg': '#1E293B',
      'sidebar-fg': '#F1F5F9',
      'sidebar-border': '#334155',
      'sidebar-accent': '#334155',
      'sidebar-accent-fg': '#F1F5F9',
    },
    radius: 0.375,
    // 정보 밀도 ↑ — 본문 14px 부터, 컨트롤 36px (대시보드/관리자 인상)
    typography: { xs: 11, sm: 12, base: 14, lg: 16, xl: 18, '2xl': 21, '3xl': 26, '4xl': 32 },
    controls: { sm: 28, md: 36, lg: 44 },
  },
  rose: {
    label: '로즈 — 핑크 강조 + 둥근 모서리 (친근·여유)',
    light: {
      ...NEUTRAL_LIGHT,
      'primary': '#E11D48',
      'primary-foreground': '#FFF1F2',
      'primary-hover': '#BE123C',
      'accent': '#E11D48',
      'accent-foreground': '#FFF1F2',
      'accent-hover': '#BE123C',
    },
    dark: {
      ...NEUTRAL_DARK,
      'primary': '#FB7185',
      'primary-foreground': '#4C0519',
      'primary-hover': '#FDA4AF',
      'accent': '#FB7185',
      'accent-foreground': '#4C0519',
      'accent-hover': '#FDA4AF',
    },
    radius: 0.75,
    // 큰 모서리 + 큼직한 컨트롤 — 소비자 앱 / 캐주얼 인상
    controls: { sm: 36, md: 44, lg: 52 },
  },
  emerald: {
    label: '에메랄드 — 그린 강조',
    light: {
      ...NEUTRAL_LIGHT,
      'primary': '#059669',
      'primary-foreground': '#ECFDF5',
      'primary-hover': '#047857',
      'accent': '#059669',
      'accent-foreground': '#ECFDF5',
      'accent-hover': '#047857',
    },
    dark: {
      ...NEUTRAL_DARK,
      'primary': '#34D399',
      'primary-foreground': '#022C22',
      'primary-hover': '#6EE7B7',
      'accent': '#34D399',
      'accent-foreground': '#022C22',
      'accent-hover': '#6EE7B7',
    },
    radius: 0.5,
  },
  violet: {
    label: '바이올렛 — 퍼플 강조 + 살짝 라운드 (모던·또렷)',
    light: {
      ...NEUTRAL_LIGHT,
      'primary': '#7C3AED',
      'primary-foreground': '#F5F3FF',
      'primary-hover': '#6D28D9',
      'accent': '#7C3AED',
      'accent-foreground': '#F5F3FF',
      'accent-hover': '#6D28D9',
    },
    dark: {
      ...NEUTRAL_DARK,
      'primary': '#A78BFA',
      'primary-foreground': '#1E1B4B',
      'primary-hover': '#C4B5FD',
      'accent': '#A78BFA',
      'accent-foreground': '#1E1B4B',
      'accent-hover': '#C4B5FD',
    },
    radius: 0.625,
    // 살짝 큰 컨트롤 + 진한 강조 보더 (creative/디자인 도구 인상)
    controls: { sm: 34, md: 42, lg: 50 },
    borders: { width: 1, widthStrong: 3 },
  },
};

export const THEME_PRESET_NAMES = Object.keys(THEME_PRESETS);

/**
 * 프리셋 객체에서 ThemeConfig 형태로 변환 — 사용자에게 보이는 label 빼고 모두 forward.
 * v0.39.0 부터 light/dark/radius 외에 옵셔널 카테고리(typography/controls/borders/...)
 * 도 그대로 전달돼 CLI inject 가 카테고리별 마커 섹션을 교체한다.
 */
export const getThemePreset = (name) => {
  const preset = THEME_PRESETS[name];
  if (!preset) return null;
  const { label: _label, ...themeConfig } = preset;
  return themeConfig;
};
