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
 * - tailwind: 모든 styled 컴포넌트가 utility-class 변종 보유.
 * - css-modules: 모든 styled 컴포넌트가 .module.css 변종 보유. */
export type CssFrameworkSupported = 'plain' | 'tailwind' | 'css-modules';
/** 향후 추가 예정 — UI 에서 "곧 지원" 으로 노출되지만 CLI 는 거부. */
export type CssFrameworkPlanned = 'vanilla-extract';
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

/* ─────── 아키텍처 (arch) ─────── */

/** 논리 키 셋 — 모든 arch 디스크립터가 동일하게 노출하는 카테고리. */
export type ArchPathKey =
  | 'layouts'
  | 'providers'
  | 'api'
  | 'config'
  | 'hooks'
  | 'utils'
  | 'ui'
  | 'test';

export type ArchManifest = {
  /** kebab-case 식별자 (예: "fsd", "flat"). */
  name: string;
  label: string;
  description: string;
  /** 이 arch 가 적용 가능한 플랫폼들. */
  platforms: readonly CreatePlatform[];
  /** 논리 키 → 파일시스템 경로 (앱 루트 기준). */
  paths: Record<ArchPathKey, string>;
  /** 논리 키 → import alias prefix (TS 코드 emit 시). */
  aliases: Record<ArchPathKey, string>;
  /** tsconfig.json 의 paths 블록에 그대로 들어갈 객체. */
  tsconfigPaths: Record<string, string[]>;
};

export const allArchitectures: readonly ArchManifest[];
export const DEFAULT_ARCH: 'fsd';
export function getArchByName(name: string): ArchManifest;
export function getArchesForPlatform(platform: CreatePlatform): readonly ArchManifest[];
export function isKnownArch(name: string): boolean;

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
