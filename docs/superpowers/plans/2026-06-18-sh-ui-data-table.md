# dataTable (Phase 1 코어) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sh-ui 에 presentational `table` 프리미티브(React, 3 CSS 변종)와 TanStack Table v8 로 정렬·행선택·페이지네이션이 동작하는 docs 데이터 테이블 예제를 추가한다.

**Architecture:** shadcn data-table 모델 — sh-ui 는 네이티브 `<table>` 위 presentational 프리미티브만 제공(의존성 0), 정렬·선택·페이지 로직은 사용자가 TanStack Table v8 로 wiring(docs 예제 제공). Tree 와 동일한 컴포넌트 인프라(registry 원본 ↔ docs 복사본, 3 변종).

**Tech Stack:** React(TSX, `@SH_UI_UTILS@`/`cn`), vitest + @testing-library/react, `@tanstack/react-table` v8(데모 전용 peer), CSS 변수 토큰.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/data-table`). React 테스트는 `packages/registry/react` 에서 `pnpm vitest run`.

> **TanStack 버전 주의:** context7 가 v9 beta(`useTable`/`tableFeatures`/`FlexRender`)를 보여주지만, **이 plan 은 v8 stable API**(`useReactTable`/`getCoreRowModel`/`getSortedRowModel`/`getPaginationRowModel`/`flexRender`)를 쓴다. 데모 코드를 v9 로 바꾸지 말 것.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `packages/registry/react/components/table/index.tsx` | plain 변종 — 8개 presentational 서브컴포넌트 |
| `packages/registry/react/components/table/styles.css` | plain 스타일(토큰) |
| `packages/registry/react/components/table/index.tailwind.tsx` | Tailwind 변종 |
| `packages/registry/react/components/table/index.module.tsx` | CSS Modules 변종 |
| `packages/registry/react/components/table/styles.module.css` | CSS Modules 스타일 |
| `packages/registry/react/components/table/table.test.tsx` | primitives 렌더 테스트 |
| `packages/registry/react/registry.json` | `table` 엔트리 |
| `apps/docs/components/ui/table/{index.tsx,styles.css}` | docs 복사본(로컬 cx) |
| `apps/docs/app/[locale]/(docs)/components/table/page.tsx` | docs 페이지 |
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table.tsx` | TanStack v8 데모 |
| `apps/docs/components/app-sidebar.tsx` | 사이드바 등록 |
| `apps/docs/app/[locale]/(docs)/components/page.tsx` | 인덱스 그리드 등록 |
| `apps/docs/package.json` | `@tanstack/react-table` 추가 |
| `packages/changelog/versions.json` + `packages/cli/package.json` | 릴리즈 |

---

## Task 1: table primitives (plain) + 테스트

**Files:**
- Create: `packages/registry/react/components/table/index.tsx`
- Create: `packages/registry/react/components/table/styles.css`
- Test: `packages/registry/react/components/table/table.test.tsx`

**참고:** accordion `index.tsx` 의 `import { cn } from "@SH_UI_UTILS@"`, `forwardRef`, BEM 관행. table 은 Base UI 없이 네이티브 요소 + sh-ui 스타일.

- [ ] **Step 1: 실패하는 테스트 작성**

`packages/registry/react/components/table/table.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import {
  Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption,
} from "./index";

function Sample(props: { selected?: boolean }) {
  return (
    <Table>
      <TableCaption>사용자 목록</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state={props.selected ? "selected" : undefined}>
          <TableCell>Kim</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow><TableCell>합계 1</TableCell></TableRow>
      </TableFooter>
    </Table>
  );
}

describe("Table primitives", () => {
  it("네이티브 table 구조를 렌더", () => {
    const { container } = render(<Sample />);
    expect(container.querySelector("table")).toBeTruthy();
    expect(container.querySelector("thead")).toBeTruthy();
    expect(container.querySelector("tbody")).toBeTruthy();
    expect(container.querySelector("tfoot")).toBeTruthy();
    expect(container.querySelector("caption")).toBeTruthy();
  });

  it("TableHead 는 th[scope=col]", () => {
    const { container } = render(<Sample />);
    const th = container.querySelector("th");
    expect(th?.getAttribute("scope")).toBe("col");
  });

  it("columnheader role 로 헤더 셀 접근", () => {
    render(<Sample />);
    expect(screen.getByRole("columnheader", { name: "이름" })).toBeTruthy();
  });

  it("data-state=selected 가 행에 반영", () => {
    const { container } = render(<Sample selected />);
    const selected = container.querySelector('tbody tr[data-state="selected"]');
    expect(selected).toBeTruthy();
  });

  it("className 이 병합된다", () => {
    const { container } = render(<Table className="custom"><TableBody><TableRow><TableCell>x</TableCell></TableRow></TableBody></Table>);
    expect(container.querySelector("table.custom")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm vitest run components/table/table.test.tsx`
