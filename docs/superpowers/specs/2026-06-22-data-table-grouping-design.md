# dataTable Phase 4 — 그룹화·확장 (docs 데모/레시피) 설계

- 작성일: 2026-06-22
- 대상 레포: sh-ui (apps/docs 전용)
- 상태: 설계 승인됨 → 플랜 작성 단계

## 배경

dataTable 데모는 Phase 1(정렬·선택·페이지), 2(필터), 3(고정·리사이즈), 5(열 순서 DnD)를 거쳤다. Phase 4 는 **행 그룹화(grouping)와 확장/축소(expanding)** 를 다룬다. TanStack v8 은 `getGroupedRowModel()` + `getExpandedRowModel()` 로 이를 내장 지원하므로, `table` 컴포넌트·registry 무변경·새 의존성 0 으로 docs 데모/레시피로 보여줄 수 있다.

## 목표

- docs 에 동작하는 그룹화 데모: 토글 버튼으로 **팀/역할 기준 그룹화·해제**, 그룹 행 **확장/축소**(개별 + 전체), 숫자 컬럼(나이) **집계(평균)**.
- 사용자가 복사해 쓰는 레시피 — `grouping` state + `getGroupedRowModel`/`getExpandedRowModel` + 셀 렌더 분기(grouped/aggregated/placeholder).

## 비목표

- `table` registry 컴포넌트 변경 — **무변경**(그룹 토글·들여쓰기는 데모 inline).
- 새 registry 컴포넌트·새 의존성 — 없음(TanStack 내장).
- 다중 그룹 기준(중첩 그룹) — 이번엔 단일 기준(팀 또는 역할)으로 단순화. 중첩은 후속.
- 버전 범프/릴리즈 — docs 전용.

## 설계

### 새 데모 `_demos/data-table-grouping.tsx`

- **데이터:** 그룹이 보이도록 팀/역할 중복이 있는 6~8행(팀: Core/Web/Design 등, 역할: Engineer/Designer/PM 등).
- **컬럼:** name/team/role/age. `age` 에 `aggregationFn: "mean"`(그룹 집계 평균). team/role 은 `getCanGroup` 기본 허용.
- **state:** `grouping: GroupingState`(string[]), `expanded: ExpandedState`. `onGroupingChange`/`onExpandedChange`.
- **그룹 토글 버튼:** "팀"/"역할"/"해제" — 각각 `setGrouping(["team"])` / `setGrouping(["role"])` / `setGrouping([])`. 현재 활성 기준은 `aria-pressed` 표시.
- **확장 컨트롤:** "모두 펼치기/접기" 버튼 → `table.toggleAllRowsExpanded()`. 그룹 행 셀에 토글(▶/▼) → `row.getToggleExpandedHandler()`, `row.getIsExpanded()`.
- **셀 렌더 분기:**
  - `cell.getIsGrouped()` → 그룹 헤더 셀: 토글(▶/▼) + 그룹값 + 하위 개수 `(${row.subRows.length})`. `row.depth` 로 `paddingInlineStart` 들여쓰기.
  - `cell.getIsAggregated()` → 집계 셀: `flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, ...)`(나이 평균).
  - `cell.getIsPlaceholder()` → 빈 셀(그룹 기준 컬럼의 자식 행 placeholder).
  - 그 외 → 일반 셀.
- 그룹 해제(`grouping: []`) 시 평범한 평면 테이블로 폴백.

### 데이터 흐름 요약

```tsx
const [grouping, setGrouping] = React.useState<GroupingState>([]);
const [expanded, setExpanded] = React.useState<ExpandedState>({});
const table = useReactTable({
  data, columns,
  state: { grouping, expanded },
  onGroupingChange: setGrouping,
  onExpandedChange: setExpanded,
  getCoreRowModel: getCoreRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
});
// 토글: setGrouping(["team"]) / ["role"] / []
// 셀: cell.getIsGrouped() ? 토글+값+개수 : cell.getIsAggregated() ? 집계 : cell.getIsPlaceholder() ? null : 일반
```

### docs page.tsx (table)

- "그룹화·확장" h2 섹션: 한 줄 설명(팀/역할 토글, 확장/축소, 평균 집계) + `<Preview>` 로 `<DataTableGroupingDemo />` + `<CodeTabs>` 로 핵심 wiring(grouping state + getGroupedRowModel/getExpandedRowModel + 셀 분기).
- 기존 섹션 그대로.

## 접근성

- 그룹 토글(▶/▼) 버튼: `aria-expanded` + `aria-label`(예: "Core 그룹 펼치기/접기").
- 그룹 기준 버튼: `aria-pressed` 로 현재 기준 표시.
- 집계/그룹 행은 시각(들여쓰기·개수)만이 아니라 텍스트로도 의미 전달.

## 검증

- `apps/docs` `pnpm tsc --noEmit` 0(특히 `GroupingState`/`ExpandedState` import), `pnpm build` 성공.
- preview eval(가능 시): (1) "팀" 클릭 시 팀별 그룹 행 생성+집계, (2) 그룹 토글로 확장/축소, (3) "역할"로 기준 전환, (4) "해제" 시 평면 복귀, (5) 콘솔 에러 0.

## 릴리즈

- **없음** — docs 전용(table·registry·cli 무변경, 새 의존성 0). dev → live 일반 docs PR(태그·npm 없음).

## 백로그 (dataTable 다음)

- 행(row) DnD — @dnd-kit + verticalListSortingStrategy(열 DnD의 세로 버전).
- Flutter dataTable — 별도.
- (후속) 중첩 그룹(다중 grouping 기준).
