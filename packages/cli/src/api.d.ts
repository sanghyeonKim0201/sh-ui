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

export const CREATE_PLATFORMS: readonly CreatePlatform[];
export const CREATE_STRUCTURES: readonly CreateStructure[];
export const INIT_PLATFORMS: readonly InitPlatform[];
export const THEME_BASES: readonly ThemeBase[];
export const THEME_RADII: readonly ThemeRadius[];
export const THEME_MODES: readonly ThemeMode[];

export const INIT_DEFAULTS: {
  platform: InitPlatform;
  base: ThemeBase;
  radius: ThemeRadius;
  mode: ThemeMode;
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
