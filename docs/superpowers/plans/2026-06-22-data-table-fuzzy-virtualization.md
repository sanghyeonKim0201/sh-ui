# dataTable PR B — Fuzzy Filtering · Virtualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docs 의 table 페이지에 **Fuzzy Filtering**(@tanstack/match-sorter-utils) 과 **Virtualization**(@tanstack/react-virtual) 데모를 추가한다(table 컴포넌트·registry 무변경).

**Architecture:** `table` primitives 그대로. 퍼지 데모는 `rankItem` 커스텀 filterFn + globalFilter. 가상화 데모는 `useVirtualizer` + 스크롤 컨테이너 + tbody 상/하 spacer 행(table 호환).

**Tech Stack:** Next.js(apps/docs), `@tanstack/react-table` v8, `@tanstack/match-sorter-utils`, `@tanstack/react-virtual`, `@/components/ui/{table,input}`.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/data-table-fuzzy-virtualization`). 검증 `apps/docs` `pnpm build`/`tsc`.

> **sh-ui 코어 릴리즈 없음.** table·registry·cli·versions.json 무변경. apps/docs/package.json 에 2개 의존성 + lockfile.

---

## File Structure

| 파일 | 변경 |
|---|---|
| `apps/docs/package.json` | @tanstack/match-sorter-utils·@tanstack/react-virtual 추가 |
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-fuzzy.tsx` | 신규 — 퍼지 글로벌 검색 |
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-virtualized.tsx` | 신규 — 행 가상화 |
| `apps/docs/app/[locale]/(docs)/components/table/page.tsx` | 2개 예제 섹션 추가 |

---

## Task 1: 의존성 설치

- [ ] **Step 1: 설치**
Run (repo 루트):
```bash
pnpm --filter @sh-ui/docs add @tanstack/match-sorter-utils @tanstack/react-virtual
```
Expected: 두 패키지가 `apps/docs/package.json` dependencies 에 추가, lockfile 갱신.

- [ ] **Step 2: 확인**
Run:
```bash
node -e "const d=require('./apps/docs/package.json').dependencies; console.log(['@tanstack/match-sorter-utils','@tanstack/react-virtual'].map(k=>k+': '+(d[k]||'MISSING')).join('\n'))"
```
Expected: 둘 다 버전 출력(MISSING 없음).

- [ ] **Step 3: 커밋**
```bash
git add apps/docs/package.json pnpm-lock.yaml
git commit -m "build(docs): @tanstack match-sorter-utils·react-virtual 추가 (fuzzy·가상화 데모용)"
```

---

## Task 2: Fuzzy Filtering 데모

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-fuzzy.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Person {
  id: string;
  name: string;
  role: string;
  team: string;
}

const data: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", team: "Core" },
  { id: "2", name: "이도윤", role: "Designer", team: "Design" },
  { id: "3", name: "박서연", role: "Engineer", team: "Web" },
  { id: "4", name: "최민준", role: "Product Manager", team: "Product" },
  { id: "5", name: "정하은", role: "Engineer", team: "Web" },
  { id: "6", name: "강지우", role: "Product Manager", team: "Web" },
];

// 오타 관대 매칭: rankItem 으로 점수화하고 통과 여부 반환
const fuzzyFilter: FilterFn<Person> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value as string);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "team", header: "팀" },
];

export function DataTableFuzzyDemo() {
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: "var(--space-3)" }}>
      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="퍼지 검색 (오타 허용)…"
          aria-label="퍼지 검색"
          style={{ maxWidth: "16rem" }}
        />
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

> 랭킹 정렬(선택): `columnFiltersMeta[columnId].itemRank` 를 `compareItems` 로 비교하는 sortingFn 을 추가하면 매칭도 순 정렬 가능. 데모에선 글로벌 검색 + 카운트로 충분.

- [ ] **Step 2: 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-fuzzy" | head`
Expected: empty. `FilterFn` import 및 `addMeta`/`itemRank` 타입 확인. `rankItem` 의 첫 인자 타입(unknown)은 `row.getValue(columnId)` 그대로 전달.

- [ ] **Step 3: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-fuzzy.tsx"
git commit -m "feat(docs): dataTable 퍼지 검색(Fuzzy Filtering) 데모"
```

---

## Task 3: Virtualization 데모

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-virtualized.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
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

const ROLES = ["Maintainer", "Designer", "Engineer", "PM"];
const TEAMS = ["Core", "Web", "Design", "Product"];

// 결정론적 더미 1,000행 (Date.now/random 미사용)
const data: Person[] = Array.from({ length: 1000 }, (_, i) => ({
  id: String(i + 1),
  name: `사용자 ${i + 1}`,
  role: ROLES[i % ROLES.length],
  team: TEAMS[i % TEAMS.length],
  age: 20 + (i % 40),
}));

const columns: ColumnDef<Person>[] = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "team", header: "팀" },
  { accessorKey: "age", header: "나이" },
];

const ROW_HEIGHT = 41; // 행 추정 높이(px)

export function DataTableVirtualizedDemo() {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows.length ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length
    ? totalSize - virtualRows[virtualRows.length - 1].end
    : 0;

  return (
    <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: "var(--space-2)" }}>
      <p className="muted" style={{ margin: 0, fontSize: "var(--text-sm)" }}>
        {data.length.toLocaleString()}행 중 화면에 보이는 행만 DOM 에 렌더한다.
      </p>
      <div ref={parentRef} style={{ height: "20rem", overflow: "auto" }}>
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
            {paddingTop > 0 ? (
              <tr aria-hidden style={{ height: paddingTop }} />
            ) : null}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow key={row.id} data-index={virtualRow.index}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paddingBottom > 0 ? (
              <tr aria-hidden style={{ height: paddingBottom }} />
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

> tbody 안의 상/하 spacer 는 평범한 `<tr>`(TableRow 아님 — 클래스/스타일 충돌 방지). 가상 행만 `<TableRow>` 로 렌더. table-layout 기본(auto)이면 행 폭은 자동.

- [ ] **Step 2: 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-virtualized" | head`
Expected: empty. `useVirtualizer` 제네릭(HTMLDivElement) 타입 확인.

