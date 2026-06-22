# dataTable Phase 5 — 열 순서 드래그앤드롭 (docs 데모/레시피) 설계

- 작성일: 2026-06-22
- 대상 레포: sh-ui (apps/docs 전용)
- 상태: 설계 승인됨 → 플랜 작성 단계

## 배경

dataTable 데모는 Phase 1(정렬·선택·페이지), Phase 2(필터), Phase 3(열 고정·리사이즈)를 거쳤다. Phase 5 는 **열 순서 변경(column reordering)** 을 드래그앤드롭으로 보여준다.

중요 구분: **고정(pinning)** 은 열을 가장자리에 sticky로 붙박는 것(Phase 3, `⇤`/`⇥` 버튼)이고, **순서 변경(reordering)** 은 열 배치 순서 자체를 바꾸는 별개 기능이다. TanStack 은 후자를 `columnOrder: string[]` state 로 다룬다. 드래그 인터랙션은 @dnd-kit(TanStack 공식 레시피와 동일)으로 구현한다.

## 목표

- docs 에 동작하는 **열 헤더 드래그로 순서 변경** 데모: 그립 핸들을 잡아 좌/우로 끌면 열 순서가 바뀌고 바디 셀도 따라 이동.
- 키보드 접근성 포함(@dnd-kit Keyboard 센서: Space 잡기 → ←/→ 이동 → Space 드롭).
- 사용자가 복사해 쓰는 레시피 — TanStack `columnOrder` + @dnd-kit sortable wiring.

## 비목표

- `table` registry 컴포넌트 변경 — **무변경**(DnD 는 데모 내 @dnd-kit + TanStack columnOrder).
- 행(row) DnD — 이번 범위 아님. 후속 별도.
- 고정/리사이즈와 한 데모에 합치기 — 안 함(sticky + DnD 동시는 복잡 → 별도 파일).
- sh-ui 코어 버전 범프/npm 릴리즈 — 없음. 단 **apps/docs 에 @dnd-kit 의존성 3개 추가**(docs PR).

## 의존성

apps/docs 에 추가 (React 19 / Next 16 호환 — @dnd-kit peer `react >= 16.8`):

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/modifiers`

table·registry·cli 무변경이므로 sh-ui 자체 의존성에는 영향 없음.

## 설계

### 새 데모 `_demos/data-table-column-dnd.tsx`

Phase 1~3 데모와 별도 파일. 구성:

- **상태:** `columnOrder: string[]`(컬럼 id 배열) + `onColumnOrderChange`. 초기값은 columns 정의 순서.
- **DndContext:** 센서 = `PointerSensor` + `KeyboardSensor`(sortableKeyboardCoordinates). modifier = `restrictToHorizontalAxis`(가로 이동만). `onDragEnd` 에서 `arrayMove(columnOrder, oldIndex, newIndex)` → setColumnOrder.
- **SortableContext:** `items = columnOrder`, strategy = `horizontalListSortingStrategy`. 헤더 행 전체를 감쌈.
- **DraggableHead(헤더 셀 컴포넌트):** `useSortable({ id: column.id })` → `setNodeRef`, `transform`(CSS.Translate.toString), `transition`, `isDragging`. 헤더 안에 **그립 핸들**(`⠿`, `{...attributes} {...listeners}`)을 두어 핸들만 드래그 시작점이 되게 함(라벨 텍스트는 클릭 가능 유지). 드래그 중 `opacity`/`zIndex` 강조.
- **바디:** `row.getVisibleCells()` 가 TanStack 의 columnOrder 를 자동 반영하므로 셀은 추가 작업 없이 헤더와 같은 순서로 렌더. (셀에는 DnD 불필요 — 헤더만 sortable.)
- 데이터/컬럼은 Phase 3 데모와 유사(name/role/email/team/age 등 5~6열) 재사용 가능하되 size·pinning 관련 props 는 제외(여기선 순서만).

### 데이터 흐름 요약

```tsx
const [columnOrder, setColumnOrder] = React.useState<string[]>(
  () => columns.map((c) => c.id as string), // 또는 accessorKey 기반 id
);
const table = useReactTable({
  data, columns,
  state: { columnOrder },
  onColumnOrderChange: setColumnOrder,
  getCoreRowModel: getCoreRowModel(),
});

function onDragEnd(e: DragEndEvent) {
  const { active, over } = e;
  if (over && active.id !== over.id) {
    setColumnOrder((prev) => {
      const oldI = prev.indexOf(active.id as string);
      const newI = prev.indexOf(over.id as string);
      return arrayMove(prev, oldI, newI);
    });
  }
}

<DndContext sensors={sensors} modifiers={[restrictToHorizontalAxis]} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
  <Table>
    <TableHeader>
      <TableRow>
        <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
          {headerGroup.headers.map((header) => <DraggableHead key={header.id} header={header} />)}
        </SortableContext>
      </TableRow>
    </TableHeader>
    <TableBody>{/* 평범한 셀 렌더 — columnOrder 자동 반영 */}</TableBody>
  </Table>
</DndContext>
```

> 컬럼 id: accessorKey 만 있는 컬럼은 TanStack 이 id 를 accessorKey 로 자동 설정하므로 `column.id` 사용. SortableContext items 와 useSortable id 를 동일한 `column.id` 로 맞춘다.

### docs page.tsx (table)

- "열 순서 변경 (드래그앤드롭)" h2 섹션: 한 줄 설명(헤더 그립을 끌어 순서 변경, 키보드 Space/←/→ 지원) + `<Preview>` 로 `<DataTableColumnDndDemo />` + `<CodePanel>`/`<CodeTabs>` 로 핵심 wiring(columnOrder + DndContext/SortableContext + useSortable + arrayMove).
- 기존 섹션 그대로.

## 접근성

- @dnd-kit `KeyboardSensor` + `sortableKeyboardCoordinates`: 그립 핸들 포커스 후 Space 로 픽업, ←/→ 로 이동, Space 로 드롭, Esc 취소. 마우스 없이도 순서 변경 가능.
- 그립 핸들 `aria-label`(예: "이메일 열 순서 변경 핸들"), `button` 요소로 포커서블.
- 드래그 중 시각 피드백(opacity/zIndex) — 색만이 아니라 위치 변화로 전달.

## 검증

- `apps/docs` `pnpm install`(새 deps), `pnpm tsc --noEmit` 0, `pnpm build` 성공.
- preview eval(가능 시): (1) 헤더 그립을 끌어 두 열 위치 교환 시 columnOrder 와 바디 셀 순서가 함께 바뀜, (2) 키보드(Space→화살표→Space)로 동일 동작, (3) 콘솔 에러 0.
- DnD 자체 단위 테스트는 생략 — @dnd-kit + 브라우저 포인터/키보드 통합이라 build/preview 가 적절한 게이트(Phase 1~3 와 동일 기조).

## 릴리즈

- **없음** — sh-ui 코어(table·registry·cli) 무변경. dev → live 일반 docs PR(태그·npm 없음). 단 apps/docs/package.json 에 @dnd-kit 3개 추가 + lockfile 갱신 포함.

## 백로그 (dataTable 다음)

- Phase 4 — 그룹화·확장(getGroupedRowModel/getExpandedRowModel).
- 행(row) DnD — @dnd-kit + verticalListSortingStrategy(이 열-DnD 레시피의 행 버전).
- Flutter dataTable — 별도.
