# dataTable PR A — Column Visibility · Row Pinning · Faceting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docs 의 table 페이지에 TanStack v8 내장 **Column Visibility, Row Pinning, Faceting** 데모 3개를 추가한다(table 컴포넌트·registry 무변경, 새 의존성 0).

**Architecture:** `table` presentational primitives 는 그대로. 데모 3개가 각각 TanStack visibility/rowPinning/faceting state·rowModel 을 wiring. row pinning 은 top/center/bottom 3구역 + sticky inline style. faceting 은 Phase 2 faceted 필터 + 개수/범위.

**Tech Stack:** Next.js(apps/docs), `@tanstack/react-table` v8, `@/components/ui/{table,button,checkbox,popover}`.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/data-table-visibility-pinning-faceting`). 검증 `apps/docs` `pnpm build`/`tsc`.

> **docs 전용 — 릴리즈 없음.** versions.json·cli/package.json·registry·의존성 무변경.

---

## File Structure

| 파일 | 변경 |
|---|---|
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-visibility.tsx` | 신규 — 열 표시 토글 |
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-row-pinning.tsx` | 신규 — 행 상단/하단 고정 |
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-faceting.tsx` | 신규 — 패싯(값·개수·범위) |
| `apps/docs/app/[locale]/(docs)/components/table/page.tsx` | 3개 예제 섹션 추가 |

> 공통: 모든 데모는 정적 데이터/컬럼(모듈 상수). TanStack 첫-마운트 setState 경고가 보이면 `autoResetAll: false` 추가(grouping 학습 참조). 컬럼 id 는 accessorKey 자동.

---

## Task 1: Column Visibility 데모

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-visibility.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Person {
  id: string;
  name: string;
  role: string;
  team: string;
  age: number;
}

const data: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", team: "Core", age: 29 },
  { id: "2", name: "이도윤", role: "Designer", team: "Design", age: 34 },
  { id: "3", name: "박서연", role: "Engineer", team: "Web", age: 27 },
  { id: "4", name: "최민준", role: "PM", team: "Product", age: 41 },
  { id: "5", name: "정하은", role: "Engineer", team: "Web", age: 23 },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "team", header: "팀" },
  { accessorKey: "age", header: "나이" },
];

export function DataTableVisibilityDemo() {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: "var(--space-3)" }}>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--foreground-muted)" }}>표시 열:</span>
        {table.getAllLeafColumns().filter((c) => c.getCanHide()).map((column) => (
          <label
            key={column.id}
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", cursor: "pointer" }}
          >
            <Checkbox
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(checked === true)}
              aria-label={`${String(column.columnDef.header)} 열 표시`}
            />
            {String(column.columnDef.header)}
          </label>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          style={{ marginInlineStart: "auto" }}
          onClick={() => table.toggleAllColumnsVisible(true)}
        >
          모두 표시
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
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
  );
}
```

- [ ] **Step 2: 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-visibility" | head`
Expected: empty. Checkbox `onCheckedChange` 시그니처(boolean)는 Phase 1 에서 확인됨.

