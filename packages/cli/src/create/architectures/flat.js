/**
 * Flat 아키텍처 디스크립터.
 *
 * 슬라이스 없이 vanilla Next.js 관용에 가까운 폴더 구조 — `lib/` (유틸/설정),
 * `components/` (UI/레이아웃/프로바이더). 토이 프로젝트, 데모, 일회성 도구처럼
 * FSD 의 6 레이어가 과한 경우에 적합.
 *
 * tsconfig 의 `paths` 는 FSD 의 전역 `@/*` 와 다르게 *카테고리별 scoped alias* 를
 * 쓴다 (`@/lib/*`, `@/components/*`, `@/app/*`). 이유는 두 가지:
 *
 *   1. flat 은 import 가 짧은 게 강점 — `@/lib/api/x` 처럼 카테고리가 alias 에 박혀
 *      있으면 한 번 보고 어디 파일인지 식별. 전역 `@/*` 보다 가독성 ↑.
 *   2. 미래에 다른 arch 를 추가할 때 alias 컨벤션 차이가 arch 정체성의 일부가
 *      될 수 있도록 — clean/MVC 등은 또 자기만의 alias 패턴을 가질 수 있다.
 */
export const flatArch = {
  name: 'flat',
  label: 'Flat',
  description:
    '슬라이스 없는 관용적 Next.js 구조 (lib/components/app). 작은 프로젝트, 데모, 일회성 도구에 적합.',
  platforms: ['next', 'vite'],

  paths: {
    layouts:    'components/layouts',
    providers:  'components/providers',
    api:        'lib/api',
    config:     'lib/config',
    hooks:      'lib/hooks',
    utils:      'lib/utils',
    ui:         'components/common',
    test:       'lib/test',
  },

  aliases: {
    layouts:    '@/components/layouts',
    providers:  '@/components/providers',
    api:        '@/lib/api',
    config:     '@/lib/config',
    hooks:      '@/lib/hooks',
    utils:      '@/lib/utils',
    ui:         '@/components/common',
    test:       '@/lib/test',
  },

  // Scoped alias — 카테고리별로 명시. FSD 의 catch-all `@/*` 와 의도적으로 다름.
  // Next.js 의 `app/` 라우트 디렉토리는 import alias 가 거의 쓰이지 않아 제외.
  tsconfigPaths: {
    '@/lib/*':        ['./lib/*'],
    '@/components/*': ['./components/*'],
  },
};