Expected: FAIL — Cannot find module './index'

- [ ] **Step 3: index.tsx 구현 (plain)**

`packages/registry/react/components/table/index.tsx`:

```tsx
import * as React from "react";
import "./styles.css";
import { cn } from "@SH_UI_UTILS@";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="sh-ui-table__wrapper">
    <table ref={ref} className={cn("sh-ui-table", className)} {...props} />
  </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("sh-ui-table__header", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("sh-ui-table__body", className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("sh-ui-table__footer", className)} {...props} />
));
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("sh-ui-table__row", className)} {...props} />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, scope = "col", ...props }, ref) => (
  <th ref={ref} scope={scope} className={cn("sh-ui-table__head", className)} {...props} />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("sh-ui-table__cell", className)} {...props} />
));
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("sh-ui-table__caption", className)} {...props} />
));
TableCaption.displayName = "TableCaption";
```

- [ ] **Step 4: styles.css 작성 (토큰 변수)**

`packages/registry/react/components/table/styles.css`:

```css
.sh-ui-table__wrapper { width: 100%; overflow-x: auto; }
.sh-ui-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  color: var(--foreground);
}
.sh-ui-table__head {
  height: var(--control-md);
  padding: 0 var(--space-3);
  text-align: start;
  font-weight: var(--weight-medium);
  color: var(--foreground-muted);
  vertical-align: middle;
  white-space: nowrap;
}
.sh-ui-table__cell {
  padding: var(--space-3);
  vertical-align: middle;
}
.sh-ui-table__row {
  border-bottom: 1px solid var(--border);
  transition: background-color var(--duration-fast) var(--ease-standard);
}
.sh-ui-table__body .sh-ui-table__row:hover { background: var(--background-muted); }
.sh-ui-table__row[data-state="selected"] { background: var(--background-muted); }
.sh-ui-table__footer { border-top: 1px solid var(--border); font-weight: var(--weight-medium); }
.sh-ui-table__caption {
  margin-top: var(--space-3);
  color: var(--foreground-muted);
  font-size: var(--text-xs);
  text-align: start;
}
@media (prefers-reduced-motion: reduce) { .sh-ui-table__row { transition: none; } }
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm vitest run components/table/table.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 6: 커밋**

```bash
git add packages/registry/react/components/table/index.tsx packages/registry/react/components/table/styles.css packages/registry/react/components/table/table.test.tsx
git commit -m "feat(table): presentational primitives (plain) + 테스트"
```

---

## Task 2: tailwind + css-modules 변종

**Files:**
- Create: `packages/registry/react/components/table/index.tailwind.tsx`
- Create: `packages/registry/react/components/table/index.module.tsx`
- Create: `packages/registry/react/components/table/styles.module.css`

**참고:** accordion 의 `index.tailwind.tsx`(utility + `var(--*)` `[...]`), `index.module.tsx`(`styles.*`). 로직(8 서브컴포넌트 구조)은 Task 1 과 동일, className 표현만 다름.

- [ ] **Step 1: index.module.tsx**

Task 1 의 `index.tsx` 를 복사하되:
- `import "./styles.css";` → `import styles from "./styles.module.css";`
- 클래스 치환: `"sh-ui-table__wrapper"` → `styles["table__wrapper"]`, `"sh-ui-table"` → `styles.table`, `"sh-ui-table__header"` → `styles.table__header`, `__body`/`__footer`/`__row`/`__head`/`__cell`/`__caption` 동일 패턴. `cn(styles.table, className)` 형태 유지.

- [ ] **Step 2: styles.module.css**

Task 1 `styles.css` 복사 후 셀렉터 `.sh-ui-table*` → `.table*` (CSS Modules 네임스페이스). 토큰·`[data-state="selected"]`·reduced-motion 보존. `.sh-ui-table__body .sh-ui-table__row:hover` → `.table__body .table__row:hover`.

- [ ] **Step 3: index.tailwind.tsx**

Task 1 로직 복사, className 을 Tailwind utility 로 (accordion idiom, `var(--*)` 를 `[...]` 임베드):
- wrapper: `w-full overflow-x-auto`
- table: `w-full border-collapse text-[length:var(--text-sm)] text-foreground`
- head(th): `h-[var(--control-md)] px-[var(--space-3)] text-start font-medium text-foreground-muted align-middle whitespace-nowrap`
- cell(td): `p-[var(--space-3)] align-middle`
- row(tr): `border-b border-border transition-[background-color] duration-[var(--duration-fast)] hover:bg-background-muted data-[state=selected]:bg-background-muted motion-reduce:transition-none`
- footer: `border-t border-border font-medium`
- caption: `mt-[var(--space-3)] text-foreground-muted text-[length:var(--text-xs)] text-start`
- `import { cn } from "@SH_UI_UTILS@";` 유지(CLI 가 tailwind cn 으로 swap).

- [ ] **Step 4: 타입/회귀 확인**

Run: `cd packages/registry/react && pnpm vitest run components/table/`
Expected: PASS (plain 테스트 회귀 없음 — 변종은 새 파일)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/table/index.tailwind.tsx packages/registry/react/components/table/index.module.tsx packages/registry/react/components/table/styles.module.css
git commit -m "feat(table): tailwind·css-modules 변종"
```

