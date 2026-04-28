# 실전 예제 섹션 설계 (Examples Section)

- 날짜: 2026-04-23
- 대상: `apps/docs`
- 목적: sh-ui 컴포넌트로 "실제 화면이 어떻게 이쁘게 꾸며질 수 있는지" 보여주는
  쇼케이스 섹션을 docs에 신설한다. 마케팅·영감 용도이며 사용자가 소스를 열람할
  수 있지만 CLI 복사 기능은 포함하지 않는다.

## 1. 아키텍처 & 라우팅

```
/examples                      갤러리 (docs shell 내부)
  - 카테고리 탭: All | Blocks | Pages | Flows | Themes
  - 활성 카테고리는 URL query (?cat=flows)로 반영
  - 그리드 카드: 라이브 미니프리뷰 + 제목 + 카테고리 배지 + "View →"

/examples/[slug]               풀스크린 쇼케이스 (docs shell 바깥)
  - 상단 얇은 바: [← 돌아가기]  [제목 · 카테고리]      [</> 코드 보기]
  - 본문: 예제 컴포넌트가 뷰포트를 꽉 채움
  - 코드 보기 클릭 → 우측 슬라이드 패널(Dialog 기반)에 소스 노출
```

- `/examples/[slug]` 는 segment `layout.tsx` 로 전역 `app/layout.tsx` 의
  사이드바·헤더를 오버라이드한다. 전역 레이아웃은 건드리지 않는다.
- 사이드바 topLinks 에 `{ title: "실전 예제", href: "/examples",
  icon: LayoutTemplateIcon }` 을 "가이드라인"과 "변경 내역" 사이에 추가한다.

## 2. 파일 구조

```
apps/docs/
├─ app/
│  └─ examples/
│     ├─ page.tsx                    # 갤러리
│     ├─ examples.css                # 갤러리·카드 스타일
│     └─ [slug]/
│        ├─ layout.tsx               # 풀스크린 레이아웃
│        ├─ page.tsx                 # 상단 바 + 예제 렌더
│        └─ showcase.css
│
├─ components/
│  └─ examples/
│     ├─ example-card.tsx
│     ├─ example-gallery.tsx         # 'use client' — 탭/URL query
│     ├─ example-topbar.tsx          # 'use client' — 코드 보기 트리거
│     └─ example-source-panel.tsx    # 'use client' — Dialog + 탭 + 하이라이트
│
└─ examples/                         # 예제 컴포넌트 + 메타데이터
   ├─ index.ts                       # 카탈로그 집계
   ├─ types.ts                       # ExampleMeta, ExampleEntry, ExampleCategory
   └─ <slug>/
      ├─ meta.ts
      ├─ Example.tsx
      └─ example.css                 # 예제 전용 장식 (그라데이션 등)
```

### 저장 위치 결정

- 예제는 `apps/docs/examples/` 에 docs-only 로 둔다. `packages/registry/` 에
  넣지 않는다. CLI 복사 대상이 아니므로 레지스트리 규칙(듀얼 카피본 유지)에서
  자유롭다.
- 나중에 CLI 배포가 필요해지면 `packages/registry/examples/` 로 이동 +
  `index.ts` 경로 갱신으로 이전 가능.

### 소스 코드 추출 방식

- 쇼케이스 페이지(서버 컴포넌트)가 `fs.readFile` 로 예제 폴더의 타겟 파일들을
  읽어 문자열 배열로 준비 → 클라이언트 패널에 prop 으로 내려준다.
- Next.js 는 `.tsx?raw` 를 정식 지원하지 않으므로 `fs` 경유가 가장 안전하다.
- 대상 파일은 `ExampleEntry.sourceFiles` 로 명시 (예: `Example.tsx`,
  `example.css`).

## 3. 핵심 타입 · 카탈로그 · 컴포넌트

### 타입

```ts
// apps/docs/examples/types.ts
export type ExampleCategory = "blocks" | "pages" | "flows" | "themes";

export interface ExampleMeta {
  slug: string;
  title: string;
  category: ExampleCategory;
  description: string;
}

export interface ExampleEntry extends ExampleMeta {
  Component: React.ComponentType;
  sourceFiles: string[];   // 예: ["login-card/Example.tsx", "login-card/example.css"]
}
```

