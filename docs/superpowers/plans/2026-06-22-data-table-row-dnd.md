# dataTable 행(Row) DnD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docs 의 table 페이지에 @dnd-kit 기반 **행 헤더 그립 드래그로 순서 변경** 데모를 추가한다(table 컴포넌트·registry 무변경, 새 의존성 0 — @dnd-kit 재사용).

**Architecture:** 행 순서 state 가 TanStack 에 없으므로 데이터 배열을 로컬 `useState` 로 들고 `arrayMove` 로 재정렬. @dnd-kit `DndContext`/`SortableContext`(vertical) + 행별 `useSortable`. `DndContext id={useId()}` 로 SSR 하이드레이션 가드(Phase 5 학습).

**Tech Stack:** Next.js(apps/docs), `@tanstack/react-table` v8, `@dnd-kit/{core,sortable,modifiers,utilities}`, `@/components/ui/table`.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/data-table-row-dnd`). 검증 `apps/docs` `pnpm build`/`tsc`.

> **docs 전용 — 릴리즈 없음.** versions.json·cli/package.json·registry·의존성 무변경.

---

## File Structure

| 파일 | 변경 |
|---|---|
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-row-dnd.tsx` | 신규 — 행 순서 DnD |
| `apps/docs/app/[locale]/(docs)/components/table/page.tsx` | "행 순서 변경 (드래그앤드롭)" 섹션 추가 |

---

## Task 1: 행 DnD 데모 컴포넌트

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-row-dnd.tsx`

- [ ] **Step 1: 작성** (Phase 5 열 DnD 데모 `data-table-column-dnd.tsx` 의 세로 버전)

```tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  type Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface Person {
  id: string;
  name: string;
  role: string;
  team: string;
}

const initialData: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", team: "Core" },
  { id: "2", name: "이도윤", role: "Designer", team: "Design" },
  { id: "3", name: "박서연", role: "Engineer", team: "Web" },
  { id: "4", name: "최민준", role: "PM", team: "Product" },
  { id: "5", name: "정하은", role: "Engineer", team: "Web" },
  { id: "6", name: "강지우", role: "PM", team: "Web" },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "team", header: "팀" },
];

