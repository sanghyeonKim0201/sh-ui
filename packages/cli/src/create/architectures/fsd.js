/**
 * Feature-Sliced Design 아키텍처 디스크립터.
 *
 * sh-ui 의 디폴트 arch — 슬라이스 (entities, features, widgets, views, shared, app) 기반.
 * 플러그인이 emit 하는 산출물의 fs 경로/import alias 를 결정한다.
 *
 * 본 디스크립터의 값은 sh-ui v0.57 까지의 하드코딩된 경로와 1:1 일치 —
 * 즉 v0.58 에서 FSD 사용자 입장 변화 0 이어야 한다 (회귀 가드는 smoke matrix 가).
 */
export const fsdArch = {
  name: 'fsd',
  label: 'Feature-Sliced Design',
  description:
    '슬라이스 기반 폴더 구조 (entities/features/widgets/views/shared/app). 도메인이 큰 프로젝트에 적합.',
  platforms: ['next', 'vite'],

  paths: {
    layouts:    'src/app/layouts',
    providers:  'src/app/providers',
    api:        'src/shared/api',
    config:     'src/shared/config',
    hooks:      'src/shared/hooks',
    utils:      'src/shared/lib',
    ui:         'src/shared/ui',
    test:       'src/shared/test',
  },

  aliases: {
    layouts:    '@/src/app/layouts',
    providers:  '@/src/app/providers',
    api:        '@/src/shared/api',
    config:     '@/src/shared/config',
    hooks:      '@/src/shared/hooks',
    utils:      '@/src/shared/lib',
    ui:         '@/src/shared/ui',
    test:       '@/src/shared/test',
  },

  tsconfigPaths: {
    '@/*': ['./*'],
  },
};
