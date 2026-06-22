# dataTable Phase 2 — 필터 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docs 의 dataTable 페이지에 TanStack `getFilteredRowModel` 기반 글로벌 필터 + faceted(role 다중선택) 필터 데모를 추가한다(table 컴포넌트·registry 무변경).

**Architecture:** `table` presentational primitives 는 그대로. 새 데모 컴포넌트가 TanStack 필터(globalFilter + columnFilters)를 wiring하고 기존 sh-ui Input·Popover·Checkbox 로 필터 UI 를 조립. shadcn data-table toolbar 패턴.

**Tech Stack:** Next.js(apps/docs), `@tanstack/react-table` v8, `@/components/ui/{table,input,popover,checkbox,button}`.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/data-table-filters`). 검증 `apps/docs` `pnpm build`/`tsc`.

> **docs 전용 — 릴리즈 없음.** versions.json·cli/package.json·registry 무변경.

---

## File Structure

| 파일 | 변경 |
|---|---|
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-filter.tsx` | 신규 — 글로벌+faceted 필터 데모 |
| `apps/docs/app/[locale]/(docs)/components/table/page.tsx` | "필터" 예제 섹션 추가 |

---

## Task 1: 필터 데모 + page 섹션

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-filter.tsx`
- Modify: `apps/docs/app/[locale]/(docs)/components/table/page.tsx`

### Step 1: 실제 API 확인 (코드 작성 전 READ)
- `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table.tsx` — Phase 1 데모(Table 렌더·columns·checkbox 사용법) 를 베이스로 재사용.
- `apps/docs/components/ui/popover/index.tsx` — Popover 의 export 이름/구조(Popover/PopoverTrigger/PopoverContent 등)와 trigger `render` prop 여부 확인.
- `apps/docs/components/ui/checkbox/index.tsx` — checked/onCheckedChange (이미 Phase 1 데모에서 `checked:boolean`+`onCheckedChange(boolean)` 확인됨).
- `apps/docs/components/ui/button/index.tsx` — variant/size.

### Step 2: `_demos/data-table-filter.tsx` 작성

아래를 베이스로 작성하되, Popover 의 실제 export/props 에 맞춰 조정(Step 1):

```tsx
"use client";
import * as React from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, type ColumnDef, type SortingState, type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type Person = { id: string; name: string; role: string; age: number };

const DATA: Person[] = [
  { id: "1", name: "김상현", role: "Owner", age: 32 },
  { id: "2", name: "이도윤", role: "Admin", age: 28 },
  { id: "3", name: "박서연", role: "Member", age: 41 },
  { id: "4", name: "최민준", role: "Member", age: 25 },
  { id: "5", name: "정하은", role: "Admin", age: 37 },
  { id: "6", name: "강지우", role: "Member", age: 30 },
];

const ROLES = ["Owner", "Admin", "Member"];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할", filterFn: "arrIncludesSome" },
  { accessorKey: "age", header: "나이" },
];

export function DataTableFilterDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: DATA,
    columns,
    getRowId: (r) => r.id,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  const roleCol = table.getColumn("role");
  const selectedRoles = (roleCol?.getFilterValue() as string[] | undefined) ?? [];
  const toggleRole = (role: string, on: boolean) => {
    const next = on ? [...selectedRoles, role] : selectedRoles.filter((r) => r !== role);
    roleCol?.setFilterValue(next.length ? next : undefined);
  };

  const hasFilters = globalFilter !== "" || columnFilters.length > 0;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div>
      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="전체 검색…"
          aria-label="전체 검색"
          style={{ maxWidth: "16rem" }}
        />
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
              {ROLES.map((role) => (
                <label key={role} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", fontSize: "var(--text-sm)" }}>
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={(on) => toggleRole(role, on === true)}
                    aria-label={role}
                  />
                  {role}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => { setGlobalFilter(""); table.resetColumnFilters(); }}
          >
            초기화
          </Button>
        ) : null}
        <span style={{ marginInlineStart: "auto", fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>
          {filteredCount} / {DATA.length}
        </span>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    {flexRender(cell.column.columnDef.cell ?? ((c) => c.getValue()), cell.getContext())}
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

> Popover `render` prop: sh-ui 의 PopoverTrigger/Content 가 Base UI 기반이면 `render={<Button/>}` 슬롯 패턴일 가능성이 높다(dialog 의 DialogTrigger 가 그랬듯). 실제 popover/index.tsx 를 READ 해 맞춘다 — 만약 PopoverTrigger 가 children 패턴이면 `<PopoverTrigger><Button/></PopoverTrigger>` 로 조정(단 button 중첩 주의). Checkbox `onCheckedChange` 는 Phase 1 처럼 `(checked: boolean) => ...` (boolean) — `on === true` 가드 유지.

### Step 3: page.tsx 에 "필터" 예제 섹션 추가

`apps/docs/app/[locale]/(docs)/components/table/page.tsx` 를 READ 후, 기존 예제 흐름(Preview + CodePanel)을 따라 "필터" h2 섹션 추가:
- import `import { DataTableFilterDemo } from "./_demos/data-table-filter";`
- 섹션: h2 "필터" + 한 줄 설명(글로벌 + 역할 faceted) + `<Preview>`로 `<DataTableFilterDemo />` + `<CodePanel>`로 핵심 wiring(getFilteredRowModel + globalFilter state + setFilterValue/arrIncludesSome) 발췌.
- 기존 SubComponents/PropsTable 섹션은 그대로.

### Step 4: 빌드 + 타입체크
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -iE "data-table-filter|table/page" | head`
Expected: empty.
Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공, `/components/table` 정적 생성. Popover/Checkbox API 불일치로 깨지면 실제 export 에 맞춰 데모 수정 후 재빌드. 빌드 깨진 채 두지 말 것.

### Step 5: (선택) preview eval 동작 확인
가능하면 dev 서버에서: 전체 검색 입력 시 행 필터, 역할 Popover 체크 시 role 필터, 초기화 동작, 결과 카운트 갱신.

### Step 6: 커밋
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-filter.tsx" "apps/docs/app/[locale]/(docs)/components/table/page.tsx"
git commit -m "feat(docs): dataTable 필터 데모 (글로벌 + faceted, getFilteredRowModel)"
```

---

## 릴리즈 절차
**없음** — docs 전용. dev → live 일반 docs PR(태그·npm 없음), 사용자 확인.

## 자기 점검 메모
- table/registry 무변경 — 필터는 TanStack + 기존 컴포넌트 조합(데모).
- Popover trigger 패턴(render vs children)은 구현 시 popover/index.tsx 로 확정.
- TanStack: `getFilteredRowModel`, `globalFilter`/`columnFilters` state + onChange, role 컬럼 `filterFn:"arrIncludesSome"`, `setFilterValue(undefined)` 로 해제.
- 후속(Phase 3 고정·리사이즈)은 table 컴포넌트 변경 동반 가능 → 그땐 릴리즈.
