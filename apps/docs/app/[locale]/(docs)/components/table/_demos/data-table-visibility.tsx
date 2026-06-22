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
        {table
          .getAllLeafColumns()
          .filter((c) => c.getCanHide())
          .map((column) => (
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
