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
