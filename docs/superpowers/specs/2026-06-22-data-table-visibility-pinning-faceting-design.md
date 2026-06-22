# dataTable PR A — Column Visibility · Row Pinning · Faceting (docs 데모/레시피) 설계

- 작성일: 2026-06-22
- 대상 레포: sh-ui (apps/docs 전용)
- 상태: 설계 승인됨 → 플랜 작성 단계

## 배경

dataTable 데모는 TanStack 기능 가이드의 다수 기능(정렬·선택·페이지·필터·고정·리사이즈·순서·그룹화·확장)을 이미 커버한다. 남은 가이드 기능을 채우기 위한 첫 묶음(PR A): **Column Visibility, Row Pinning, Column/Global Faceting**. 셋 다 TanStack v8 내장이라 새 의존성 0, `table`·registry 무변경으로 docs 데모/레시피로 보여준다.

(PR B 후속: Fuzzy Filtering, Virtualization — 새 의존성 동반.)

## 목표

- docs 에 동작하는 데모 3개:
  1. **Column Visibility** — 열 표시/숨김 토글.
  2. **Row Pinning** — 행을 상단/하단에 고정.
  3. **Faceting** — `getFacetedRowModel` + `getFacetedUniqueValues`/`getFacetedMinMaxValues` 로 패싯 값·개수·범위.
- 복붙 가능한 레시피.

## 비목표

- `table` registry 변경 — 무변경.
- 새 의존성 — 없음(전부 TanStack 내장).
- Fuzzy/Virtualization — PR B.
- 버전 범프/릴리즈 — docs 전용.

## 설계

### 1. `_demos/data-table-visibility.tsx`

- state: `columnVisibility: VisibilityState` + `onColumnVisibilityChange`.
- 컨트롤: 각 열 체크박스(`column.getIsVisible()`, `column.getToggleVisibilityHandler()`), "모두 표시"/"모두 숨김"(`table.toggleAllColumnsVisible(true|false)`). `column.getCanHide()` 로 토글 가능 열만 노출.
- 테이블: 헤더 `getVisibleLeafColumns`/`getHeaderGroups`, 셀 `row.getVisibleCells()` 가 visibility 자동 반영.
- 데이터: name/role/team/age 5~6행.

### 2. `_demos/data-table-row-pinning.tsx`

- state: `rowPinning: RowPinningState` + `enableRowPinning: true`, `onRowPinningChange`. `keepPinnedRows: true`.
- 각 행에 핀 컨트롤: ⤒(상단)/⤓(하단)/✕(해제) — `row.pin("top"|"bottom"|false)`, 현재 상태 `row.getIsPinned()`(false|"top"|"bottom").
- 렌더 3구역: `table.getTopRows()`(상단 고정) → `table.getCenterRows()`(일반) → `table.getBottomRows()`(하단 고정). 고정 행은 sticky inline style — 상단 `position:sticky; top:0`, 하단 `position:sticky; bottom:0`, `zIndex` + 불투명 배경(`var(--background)`)으로 겹침 방지.
- 스크롤이 보이게 래퍼에 `maxHeight`(예: 14rem) + `overflow:auto`.

### 3. `_demos/data-table-faceting.tsx`

- row models: `getCoreRowModel` + `getFilteredRowModel` + `getFacetedRowModel` + `getFacetedUniqueValues` + `getFacetedMinMaxValues`.
- 역할 faceted 필터(Phase 2 패턴) + **각 값의 실제 개수**: `column.getFacetedUniqueValues()`(Map<value, count>)로 체크박스 라벨에 `역할 (N)` 표시. `filterFn: "arrIncludesSome"`.
- 나이: `column.getFacetedMinMaxValues()`로 `[min, max]` 힌트 텍스트 표시.
- 패싯 값이 다른 필터에 반응(filteredRowModel 등록 효과)함을 설명.

### docs page.tsx (table)

- 3개 h2 섹션("열 표시 토글", "행 고정", "패싯(값·개수)") 각각 Preview + CodeTabs. "그룹화·확장" 섹션 다음, "Installation" 앞에 삽입.

## 접근성

- visibility 체크박스: 각 열 `aria-label`(예: "역할 열 표시").
- row pin 버튼: `aria-label`(예: "이 행 상단 고정") + `aria-pressed`.
- faceting 체크박스: 값+개수 텍스트로 의미 전달(색 의존 X).
- 고정 행 배경 불투명, sticky 경계 명확.

## 검증

- `apps/docs` `pnpm tsc --noEmit` 0(`VisibilityState`/`RowPinningState` import), `pnpm build` 성공.
- preview eval(가능 시): (1) visibility 토글 시 열 사라짐/나타남, (2) 행 상단/하단 고정 시 스크롤해도 고정 유지, (3) faceting 체크박스에 개수 표시·필터 시 행 감소·나이 min/max 표시, (4) 콘솔 에러 0.
- (주의) TanStack 자동 리셋 관련 첫-마운트 setState 경고가 보이면 `autoResetAll: false` 적용(그룹화 데모 학습: `docs/solutions/runtime-errors/tanstack-grouping-unmounted-setstate-2026-06-22.md`). fresh 서버 재시작으로 검증.

## 릴리즈

- **없음** — docs 전용(table·registry·cli 무변경, 새 의존성 0). dev → live 일반 docs PR(태그·npm 없음).

## 백로그 (이후)

- PR B — Fuzzy Filtering(`@tanstack/match-sorter-utils`), Virtualization(`@tanstack/react-virtual`).
- 행(row) DnD — @dnd-kit 세로.
- Flutter dataTable.
