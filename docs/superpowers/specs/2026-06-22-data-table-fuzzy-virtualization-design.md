# dataTable PR B — Fuzzy Filtering · Virtualization (docs 데모/레시피) 설계

- 작성일: 2026-06-22
- 대상 레포: sh-ui (apps/docs 전용)
- 상태: 설계 승인됨 → 플랜 작성 단계

## 배경

TanStack 기능 가이드 커버리지의 마지막 묶음(PR B): **Fuzzy Filtering** 과 **Virtualization**. 둘 다 별도 헬퍼 패키지가 필요해 PR A(내장 기능)와 분리했다. `table`·registry 무변경, docs 데모/레시피.

## 목표

- **Fuzzy Filtering** — 오타 관대 글로벌 검색(랭킹 기반). `@tanstack/match-sorter-utils` 의 `rankItem` 으로 커스텀 `filterFn`.
- **Virtualization** — 대량(1,000행) 데이터에서 보이는 행만 렌더. `@tanstack/react-virtual` 의 `useVirtualizer`.

## 비목표

- `table` registry 변경 — 무변경.
- 컬럼 가상화 — 행 가상화만(컬럼 가상화는 후속 가능).
- 버전 범프/릴리즈(sh-ui 코어) — docs 전용. 단 apps/docs 의존성 2개 추가.

## 의존성 (apps/docs)

- `@tanstack/match-sorter-utils` — `rankItem`/`compareItems`.
- `@tanstack/react-virtual` — `useVirtualizer`.

(둘 다 React 19 호환.)

## 설계

### 1. `_demos/data-table-fuzzy.tsx`

- 커스텀 filterFn:
  ```ts
  const fuzzyFilter: FilterFn<Person> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value as string);
    addMeta({ itemRank });
    return itemRank.passed;
  };
  ```
- `globalFilter` state + `onGlobalFilterChange`, `globalFilterFn: fuzzyFilter`, `getFilteredRowModel`. 단일 `Input` 으로 전 컬럼 오타 관대 검색.
- (선택) 퍼지 랭킹 정렬: `sortingFns` 에 rank 비교(`compareItems(rowA.columnFiltersMeta[columnId].itemRank, ...)`). 데모에선 글로벌 검색 + 결과 카운트로 충분, 랭킹 정렬은 코드 주석으로 언급.
- 예: "김상혀"/"enginer" 같은 오타도 매칭.

### 2. `_demos/data-table-virtualized.tsx`

- 1,000행 생성(모듈 상수, 결정론적 — `Date.now`/`random` 미사용; index 기반 더미).
- 고정 높이 스크롤 컨테이너(예: `20rem`, `overflow:auto`) ref.
- `useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => 행높이, overscan: 8 })`.
- 렌더: `virtualizer.getVirtualItems()` 로 보이는 행만 `<TableRow>` 출력. 전체 스크롤 높이는 `virtualizer.getTotalSize()`; 보이는 행을 `transform: translateY(virtualRow.start)` 로 배치하거나 상/하 spacer 행으로 처리.
  - table 구조 유지를 위해: tbody 안에서 상단 spacer `<tr style={{height: paddingTop}}/>` + 가상 행들 + 하단 spacer `<tr style={{height: paddingBottom}}/>` 방식(table 호환).
- "1,000행 중 N개만 DOM 렌더" 를 설명 텍스트로.

### docs page.tsx (table)

- "퍼지 검색", "행 가상화" h2 섹션 각각 Preview + CodeTabs. "패싯" 섹션 다음, "Installation" 앞.

## 접근성

- 퍼지 검색 `Input` `aria-label`.
- 가상화 스크롤 컨테이너는 의미상 표 영역 — 헤더 유지, 스크롤 가능 영역 명시.

## 검증

- `apps/docs` `pnpm install`(deps), `pnpm tsc --noEmit` 0, `pnpm build` 성공.
- preview eval(가능 시): (1) 퍼지 — 오타 입력 시 근접 행 매칭·카운트 갱신, (2) 가상화 — 1,000행인데 DOM `tbody tr` 수가 (대략 overscan+viewport)만, 스크롤 시 행 내용 바뀜, (3) 콘솔 에러 0.
- 첫-마운트 setState 경고 시 `autoResetAll: false`(grouping 학습 참조), fresh 서버 재시작 검증.

## 릴리즈

- **없음(sh-ui 코어)** — table·registry·cli·versions.json 무변경. dev → live 일반 docs PR(태그·npm 없음). apps/docs/package.json + lockfile 변경 포함.

## 백로그 (이후, dataTable 외)

- 행(row) DnD — @dnd-kit 세로.
- Flutter dataTable.
- (선택) 컬럼 가상화.
