/**
 * sh-ui-cli 외부 노출 API 의 타입 선언.
 * apps/docs 등 TypeScript 사용자가 자동완성과 타입 안전을 받을 수 있게.
 */

export type CreatePlatform = 'next' | 'flutter';
export type CreateStructure = 'standalone' | 'monorepo';
export type InitPlatform = 'react' | 'flutter';
export type ThemeBase = 'neutral' | 'zinc' | 'slate';
export type ThemeRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ThemeMode = 'light-dark' | 'light' | 'dark';

/** 현재 실제로 동작하는 CSS 프레임워크.
 * - plain: 모든 컴포넌트가 plain 변종 보유.
 * - tailwind: 일부 컴포넌트가 utility-class 변종 보유 — 미지원 컴포넌트는 add 시 plain 으로 자동 fallback. */
export type CssFrameworkSupported = 'plain' | 'tailwind';
/** 향후 추가 예정 — UI 에서 "곧 지원" 으로 노출되지만 CLI 는 거부. */
export type CssFrameworkPlanned = 'css-modules' | 'vanilla-extract';
/** 알려진 전체 (validation 메시지용). */
export type CssFramework = CssFrameworkSupported | CssFrameworkPlanned;

export const CREATE_PLATFORMS: readonly CreatePlatform[];
export const CREATE_STRUCTURES: readonly CreateStructure[];
export const INIT_PLATFORMS: readonly InitPlatform[];
export const THEME_BASES: readonly ThemeBase[];
export const THEME_RADII: readonly ThemeRadius[];
export const THEME_MODES: readonly ThemeMode[];
export const CSS_FRAMEWORKS_SUPPORTED: readonly CssFrameworkSupported[];
export const CSS_FRAMEWORKS_PLANNED: readonly CssFrameworkPlanned[];
export const CSS_FRAMEWORKS_ALL: readonly CssFramework[];
export const CSS_FRAMEWORK_DEFAULT: CssFrameworkSupported;

export const INIT_DEFAULTS: {
  platform: InitPlatform;
  base: ThemeBase;
  radius: ThemeRadius;
  mode: ThemeMode;
  cssFramework: CssFrameworkSupported;
};

export type PluginManifest = {
  name: string;
  label: string;
  description?: string;
  priority: number;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  envVars?: string[];
  turboEnvVars?: string[];
  imports?: string[];
  providerImports?: string[];
  providerWrappers?: Array<{ open: string; close: string } | string>;
  files?: Record<string, string>;
};

export const allPlugins: readonly PluginManifest[];

/* ─────── 테마 프리셋 ─────── */

export type ThemePresetName = 'neutral' | 'slate' | 'rose' | 'emerald' | 'violet';

/** decode.js 의 TOKEN_KEYS — light/dark 양쪽이 가져야 하는 키 12개. */
export type ThemeTokenKey =
  | 'background' | 'background-subtle' | 'background-muted'
  | 'foreground' | 'foreground-muted'
  | 'border' | 'border-strong'
  | 'primary' | 'primary-foreground' | 'primary-hover'
  | 'danger' | 'danger-foreground';

export interface ThemePreset {
  /** UI 에 표시할 사람이 읽는 라벨. */
  label: string;
  light: Record<ThemeTokenKey, string>;
  dark: Record<ThemeTokenKey, string>;
  /** rem 단위 (0~1.5). */
  radius: number;
  /** v0.39.0+ — 프리셋 별 정체성 차별화 (옵셔널). decode.js SCALAR_CATEGORIES 와 동일 키. */
  typography?: Record<string, number>;
  controls?: Record<string, number>;
  borders?: Record<string, number>;
  spacing?: Record<string, number>;
  weights?: Record<string, number>;
  durations?: Record<string, number>;
}

export const THEME_PRESETS: Record<ThemePresetName, ThemePreset>;
export const THEME_PRESET_NAMES: readonly ThemePresetName[];