---

## Task 3: registry 엔트리 + docs 복사본

**Files:**
- Modify: `packages/registry/react/registry.json`
- Create: `apps/docs/components/ui/table/index.tsx`, `apps/docs/components/ui/table/styles.css`

- [ ] **Step 1: registry.json `table` 엔트리**

`packages/registry/react/registry.json` 의 `components` 에 추가(accordion 포맷, types/flatten 없음 — table 은 단일 index + styles):

```json
"table": {
  "name": "table",
  "type": "component",
  "files": [
    { "src": "components/table/index.tsx", "dest": "{components}/table/index.tsx", "frameworks": ["plain"] },
    { "src": "components/table/styles.css", "dest": "{components}/table/styles.css", "frameworks": ["plain"] },
    { "src": "components/table/index.tailwind.tsx", "dest": "{components}/table/index.tsx", "frameworks": ["tailwind"] },
    { "src": "components/table/index.module.tsx", "dest": "{components}/table/index.tsx", "frameworks": ["css-modules"] },
    { "src": "components/table/styles.module.css", "dest": "{components}/table/styles.module.css", "frameworks": ["css-modules"] }
  ],
  "dependencies": [],
  "registryDependencies": ["utils"]
}
```

Validate: `node -e "JSON.parse(require('fs').readFileSync('packages/registry/react/registry.json','utf8')); console.log('OK')"`

- [ ] **Step 2: docs 복사본**

`apps/docs/components/ui/table/index.tsx` — Task 1 `index.tsx` 복사하되 `import { cn } from "@SH_UI_UTILS@";` 를 로컬 `cx` 로 교체(accordion docs 복사본 관행):
```tsx
function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
```
모든 `cn(` → `cx(`. `import "./styles.css";` 유지.

`apps/docs/components/ui/table/styles.css` — Task 1 `styles.css` 동일 복사.

- [ ] **Step 3: docs 타입 체크**

Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "components/ui/table" | head`
Expected: empty (table 관련 에러 없음)

- [ ] **Step 4: 커밋**

```bash
git add packages/registry/react/registry.json apps/docs/components/ui/table/
git commit -m "feat(table): registry 엔트리 + docs 복사본"
```

---

## Task 4: docs 페이지 + TanStack v8 데모 + 등록

**Files:**
- Modify: `apps/docs/package.json` (@tanstack/react-table 추가)
- Create: `apps/docs/app/[locale]/(docs)/components/table/page.tsx`
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table.tsx`
- Modify: `apps/docs/components/app-sidebar.tsx`
- Modify: `apps/docs/app/[locale]/(docs)/components/page.tsx`

