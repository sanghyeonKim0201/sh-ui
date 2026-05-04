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
// - tailwind: utility class TSX 변종 (모든 styled 컴포넌트 변종 보유)
// - css-modules: 모듈 단위 .module.css + styles.X 참조 (모든 styled 컴포넌트 변종 보유)
export const CSS_FRAMEWORKS_SUPPORTED = ['plain', 'tailwind', 'css-modules'];

// 향후 추가 예정. 사용자가 이 값을 주면 친절 에러로 안내.
// vanilla-extract: button/card/input 3 개 파일럿만 변종 보유 (수동 작성, 검증됨).
//   v0.50.0 에서 자동 변환 스크립트로 40 개 추가 시도했으나 vanilla-extract 의 strict
//   selector 규칙 (selectors 안에 다른 클래스 reference 불가, third-party 클래스 descendant 불가
//   등) 을 어김 — v0.52.2 에서 broken 변종 rollback. 사용자가 직접 .css.ts 를 작성하거나
//   향후 정식 rollout (selectors → globalStyle 분기까지 처리) 후 SUPPORTED 로 다시 승격 예정.
export const CSS_FRAMEWORKS_PLANNED = ['vanilla-extract'];

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
