# sh-ui

> React + Flutter 듀얼 컴포넌트 레지스트리. shadcn 스타일로 컴포넌트 소스를 프로젝트에 복사해 사용자가 직접 소유한다. 디자인 토큰은 단일 소스(`@sh-ui/tokens`)에서 `sh-ui.config.json`을 통해 플랫폼별로 변환된다.

## 설치 흐름

1. `npx sh-ui-cli init` — 프로젝트에 `sh-ui.config.json` 생성
2. `npx sh-ui-cli add <name>` — 컴포넌트 소스를 프로젝트로 복사
3. `npx sh-ui-cli list` — 설치된 컴포넌트 목록
4. `npx sh-ui-cli remove <name>` — 설치 제거
5. `npx sh-ui-cli add <name> --diff` — 실제 파일 쓰지 않고 업데이트 미리보기

## Import 경로

- **React**: 컴포넌트는 `@/components/ui/<name>`, 훅은 `@/hooks/<name>`, 유틸은 `@/lib/<name>` (경로 alias는 `sh-ui.config.json`으로 바꿀 수 있음)
- **Flutter**: `lib/widgets/sh_ui_<name>.dart`, 토큰은 `lib/foundation/sh_ui_tokens.dart`

## 핵심 관용

- **React는 compound 우선** — `<Pagination><PaginationContent>...</PaginationContent></Pagination>`처럼 sub-component 조합. prop 덩어리 컴포넌트 지양.
- **Flutter는 named slot 우선** — `ShUiDialog(header:, body:, footer:)`처럼 생성자 slot. 단 Pagination·Breadcrumb처럼 items 배열로 끝나는 구성은 items prop.
- **접근성 내장** — nav/ol/button 등 시맨틱 태그, aria-label/aria-current 자동 부여, 키보드 내비 보장.
- **토큰 사용 강제** — 매직값 금지. 컴포넌트 CSS는 `var(--foreground)` 등 semantic 토큰만 사용.
