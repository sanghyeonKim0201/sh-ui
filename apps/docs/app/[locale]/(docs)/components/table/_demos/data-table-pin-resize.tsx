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
  };
  return (
    <span style={{ display: "inline-flex", gap: "var(--space-1)" }}>
      <button
        type="button"
        style={{ ...btn, opacity: pinned === "left" ? 1 : 0.7 }}
        title={pinned === "left" ? "고정 해제" : "왼쪽 고정"}
        aria-label={`${label} 열 왼쪽 고정`}
        aria-pressed={pinned === "left"}
        onClick={() => column.pin(pinned === "left" ? false : "left")}
      >
        ⇤
      </button>
      <button
        type="button"
        style={{ ...btn, opacity: pinned === "right" ? 1 : 0.7 }}
        title={pinned === "right" ? "고정 해제" : "오른쪽 고정"}
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
