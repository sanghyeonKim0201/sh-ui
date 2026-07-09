---
title: 새 sh-ui 컴포넌트 추가 — 건드려야 할 표면과 숨은 함정 (TimePicker 회고)
date: 2026-07-09
category: developer-experience
module: packages/registry, apps/docs, apps/showcase
problem_type: developer_experience
component: tooling
severity: medium
applies_when:
  - "sh-ui 에 새 React/Flutter 컴포넌트를 추가할 때"
  - "듀얼 카피/레지스트리/docs/visual 테스트 등 여러 표면을 동기화해야 할 때"
  - "locale 기반 기본값(예: 12/24시간제)을 정할 때"
  - "새 컴포넌트를 릴리즈하며 버전을 정할 때"
tags: [component-authoring, dual-copy, registry, visual-regression, intl, versioning, monorepo]
---

# 새 sh-ui 컴포넌트 추가 — 건드려야 할 표면과 숨은 함정 (TimePicker 회고)

## Context

TimePicker(v0.122.0)를 React(3 스타일 변형)+Flutter로 신설하며 서브에이전트 주도 TDD로
진행했다. 코드 자체보다 **여러 표면을 정확히 동기화하는 것**과 **lint/CI가 강제하는 실제 관례가
직관과 다른 지점**에서 반복적으로 시간이 들었다. 다음 컴포넌트 추가 시 곧바로 참조할 수 있도록
표면 목록과 숨은 함정을 정리한다.

## Guidance

### 1. 건드려야 할 표면 (React 컴포넌트 1개 기준)

- 레지스트리 원본 5파일: `packages/registry/react/components/<name>/`
  `index.tsx`(plain) · `index.module.tsx`(css-modules) · `index.tailwind.tsx`(tailwind) ·
  `styles.css` · `styles.module.css`. 세 변형은 **로직/JSX 완전 동일, 스타일 적용 방식만 다름.**
- docs 듀얼 카피 2파일: `apps/docs/components/ui/<name>/` — **`index.tsx` + `styles.css`만.**
  module/tailwind 변형은 복사하지 않는다.
- `packages/registry/react/registry.json` 엔트리 + `tokens-used.json`(재생성) +
  `packages/llms/summaries/react.json` 한 줄.
- docs 페이지: `apps/docs/app/[locale]/(docs)/components/<name>/` — `page.tsx` +
  `<name>-live-demo.tsx` + `_demos/basic.tsx`.
- 등록: `app-sidebar.tsx`(알파벳 위치) · `components/page.tsx`(카드) ·
  `create/showcases/<name>.tsx`+`index.ts` · `tests/visual/components.spec.ts`(`COMPONENTS` 슬러그) +
  visual baseline png.
- Flutter(있으면): `packages/registry/flutter/widgets/sh_ui_<name>.dart` ↔
  `apps/showcase/lib/widgets/...`(byte-동일) + `pages/<name>_page.dart` + `home_page.dart`
  (`ShUiAppShellItem`+builder) + flutter `registry.json`.
- 릴리즈: `packages/changelog/versions.json` prepend + `packages/cli/package.json` 버전 = 태그
  (see [[component-release-requires-cli-version-bump-2026-06-18]]).

`pnpm lint:drift`(= lint:registry + lint:dual-copy + lint:tokens-used)가 위 상당수를 강제하니,
작업 끝에 반드시 green 확인.

### 2. 듀얼 카피는 "그대로 복사"가 아니라 변환 복사다

`scripts/lint-dual-copy.mjs`가 검사하는 실제 규칙:
- docs `index.tsx` = 레지스트리 plain `index.tsx`에서 **`import { cn } from "@SH_UI_UTILS@";` 라인 제거
  + 인라인 `cx()` 헬퍼 추가 + `cn(`→`cx(`.**
- `styles.css`는 byte-동일. module/tailwind 변형은 docs에 없음.

→ "5파일 그대로 cp"는 틀림. docs typecheck가 `@SH_UI_UTILS@` 미해석으로 깨진다.

### 3. `packages/registry/react`에는 tsconfig가 없다

레지스트리 컴포넌트를 `cd packages/registry/react && tsc --noEmit`로 타입체크하려 하면 전체 .tsx가
jsx/모듈해석 에러로 깨진다(설정 부재). 실제 타입 게이트는 두 가지:
- **vitest**(`pnpm test`) — 레지스트리의 유일한 TS 검증(transform 기반).
- **`apps/docs` `pnpm typecheck`** — 듀얼 카피본을 `tsc --noEmit`으로 검증(실질 게이트).

