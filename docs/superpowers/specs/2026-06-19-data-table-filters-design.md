# dataTable Phase 2 — 필터 (docs 데모/레시피) 설계

- 작성일: 2026-06-19
- 대상 레포: sh-ui (apps/docs 전용)
- 상태: 설계 승인 대기

## 배경

v0.118.0 에서 `table`(presentational primitives + TanStack v8 정렬·선택·페이지 데모)을 배포했다. Phase 2 는 **필터**를 추가한다. `table` 은 presentational 이고 필터는 순수 TanStack 기능(`getFilteredRowModel`) + 기존 sh-ui 컴포넌트(Input·Popover·Checkbox) 조합이므로, **table/registry 는 건드리지 않고 docs 데모/레시피로** 필터 패턴을 보여준다(shadcn data-table toolbar 모델).

## 목표

- docs 에 동작하는 필터 데모: 글로벌 필터 + faceted(컬럼 값 다중선택) 필터, Phase 1(정렬·선택·페이지)와 공존.
- 사용자가 복사해 쓰는 레시피 — table primitives + TanStack 필터 wiring.

## 비목표

- `table` registry 컴포넌트 변경 — 무변경.
- 새 registry 컴포넌트(faceted-filter 등) — 이번엔 안 함(데모/레시피로 충분, 후속에서 컴포넌트화 검토).
- 버전 범프/릴리즈 — docs 전용.

## 설계

### 새 데모 `_demos/data-table-filter.tsx`

Phase 1 데모(`data-table.tsx`)와 별도 파일. shadcn data-table toolbar 패턴:

- **글로벌 필터**: 테이블 위 `Input` → `globalFilter` state + `onGlobalFilterChange` + `getFilteredRowModel()`. 모든 컬럼 텍스트 매칭.
- **faceted 필터**: `role` 컬럼 값(Owner/Admin/Member) 다중선택 — `Popover` + 체크박스 리스트(고유값 추출), `column.setFilterValue(string[] | undefined)`. 트리거 버튼에 선택 개수 뱃지. 컬럼 `filterFn: "arrIncludesSome"`.
- **초기화**: 활성 필터 있으면 "초기화" 버튼(`table.resetColumnFilters()` + `setGlobalFilter("")`).
- **결과 카운트**: `table.getFilteredRowModel().rows.length` / 전체.
- Phase 1 기능 공존: 같은 `useReactTable` 에 `getFilteredRowModel`, `state.globalFilter`/`columnFilters`, `onGlobalFilterChange`/`onColumnFiltersChange` 추가. 정렬·선택·페이지 그대로.

### docs page.tsx (table)

- "필터" 예제 섹션 추가: `<Preview>` 로 `<DataTableFilterDemo />` 렌더 + `<CodePanel>` 로 핵심 코드(글로벌·faceted wiring).
- Usage/설명에 한 줄: 필터는 `getFilteredRowModel` + state 추가, faceted 는 `setFilterValue` + `arrIncludesSome`.

### 데이터 흐름

```tsx
const [globalFilter, setGlobalFilter] = useState("");
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const table = useReactTable({
  data, columns,
  state: { sorting, rowSelection, globalFilter, columnFilters },
  onGlobalFilterChange: setGlobalFilter,
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),   // 신규
  getPaginationRowModel: getPaginationRowModel(),
  ...
});
// role 컬럼 def 에 filterFn: "arrIncludesSome"
// faceted 트리거: table.getColumn("role")?.setFilterValue(selected.length ? selected : undefined)
```

## 검증

- `apps/docs` `pnpm tsc --noEmit` 에러 0, `pnpm build` 성공.
- (가능 시) preview eval — 글로벌 입력 시 행 필터, faceted 체크 시 role 필터, 초기화 동작.

## 릴리즈

- **없음** — docs 전용(table·registry·cli 무변경). dev → live 는 일반 docs PR(태그·npm 없음).

## 백로그 (dataTable 다음 phase)

- Phase 3 — 열 고정(pinning)·리사이즈(sizing). (table 컴포넌트에 sticky/resize 스타일·핸들 필요 — registry 변경 가능성 → 릴리즈 동반)
- Phase 4 — 그룹화·확장(getGroupedRowModel/getExpandedRowModel).
- Phase 5 — 행/열 DnD(@dnd-kit).
- Flutter dataTable — 별도.
