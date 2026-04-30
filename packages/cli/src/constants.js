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

// ─── CSS 프레임워크 (변종 시스템 — 1단계: 그릇만) ───

// 현재 실제로 동작하는 값.
// - plain: CSS custom properties + 일반 .css 파일 (모든 컴포넌트 변종 보유)
// - tailwind: utility class TSX 변종 (button/card/input 부터 시작, 점진적 확대 — 변종이 없는 컴포넌트는 add 시 plain 으로 자동 fallback)
export const CSS_FRAMEWORKS_SUPPORTED = ['plain', 'tailwind'];

// 향후 추가 예정. 사용자가 이 값을 주면 친절 에러로 안내.
export const CSS_FRAMEWORKS_PLANNED = ['css-modules', 'vanilla-extract'];

// 알려진 전체 — 검증 시 supported 와 planned 둘 다 인지하기 위함.
export const CSS_FRAMEWORKS_ALL = [
  ...CSS_FRAMEWORKS_SUPPORTED,
  ...CSS_FRAMEWORKS_PLANNED,
];

export const CSS_FRAMEWORK_DEFAULT = 'plain';

// ─── 기본값 ───

export const INIT_DEFAULTS = {
  platform: 'react',
  base: 'neutral',
  radius: 'md',
  mode: 'light-dark',
  cssFramework: CSS_FRAMEWORK_DEFAULT,
};
