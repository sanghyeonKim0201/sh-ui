# 프로젝트 작업 규칙

sh-ui CLI 가 스캐폴드한 Next.js standalone 프로젝트. AI 에이전트 (Claude / Cursor /
Codex 등) 가 이 파일을 컨텍스트로 읽고 아래 규칙을 따른다.

## 아키텍처 옵션 (`--arch`)

- **`fsd`** (default) — Feature-Sliced Design. `src/{app,pages,widgets,features,entities,shared}`
  레이어로 단방향 의존(상위→하위). 일반적 SPA / 서비스에 적합.
- **`flat`** — `src/{components,hooks,lib}` 단순 구조. 작은 앱 / 학습용.
- **`mes`** — MES (Backoffice) 전용. 페이지 격리 + 단방향 의존 강제. ERP/내부 관리도구
  처럼 페이지 간 분리도가 중요한 도메인.

선택한 arch 에 따라 `eslint.config.js` 가 다르게 emit 된다.

## 날짜 / 숫자 포맷

- raw `Date.prototype.toLocaleDateString()` / `toLocaleString()` / `toLocaleTimeString()`
  호출 **금지** — SSR(Node) 와 브라우저의 기본 로케일이 달라 hydration mismatch 의
  원인. ESLint `no-restricted-syntax` 룰이 인자 0개의 호출을 막는다.
- 대신 `@/src/shared/lib/formatDate` 의 `formatDate(date)` / `formatDateTime(date)`
  사용 (default locale `ko-KR`, 서버·클라이언트 동일 출력 보장).
- next-intl locale 추종이 필요하면 `@/src/shared/hooks/useFormatDate` 훅 사용.
- 동일 원칙이 숫자에도 적용 — raw `Number.prototype.toLocaleString()` 금지,
  `@/src/shared/lib/formatPrice` 의 `formatPrice` 사용.
- 인자가 명시된 호출 (`toLocaleDateString('ko-KR', { ... })`) 은 의도된 사용이므로
  허용. 다만 SSR 출력 결정성을 위해서는 util 경유가 안전.

## sh-ui 컴포넌트 우선

- shadcn/ui 류 외부 라이브러리 대신 이 프로젝트의 `components/ui/*` (sh-ui 레지스트리)
  사용. Base UI (`@base-ui-components/react`) 위에 빌드되어 있음.
- 새 컴포넌트가 필요하면 `npx sh-ui-cli add <name>` 또는 sh-ui MCP 의
  `sh_ui_add_component` 사용.

## 토큰 사용

- 색상 / 간격 / 폰트 크기는 항상 토큰 변수 경유 (`var(--space-3)`, `bg-fg`,
  `text-fg-muted` 등). 매직 px / hex 직접 하드코딩 금지.
- 토큰 정의부는 `app/globals.css` 또는 `src/shared/styles/tokens.css`.