**참고:** accordion `page.tsx` 구조(`export const dynamic = "force-static"`, `<CodeTabs>`, `<PropsTable>`/`<SubComponents>`, `<Preview>`)를 READ 후 그대로 따른다. table 은 멀티파일 아님(단일 index)이지만, 데모가 `@tanstack/react-table` 를 import 하므로 ComponentSandbox 대신 정적 `<Preview>` + 실제 데모 컴포넌트 렌더(Tree 와 동일 판단).

- [ ] **Step 1: @tanstack/react-table 추가**

Run: `cd apps/docs && pnpm add @tanstack/react-table`
Expected: package.json 에 `@tanstack/react-table`(v8.x) 추가, lockfile 갱신.
확인: `node -e "console.log(require('./apps/docs/package.json').dependencies['@tanstack/react-table'])"` (루트에서) → `^8...`

- [ ] **Step 2: `_demos/data-table.tsx` — TanStack v8 데모**

```tsx
"use client";
import * as React from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel,
  flexRender, type ColumnDef, type SortingState, type RowSelectionState,
} from "@tanstack/react-table";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext,
} from "@/components/ui/pagination";

type Person = { id: string; name: string; role: string; age: number };

const DATA: Person[] = [
  { id: "1", name: "김상현", role: "Owner", age: 32 },
  { id: "2", name: "이도윤", role: "Admin", age: 28 },
  { id: "3", name: "박서연", role: "Member", age: 41 },
  { id: "4", name: "최민준", role: "Member", age: 25 },
  { id: "5", name: "정하은", role: "Admin", age: 37 },
];

const columns: ColumnDef<Person>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="전체 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
  },
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "age", header: "나이" },
];

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data: DATA,
    columns,
    getRowId: (r) => r.id,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 3 } },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : canSort ? "none" : undefined}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit", padding: 0 }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "↕"}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell ?? ((c) => c.getValue()), cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div style={{ marginTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>
          {table.getSelectedRowModel().rows.length} / {DATA.length} 선택
        </span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); table.previousPage(); }}
                aria-disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); table.nextPage(); }}
                aria-disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
```

> 구현 시 `@/components/ui/checkbox` 와 `@/components/ui/pagination` 의 실제 export 이름/props 를 READ 로 확인하고 맞춘다(위는 일반적 shape — Checkbox 의 `onCheckedChange`, Pagination 의 sub-export 가 다르면 실제에 맞게 조정). 다르면 데모를 실제 API 에 맞춰 수정하되, "정렬·선택·페이지 동작"이라는 목표는 유지.

- [ ] **Step 3: `page.tsx`**

accordion `page.tsx` 구조를 따라: `export const dynamic = "force-static"` → h1 "Table" + 설명 → `<Preview>` 로 `<DataTableDemo />` 렌더 → Installation(`npx sh-ui-cli add table`, React 탭; `@tanstack/react-table` 는 데모용 별도 설치 안내) → Usage(table primitives import + TanStack 조립 코드 `<CodePanel>`) → API Reference(`<SubComponents>` 로 8개 서브컴포넌트 설명: Table/TableHeader/TableBody/TableFooter/TableRow/TableHead/TableCell/TableCaption). Flutter 탭은 없음(React 전용 — Installation/Usage 에 "Flutter: 후속" 한 줄).

`<SubComponents>` 행 예:
```tsx
<SubComponents rows={[
  { name: "Table", description: "루트. <table> + 가로 스크롤 래퍼." },
  { name: "TableHeader", description: "<thead>." },
  { name: "TableBody", description: "<tbody>." },
  { name: "TableFooter", description: "<tfoot> — 합계/요약 행." },
  { name: "TableRow", description: "<tr>. data-state=\"selected\" 로 선택 강조." },
  { name: "TableHead", description: "<th scope=\"col\">. 정렬 토글/인디케이터 슬롯." },
  { name: "TableCell", description: "<td>." },
  { name: "TableCaption", description: "<caption> — 접근성 캡션." },
]} />
```

- [ ] **Step 4: 사이드바 + 인덱스 등록**

`apps/docs/components/app-sidebar.tsx` 의 `components` 배열에 알파벳 위치:
```tsx
{ title: "Table", href: "/components/table" },
```
`apps/docs/app/[locale]/(docs)/components/page.tsx` 의 "Display" 그룹 `items` 에:
```tsx
{ name: "Table", slug: "table", description: "데이터 테이블 — TanStack 정렬·선택·페이지." },
```
(실제 그룹 키/항목 shape 는 파일을 READ 해 맞춘다. "Display" 그룹이 없으면 가장 적합한 그룹에.)