- [ ] **Step 3: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-visibility.tsx"
git commit -m "feat(docs): dataTable 열 표시 토글(Column Visibility) 데모"
```

---

## Task 2: Row Pinning 데모

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-row-pinning.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  type RowPinningState,
  type Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
  age: number;
}

const data: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", team: "Core", age: 29 },
  { id: "2", name: "이도윤", role: "Designer", team: "Design", age: 34 },
  { id: "3", name: "박서연", role: "Engineer", team: "Web", age: 27 },
  { id: "4", name: "최민준", role: "PM", team: "Product", age: 41 },
  { id: "5", name: "정하은", role: "Engineer", team: "Web", age: 23 },
  { id: "6", name: "강지우", role: "PM", team: "Web", age: 30 },
  { id: "7", name: "윤서아", role: "Designer", team: "Design", age: 38 },
  { id: "8", name: "임하준", role: "Engineer", team: "Core", age: 26 },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "team", header: "팀" },
  { accessorKey: "age", header: "나이" },
];

const pinBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  color: "inherit",
  fontSize: "var(--text-sm)",
  lineHeight: 1,
};

function RowCells({ row, pinned }: { row: Row<Person>; pinned: false | "top" | "bottom" }) {
  return (
    <TableRow
      style={
        pinned
          ? {
              position: "sticky",
              [pinned === "top" ? "top" : "bottom"]: 0,
              zIndex: 1,
              background: "var(--background)",
              boxShadow:
                pinned === "top"
                  ? "inset 0 -1px 0 0 var(--border)"
                  : "inset 0 1px 0 0 var(--border)",
            }
          : undefined
      }
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
      <TableCell style={{ whiteSpace: "nowrap" }}>
        <span style={{ display: "inline-flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            style={{ ...pinBtn, opacity: pinned === "top" ? 1 : 0.6 }}
            aria-label={`${row.original.name} 행 상단 고정`}
            aria-pressed={pinned === "top"}
            onClick={() => row.pin(pinned === "top" ? false : "top")}
          >
            ⤒
          </button>
          <button
            type="button"
            style={{ ...pinBtn, opacity: pinned === "bottom" ? 1 : 0.6 }}
            aria-label={`${row.original.name} 행 하단 고정`}
            aria-pressed={pinned === "bottom"}
            onClick={() => row.pin(pinned === "bottom" ? false : "bottom")}
          >
            ⤓
          </button>
        </span>
      </TableCell>
    </TableRow>
  );
}

export function DataTableRowPinningDemo() {
  const [rowPinning, setRowPinning] = React.useState<RowPinningState>({ top: [], bottom: [] });

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { rowPinning },
    onRowPinningChange: setRowPinning,
    enableRowPinning: true,
    keepPinnedRows: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <div className="sh-ui-table__wrapper" style={{ maxHeight: "14rem", overflow: "auto" }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} scope="col">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead scope="col">고정</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getTopRows().map((row) => (
              <RowCells key={row.id} row={row} pinned="top" />
            ))}
            {table.getCenterRows().map((row) => (
              <RowCells key={row.id} row={row} pinned={false} />
            ))}
            {table.getBottomRows().map((row) => (
              <RowCells key={row.id} row={row} pinned="bottom" />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

> 주의: `Table` 이 이미 `.sh-ui-table__wrapper`(overflow-x:auto) 로 감싸므로, 여기서 별도 스크롤 컨테이너를 만들기 위해 데모에서 한 번 더 `maxHeight`+`overflow:auto` div 로 감쌌다. 만약 이중 래퍼가 시각적으로 어색하면 빌드/preview 확인 후 조정(예: Table 바로 바깥 div 에만 maxHeight). sticky top/bottom 은 이 스크롤 컨테이너 기준.

- [ ] **Step 2: 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-row-pinning" | head`
Expected: empty. `RowPinningState`/`Row` import 확인. 동적 키 `[pinned === "top" ? "top" : "bottom"]` 가 CSSProperties 타입에서 문제되면 객체를 분기해 명시(top/bottom 별도 리터럴).

- [ ] **Step 3: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-row-pinning.tsx"
git commit -m "feat(docs): dataTable 행 고정(Row Pinning) 데모"
```

---

## Task 3: Faceting 데모

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-faceting.tsx`

- [ ] **Step 1: 실제 Popover API 확인 (작성 전 READ)**
- `apps/docs/components/ui/popover/index.tsx` — `PopoverTrigger` 가 render prop(`render={<Button/>}`) 인지 children 인지 확인(Phase 2 필터 데모 `data-table-filter.tsx` 가 이미 쓴 패턴 그대로 따른다).
- 기존 `_demos/data-table-filter.tsx` 를 베이스로 재사용.

- [ ] **Step 2: 작성**

아래를 베이스로 하되 Popover 사용법은 `data-table-filter.tsx` 와 동일하게 맞춘다:

```tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface Person {
  id: string;
  name: string;
  role: string;
  age: number;
}

const data: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", age: 29 },
  { id: "2", name: "이도윤", role: "Designer", age: 34 },
  { id: "3", name: "박서연", role: "Engineer", age: 27 },
  { id: "4", name: "최민준", role: "PM", age: 41 },
  { id: "5", name: "정하은", role: "Engineer", age: 23 },
  { id: "6", name: "강지우", role: "Engineer", age: 30 },
  { id: "7", name: "윤서아", role: "Designer", age: 38 },
  { id: "8", name: "임하준", role: "Engineer", age: 26 },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할", filterFn: "arrIncludesSome" },
  { accessorKey: "age", header: "나이" },
];

export function DataTableFacetingDemo() {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  const roleCol = table.getColumn("role");
  const ageCol = table.getColumn("age");
  // 패싯: 역할별 고유값 + 개수 (다른 필터에 반응)
  const roleFacets = roleCol?.getFacetedUniqueValues() ?? new Map<string, number>();
  const roleOptions = Array.from(roleFacets.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const selectedRoles = (roleCol?.getFilterValue() as string[] | undefined) ?? [];
  const toggleRole = (role: string, on: boolean) => {
    const next = on ? [...selectedRoles, role] : selectedRoles.filter((r) => r !== role);
    roleCol?.setFilterValue(next.length ? next : undefined);
  };
  // 패싯: 나이 min/max
  const ageMinMax = ageCol?.getFacetedMinMaxValues();

  return (
    <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: "var(--space-3)" }}>
      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
        <Popover>
          <PopoverTrigger
            render={
              <Button type="button" variant="secondary" size="md">
                역할{selectedRoles.length ? ` (${selectedRoles.length})` : ""}
              </Button>
            }
          />
          <PopoverContent>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-1)" }}>
              {roleOptions.map(([role, count]) => (
                <label key={role} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", fontSize: "var(--text-sm)" }}>
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={(on) => toggleRole(role, on === true)}
                    aria-label={`${role} (${count}건)`}
                  />
                  {role}{" "}
                  <span style={{ color: "var(--foreground-muted)" }}>({count})</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {ageMinMax ? (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>
            나이 범위(패싯): {ageMinMax[0]}–{ageMinMax[1]}
          </span>
        ) : null}
        <span style={{ marginInlineStart: "auto", fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>
          {table.getFilteredRowModel().rows.length} / {data.length}
        </span>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ textAlign: "center", color: "var(--foreground-muted)" }}>
                결과 없음
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 3: 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-faceting" | head`
Expected: empty. Popover API 불일치 시 `data-table-filter.tsx` 패턴에 맞춰 조정.

- [ ] **Step 4: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-faceting.tsx"
git commit -m "feat(docs): dataTable 패싯(Faceting) 데모 — 값·개수·범위"
```

---

## Task 4: page.tsx 에 3개 섹션 추가

**Files:**
- Modify: `apps/docs/app/[locale]/(docs)/components/table/page.tsx`

- [ ] **Step 1: import 추가**
데모 import 묶음 아래:
```tsx
import { DataTableVisibilityDemo } from "./_demos/data-table-visibility";
import { DataTableRowPinningDemo } from "./_demos/data-table-row-pinning";
import { DataTableFacetingDemo } from "./_demos/data-table-faceting";
```

- [ ] **Step 2: 섹션 3개 추가**
"그룹화·확장" 섹션의 닫는 `</Preview>` 다음, `<h2>Installation</h2>` 앞에 삽입. 각 섹션은 기존 Preview + CodeTabs 패턴:

```tsx
      <h2>열 표시 토글</h2>
      <p className="muted">
        <code>columnVisibility</code> state 와{" "}
        <code>column.toggleVisibility()</code>로 열을 표시/숨김한다. 헤더·셀은{" "}
        <code>getVisibleCells</code>가 자동 반영한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableVisibilityDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

const table = useReactTable({
  data, columns,
  state: { columnVisibility },
  onColumnVisibilityChange: setColumnVisibility,
  getCoreRowModel: getCoreRowModel(),
});

