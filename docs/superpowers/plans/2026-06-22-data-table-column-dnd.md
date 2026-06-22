# dataTable Phase 5 — 열 순서 드래그앤드롭 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docs 의 table 페이지에 TanStack `columnOrder` + @dnd-kit 기반 **열 헤더 드래그로 순서 변경** 데모를 추가한다(table 컴포넌트·registry 무변경).

**Architecture:** `table` presentational primitives 는 그대로. 새 데모가 TanStack `columnOrder` state 를 들고, @dnd-kit `DndContext`/`SortableContext` + 헤더별 `useSortable` 로 드래그를 처리, `onDragEnd` 에서 `arrayMove` 로 순서를 갱신. 바디 셀은 columnOrder 를 자동 반영. shadcn/TanStack 공식 column-DnD 레시피.

**Tech Stack:** Next.js(apps/docs), `@tanstack/react-table` v8, `@dnd-kit/core`·`@dnd-kit/sortable`·`@dnd-kit/modifiers`, `@/components/ui/table`.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/data-table-column-dnd`). 검증 `apps/docs` `pnpm build`/`tsc`.

> **sh-ui 코어 릴리즈 없음.** table·registry·cli·versions.json 무변경. 단 apps/docs/package.json 에 @dnd-kit 3개 + lockfile 갱신.

---

## File Structure

| 파일 | 변경 |
|---|---|
| `apps/docs/package.json` | @dnd-kit/core·sortable·modifiers 의존성 추가 |
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-column-dnd.tsx` | 신규 — 열 순서 DnD 데모 |
| `apps/docs/app/[locale]/(docs)/components/table/page.tsx` | "열 순서 변경 (드래그앤드롭)" 예제 섹션 추가 |

---

## Task 1: @dnd-kit 의존성 설치

**Files:**
- Modify: `apps/docs/package.json` (자동 — pnpm add)

- [ ] **Step 1: 설치**

Run (repo 루트에서):
```bash
pnpm --filter @sh-ui/docs add @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
```
Expected: 3개 패키지가 `apps/docs/package.json` dependencies 에 추가되고 lockfile 갱신. React 19 peer 경고가 나도 무방(@dnd-kit peer `react >= 16.8`, 상한 없음).

- [ ] **Step 2: 설치 확인**

Run:
```bash
node -e "const p=require('./apps/docs/package.json'); const d=p.dependencies; console.log(['@dnd-kit/core','@dnd-kit/sortable','@dnd-kit/modifiers'].map(k=>k+': '+(d[k]||'MISSING')).join('\n'))"
```
Expected: 3개 모두 버전 문자열 출력(MISSING 없음).

- [ ] **Step 3: 커밋**
```bash
git add apps/docs/package.json pnpm-lock.yaml
git commit -m "build(docs): @dnd-kit 의존성 추가 (열 순서 DnD 데모용)"
```

---

## Task 2: 열 순서 DnD 데모 컴포넌트

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-column-dnd.tsx`

- [ ] **Step 1: 데모 파일 작성**

아래 전체 내용을 그대로 생성한다. (Phase 1~3 데모와 같은 import 경로·렌더 패턴. 헤더만 sortable; 바디 셀은 columnOrder 자동 반영.)

```tsx
"use client";

import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type Header,
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
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
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
  email: string;
  team: string;
  age: number;
}

const data: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", email: "sh@sh-ui.dev", team: "Core", age: 29 },
  { id: "2", name: "이도윤", role: "Designer", email: "doyun@sh-ui.dev", team: "Design", age: 34 },
  { id: "3", name: "박서연", role: "Engineer", email: "seoyeon@sh-ui.dev", team: "Web", age: 27 },
  { id: "4", name: "최민준", role: "PM", email: "minjun@sh-ui.dev", team: "Product", age: 41 },
  { id: "5", name: "정하은", role: "Engineer", email: "haeun@sh-ui.dev", team: "Web", age: 23 },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "email", header: "이메일" },
  { accessorKey: "team", header: "팀" },
  { accessorKey: "age", header: "나이" },
];

function DraggableHead({ header }: { header: Header<Person, unknown> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: header.column.id });
  const label = (header.column.columnDef.header as string) ?? header.column.id;
  return (
    <TableHead
      ref={setNodeRef}
      scope="col"
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1 : undefined,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
        <button
          type="button"
          aria-label={`${label} 열 순서 변경 핸들`}
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
        {flexRender(header.column.columnDef.header, header.getContext())}
      </span>
    </TableHead>
  );
}

export function DataTableColumnDndDemo() {
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((c) => (c as { accessorKey?: string }).accessorKey as string),
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { columnOrder },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={onDragEnd}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                  {headerGroup.headers.map((header) => (
                    <DraggableHead key={header.id} header={header} />
                  ))}
                </SortableContext>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}
```

> 컬럼 id: 이 데모의 컬럼은 `accessorKey` 만 있으므로 TanStack 이 `column.id = accessorKey` 로 설정한다. 따라서 `columnOrder` 초기값을 accessorKey 배열로 만들고, `useSortable({ id: header.column.id })` 와 `SortableContext items` 가 같은 문자열 집합을 공유한다. TableHead 가 `ref` 를 forward 하는지 확인됨(forwardRef → `<th ref>`).

- [ ] **Step 2: 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-column-dnd" | head`
Expected: empty. @dnd-kit 타입(`Header`, `DragEndEvent`) import 오류 시 실제 export 에 맞춰 조정.