module/tailwind 변형은 docs가 import하지 않아 자동 타입체크 대상이 아니다. 즉시 검증하려면 scratch
tsconfig로 세 파일만 돌린다:
`pnpm exec tsc --noEmit --jsx react-jsx --moduleResolution bundler --module esnext --target es2020 --skipLibCheck --strict components/<name>/index*.tsx`
(`@SH_UI_UTILS@`/`@base-ui/react` 미해석 에러는 무시 — 런타임 alias/설치본이 해결).

### 4. locale 기반 "자동 추론" 기본값의 함정 — hour12

스펙 초안은 "`hour12` 미지정 시 locale에서 자동 추론"이었으나, `Intl.DateTimeFormat(locale).resolvedOptions().hour12`는
**en-US·ko-KR 모두 `true`(12시간제)**를 반환한다. "locale 추론"을 기본값으로 쓰면 대부분 로케일이
12시간제로 떨어져 예측이 어렵고, 24h를 기대한 테스트와도 충돌했다. → **명시 기본값(24시간제)** 으로
결정하고, `inferHour12(locale)`는 사용자가 직접 호출할 수 있는 export 헬퍼로만 남겼다.

교훈: `Intl` 파생값을 컴포넌트 "기본 동작"으로 쓰기 전, 실제 반환값을 대표 로케일 몇 개로 찍어보고
예측 가능성을 우선한다.

### 5. Visual baseline — 다른 워크트리가 포트를 점유해도 생성 가능

`apps/docs`의 playwright visual은 non-CI에서 `reuseExistingServer:true`라, 다른 워크트리의 dev 서버가
3000을 점유 중이면 **엉뚱한 앱을 캡처**한다(404). `dev.mjs`는 `--port`를 안 넘기지만 `next dev`는
`PORT` env를 읽으므로:

```bash
# 내 docs 서버를 대체 포트로 (다른 워크트리 3000은 그대로 둠)
PORT=3210 pnpm --filter @sh-ui/docs dev &
# playwright를 내 서버로 겨눠 해당 컴포넌트 baseline만 생성
PLAYWRIGHT_BASE_URL=http://localhost:3210 \
  pnpm --filter @sh-ui/docs exec playwright test --update-snapshots -g "<name>"
```

핵심 사실: **visual.yml은 `macos-latest`에서 돌고 baseline은 `chromium-darwin`.** 로컬 Mac에서 생성한
darwin baseline이 CI와 일치한다(이번에 CI visual 1m49s green으로 실증). 다른 워크트리 서버를 죽이지
말 것 — 대체 포트로 우회한다.

### 6. 버전은 "릴리즈 시점"에 확정한다 (병렬 릴리즈 충돌)

작업 초반 versions.json에 `0.121.0`을 하드코딩했는데, 그 사이 **다른 브랜치가 0.121.0(DatePicker id)을
먼저 릴리즈**해 번호가 충돌했다. 해소: `live`를 브랜치에 머지 → versions.json 충돌을 "0.122.0(신규) 위,
0.121.0(기존) 아래"로 정리 → `packages/cli/package.json`도 0.122.0으로 맞춤.

교훈: 브랜치가 오래 살아있을 수 있으면 **다음 버전 번호를 미리 박지 말고 릴리즈 직전에 `live` 기준으로
확정**한다. 릴리즈 전 `git show live:packages/changelog/versions.json`로 최신 번호를 확인.

## Why This Matters

컴포넌트 로직은 리뷰로 잡히지만, 위 표면 누락·관례 오해는 **lint/CI/npm에서 뒤늦게(때론 릴리즈 후)**
드러난다. 실제로 이번에도 브리프가 "5파일 그대로 복사"·"llms 요약 불필요"로 잘못 안내했고, 구현자가
실제 lint 소스를 읽고 바로잡아야 했다. 표면 목록과 함정을 미리 알면 첫 시도에 green이 난다.

## When to Apply

- 새 컴포넌트/위젯 추가 착수 시 표면 체크리스트로.
- locale 파생 기본값(시간·통화·숫자 포맷 등)을 정할 때 4번.
- 다른 워크트리와 병행 작업 중 visual baseline이 필요할 때 5번.
- 오래 산 브랜치를 릴리즈할 때 6번.

## Examples

관련 학습: [[component-release-requires-cli-version-bump-2026-06-18]] (릴리즈 시 cli 버전 bump 필수),
[[sh-ui-cli-add-delegates-to-single-entry-2026-06-17]] (registry가 cli에 번들되는 구조).
