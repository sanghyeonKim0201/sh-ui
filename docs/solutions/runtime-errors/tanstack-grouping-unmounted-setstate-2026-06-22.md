---
module: "apps/docs dataTable (그룹화·확장 데모)"
date: "2026-06-22"
problem_type: runtime_error
component: frontend_stimulus
severity: medium
symptoms:
  - "Can't perform a React state update on a component that hasn't mounted yet."
  - "This indicates that you have a side-effect in your render function that asynchronously tries to update the component."
  - "첫 페이지(SSR) 로드에서만 발생, 클라이언트 재마운트(라우트 이동 후 복귀)에선 재현 안 됨"
root_cause: config_error
resolution_type: config_change
related_components:
  - tooling
tags:
  - tanstack-table
  - grouping
  - expanding
  - nextjs
  - react
  - ssr
  - autoreset
  - data-table
  - hydration
---

# TanStack Table 그룹화/확장 — 첫 하이드레이션 마운트 setState 경고 (autoResetAll: false)

## Problem

Next.js(SSR)에서 TanStack Table v8 의 `getGroupedRowModel` + `getExpandedRowModel` 을 쓰면, 첫 페이지 로드(하이드레이션) 시 React 가 "마운트되지 않은 컴포넌트에 state 업데이트" 경고를 콘솔에 낸다. TanStack 의 auto-reset 로직이 첫 커밋(마운트 직전)에 `setState` 를 트리거하기 때문이다.

## Symptoms

- 콘솔: `Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously tries to update the component. Move this work to useEffect instead.`
- **첫 SSR 로드에서만** 발생. 사이드바 링크로 다른 페이지 갔다 돌아오는 **클라이언트 재마운트에선 재현되지 않음**(하이드레이션 커밋 경로에서만 터짐).
- 그룹화/확장 기능 자체는 정상 동작.

## What Didn't Work

- **`autoResetExpanded: false` 만 추가** — expanded 만 끄는 옵션으로는 경고가 그대로(로드당 2건 유지). auto-reset 은 expanded 외에도 여러 축이 있어 한 축만 끄면 부족하다.
- **HMR 후 같은 탭 콘솔 재확인** — preview 콘솔 버퍼가 이전 에러를 누적해 "안 고쳐진 듯" 오판 유발. 첫-마운트 한정 경고라 **dev 서버 재시작 → fresh 로드**로만 확실히 검증된다.

## Solution

테이블 옵션에 `autoResetAll: false` 를 준다. TanStack 의 모든 자동 리셋(expanded/페이지 인덱스 등)을 꺼서, 첫 마운트 커밋에서 setState 가 트리거되지 않게 한다.

```tsx
const table = useReactTable({
  data,
  columns,
  state: { grouping, expanded },
  onGroupingChange: setGrouping,
  onExpandedChange: setExpanded,
  getCoreRowModel: getCoreRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  autoResetAll: false, // ← 첫 하이드레이션 마운트 setState 경고 해소
});
```

검증: dev 서버 재시작 후 fresh 로드 콘솔 에러 0, 그룹화/확장/집계 동작 유지(팀 그룹화 → 평균 집계, 그룹 토글 확장).

## Why This Works

`data`/`grouping` 이 "바뀌었다"고 감지되면 TanStack 은 expanded 등 파생 상태를 초기화하려고 `setState`(onChange)를 큐에 넣는다. 첫 렌더에선 이전 참조가 없어 "변경"으로 판정되고, 그 setState 가 하이드레이션 커밋(마운트 완료 직전)에 실행되면서 React 가 "아직 마운트 안 된 컴포넌트 업데이트" 경고를 낸다. 데이터가 정적이고 expanded 를 사용자 조작으로만 바꾸는 데모에서는 자동 리셋이 필요 없으므로 `autoResetAll: false` 로 꺼서 setState 트리거 자체를 제거한다.

## Prevention

- **Next.js(SSR)에서 TanStack Table 의 grouping/expanding(또는 다른 row model)을 쓸 때, expanded/페이지 상태를 직접 제어한다면 `autoResetAll: false` 를 기본으로 둔다.** 자동 리셋이 꼭 필요한 경우에만(예: 필터 변경 시 페이지 1로) 개별 `autoReset*` 를 켠다.
- auto-reset 관련 경고는 **한 축(`autoResetExpanded`)만 끄지 말고** 증상이 남으면 `autoResetAll` 로 넓힌다.
- 첫-마운트 한정 경고 검증은 HMR 재확인이 아니라 **dev 서버 재시작 후 fresh 로드**로 한다(버퍼 누적 오판 방지). 같은 결의 SSR 초기화 경고로 [[dnd-kit-ssr-hydration-mismatch-2026-06-22]] 도 참고.