- [ ] **Step 3: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-virtualized.tsx"
git commit -m "feat(docs): dataTable 행 가상화(Virtualization) 데모 — 1,000행"
```

---

## Task 4: page.tsx 에 2개 섹션 추가

**Files:**
- Modify: `apps/docs/app/[locale]/(docs)/components/table/page.tsx`

- [ ] **Step 1: import 추가**
```tsx
import { DataTableFuzzyDemo } from "./_demos/data-table-fuzzy";
import { DataTableVirtualizedDemo } from "./_demos/data-table-virtualized";
```

- [ ] **Step 2: 섹션 추가**
"패싯(값·개수)" 섹션의 닫는 `</Preview>` 다음, `<h2>Installation</h2>` 앞에 삽입:

```tsx
      <h2>퍼지 검색</h2>
      <p className="muted">
        <code>@tanstack/match-sorter-utils</code>의 <code>rankItem</code>으로 커스텀{" "}
        <code>filterFn</code>을 만들어 오타에 관대한 글로벌 검색을 한다. 단일
        입력으로 전 컬럼을 점수 기반 매칭한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableFuzzyDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { rankItem } from "@tanstack/match-sorter-utils";

const fuzzyFilter: FilterFn<Person> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value as string);
  addMeta({ itemRank });
  return itemRank.passed;
};

const table = useReactTable({
  data, columns,
  state: { globalFilter },
  onGlobalFilterChange: setGlobalFilter,
  globalFilterFn: fuzzyFilter,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

<Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />`,
            },
          ]}
        />
      </Preview>

      <h2>행 가상화</h2>
      <p className="muted">
        <code>@tanstack/react-virtual</code>의 <code>useVirtualizer</code>로 대량
        데이터(1,000행)에서 화면에 보이는 행만 렌더한다. 상/하 spacer 로 전체 스크롤
        높이를 유지한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableVirtualizedDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { useVirtualizer } from "@tanstack/react-virtual";

const parentRef = React.useRef<HTMLDivElement>(null);
const rows = table.getRowModel().rows;

const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 41,
  overscan: 8,
});

const virtualRows = virtualizer.getVirtualItems();
const paddingTop = virtualRows.length ? virtualRows[0].start : 0;
const paddingBottom = virtualRows.length
  ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
  : 0;

<div ref={parentRef} style={{ height: "20rem", overflow: "auto" }}>
  <Table>
    <TableBody>
      {paddingTop > 0 && <tr style={{ height: paddingTop }} />}
      {virtualRows.map((v) => { const row = rows[v.index]; return <TableRow>…</TableRow>; })}
      {paddingBottom > 0 && <tr style={{ height: paddingBottom }} />}
    </TableBody>
  </Table>
</div>`,
            },
          ]}
        />
      </Preview>
```

- [ ] **Step 3: 빌드 + 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -iE "data-table-(fuzzy|virtualized)|table/page" | head`
Expected: empty.
Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공.

- [ ] **Step 4: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/page.tsx"
git commit -m "docs(table): 퍼지 검색·행 가상화 예제 섹션 추가"
```

---

## Task 5: preview 검증

- [ ] dev 서버에서 `/components/table`:
  1. **Fuzzy**: 오타 입력("enginer", "사용자")시 근접 행 매칭·카운트 갱신.
  2. **Virtualization**: 1,000행이지만 `tbody tr`(데이터 행) 수가 viewport+overscan 수준(수십 개)뿐, 스크롤 시 행 내용·data-index 변화, 전체 스크롤 높이 유지.
  3. **콘솔 에러 0** — 첫-마운트 경고 보이면 autoResetAll:false, 서버 재시작 재확인.

---

## 릴리즈 절차
**sh-ui 코어 없음** — dev → live 일반 docs PR(태그·npm 없음), 사용자 확인. PR 에 apps/docs/package.json + lockfile 포함.

## 자기 점검 메모
- table/registry 무변경. fuzzy=rankItem 커스텀 filterFn, virtualization=useVirtualizer + spacer 행.
- 1,000행은 결정론적 생성(Date.now/random 미사용).
- 가상화 spacer 는 plain `<tr>`(TableRow 아님).
- 첫-마운트 경고 시 autoResetAll:false(grouping 학습).

---

## Self-Review

**1. Spec coverage:** Fuzzy(Task2) / Virtualization(Task3) / deps(Task1) / page(Task4) / preview(Task5) — spec 2기능 + deps + page + 검증 매핑 ✅
**2. Placeholder scan:** CodeTabs 문자열은 표시용 발췌, 실제 구현은 Task2~3 에 전부 포함 ✅
**3. Type consistency:** export 명(`DataTableFuzzyDemo`/`DataTableVirtualizedDemo`) ↔ Task4 import 일치. `FilterFn`/`fuzzyFilter`/`useVirtualizer`/`parentRef`/`virtualRows` 명칭 일관 ✅
