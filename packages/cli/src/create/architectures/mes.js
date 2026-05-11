/**
 * MES (Backoffice) 아키텍처 디스크립터.
 *
 * 스마트팩토리 MES·ERP·관리자 도구처럼 **페이지 간 상호작용이 거의 없고**
 * 페이지마다 자기 컬럼/스키마/다이얼로그를 다시 정의하는 CRUD-heavy 앱을 위한
 * 페이지 격리 구조.
 *
 * 핵심 컨벤션:
 *   - `app/<route>/page.tsx` 는 한 줄짜리 위임 (`export { default } from "@/pages/<name>"`)
 *   - 페이지 본체는 `src/pages/<name>/` 에 자기완결로 거주 — index.tsx, components/,
 *     api.ts, hooks.ts, schema.ts, columns.ts.
 *   - 두 페이지 이상에서 같은 코드가 보이기 시작하면 그때 `src/components/` `src/hooks/`
 *     `src/lib/` 로 승격. **두 번째 쓰임이 나타나기 전엔 공용 만들지 않기.**
 *
 * tsconfig 의 `paths` 는 FSD 처럼 catch-all `@/*` 를 쓰되 매핑 대상이 `./src/*` —
 * 즉 모든 import 가 `@/pages/...`, `@/components/...`, `@/lib/...` 처럼 `src/` 루트
 * 기준으로 짧게 정리된다.
 */
export const mesArch = {
  name: 'mes',
  label: 'MES (Backoffice)',
  description:
    '페이지 격리 구조 (src/pages/<name>/ 자기완결). 페이지 간 상호작용이 적은 CRUD-heavy 관리자 도구·MES 류에 적합.',
  platforms: ['next'],

  paths: {
    layouts:    'src/components/layouts',
    providers:  'src/components/providers',
    api:        'src/lib/api',
    config:     'src/lib/config',
    hooks:      'src/hooks',
    utils:      'src/lib/utils',
    ui:         'src/components/common',
    test:       'src/lib/test',
  },

  aliases: {
    layouts:    '@/components/layouts',
    providers:  '@/components/providers',
    api:        '@/lib/api',
    config:     '@/lib/config',
    hooks:      '@/hooks',
    utils:      '@/lib/utils',
    ui:         '@/components/common',
    test:       '@/lib/test',
  },

  // Catch-all `@/*` → `./src/*`. FSD 와 같은 결의 명명이지만 src/ 루트가 바뀜.
  // `@/pages/customers`, `@/components/...`, `@/lib/api/...` 모두 자연스럽게 풀린다.
  tsconfigPaths: {
    '@/*': ['./src/*'],
  },
};
