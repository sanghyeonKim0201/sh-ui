# dataTable Phase 3 — 열 고정·리사이즈 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docs 의 table 페이지에 TanStack `enableColumnPinning`(좌/우 sticky 고정) + `enableColumnResizing`(드래그 리사이즈) 기반 데모를 추가한다(table 컴포넌트·registry 무변경).

**Architecture:** `table` presentational primitives 는 그대로. 새 데모 컴포넌트가 TanStack pinning/sizing 을 wiring 하고, sticky 위치는 `pinnedStyle` 헬퍼(inline style)로, 리사이즈는 헤더 우측 핸들 div + `header.getResizeHandler()` 로 구현. `Table` 래퍼의 `overflow-x:auto` 가 sticky 스크롤 컨테이너.

**Tech Stack:** Next.js(apps/docs), `@tanstack/react-table` v8, `@/components/ui/table`.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/data-table-pinning`). 검증 `apps/docs` `pnpm build`/`tsc`.

> **docs 전용 — 릴리즈 없음.** versions.json·cli/package.json·registry 무변경. 단위 테스트도 추가하지 않음(Phase 1/2 와 동일하게 build/tsc/preview 가 게이트 — 이 데모는 TanStack + 브라우저 sticky/resize 통합이라 vitest 비대상).

---

## File Structure

| 파일 | 변경 |
|---|---|
| `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-pin-resize.tsx` | 신규 — 고정+리사이즈 데모 |
| `apps/docs/app/[locale]/(docs)/components/table/page.tsx` | "열 고정·리사이즈" 예제 섹션 추가(import + Preview + CodeTabs) |

---

## Task 1: 고정·리사이즈 데모 컴포넌트

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-pin-resize.tsx`

### Step 1: 데모 파일 작성

아래 전체 내용을 그대로 생성한다. (Phase 1 데모 `data-table.tsx` 와 같은 import 경로·렌더 패턴; `flexRender(cell.column.columnDef.cell, ...)` 는 accessor 컬럼의 기본 cell 렌더러를 사용 — Phase 1 에서 검증된 방식.)

```tsx
"use client";

import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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
  email: string;
  team: string;
  location: string;
  age: number;
}

const data: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", email: "sh@sh-ui.dev", team: "Core", location: "서울", age: 29 },
  { id: "2", name: "이도윤", role: "Designer", email: "doyun@sh-ui.dev", team: "Design", location: "부산", age: 34 },
  { id: "3", name: "박서연", role: "Engineer", email: "seoyeon@sh-ui.dev", team: "Web", location: "대전", age: 27 },
  { id: "4", name: "최민준", role: "PM", email: "minjun@sh-ui.dev", team: "Product", location: "인천", age: 41 },
  { id: "5", name: "정하은", role: "Engineer", email: "haeun@sh-ui.dev", team: "Web", location: "광주", age: 23 },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름", size: 140 },
  { accessorKey: "role", header: "역할", size: 140 },
  { accessorKey: "email", header: "이메일", size: 220 },
  { accessorKey: "team", header: "팀", size: 140 },
  { accessorKey: "location", header: "지역", size: 140 },
  { accessorKey: "age", header: "나이", size: 100 },
];

// 고정 열의 sticky 위치를 계산한다.
// getStart("left")/getAfter("right") 는 같은 쪽에 여러 열이 고정될 때 누적 offset 을 계산.
// 배경(var(--background))은 스크롤된 비고정 셀을 가리기 위함(셀 기본 배경은 transparent).
function pinnedStyle(column: Column<Person>, isHeader = false): React.CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: pinned === "right" ? `${column.getAfter("right")}px` : undefined,
    zIndex: isHeader ? 2 : 1,
    background: "var(--background)",
    boxShadow:
      pinned === "left"
        ? "inset -1px 0 0 0 var(--border)"
        : "inset 1px 0 0 0 var(--border)",
  };
}

function PinControls({ column }: { column: Column<Person> }) {
  const pinned = column.getIsPinned();
  const label = (column.columnDef.header as string) ?? column.id;
  const btn: React.CSSProperties = {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "inherit",
    fontSize: "var(--text-xs)",
    lineHeight: 1,
    opacity: 0.7,
  };
  return (
    <span style={{ display: "inline-flex", gap: "var(--space-1)" }}>
      <button
        type="button"
        style={{ ...btn, opacity: pinned === "left" ? 1 : 0.7 }}
        aria-label={`${label} 열 왼쪽 고정`}
        aria-pressed={pinned === "left"}
        onClick={() => column.pin(pinned === "left" ? false : "left")}
      >
        ⇤
      </button>
      <button
        type="button"
        style={{ ...btn, opacity: pinned === "right" ? 1 : 0.7 }}
        aria-label={`${label} 열 오른쪽 고정`}
        aria-pressed={pinned === "right"}
        onClick={() => column.pin(pinned === "right" ? false : "right")}
      >
        ⇥
      </button>
    </span>
  );
}

export function DataTablePinResizeDemo() {
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ["name"],
    right: [],
  });

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { columnPinning },
    onColumnPinningChange: setColumnPinning,
    enableColumnPinning: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <Table style={{ width: table.getTotalSize(), tableLayout: "fixed" }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  scope="col"
                  style={{
                    width: header.getSize(),
                    position: "relative",
                    ...pinnedStyle(header.column, true),
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </span>
                    <PinControls column={header.column} />
                  </div>
                  {header.column.getCanResize() ? (
                    <div
                      aria-hidden
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      style={{
                        position: "absolute",
                        insetBlock: 0,
                        insetInlineEnd: 0,
                        width: "var(--space-1)",
                        cursor: "col-resize",
                        userSelect: "none",
                        touchAction: "none",
                        background: header.column.getIsResizing()
                          ? "var(--primary)"
                          : "transparent",
                      }}
                    />
                  ) : null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                    ...pinnedStyle(cell.column),
                  }}
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext(),
                  )}
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

### Step 2: 타입체크
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "data-table-pin-resize" | head`
Expected: empty(에러 없음). 만약 `Column`/`ColumnPinningState` 타입 import 오류가 나면 `@tanstack/react-table` export 이름을 확인해 맞춘다(v8 에서 둘 다 export됨).

