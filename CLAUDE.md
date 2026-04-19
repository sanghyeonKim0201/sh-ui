# sh-ui — Claude 작업 규칙

`~/development/PROJECT/claude-rules/`의 공통 규칙을 따르되, 이 레포에 한정된 관용·구조·워크플로를 아래에 정리한다.

## 프로젝트 개요

멀티 플랫폼 디자인 시스템. **React + Flutter** 두 플랫폼을 단일 토큰 소스에서 파생한다. shadcn 스타일(사용자가 직접 코드를 복사해 소유)을 유지.

## 모노레포 구조

```
sh-ui/
├── packages/
│   ├── tokens/         # 토큰 생성기 (CSS + Dart 동시 출력)
│   ├── cli/            # sh-ui add / init CLI
│   └── registry/
│       ├── react/      # React 컴포넌트 원본 (레지스트리)
│       └── flutter/    # Flutter 위젯 원본 (레지스트리)
├── apps/
│   ├── docs/           # Next.js 문서 사이트 (dogfood: ui/ 아래 카피본 사용)
│   └── showcase/       # Flutter 쇼케이스 앱 (dogfood: widgets/ 아래 카피본 사용)
```

## 듀얼 카피본 관리 (중요)

**레지스트리 원본 → docs/showcase 카피본**을 이중 유지한다. 심볼릭 링크 자동화 대신 **수동 듀얼 수정**으로 결정됨 (이전 논의 결과).

- 컴포넌트 수정 시 **반드시 두 곳을 동시에 업데이트**:
  - React: `packages/registry/react/components/<name>/` + `apps/docs/components/ui/<name>/`
  - Flutter: `packages/registry/flutter/widgets/sh_ui_<name>.dart` + `apps/showcase/lib/widgets/sh_ui_<name>.dart`
- 레지스트리 편집 후 `cp`로 바로 싱크하는 습관.
- 토큰도 동일: `packages/registry/flutter/foundation/sh_ui_tokens.dart` + `apps/showcase/lib/foundation/sh_ui_tokens.dart` + `apps/docs/app/styles/tokens.css`.

## 플랫폼별 컴포지션 관용

`claude-rules/ui/composition.md`의 **플랫폼별 관용** 섹션을 따른다.

- **React** — compound component (JSX + Context + React.Children). 예: `<Header><HeaderBrand/><HeaderNav>...</HeaderNav></Header>`.
- **Flutter** — named slot (생성자 slot). 예: `ShUiSidebar(header:, footer:, children:)`. Dart 중첩 비용 때문에 compound 지양.

**두 플랫폼 API를 무리하게 통일하지 않는다.** 각 플랫폼 관용이 더 중요.

## 디자인 토큰 시스템 (v2)

**단일 소스** `packages/tokens/src/{primitives,semantic}.json` → `node packages/tokens/build.mjs` → CSS + Dart 동시 생성.

카테고리: colors / radius / spacing / text / weight / shadow / duration / ease / control / borderWidth / opacity / z-index / breakpoint.

- 수정 후 재생성: `cd packages/tokens && node build.mjs && cp dist/* <destinations>`
- 컴포넌트 코드에서 **하드코딩 금지**: 항상 `var(--space-3)` / `shUi.spacing.s3` 등 토큰 사용.
- 새 토큰이 필요하면 primitives + semantic에 추가한 뒤 재생성, 3개 소비 위치로 복사.

## Flutter 특화 관용

### 사이드바 / drawer
- `ShUiSidebarMode.auto | inline | drawer`로 반응형. 기본 `auto`는 `MediaQuery.width >= shUi.breakpoint.md` 기준.
- drawer 패턴: `ModalBarrier` + `BackdropFilter(blur 8px)` + `SlideTransition`. alpha 0.25 — React와 통일.
- `ShUiAppShell` — 고수준 쉘 (Scaffold + AppBar + Sidebar + 콘텐츠 스위칭). shadcn dashboard 스타일.
- `ShUiSidebar` 저수준 — 라우트 기반 네비 직접 조립용.

### 애니메이션 / ticker mute 대응
- 라우트가 비활성화되면 `SingleTickerProviderStateMixin`의 ticker가 muted → `AnimationController.reverse()`가 진행 안 됨.
- 대응: `_hideDrawer`에 `Future.delayed(const Duration(milliseconds: 400), finish)` fallback 타이머.
- 라우트 이동 전에 drawer 먼저 닫고 애니메이션 끝난 뒤 이동하는 패턴도 사용 (쇼케이스 `home_page.dart` 참고).

### SafeArea 관용
- drawer 패널 배경은 노치/홈 인디케이터 영역까지 **끝까지 연장**. SafeArea는 **콘텐츠에만** 적용.
  - `Container(decoration: color: ..., child: SafeArea(right: false, child: content))` 구조.

### 좁은 폭에서 hit test
- 접힌 사이드바(56px) 같은 좁은 컨테이너에서 `ShUiSidebarHeader` padding 크면 내부 트리거가 오버플로우해 hit test에서 잘림.
- 접힘 상태에선 horizontal padding을 s4→s2로 자동 축소(`AnimatedContainer`).

## React 특화 관용

- `@base-ui-components/react`를 headless primitive로 사용 (Dialog/Select/Popover 등).
- Next.js App Router, Turbopack. Server components 기본, `"use client"` 명시 필요한 곳만.
- `tokens.css` import 순서: `tokens.css` → `base.css` → 컴포넌트 스타일.
- `@media (max-width: 767px)` 기준 반응형 — `var(--bp-md)` 값과 일치.

## 테스트 / 검증

- React: `cd apps/docs && pnpm exec tsc --noEmit`
- Flutter: `cd apps/showcase && flutter analyze`
- pre-existing 이슈 (color_picker deprecated Color getters, widget_test.dart MyApp 등)는 무시 OK.

## Git / 버전

- 브랜치: 작업은 `dev`, 릴리즈는 `live`. `dev → live` PR 머지로 릴리즈.
- 머지 전략: **Merge commit만** (squash/rebase 저장소 설정으로 비활성화됨).
- 버전 태깅: semver. 각 릴리즈 준비 시 4개 `package.json` 모두 bump (root / apps/docs / packages/cli / packages/tokens).
- 태그 생성: `git tag -a vX.Y.Z -m "..."` → `git push origin dev --follow-tags`.
- GitHub Release: `gh release create vX.Y.Z --title "..." --notes "..."`.

## Agent 위임 패턴

파이프라인성 작업은 agent 병렬 처리:
- 대량 파일 마이그레이션 (CSS 토큰 치환, 페이지 리팩터 등).
- 독립적인 컴포넌트 작업 (예: 5개 컴포넌트 각각 compound 리팩터).

Agent에게 주는 지시는:
- 수정 범위(파일 경로) 명시
- backward-compat 요구 여부 명시
- `flutter analyze` 또는 `tsc --noEmit` 통과 확인 요구
- 300단어 이내 리포트 요구

## 피해야 할 것

- 레지스트리 **한쪽만** 수정 (docs나 showcase 한쪽 빠뜨리는 실수). 항상 양쪽 동시.
- Flutter에서 JSX 흉내 compound 시도. named slot으로.
- React에서 prop 20+ 컴포넌트. compound로.
- 토큰 없이 하드코딩 (spacing / colors 특히). generator 돌리고 토큰 추가.
- `live` 브랜치에 직접 push (브랜치 보호 걸려있음). PR 경유.
