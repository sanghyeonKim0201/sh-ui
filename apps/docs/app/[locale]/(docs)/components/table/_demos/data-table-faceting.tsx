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
  const roleOptions = Array.from(roleFacets.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
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
