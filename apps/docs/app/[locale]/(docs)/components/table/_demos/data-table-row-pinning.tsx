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
  const stickyStyle: React.CSSProperties | undefined = pinned
    ? {
        position: "sticky",
        top: pinned === "top" ? 0 : undefined,
        bottom: pinned === "bottom" ? 0 : undefined,
        zIndex: 1,
        background: "var(--background)",
        boxShadow:
          pinned === "top"
            ? "inset 0 -1px 0 0 var(--border)"
            : "inset 0 1px 0 0 var(--border)",
      }
    : undefined;
  return (
    <TableRow style={stickyStyle}>
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
      <div style={{ maxHeight: "14rem", overflow: "auto" }}>
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
