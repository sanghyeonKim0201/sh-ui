# dataTable Phase 4 — 그룹화·확장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docs 의 table 페이지에 TanStack `getGroupedRowModel`/`getExpandedRowModel` 기반 그룹화(팀/역할 토글)·확장·집계(평균) 데모를 추가한다(table 컴포넌트·registry 무변경, 새 의존성 0).

**Architecture:** `table` presentational primitives 는 그대로. 새 데모가 TanStack grouping/expanding state 를 wiring 하고, 셀 렌더를 `getIsGrouped`/`getIsAggregated`/`getIsPlaceholder` 로 분기. 그룹 토글·들여쓰기는 inline.

**Tech Stack:** Next.js(apps/docs), `@tanstack/react-table` v8(내장 grouping), `@/components/ui/{table,button}`.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/data-table-grouping`). 검증 `apps/docs` `pnpm build`/`tsc`.

> **docs 전용 — 릴리즈 없음.** versions.json·cli/package.json·registry·의존성 무변경.

---

## File Structure

| 파일 | 변경 |
|---|---|
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-grouping.tsx` | 신규 — 그룹화·확장 데모 |
| `apps/docs/app/[locale]/(docs)/components/table/page.tsx` | "그룹화·확장" 예제 섹션 추가 |

---

## Task 1: 그룹화·확장 데모 컴포넌트

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-grouping.tsx`

- [ ] **Step 1: 데모 파일 작성**

아래 전체 내용을 그대로 생성한다. (Phase 1~5 데모와 같은 import 경로·렌더 패턴. Button 은 `@/components/ui/button`.)

```tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  type GroupingState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
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
import { Button } from "@/components/ui/button";

interface Person {
  id: string;
  name: string;
  team: string;
  role: string;
  age: number;
}

const data: Person[] = [
  { id: "1", name: "김상현", team: "Core", role: "Maintainer", age: 29 },
  { id: "2", name: "이도윤", team: "Design", role: "Designer", age: 34 },
  { id: "3", name: "박서연", team: "Web", role: "Engineer", age: 27 },
  { id: "4", name: "최민준", team: "Web", role: "Engineer", age: 41 },
  { id: "5", name: "정하은", team: "Core", role: "Engineer", age: 23 },
  { id: "6", name: "강지우", team: "Web", role: "PM", age: 30 },
  { id: "7", name: "윤서아", team: "Design", role: "Designer", age: 38 },
  { id: "8", name: "임하준", team: "Core", role: "Engineer", age: 26 },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "team", header: "팀" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "name", header: "이름" },
  {
    accessorKey: "age",
    header: "나이",
    aggregationFn: "mean",
    aggregatedCell: ({ getValue }) => `평균 ${Math.round(Number(getValue()))}`,
  },
];

