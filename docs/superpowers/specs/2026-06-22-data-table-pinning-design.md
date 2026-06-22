# dataTable Phase 3 — 열 고정·리사이즈 (docs 데모/레시피) 설계

- 작성일: 2026-06-22
- 대상 레포: sh-ui (apps/docs 전용)
- 상태: 설계 승인됨 → 플랜 작성 단계

## 배경

v0.118.0 에서 `table`(presentational primitives + TanStack v8 정렬·선택·페이지 데모)을, v0.119.0/Phase 2 에서 필터 데모를 추가했다. Phase 3 는 **열 고정(pinning)·리사이즈(sizing)** 를 다룬다.

`table` primitives(`Table`/`TableHeader`/`TableHead`/`TableCell` …)는 모두 `style`·`className`·`ref`·`...props` 를 forward 하고, `Table` 래퍼 `.sh-ui-table__wrapper` 는 `overflow-x: auto`(sticky pinning 이 붙을 스크롤 컨테이너)다. 따라서 **table/registry 무변경**으로, TanStack column pinning/sizing API + inline style 조합을 docs 데모/레시피로 보여줄 수 있다(shadcn data-table 의 pinning/resizing 레시피 모델).

## 목표

- docs 에 동작하는 **열 고정 + 열 리사이즈** 데모: 좌측 고정(첫 열) + 우측 고정 가능, 각 열 드래그 리사이즈.
- 사용자가 복사해 쓰는 레시피 — table primitives + TanStack pinning/sizing wiring(헬퍼 포함).
- Phase 1(정렬·선택·페이지)·Phase 2(필터)와 같은 "데모/레시피" 결의 일관성 유지.

## 비목표

- `table` registry 컴포넌트 변경 — **무변경**(sticky/resize 스타일·핸들은 데모 inline style 로).
- 새 registry 컴포넌트(data-table 래퍼 등) — 이번엔 안 함.
- 버전 범프/릴리즈 — docs 전용(versions.json·cli/package.json·react summary 무관).

## 설계

### 새 데모 `_demos/data-table-pin-resize.tsx`

Phase 1/2 와 별도 파일. 가로 스크롤이 실제로 필요하도록 열을 늘린다(name/role/age/email/team/location).

#### 열 고정 (column pinning)

- `useReactTable` 에 `enableColumnPinning: true`, `state.columnPinning` + `onColumnPinningChange`. 초기값 `{ left: ["name"], right: [] }`.
- 각 헤더에 핀 컨트롤(좌측 고정 / 우측 고정 / 해제) — 작은 버튼. `column.pin("left" | "right" | false)`.
- **sticky 위치 계산 헬퍼**(데모 내 함수):

```tsx
function pinnedStyle(column: Column<Person>): React.CSSProperties {
  const pinned = column.getIsPinned(); // false | "left" | "right"
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? column.getStart("left") : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    zIndex: 1,
    // 스크롤된 비고정 셀을 가리기 위한 불투명 배경 (셀 기본은 transparent)
    background: "var(--background)",
    // 고정 경계 표시
    boxShadow:
      pinned === "left"
        ? "inset -1px 0 0 0 var(--border)"
        : pinned === "right"
          ? "inset 1px 0 0 0 var(--border)"
          : undefined,
  };
}
```

- `th`(헤더)에는 위 + `zIndex: 2`(헤더가 바디 위), 배경은 헤더와 동일 톤(`var(--background)`). `td`(바디)에는 헬퍼 그대로 적용.
- 핀 헤더/셀 양쪽에 같은 헬퍼를 적용해 좌/우 모두 sticky. `getStart("left")`/`getAfter("right")` 가 다중 고정 시 누적 offset 을 계산.

#### 열 리사이즈 (column sizing)

