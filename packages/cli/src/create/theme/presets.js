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
  'danger': '#DC2626',
  'danger-foreground': '#FFFFFF',
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
  'danger': '#DC2626',
  'danger-foreground': '#FFFFFF',
};

export const THEME_PRESETS = {
  neutral: {
    label: '뉴트럴 — 흑백 강조 (sh-ui 기본)',
    light: NEUTRAL_LIGHT,
    dark: NEUTRAL_DARK,
    radius: 0.5,
  },
  slate: {
    label: '슬레이트 — 차분한 슬레이트 + 인디고',
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
      'danger': '#DC2626',
      'danger-foreground': '#FFFFFF',
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
      'danger': '#F87171',
      'danger-foreground': '#450A0A',
    },
    radius: 0.375,
  },
  rose: {
    label: '로즈 — 핑크 강조 + 둥근 모서리',
    light: {
      ...NEUTRAL_LIGHT,
      'primary': '#E11D48',
      'primary-foreground': '#FFF1F2',
      'primary-hover': '#BE123C',
    },
    dark: {
      ...NEUTRAL_DARK,
      'primary': '#FB7185',
      'primary-foreground': '#4C0519',
      'primary-hover': '#FDA4AF',
    },
    radius: 0.75,
  },
  emerald: {
    label: '에메랄드 — 그린 강조',
    light: {
      ...NEUTRAL_LIGHT,
      'primary': '#059669',
      'primary-foreground': '#ECFDF5',
      'primary-hover': '#047857',
    },
    dark: {
      ...NEUTRAL_DARK,
      'primary': '#34D399',
      'primary-foreground': '#022C22',
      'primary-hover': '#6EE7B7',
    },
    radius: 0.5,
  },
  violet: {
    label: '바이올렛 — 퍼플 강조 + 살짝 라운드',
    light: {
      ...NEUTRAL_LIGHT,
      'primary': '#7C3AED',
      'primary-foreground': '#F5F3FF',
      'primary-hover': '#6D28D9',
    },
    dark: {
      ...NEUTRAL_DARK,
      'primary': '#A78BFA',
      'primary-foreground': '#1E1B4B',
      'primary-hover': '#C4B5FD',
    },
    radius: 0.625,
  },
};

export const THEME_PRESET_NAMES = Object.keys(THEME_PRESETS);

/** 프리셋 객체에서 inject 가 기대하는 ThemeConfig 형태(light/dark/radius)만 추출 */
export const getThemePreset = (name) => {
  const preset = THEME_PRESETS[name];
  if (!preset) return null;
  return { light: preset.light, dark: preset.dark, radius: preset.radius };
};
