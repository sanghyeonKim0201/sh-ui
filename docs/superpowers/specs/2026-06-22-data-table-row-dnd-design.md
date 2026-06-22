# dataTable 행(Row) DnD (docs 데모/레시피) 설계

- 작성일: 2026-06-22
- 대상 레포: sh-ui (apps/docs 전용)
- 상태: 설계 승인됨 → 플랜 작성 단계

## 배경

Phase 5 에서 **열(column) 순서 DnD** 를 추가했다. 이번엔 그 세로 버전인 **행(row) 순서 DnD**. @dnd-kit 은 이미 docs 에 설치돼 있어(Phase 5) 새 의존성 0, `table`·registry 무변경으로 docs 데모로 보여준다.

## 목표

- docs 에 동작하는 행 드래그 순서 변경 데모: 행 그립(`⠿`)을 잡아 위/아래로 끌어 순서 변경. 키보드 지원(Space→↑/↓→Space).
- 복붙 가능한 레시피 — 데이터 배열 로컬 state + @dnd-kit vertical sortable.

## 비목표

- `table` registry 변경 — 무변경.
- TanStack rowModel 의 정렬/필터와 동시 조합 — 이번엔 순수 순서 변경에 집중(데이터 배열을 직접 재정렬).
- 새 의존성 — 없음(@dnd-kit 재사용).
- 버전 범프/릴리즈 — docs 전용.

## 핵심 결정: 데이터 배열을 직접 재정렬

열 DnD 는 TanStack `columnOrder` state 가 있지만, **행에는 대응하는 "row order" state 가 없다.** 따라서 행 순서는 **데이터 배열 자체를 로컬 `useState` 로 들고** `onDragEnd` 에서 `arrayMove` 로 재정렬한다. `getRowId` 로 안정 id 를 유지하고, `SortableContext items` 와 `useSortable id` 를 행 id 로 맞춘다.

## 설계

### 새 데모 `_demos/data-table-row-dnd.tsx`

- **state:** `const [rows, setRows] = useState(initialData)` — 행 데이터 배열.
- **table:** `useReactTable({ data: rows, columns, getRowId: (r) => r.id, getCoreRowModel })`.
- **DnD:** `DndContext`(센서: Pointer + Keyboard/sortableKeyboardCoordinates, modifier: `restrictToVerticalAxis`, `id={React.useId()}`) → `SortableContext`(items = `rows.map(r => r.id)`, `verticalListSortingStrategy`).
- **DraggableRow(행 컴포넌트):** `useSortable({ id: row.id })` → `setNodeRef`, `transform`(CSS.Transform.toString — 세로 이동이므로 Transform 사용), `transition`, `isDragging`. 첫 셀(또는 전용 셀)에 그립 핸들(`⠿`, `{...attributes} {...listeners}`). 드래그 중 `opacity`/배경 강조.
- **onDragEnd:** `arrayMove(rows, oldIndex, newIndex)` → setRows. oldIndex/newIndex 는 `rows.findIndex(r => r.id === active.id/over.id)`.
- 데이터: name/role/team 5~6행.

### 데이터 흐름 요약

```tsx
const [rows, setRows] = React.useState<Person[]>(initialData);
const rowIds = React.useMemo(() => rows.map((r) => r.id), [rows]);
const table = useReactTable({ data: rows, columns, getRowId: (r) => r.id, getCoreRowModel: getCoreRowModel() });
const dndId = React.useId();

function onDragEnd(e: DragEndEvent) {
  const { active, over } = e;
  if (over && active.id !== over.id) {
    setRows((prev) => {
      const oldI = prev.findIndex((r) => r.id === active.id);
      const newI = prev.findIndex((r) => r.id === over.id);
      return arrayMove(prev, oldI, newI);
    });
  }
}

<DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter}
  modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
  <Table>
    <TableBody>
      <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
        {table.getRowModel().rows.map((row) => <DraggableRow key={row.id} row={row} />)}
      </SortableContext>
    </TableBody>
  </Table>
</DndContext>
```

> 행 컴포넌트 transform: 세로 이동이라 `CSS.Transform.toString(transform)`(translate + 필요 시) 사용. `tr` 에 `position: relative` 가 transform 적용에 안전.

### docs page.tsx (table)

- "행 순서 변경 (드래그앤드롭)" h2 섹션: 한 줄 설명(행 그립 드래그, 데이터 배열 재정렬, 키보드) + Preview + CodeTabs(rows state + SortableContext vertical + useSortable + arrayMove). "행 가상화" 섹션 다음(또는 "행 고정" 근처), "Installation" 앞.

## 접근성

- 그립 핸들: `aria-label`(예: "김상현 행 순서 변경 핸들"), `button` 포커서블.
- @dnd-kit KeyboardSensor: Space 픽업 → ↑/↓ 이동 → Space 드롭 → Esc 취소.
- 드래그 중 위치 변화로 의미 전달(색 의존 X).

## 검증

- `apps/docs` `pnpm tsc --noEmit` 0(`DragEndEvent`/`Row` import), `pnpm build` 성공.
- preview eval(가능 시): (1) 행 그립 드래그로 순서 변경(data-index/내용 반영), (2) 키보드 이동, (3) **fresh SSR 로드 콘솔 에러 0**(useId 하이드레이션 가드 확인), (4) 일반 콘솔 에러 0.

## 릴리즈

- **없음** — docs 전용(table·registry·cli 무변경, 새 의존성 0). dev → live 일반 docs PR(태그·npm 없음).

## 백로그 (이후)

- Flutter dataTable.
- (선택) 행 DnD + 가상화 조합, 열/행 동시 DnD.