- `enableColumnResizing: true`, `columnResizeMode: "onChange"`.
- 테이블 inline style: `tableLayout: "fixed"`, `width: table.getTotalSize()`. 각 `th`/`td` 에 `width: header.getSize()` / `cell.column.getSize()`.
- 각 헤더 우측에 리사이즈 핸들(`<div>`): `onMouseDown`/`onTouchStart={header.getResizeHandler()}`, `cursor: col-resize`, `position: absolute; insetBlock: 0; right: 0; width: var(--space-1)`. 헤더 셀은 `position: relative`(핸들 기준). 리사이즈 중이면 핸들 강조(`header.column.getIsResizing()`).
- 컬럼 def 에 기본 사이즈 부여(`size: 160` 등 px 숫자 — TanStack sizing 은 number 전용; CSS 토큰 px 정책의 "px 허용 예외" 와 무관하게 **JS 숫자 값**이라 토큰 대상 아님). 데모 주석으로 명시.

#### 정렬·선택과의 공존 메모

- 이 데모는 pinning/sizing 에 집중. 정렬 핸들은 넣되(헤더 라벨 클릭) 핀 컨트롤·리사이즈 핸들과 클릭 영역이 겹치지 않게 레이아웃 분리(라벨/정렬 = 가운데, 핀 버튼 = 라벨 옆, 리사이즈 핸들 = 셀 우측 끝 absolute).
- 선택 컬럼·페이지네이션은 이 데모에서 생략(Phase 1 데모가 이미 다룸) — 범위 최소화.

### docs page.tsx (table)

- "열 고정·리사이즈" h2 섹션 추가: 한 줄 설명 + `<Preview>` 로 `<DataTablePinResizeDemo />` + `<CodePanel>` 로 핵심 wiring 발췌(enableColumnPinning/columnPinning, pinnedStyle 헬퍼, enableColumnResizing/columnResizeMode, getResizeHandler, tableLayout fixed + getTotalSize/getSize).
- 기존 섹션(정렬·선택·페이지·필터·SubComponents/PropsTable)은 그대로.

### 데이터 흐름 요약

```tsx
const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({ left: ["name"], right: [] });
const table = useReactTable({
  data, columns,
  state: { columnPinning },
  onColumnPinningChange: setColumnPinning,
  enableColumnPinning: true,
  enableColumnResizing: true,
  columnResizeMode: "onChange",
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
// 렌더: <Table style={{ tableLayout:"fixed", width: table.getTotalSize() }}>
//   th/td: style={{ width: getSize(), ...pinnedStyle(column) }}
//   헤더 우측: <div onMouseDown={header.getResizeHandler()} .../>
```

## 접근성

- 핀 버튼: `aria-label`(예: "이름 열 왼쪽 고정"/"고정 해제"), `aria-pressed` 로 현재 고정 상태 표시.
- 리사이즈 핸들: 마우스/터치 전용이라 키보드 사용자를 위해 `role="separator"` + `aria-hidden` 은 부적절 → 핸들은 장식 div(`aria-hidden`)로 두고, 핵심 기능(고정)은 버튼으로 키보드 접근 보장. 리사이즈는 마우스 보조 기능으로 한정(데모 주석에 명시).
- 정렬 라벨 버튼의 `aria-sort` 는 Phase 1 패턴 유지(정렬을 데모에 포함할 경우).

## 검증

- `apps/docs` `pnpm tsc --noEmit` 에러 0(특히 `Column`/`ColumnPinningState` 타입 import).
- `pnpm build` 성공, `/components/table` 정적 생성.
- preview eval(가능 시): (1) 가로 스크롤 시 첫 열이 좌측에 고정되어 보임, (2) 핀 버튼으로 다른 열 좌/우 고정·해제, (3) 헤더 우측 핸들 드래그로 열 폭 변경, (4) 고정 셀 배경이 스크롤된 셀을 가림(겹침 없음).

## 릴리즈

- **없음** — docs 전용(table·registry·cli 무변경). dev → live 는 일반 docs PR(태그·npm 없음), 사용자 확인 후 머지.

## 백로그 (dataTable 다음 phase)

- Phase 4 — 그룹화·확장(getGroupedRowModel/getExpandedRowModel).
- Phase 5 — 행/열 DnD(@dnd-kit).
- Flutter dataTable — 별도.