### 카탈로그

```ts
// apps/docs/examples/index.ts
import dynamic from "next/dynamic";
import type { ExampleEntry } from "./types";

export const examples: ExampleEntry[] = [
  {
    slug: "login-card",
    title: "로그인 카드",
    category: "blocks",
    description: "그라데이션 배경 위 회원가입·로그인 전환 카드",
    Component: dynamic(() =>
      import("./login-card/Example").then((m) => m.Example),
    ),
    sourceFiles: ["login-card/Example.tsx", "login-card/example.css"],
  },
  // ... v1 나머지 7개
];

export const findExample = (slug: string) =>
  examples.find((e) => e.slug === slug);
```

- 예제 추가는 **폴더 하나 생성 + index 엔트리 한 줄 추가**로 끝난다.
- 각 예제의 `meta.ts` 는 단일 export(`meta: ExampleMeta`). `index.ts` 가
  그것과 `Example` 컴포넌트를 묶어 `ExampleEntry` 를 만든다.

### 컴포넌트 API

- `<ExampleGallery examples={examples} />` — 카테고리 탭 + URL query 동기화 +
  그리드 렌더. `useState` + `useSearchParams` + `useRouter`. 카테고리 0개면
  빈 상태 안내 + 필터 초기화 버튼.
- `<ExampleCard entry={entry} />` — `Link` + 라이브 미니프리뷰.
  미니프리뷰는 `transform: scale(0.4)` + `pointer-events: none` 로 상호작용
  차단.
- `<ExampleTopBar entry={entry} sources={sources} />` — 상단 바 + 코드 보기
  트리거. 패널 open 상태 로컬 보유. `Esc` 로 닫힘 + 트리거 버튼에 포커스 복귀.
- `<ExampleSourcePanel sources={sources} open onOpenChange />` — Base UI
  Dialog 기반. 파일 2개 이상이면 파일명 탭 + 신택스 하이라이트(docs 에
  이미 설치된 `shiki` 재사용. 새 의존성 없음).

### 사용 흐름

1. 사이드바 "실전 예제" → `/examples` 갤러리
2. 탭으로 카테고리 좁힘 → 카드 "View →"
3. 풀스크린 쇼케이스 → 예제 감상
4. "</> 코드 보기" → 우측 패널, 파일 탭 전환
5. "← 돌아가기" → 갤러리로 복귀

## 4. v1 카탈로그 (8개)

| slug | 카테고리 | 설명 | 주요 sh-ui 컴포넌트 | 꾸밈 포인트 |
|---|---|---|---|---|
| `login-card` | blocks | 로그인 / 회원가입 탭 카드 | Card, Tabs, Input, Label, Button, Separator | 대각선 radial gradient + 유리막 카드 |
| `pricing-card` | blocks | 요금제 비교 3단 | Card, Badge, Button, Separator | 중앙 "추천" 카드 글로우 링, 상단 그라데이션 헤더 |
| `saas-dashboard` | pages | KPI + 차트 + 최근 활동 | Sidebar, Card, Badge, Avatar, Progress, Skeleton | 섹션별 subtle gradient, 다채색 상태 뱃지 |
| `settings-page` | pages | 프로필 / 계정 / 알림 탭 | Tabs, Form, Switch, Input, Select, Button, Separator, Avatar | 좌측 고정 네비, 섹션 구분선 |
| `checkout-flow` | flows | 배송지 → 결제 → 확인 3단계 | Form.Steps, Input, Select, Radio, Button, Progress | 스텝 인디케이터 그라데이션 진행바 |
| `onboarding-flow` | flows | 환영 → 프로필 → 관심사 → 완료 | Form.Steps, Radio, Checkbox, Input, Button | 스텝별 대형 이모지/아이콘 + 컬러풀 배경 |
| `theme-dashboard` | themes | 같은 대시보드 3가지 브랜드 톤 | SaaS 대시보드 재사용 | 상단 세그먼트 토글로 토큰 스와핑 |
| `theme-login` | themes | 같은 로그인 카드 Light / Dark / Neon | 로그인 카드 재사용 | 3열 횡렬 비교 |

### 테마 변주 구현 전략 (`themes/*`)

