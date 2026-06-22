---
module: "apps/docs dataTable (열 순서 DnD 데모)"
date: "2026-06-22"
problem_type: runtime_error
component: frontend_stimulus
severity: medium
symptoms:
  - "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"
  - "aria-describedby=\"DndDescribedBy-0\" (server) vs \"DndDescribedBy-1\" (client) on every @dnd-kit draggable"
  - "React hydration-mismatch error in console on every page load, '...won't be patched up'"
root_cause: wrong_api
resolution_type: code_fix
related_components:
  - tooling
tags:
  - dnd-kit
  - nextjs
  - react
  - ssr
  - hydration
  - useid
  - data-table
  - column-reorder
  - app-router
---

# @dnd-kit DndContext SSR 하이드레이션 미스매치 — useId 로 안정 id 주입

## Problem

Next.js App Router(SSR) 에서 `@dnd-kit` 의 `DndContext` 를 `id` 없이 사용하면, 서버와 클라이언트가 draggable 의 `aria-describedby` id 를 다르게 생성해 React 하이드레이션 미스매치 에러가 매 로드마다 발생한다.

## Symptoms

- 콘솔: `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up.`
- diff 가 모든 draggable 헤더 버튼에서 `+ aria-describedby="DndDescribedBy-0"` (server) / `- aria-describedby="DndDescribedBy-1"` (client) 로 표시됨.
- 기능(드래그)은 동작하지만 접근성 설명 노드 id 가 어긋나고, 하이드레이션이 "패치되지 않음".

## What Didn't Work

- **그냥 무시** — 기능은 되니 넘어가려 했으나, 하이드레이션 미스매치는 React 가 해당 서브트리를 클라이언트 기준으로 다시 그릴 수 있어 신뢰할 수 없고, 콘솔이 매 로드 오염된다. docs 게이트(콘솔 에러 0) 기준 미달.
- **HMR 후 콘솔만 재확인** — preview 콘솔 버퍼가 픽스 이전 에러를 누적 표시해 "안 고쳐진 것처럼" 보였다. 실제로는 DOM 의 `aria-describedby` 가 이미 안정값으로 바뀐 상태. 확정하려면 **dev 서버 재시작 → fresh SSR 로드 → 콘솔 0** 으로 검증해야 한다(버퍼 오해 주의).

## Solution

`DndContext` 에 `React.useId()` 로 만든 안정적인 `id` 를 넘긴다. @dnd-kit 은 이 id 를 `aria-describedby`(`DndDescribedBy-${id}`) 등 내부 접근성 노드 id 의 베이스로 쓰므로, SSR↔클라이언트가 동일한 id 를 생성한다.

```tsx
// before — id 없음 → 내부 카운터가 server/client 간 어긋남
<DndContext sensors={sensors} onDragEnd={onDragEnd}>…</DndContext>

// after — useId 로 SSR 안정 id 주입
const dndContextId = React.useId();
// …
<DndContext id={dndContextId} sensors={sensors} onDragEnd={onDragEnd}>…</DndContext>
```

검증(같은 컴포넌트, fresh 서버): DOM `aria-describedby` 가 `_R_2p5esnebmqkned9etb_` 같은 useId 기반 안정값으로 통일되고, 콘솔 하이드레이션 에러 0.

## Why This Works

`id` 를 주지 않으면 @dnd-kit 은 모듈 레벨 카운터(`DndDescribedBy-0`, `-1`, …)로 접근성 노드 id 를 만든다. 이 카운터는 SSR 렌더와 클라이언트 하이드레이션에서 증가 시점/횟수가 달라 값이 어긋난다. `React.useId()` 는 트리 위치 기반으로 server/client 가 **동일하게** 생성하도록 설계된 API라, 그 값을 id 베이스로 고정하면 양쪽 출력이 일치해 미스매치가 사라진다.

## Prevention

- **Next.js(SSR)에서 @dnd-kit `DndContext` 를 쓸 때는 항상 `id={React.useId()}` 를 준다.** 다른 SSR 라이브러리에서도 "내부 자동 id" 를 만드는 컴포넌트는 같은 패턴(안정 id 주입)으로 막는다.
- 하이드레이션 픽스 검증은 **HMR 콘솔 재확인이 아니라 dev 서버 재시작 후 fresh 로드**로 한다 — preview/devtools 콘솔 버퍼가 이전 에러를 누적해 오판을 부른다. DOM 속성 실제값(`aria-describedby`)을 직접 읽어 교차 확인하면 더 확실하다.
- 회귀 가드: 데모/컴포넌트가 SSR 로 렌더되는 페이지라면, 빌드 외에 "fresh 로드 콘솔 에러 0" 을 수동/자동 체크에 포함.