// 열 토글 체크박스
table.getAllLeafColumns().filter((c) => c.getCanHide()).map((column) => (
  <Checkbox checked={column.getIsVisible()}
    onCheckedChange={(v) => column.toggleVisibility(v === true)} />
));
// 모두 표시
table.toggleAllColumnsVisible(true);`,
            },
          ]}
        />
      </Preview>

      <h2>행 고정</h2>
      <p className="muted">
        <code>enableRowPinning</code> + <code>rowPinning</code> state 로 행을 상단(
        <code>⤒</code>)/하단(<code>⤓</code>)에 고정한다.{" "}
        <code>getTopRows</code> / <code>getCenterRows</code> /{" "}
        <code>getBottomRows</code> 3구역으로 렌더하고 고정 행은 sticky 처리한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableRowPinningDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [rowPinning, setRowPinning] = React.useState<RowPinningState>({ top: [], bottom: [] });

const table = useReactTable({
  data, columns,
  state: { rowPinning },
  onRowPinningChange: setRowPinning,
  enableRowPinning: true,
  keepPinnedRows: true,
  getCoreRowModel: getCoreRowModel(),
});

// 행 고정 토글
row.pin("top");    // "bottom" | false
row.getIsPinned(); // false | "top" | "bottom"

// 3구역 렌더 + sticky
table.getTopRows()    // position: sticky; top: 0
table.getCenterRows()
table.getBottomRows() // position: sticky; bottom: 0`,
            },
          ]}
        />
      </Preview>

      <h2>패싯(값·개수)</h2>
      <p className="muted">
        <code>getFacetedRowModel</code> + <code>getFacetedUniqueValues</code>로
        역할별 고유값과 <strong>개수</strong>를, <code>getFacetedMinMaxValues</code>로
        나이 범위를 얻는다. 패싯 값은 다른 필터에 반응한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableFacetingDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const table = useReactTable({
  data, columns,
  state: { columnFilters },
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getFacetedMinMaxValues: getFacetedMinMaxValues(),
});

// 값별 개수 (다른 필터에 반응)
const facets = table.getColumn("role").getFacetedUniqueValues(); // Map<value, count>
Array.from(facets.entries()).map(([role, count]) => (
  <label><Checkbox … /> {role} ({count})</label>
));

// 숫자 범위
const [min, max] = table.getColumn("age").getFacetedMinMaxValues() ?? [0, 0];`,
            },
          ]}
        />
      </Preview>
```

- [ ] **Step 3: 빌드 + 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -iE "data-table-(visibility|row-pinning|faceting)|table/page" | head`
Expected: empty.
Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공. 깨지면 실제 API 에 맞춰 수정 후 재빌드.

- [ ] **Step 4: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/page.tsx"
git commit -m "docs(table): 열 표시·행 고정·패싯 예제 섹션 추가"
```

---

## Task 5: preview 검증

- [ ] dev 서버(`preview_start`)에서 `/components/table`:
  1. **Visibility**: 체크박스로 열 사라짐/나타남, "모두 표시" 복원.
  2. **Row Pinning**: ⤒/⤓ 로 행 상단/하단 고정, 14rem 스크롤해도 고정 유지.
  3. **Faceting**: 역할 Popover 에 값별 개수, 체크 시 행 감소·결과 카운트 갱신, 나이 범위 표시.
  4. **콘솔 에러 0** — 첫-마운트 경고 보이면 해당 데모에 `autoResetAll: false` 추가, 서버 재시작 후 재확인.

---

## 릴리즈 절차
**없음** — docs 전용. dev → live 일반 docs PR(태그·npm 없음), 사용자 확인 후 머지.

## 자기 점검 메모
- table/registry 무변경, 새 의존성 0 — visibility/rowPinning/faceting 전부 TanStack 내장.
- Row pinning: top/center/bottom 3구역 + sticky inline.
- Faceting: getFacetedUniqueValues(개수) + getFacetedMinMaxValues(범위), filteredRowModel 등록으로 다른 필터 반응.
- Popover/Checkbox/Button props 는 기존 데모(`data-table-filter.tsx`) 기준.
- 첫-마운트 setState 경고 시 autoResetAll:false(grouping 학습).

---

## Self-Review

**1. Spec coverage:** Column Visibility(Task1) / Row Pinning(Task2) / Faceting(Task3) / page 섹션(Task4) / preview(Task5) — spec 3기능 + page + 검증 모두 매핑 ✅
**2. Placeholder scan:** CodeTabs 문자열은 표시용 발췌, 실제 구현은 Task1~3 에 전부 포함 ✅
**3. Type consistency:** export 명(`DataTableVisibilityDemo`/`DataTableRowPinningDemo`/`DataTableFacetingDemo`) ↔ Task4 import 일치. `VisibilityState`/`RowPinningState`/`ColumnFiltersState` 사용 일관 ✅