- [ ] **Step 5: 빌드 확인**

Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공, `/components/table` 정적 생성. 데모의 checkbox/pagination import 가 깨지면 실제 export 에 맞춰 `_demos/data-table.tsx` 수정 후 재빌드. 빌드를 깨진 채 두지 말 것.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/package.json pnpm-lock.yaml apps/docs/app apps/docs/components/app-sidebar.tsx
git commit -m "feat(table): docs 페이지 + TanStack v8 데모 + 등록"
```

---

## Task 5: 릴리즈 반영

**Files:**
- Modify: `packages/changelog/versions.json`
- Modify: `packages/cli/package.json`

> ⚠️ **학습 반영 (필수):** registry 가 sh-ui-cli npm 패키지에 번들되므로 컴포넌트-only 릴리즈도 **cli version 을 태그와 동기화**해야 publish 가 통과한다(v0.117.0 publish 실패 — `docs/solutions/workflow-issues/component-release-requires-cli-version-bump-2026-06-18.md`). versions.json 과 cli/package.json 을 **둘 다** 같은 버전으로 올린다.

- [ ] **Step 1: 현재 버전 확인**

Run: `node -e "console.log('changelog:', require('./packages/changelog/versions.json').versions[0].version); console.log('cli:', require('./packages/cli/package.json').version)"`
Expected: 둘 다 `0.117.0`(직전 릴리즈). 새 버전은 MINOR → `0.118.0`. (다르면 더 높은 쪽 +0.1.0)

- [ ] **Step 2: cli/package.json version bump**

`packages/cli/package.json` 의 `version` 을 `0.118.0` 으로.

- [ ] **Step 3: versions.json 엔트리 prepend**

`versions` 배열 맨 앞에(날짜 2026-06-18):
```json
{
  "version": "0.118.0",
  "date": "2026-06-18",
  "title": "Table 컴포넌트 — TanStack 데이터 테이블 (정렬·선택·페이지)",
  "type": "minor",
  "highlights": [
    "신규 Table — presentational 프리미티브(Table/TableHeader/TableBody/TableRow/TableHead/TableCell/TableFooter/TableCaption). 네이티브 <table> + sh-ui 토큰, 의존성 0",
    "TanStack Table v8 통합 예제 — 정렬·행 선택·페이지네이션이 동작하는 데이터 테이블(docs). 컬럼/셀 렌더는 100% 자유",
    "shadcn 모델(headless 엔진 + presentational 레이어). 풀 기능(필터·고정·그룹화·DnD)은 후속 phase"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.118.0"
}
```

- [ ] **Step 4: 검증**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/changelog/versions.json','utf8')); console.log('OK')"` → `OK`
Run: `node -e "const v=require('./packages/changelog/versions.json').versions; console.log(v[0].version === require('./packages/cli/package.json').version ? 'SYNC OK' : 'MISMATCH')"` → `SYNC OK`
Run: `cd packages/registry/react && pnpm vitest run components/table/` → PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/changelog/versions.json packages/cli/package.json
git commit -m "feat(table): Table Phase 1 릴리즈 (v0.118.0, cli sync)"
```

---

## 릴리즈 절차 (구현 완료 후, 사용자 확인 하에)

레포 정책: dev → live PR → **태그는 live 에서**. ⚠️ 태그=cli version 일치 필수(Task 5 에서 보장).
1. dev push → `gh pr create --base live`.
2. CI 그린 → 머지 → live 에서 `v0.118.0` 태그 → publish.yml(npm)/release.yml(GH).
3. 머지·태그·publish 는 outward-facing — 사용자 확인.

## 자기 점검 메모

- table primitives 는 상태 없는 presentational — Tree(상태/키보드)보다 단순.
- 데모는 **TanStack v8** API(`useReactTable`/`getCoreRowModel`/`getSortedRowModel`/`getPaginationRowModel`/`flexRender`). v9 금지.
- checkbox/pagination 의 실제 export 는 구현 시 READ 로 확인(데모가 깨지지 않게).
- Task 5 에서 cli/package.json + versions.json 둘 다 0.118.0 동기화 — publish 실패 재발 방지.
- 후속 phase(필터·고정·그룹화·DnD·Flutter)는 spec 백로그.
