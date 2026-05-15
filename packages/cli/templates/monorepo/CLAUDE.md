# 프로젝트 작업 규칙

sh-ui CLI 가 스캐폴드한 monorepo (Turborepo + pnpm workspace). AI 에이전트
(Claude / Cursor / Codex 등) 가 이 파일을 컨텍스트로 읽고 아래 규칙을 따른다.

## 구조

- `apps/<name>/` — {{PLATFORM_APP_DESCRIPTION}}
- `packages/ui/ui-core/` — 모든 앱이 공유하는 sh-ui 컴포넌트 / 훅 / 유틸 SoT.
  컴포넌트 추가는 여기에 한 번만.
- `packages/ui/ui-apps/ui-<name>/` — 앱별 토큰 (color/spacing/font) 만 보관.
  컴포넌트는 두지 않음 (v0.65+ `tokens-only` 마커).
- `packages/eslint-config/` · `packages/typescript-config/` — 공용 설정.

## 아키텍처 옵션 (`--arch`)

- **`fsd`** (default) — Feature-Sliced Design. `src/{app,pages,widgets,features,entities,shared}`
  레이어로 단방향 의존(상위→하위). 일반적 SPA / 서비스에 적합.
- **`flat`** — `src/{components,hooks,lib,pages}` 단순 구조. 작은 앱 / 학습용.
- **`mes`** — MES (Backoffice) 전용. 페이지 격리 + 단방향 의존 강제. ERP/내부 관리도구
  처럼 페이지 간 분리도가 중요한 도메인. Next.js 만 지원 (vite-app 은 fsd/flat 만).

세 arch 모두 `packages/eslint-config/` 에 별도 ruleset 으로 들어가 있다 — 라이브러리
이므로 모두 emit 되지만, 본인 앱의 `eslint.config.js` 에서 선택한 arch 의 config 만
import 한다. 다른 arch 의 `.js` 파일이 보여도 deprecated 가 아니라 다른 앱이
쓸 수 있는 옵션이다.

## 날짜 / 숫자 포맷

- raw `Date.prototype.toLocaleDateString()` / `toLocaleString()` / `toLocaleTimeString()`
  호출 **금지** — SSR(Node) 와 브라우저의 기본 로케일이 달라 hydration mismatch 의
  원인. ESLint `no-restricted-syntax` 룰이 인자 0개의 호출을 막는다
  (`@workspace/eslint-config/base` 에 정의).
- 대신 `@/src/shared/lib/formatDate` 의 `formatDate(date)` / `formatDateTime(date)`
  사용 (default locale `ko-KR`, 서버·클라이언트 동일 출력 보장).
- next-intl locale 추종이 필요하면 `@/src/shared/hooks/useFormatDate` 훅 사용.
- 동일 원칙이 숫자에도 적용 — raw `Number.prototype.toLocaleString()` 금지,
  `formatPrice` 사용.
- 인자가 명시된 호출 (`toLocaleDateString('ko-KR', { ... })`) 은 의도된 사용이므로
  허용. 다만 SSR 출력 결정성을 위해서는 util 경유가 안전.

## 새 앱 추가

`sh_ui_add_app` MCP 툴 또는 `npx sh-ui-cli add app <name>` — `apps/<name>/` +
`packages/ui/ui-apps/ui-<name>/` 를 한 번에 만든다. 앱별로 다른 톤 가능 (예:
marketing = rose, admin = emerald). 컴포넌트는 `ui-core` 단일 SoT 라 두 앱이
자동 공유.

## 토큰 사용

- 색상 / 간격 / 폰트 크기는 항상 토큰 변수 경유 (`var(--space-3)`, `bg-fg`,
  `text-fg-muted` 등). 매직 px / hex 직접 하드코딩 금지.
- 토큰 정의부는 `packages/ui/ui-apps/ui-<name>/src/styles/tokens.css`.
