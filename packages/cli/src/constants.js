/**
 * sh-ui-cli 의 모든 enum / 상수 단일 진실.
 *
 * 다른 모듈 (cli-args, mcp, init, generator) 과 외부 패키지 (apps/docs) 는
 * 이 파일을 import 해서 사용한다. 새 값 추가 시 여기만 고치면 된다.
 */

// ─── 프로젝트 생성 (sh-ui-cli create) ───

export const CREATE_PLATFORMS = ['next', 'flutter'];

export const CREATE_STRUCTURES = ['standalone', 'monorepo'];

// ─── 초기화 (sh-ui-cli init) — sh-ui 컴포넌트 설정 ───

export const INIT_PLATFORMS = ['react', 'flutter'];

export const THEME_BASES = ['neutral', 'zinc', 'slate'];

export const THEME_RADII = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

export const THEME_MODES = ['light-dark', 'light', 'dark'];

// ─── 기본값 ───

export const INIT_DEFAULTS = {
  platform: 'react',
  base: 'neutral',
  radius: 'md',
  mode: 'light-dark',
};