- [ ] **Step 3: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-column-dnd.tsx"
git commit -m "feat(docs): dataTable 열 순서 드래그앤드롭 데모 컴포넌트"
```

---

## Task 3: page.tsx 에 "열 순서 변경" 섹션 추가

**Files:**
- Modify: `apps/docs/app/[locale]/(docs)/components/table/page.tsx`

- [ ] **Step 1: import 추가**
데모 import 묶음 아래에 추가:
```tsx
import { DataTableColumnDndDemo } from "./_demos/data-table-column-dnd";
```

- [ ] **Step 2: 섹션 추가**
"열 고정·리사이즈" 섹션의 닫는 `</Preview>` 다음, `<h2>Installation</h2>` 앞에 삽입(기존 Preview + CodeTabs 패턴):

```tsx
      <h2>열 순서 변경 (드래그앤드롭)</h2>
      <p className="muted">
        TanStack <code>columnOrder</code> state 와 <code>@dnd-kit</code>을 조합해 헤더
        그립(<code>⠿</code>)을 끌어 열 순서를 바꾼다. 바디 셀은{" "}
        <code>columnOrder</code>를 자동으로 따라간다. 키보드도 지원한다 —
        핸들에 포커스 후 Space로 잡고 <code>←</code>/<code>→</code>로 이동, Space로
        놓는다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableColumnDndDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// 열 순서 변경 — TanStack columnOrder + @dnd-kit
const [columnOrder, setColumnOrder] = React.useState<string[]>(
  () => columns.map((c) => c.accessorKey),
);

const table = useReactTable({
  data,
  columns,
  state: { columnOrder },
  onColumnOrderChange: setColumnOrder,
  getCoreRowModel: getCoreRowModel(),
});

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);

function onDragEnd({ active, over }: DragEndEvent) {
  if (over && active.id !== over.id) {
    setColumnOrder((prev) =>
      arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id)),
    );
  }
}

// 헤더 셀 — useSortable 로 드래그, 그립 핸들에 listeners
function DraggableHead({ header }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: header.column.id });
  return (
    <TableHead ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}>
      <button {...attributes} {...listeners} style={{ cursor: "grab" }}>⠿</button>
      {flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  );
}

// 렌더 트리
<DndContext sensors={sensors} modifiers={[restrictToHorizontalAxis]} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
  <Table>
    <TableHeader>
      <TableRow>
        <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
          {headerGroup.headers.map((h) => <DraggableHead key={h.id} header={h} />)}
        </SortableContext>
      </TableRow>
    </TableHeader>
    {/* 바디 셀은 columnOrder 자동 반영 */}
  </Table>
</DndContext>`,
            },
          ]}
        />
      </Preview>
```

- [ ] **Step 3: 빌드 + 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -iE "data-table-column-dnd|table/page" | head`
Expected: empty.
Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공, `/components/table` 정적 생성. @dnd-kit SSR 이슈/타입 불일치로 깨지면 실제 API 에 맞춰 수정 후 재빌드.

- [ ] **Step 4: (가능 시) preview eval 동작 확인**
dev 서버에서 `/components/table` 의 "열 순서 변경" 데모:
1. 헤더 그립을 끌어 두 열 위치 교환 → columnOrder 와 바디 셀 순서가 함께 바뀜.
2. 핸들 포커스 후 Space→화살표→Space 로 키보드 이동.
3. 콘솔 에러 0.

- [ ] **Step 5: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/page.tsx"
git commit -m "docs(table): 열 순서 변경(DnD) 예제 섹션 추가"
```

---

## 릴리즈 절차
**sh-ui 코어 없음** — table·registry·cli·versions.json 무변경. dev → live 일반 docs PR(태그·npm 없음), 사용자 확인 후 머지. PR 에 apps/docs/package.json + lockfile 변경 포함.

## 자기 점검 메모
- table/registry 무변경 — DnD 는 데모 내 @dnd-kit + TanStack columnOrder.
- 헤더만 sortable, 바디 셀은 columnOrder 자동 반영(추가 작업 없음).
- 컬럼 id = accessorKey(TanStack 기본). columnOrder/SortableContext/useSortable id 일치.
- 키보드 접근성: KeyboardSensor + sortableKeyboardCoordinates.
- 후속: 행 DnD(verticalListSortingStrategy), Phase 4 그룹화.

---

## Self-Review

**1. Spec coverage:**
- 열 헤더 드래그 순서 변경 → Task 2 DraggableHead + DndContext ✅
- 키보드 접근성 → KeyboardSensor + sortableKeyboardCoordinates ✅
- 바디 셀 자동 반영 → row.getVisibleCells() (columnOrder) ✅
- @dnd-kit 3개 의존성 → Task 1 ✅
- page 섹션 → Task 3 ✅
- 그립 핸들(라벨 클릭 유지) → Task 2 button {...listeners} ✅
- 릴리즈 없음(코어), docs deps 추가 명시 ✅

**2. Placeholder scan:** CodeTabs 코드 문자열은 표시용 발췌(설명) — 실제 구현은 Task 2 에 전부 포함. plan 자체에 미완성 placeholder 없음 ✅

**3. Type consistency:** `DataTableColumnDndDemo`(export) ↔ Task 3 import 일치. `columnOrder`/`setColumnOrder`/`DraggableHead`/`Header`/`DragEndEvent`/`arrayMove` 명칭 Task 간 일치 ✅