### Step 3: 커밋
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/_demos/data-table-pin-resize.tsx"
git commit -m "feat(docs): dataTable 열 고정·리사이즈 데모 컴포넌트"
```

---

## Task 2: page.tsx 에 "열 고정·리사이즈" 섹션 추가

**Files:**
- Modify: `apps/docs/app/[locale]/(docs)/components/table/page.tsx`

### Step 1: import 추가
파일 상단의 데모 import 묶음(현재 8~9행: `DataTableDemo`, `DataTableFilterDemo`) 아래에 한 줄 추가:

```tsx
import { DataTablePinResizeDemo } from "./_demos/data-table-pin-resize";
```

### Step 2: 섹션 추가
"필터" 섹션의 닫는 `</Preview>`(현재 127행) 다음, `<h2>Installation</h2>`(현재 129행) **앞**에 아래 블록을 삽입한다. 기존 필터 섹션의 `<Preview>` + `<CodeTabs>` 패턴을 그대로 따른다:

```tsx
      <h2>열 고정·리사이즈</h2>
      <p className="muted">
        <code>enableColumnPinning</code>으로 열을 좌/우에 sticky 고정하고(헤더의{" "}
        <code>⇤</code>/<code>⇥</code> 버튼), <code>enableColumnResizing</code> +{" "}
        <code>columnResizeMode: &quot;onChange&quot;</code>로 헤더 우측 핸들을 드래그해
        폭을 조절한다. 고정 위치는 <code>column.getStart(&quot;left&quot;)</code> /{" "}
        <code>getAfter(&quot;right&quot;)</code>로 계산하고, 폭은{" "}
        <code>table.getTotalSize()</code> / <code>column.getSize()</code>를{" "}
        <code>table-layout: fixed</code>와 함께 적용한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTablePinResizeDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// 열 고정 + 리사이즈
const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
  left: ["name"],
  right: [],
});

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름", size: 140 },
  { accessorKey: "email", header: "이메일", size: 220 },
  // …
];

const table = useReactTable({
  data,
  columns,
  state: { columnPinning },
  onColumnPinningChange: setColumnPinning,
  enableColumnPinning: true,
  enableColumnResizing: true,
  columnResizeMode: "onChange",
  getCoreRowModel: getCoreRowModel(),
});

