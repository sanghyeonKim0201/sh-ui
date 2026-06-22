"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface Person {
  id: string;
  name: string;
  role: string;
  age: number;
}

const data: Person[] = [
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
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
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
  const selectedRoles =
    (roleCol?.getFilterValue() as string[] | undefined) ?? [];
  const toggleRole = (role: string, on: boolean) => {
    const next = on
      ? [...selectedRoles, role]
      : selectedRoles.filter((r) => r !== role);
    roleCol?.setFilterValue(next.length ? next : undefined);
  };

  const hasFilters = globalFilter !== "" || columnFilters.length > 0;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: "var(--space-3)" }}>
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                padding: "var(--space-1)",
              }}
            >
              {ROLES.map((role) => (
                <label
                  key={role}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    cursor: "pointer",
                    fontSize: "var(--text-sm)",
                  }}
                >
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
            onClick={() => {
              setGlobalFilter("");
              table.resetColumnFilters();
            }}
          >
            초기화
          </Button>
        ) : null}
        <span
          style={{
            marginInlineStart: "auto",
            fontSize: "var(--text-xs)",
            color: "var(--foreground-muted)",
          }}
        >
          {filteredCount} / {data.length}
        </span>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
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
                    {flexRender(
                      cell.column.columnDef.cell ??
                        ((ctx) => ctx.getValue<React.ReactNode>()),
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                style={{ textAlign: "center", color: "var(--foreground-muted)" }}
              >
                결과 없음
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