- 전역 `[data-theme]` 을 건드리지 않는다. 예제 내부 컨테이너에
  `data-example-theme="cobalt"` 같은 속성을 부여하고 scoped CSS 로 토큰만
  덮어쓴다.

  ```css
  [data-example-theme="cobalt"] {
    --color-primary: #4060ff;
    --radius-md: 12px;
    --font-sans: ...;
  }
  ```

- `theme-dashboard` 는 `useState` 로 토글 상태 유지, `data-example-theme` 만
  변경한다. 대시보드 컴포넌트는 재사용.
- `theme-login` 은 3개 스코프 컨테이너를 동시에 나란히 렌더.

### 꾸밈 원칙

- 장식(그라데이션·글로우·이모지 등)은 **각 예제의 `example.css`에만** 둔다.
  sh-ui 코어 컴포넌트 스타일을 수정하지 않는다 (중립 베이스 원칙 유지).
- 색·반경·폰트 등은 가능한 한 토큰(`var(--color-*)`, `var(--radius-*)`)을
  경유한다. 매직 px/hex 는 예제 장식 용도일 때만 허용.
- 토큰으로 표현 불가능한 "예제 전용 장식값"(그라데이션 stops 등)은 예제
  파일 안에 국한.

## 5. 사이드바 수정

```ts
// apps/docs/components/app-sidebar.tsx
const topLinks = [
  // ...
  { title: "가이드라인", href: "/guidelines", icon: BookOpenIcon },
  { title: "실전 예제", href: "/examples", icon: LayoutTemplateIcon }, // 추가
  { title: "변경 내역", href: "/changelog", icon: HistoryIcon },
];
```

`LayoutTemplateIcon` 을 `lucide-react` import 목록에 추가.

## 6. 검증 / 테스트

- **타입 체크**: `pnpm tsc --noEmit` 전체 통과.
- **빌드 체크**: `pnpm --filter docs build` 성공. `/examples` 와
  `/examples/[slug]` 8개 전부 정적 생성.
- **라우팅**: `/examples` 200. 각 slug 200. 잘못된 slug 는 `notFound()`.
- **성능**: 갤러리 초기 렌더 ≤ 3s (8개 기준, 라이브 미니프리뷰 포함).
- **접근성** (`.ai/rules/ui/accessibility.md`):
  - 갤러리 탭 필터 `←` `→` `Home` `End` 지원, 포커스 링 유지.
  - 카드 키보드 포커스 + `Enter` 이동.
  - 쇼케이스 상단 바 포커스 순서: 돌아가기 → 코드 보기.
  - 코드 패널 Dialog: `Esc` 닫기, 첫 포커스 가능 요소로 이동, 닫힐 때 트리거로
    복귀.
- **다크모드**: 기존 토글과 공존. `themes/*` 는 scoped override 라 전역
  다크모드에 영향 없음.
- **UI 상태** (`.ai/rules/ui/ui-states.md`): 갤러리 empty(필터 결과 0개)
  안내 + 필터 초기화 버튼.

## 7. Out of scope (v1 명시 제외)

- 반응형 뷰포트 토글 (모바일/태블릿/데스크톱) — v1.1
- CLI 복사 (`sh-ui add example/...`) — 별도 릴리즈
- 정적 썸네일 PNG — 예제 수 ≥ 15 시 도입
- iframe 격리 렌더
- 예제 인터랙션 E2E 테스트 (/qa)

## 8. 릴리즈 영향

- 신규 컴포넌트·새 공개 API 추가가 아닌 **docs 내부 섹션 추가**에 해당.
  `common/common.md` 의 버전 범프 기준상 docs 전용 변경은 버전을 올리지
  않는다 → `packages/changelog/versions.json` 에 엔트리 추가하지 않는다.
- 커밋 prefix 는 `feat` 가 아닌 `docs` 가 적합.
- 단, 예제가 사이드바 topLink 로 노출되어 docs 사용자 경험을 바꾸므로
  CHANGELOG 관점에서 의미 있는 변경이다. 릴리즈 노트가 필요하다면 별도
  `docs:` 태그 릴리즈 대신 다음 `feat` 또는 `fix` 릴리즈의 노트에 추가
  멘션한다.