// 고정 열의 sticky 위치 — 같은 쪽에 여러 열이 고정되면 offset 누적
function pinnedStyle(column: Column<Person>): React.CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? \`\${column.getStart("left")}px\` : undefined,
    right: pinned === "right" ? \`\${column.getAfter("right")}px\` : undefined,
    background: "var(--background)", // 스크롤된 비고정 셀을 가림
    zIndex: 1,
  };
}

// 테이블/셀 폭 — table-layout: fixed 와 함께
<Table style={{ width: table.getTotalSize(), tableLayout: "fixed" }}>
  <th style={{ width: header.getSize(), ...pinnedStyle(header.column) }}>
    {/* 헤더 우측 리사이즈 핸들 */}
    <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} />
  </th>

// 열 고정 토글
column.pin("left"); // "right" | false`,
            },
          ]}
        />
      </Preview>
```

### Step 3: 빌드 + 타입체크
Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -iE "data-table-pin-resize|table/page" | head`
Expected: empty.
Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공, `/components/table` 정적 생성. 깨지면 실제 export/타입에 맞춰 수정 후 재빌드 — 빌드 깨진 채 두지 말 것.

### Step 4: (가능 시) preview eval 동작 확인
dev 서버에서 `/components/table` 의 "열 고정·리사이즈" 데모:
1. 가로 스크롤 시 첫 열("이름")이 좌측에 고정되어 보임(배경이 스크롤된 셀을 가림).
2. 헤더 `⇤`/`⇥` 로 다른 열 좌/우 고정·해제, `aria-pressed` 토글.
3. 헤더 우측 끝 핸들 드래그로 열 폭 변경(드래그 중 핸들이 `--primary` 색).

### Step 5: 커밋
```bash
git add "apps/docs/app/[locale]/(docs)/components/table/page.tsx"
git commit -m "docs(table): 열 고정·리사이즈 예제 섹션 추가"
```

---

## 릴리즈 절차
**없음** — docs 전용. dev → live 일반 docs PR(태그·npm 없음), 사용자 확인 후 머지.

## 자기 점검 메모
- table/registry 무변경 — 고정·리사이즈는 TanStack + inline style 데모.
- pinning: `enableColumnPinning` + `columnPinning` state, `pinnedStyle` 헬퍼(getStart/getAfter, sticky, 불투명 배경, 경계 box-shadow), 헤더 `PinControls`(column.pin).
- sizing: `enableColumnResizing` + `columnResizeMode:"onChange"`, `getResizeHandler`, `table-layout:fixed` + `getTotalSize`/`getSize`. 컬럼 `size` 는 JS number(토큰 대상 아님).
- 접근성: 핀 버튼 `aria-label`/`aria-pressed`, 리사이즈 핸들은 장식(`aria-hidden`) — 마우스/터치 보조 기능.
- 후속(Phase 4 그룹화)은 별도 plan.
```

---

## Self-Review

**1. Spec coverage:** 스펙의 모든 요구 점검 —
- 열 고정(좌/우, 헬퍼, offset 누적, 배경, 경계) → Task 1 `pinnedStyle` + `PinControls` ✅
- 열 리사이즈(getResizeHandler, table-layout fixed, getTotalSize/getSize, 핸들 강조) → Task 1 헤더 핸들 ✅
- 6열 가로스크롤 유발 → Task 1 columns(880px 합 > 560 maxWidth) ✅
- page 섹션(Preview+CodeTabs) → Task 2 ✅
- 접근성(aria-label/pressed, 핸들 aria-hidden) → Task 1 ✅
- 릴리즈 없음 → 명시 ✅
- 정렬/선택은 이 데모서 생략(스펙의 범위 최소화와 일치) ✅

**2. Placeholder scan:** "…" 는 CodeTabs 표시용 코드 발췌(설명 문자열)일 뿐 실제 구현 코드는 Task 1 에 전부 포함 — plan 자체엔 미완성 placeholder 없음 ✅

**3. Type consistency:** `DataTablePinResizeDemo`(export) ↔ Task 2 import 일치, `pinnedStyle`/`PinControls`/`Person`/`columnPinning`/`ColumnPinningState`/`Column` 명칭 Task1·Task2 간 일치 ✅