function DraggableRow({ row }: { row: Row<Person> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });
  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        background: isDragging ? "var(--background-muted)" : undefined,
      }}
    >
      <TableCell style={{ width: "var(--control-md)" }}>
        <button
          type="button"
          aria-label={`${row.original.name} 행 순서 변경 핸들`}
          {...attributes}
          {...listeners}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "grab",
            color: "inherit",
            fontSize: "var(--text-sm)",
            opacity: 0.6,
            touchAction: "none",
            lineHeight: 1,
          }}
        >
          ⠿
        </button>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTableRowDndDemo() {
  const [rows, setRows] = React.useState<Person[]>(initialData);
  const rowIds = React.useMemo(() => rows.map((r) => r.id), [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // @dnd-kit 의 aria-describedby 자동 id 가 SSR↔클라이언트에서 어긋나는 하이드레이션
  // 미스매치를 막기 위해 안정적인 id 를 준다(Phase 5 학습).
  const dndContextId = React.useId();

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((prev) => {
        const oldIndex = prev.findIndex((r) => r.id === active.id);
        const newIndex = prev.findIndex((r) => r.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead scope="col" aria-label="순서" />
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} scope="col">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
              {table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} row={row} />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}
```

- [ ] **Step 2: 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-row-dnd" | head`
Expected: empty. `Row`/`DragEndEvent` import 확인. `--control-md` 토큰이 없으면 `2.5rem` 등으로 대체(핸들 셀 폭).

- [ ] **Step 3: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-row-dnd.tsx"
git commit -m "feat(docs): dataTable 행 순서 드래그앤드롭 데모"
```

---

## Task 2: page.tsx 에 섹션 추가

**Files:**
- Modify: `apps/docs/app/[locale]/(docs)/components/table/page.tsx`

- [ ] **Step 1: import 추가**
```tsx
import { DataTableRowDndDemo } from "./_demos/data-table-row-dnd";
```

- [ ] **Step 2: 섹션 추가**
"행 가상화" 섹션의 닫는 `</Preview>` 다음, `<h2>Installation</h2>` 앞에 삽입:

```tsx
      <h2>행 순서 변경 (드래그앤드롭)</h2>
      <p className="muted">
        행 그립(<code>⠿</code>)을 끌어 순서를 바꾼다. 행 순서 state 는 TanStack 에
        없으므로 데이터 배열을 직접 <code>arrayMove</code>로 재정렬한다.{" "}
        <code>@dnd-kit</code>의 세로 정렬(<code>verticalListSortingStrategy</code> +{" "}
        <code>restrictToVerticalAxis</code>)을 쓰고 키보드도 지원한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableRowDndDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// 행 순서 — 데이터 배열을 직접 재정렬 (행에는 columnOrder 같은 state 가 없음)
const [rows, setRows] = React.useState<Person[]>(initialData);
const rowIds = React.useMemo(() => rows.map((r) => r.id), [rows]);

const table = useReactTable({
  data: rows,
  columns,
  getRowId: (r) => r.id,
  getCoreRowModel: getCoreRowModel(),
});

function onDragEnd({ active, over }: DragEndEvent) {
  if (over && active.id !== over.id) {
    setRows((prev) =>
      arrayMove(prev, prev.findIndex((r) => r.id === active.id), prev.findIndex((r) => r.id === over.id)),
    );
  }
}

// 행 셀 — useSortable, 그립 핸들에 listeners
function DraggableRow({ row }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id });
  return (
    <TableRow ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <TableCell><button {...attributes} {...listeners} style={{ cursor: "grab" }}>⠿</button></TableCell>
      {/* … 셀 … */}
    </TableRow>
  );
}

<DndContext id={React.useId()} sensors={sensors} modifiers={[restrictToVerticalAxis]}
  collisionDetection={closestCenter} onDragEnd={onDragEnd}>
  <Table>
    <TableBody>
      <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
        {table.getRowModel().rows.map((row) => <DraggableRow key={row.id} row={row} />)}
      </SortableContext>
    </TableBody>
  </Table>
</DndContext>`,
            },
          ]}
        />
      </Preview>
```

- [ ] **Step 3: 빌드 + 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -iE "data-table-row-dnd|table/page" | head`
Expected: empty.
Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공.

- [ ] **Step 4: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/page.tsx"
git commit -m "docs(table): 행 순서 변경(DnD) 예제 섹션 추가"
```

---

## Task 3: preview 검증

- [ ] dev 서버에서 `/components/table` 의 "행 순서 변경":
  1. 행 그립을 끌어 두 행 위치 교환(순서·내용 반영).
  2. 핸들 포커스 후 Space→↑/↓→Space 키보드 이동.
  3. **fresh SSR 로드 콘솔 에러 0**(useId 하이드레이션 가드 — 서버 재시작 후 확인).
  4. 일반 콘솔 에러 0.

---

## 릴리즈 절차
**없음** — docs 전용. dev → live 일반 docs PR(태그·npm 없음), 사용자 확인 후 머지.

## 자기 점검 메모
- table/registry 무변경, 새 의존성 0(@dnd-kit 재사용).
- 행 순서 = 데이터 배열 로컬 state + arrayMove(행엔 columnOrder 대응 state 없음).
- 세로: verticalListSortingStrategy + restrictToVerticalAxis, CSS.Transform.toString.
- 하이드레이션: DndContext id={useId()} (Phase 5 학습).
- 후속: Flutter dataTable.

---

## Self-Review

**1. Spec coverage:** 행 그립 드래그(Task1 DraggableRow) / arrayMove 데이터 재정렬(Task1 onDragEnd) / 키보드(KeyboardSensor) / useId 가드(Task1) / page 섹션(Task2) / preview(Task3) — spec 전 항목 매핑 ✅
**2. Placeholder scan:** CodeTabs 문자열은 표시용 발췌, 실제 구현은 Task1 에 전부 포함 ✅
**3. Type consistency:** export 명(`DataTableRowDndDemo`) ↔ Task2 import 일치. `rows`/`setRows`/`rowIds`/`DraggableRow`/`Row`/`DragEndEvent`/`arrayMove`/`dndContextId` 명칭 일관 ✅