export function DataTableGroupingDemo() {
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { grouping, expanded },
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const current = grouping[0] ?? "";
  const groupBtn = (id: string, label: string) => (
    <Button
      type="button"
      variant={current === id ? "primary" : "secondary"}
      size="sm"
      aria-pressed={current === id}
      onClick={() => setGrouping(id ? [id] : [])}
    >
      {label}
    </Button>
  );

  return (
    <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: "var(--space-3)" }}>
      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--foreground-muted)" }}>그룹 기준:</span>
        {groupBtn("team", "팀")}
        {groupBtn("role", "역할")}
        {groupBtn("", "해제")}
        {grouping.length ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            style={{ marginInlineStart: "auto" }}
            onClick={() => table.toggleAllRowsExpanded()}
          >
            모두 펼치기/접기
          </Button>
        ) : null}
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
              {row.getVisibleCells().map((cell) => {
                if (cell.getIsGrouped()) {
                  return (
                    <TableCell key={cell.id}>
                      <button
                        type="button"
                        onClick={row.getToggleExpandedHandler()}
                        aria-expanded={row.getIsExpanded()}
                        aria-label={`${cell.getValue()} 그룹 ${row.getIsExpanded() ? "접기" : "펼치기"}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          background: "none",
                          border: "none",
                          padding: 0,
                          font: "inherit",
                          color: "inherit",
                          cursor: "pointer",
                          paddingInlineStart: `calc(${row.depth} * var(--space-3))`,
                        }}
                      >
                        <span aria-hidden style={{ opacity: 0.7 }}>
                          {row.getIsExpanded() ? "▼" : "▶"}
                        </span>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}{" "}
                        <span style={{ color: "var(--foreground-muted)" }}>
                          ({row.subRows.length})
                        </span>
                      </button>
                    </TableCell>
                  );
                }
                if (cell.getIsAggregated()) {
                  return (
                    <TableCell key={cell.id} style={{ color: "var(--foreground-muted)" }}>
                      {flexRender(
                        cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                }
                if (cell.getIsPlaceholder()) {
                  return <TableCell key={cell.id} />;
                }
                return (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-grouping" | head`
Expected: empty. `GroupingState`/`ExpandedState` import 오류 시 `@tanstack/react-table` export 확인(v8 에서 둘 다 export). Button 의 `variant`/`size` 값(`primary`/`secondary`/`ghost`, `sm`)이 실제 API 와 다르면 맞춰 조정(button/index.tsx READ).

- [ ] **Step 3: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-grouping.tsx"
git commit -m "feat(docs): dataTable 그룹화·확장 데모 컴포넌트"
```

---

## Task 2: page.tsx 에 "그룹화·확장" 섹션 추가

**Files:**
- Modify: `apps/docs/app/[locale]/(docs)/components/table/page.tsx`

- [ ] **Step 1: import 추가**
데모 import 묶음 아래에 추가:
```tsx
import { DataTableGroupingDemo } from "./_demos/data-table-grouping";
```

- [ ] **Step 2: 섹션 추가**
"열 순서 변경 (드래그앤드롭)" 섹션의 닫는 `</Preview>` 다음, `<h2>Installation</h2>` 앞에 삽입(기존 Preview + CodeTabs 패턴):

```tsx
      <h2>그룹화·확장</h2>
      <p className="muted">
        <code>getGroupedRowModel</code>로 행을 그룹화하고{" "}
        <code>getExpandedRowModel</code>로 펼친다. 토글 버튼으로 팀/역할 기준을
        바꾸고, 숫자 컬럼은 <code>aggregationFn: &quot;mean&quot;</code>으로 그룹
        평균을 집계한다. 셀은 <code>getIsGrouped</code> /{" "}
        <code>getIsAggregated</code> / <code>getIsPlaceholder</code>로 렌더를
        분기한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableGroupingDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// 그룹화 + 확장 + 집계
const [grouping, setGrouping] = React.useState<GroupingState>([]);
const [expanded, setExpanded] = React.useState<ExpandedState>({});

const columns: ColumnDef<Person>[] = [
  { accessorKey: "team", header: "팀" },
  { accessorKey: "age", header: "나이", aggregationFn: "mean",
    aggregatedCell: ({ getValue }) => \`평균 \${Math.round(Number(getValue()))}\` },
  // …
];

const table = useReactTable({
  data,
  columns,
  state: { grouping, expanded },
  onGroupingChange: setGrouping,
  onExpandedChange: setExpanded,
  getCoreRowModel: getCoreRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
});

// 그룹 기준 토글
setGrouping(["team"]); // ["role"] | []

// 셀 렌더 분기
if (cell.getIsGrouped()) {
  // 토글(▶/▼) + 그룹값 + 하위 개수
  <button onClick={row.getToggleExpandedHandler()} aria-expanded={row.getIsExpanded()}>
    {row.getIsExpanded() ? "▼" : "▶"} {value} ({row.subRows.length})
  </button>
} else if (cell.getIsAggregated()) {
  // 집계값(평균)
  flexRender(cell.column.columnDef.aggregatedCell, cell.getContext())
} else if (cell.getIsPlaceholder()) {
  // 빈 셀
} else {
  // 일반 셀
}`,
            },
          ]}
        />
      </Preview>
```

- [ ] **Step 3: 빌드 + 타입체크**
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -iE "data-table-grouping|table/page" | head`
Expected: empty.
Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공, `/components/table` 정적 생성. 깨지면 실제 API/Button props 에 맞춰 수정 후 재빌드.

- [ ] **Step 4: (가능 시) preview eval 동작 확인**
dev 서버에서 `/components/table` 의 "그룹화·확장" 데모:
1. "팀" 클릭 → 팀별 그룹 행 + 나이 평균 집계 표시.
2. 그룹 토글(▶/▼)로 개별 확장/축소, "모두 펼치기/접기" 동작.
3. "역할"로 기준 전환, "해제"로 평면 복귀.
4. 콘솔 에러 0.

- [ ] **Step 5: 커밋**
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/page.tsx"
git commit -m "docs(table): 그룹화·확장 예제 섹션 추가"
```

---

## 릴리즈 절차
**없음** — docs 전용. dev → live 일반 docs PR(태그·npm 없음), 사용자 확인 후 머지.

## 자기 점검 메모
- table/registry 무변경, 새 의존성 0 — grouping/expanding 은 TanStack 내장.
- 셀 분기: getIsGrouped(토글+값+개수) / getIsAggregated(평균) / getIsPlaceholder(빈) / 일반.
- 그룹 기준 토글: setGrouping(["team"]/["role"]/[]), aria-pressed.
- Button props(variant/size)는 구현 시 button/index.tsx 로 확정.
- 후속: 행 DnD(다음 phase), Flutter dataTable.

---

## Self-Review

**1. Spec coverage:**
- 팀/역할/해제 토글 → Task 1 groupBtn + setGrouping ✅
- 확장/축소(개별 + 전체) → row.getToggleExpandedHandler + toggleAllRowsExpanded ✅
- 집계(평균) → age aggregationFn:"mean" + aggregatedCell ✅
- 셀 분기(grouped/aggregated/placeholder/일반) → Task 1 렌더 분기 ✅
- 들여쓰기 → row.depth paddingInlineStart ✅
- 접근성(aria-expanded/pressed/label) → Task 1 ✅
- page 섹션 → Task 2 ✅
- 릴리즈 없음·새 의존성 0 → 명시 ✅

**2. Placeholder scan:** CodeTabs 코드 문자열은 표시용 발췌 — 실제 구현은 Task 1 에 전부 포함. plan 자체에 미완성 placeholder 없음 ✅

**3. Type consistency:** `DataTableGroupingDemo`(export) ↔ Task 2 import 일치. `grouping`/`setGrouping`/`expanded`/`GroupingState`/`ExpandedState`/`aggregatedCell` 명칭 Task 간 일치 ✅
