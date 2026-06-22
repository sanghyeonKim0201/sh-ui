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
    // 자동 리셋(expanded/페이지 등)을 끈다. TanStack 의 자동 리셋은 첫 하이드레이션
    // 마운트 직전에 setState 를 트리거해 "hasn't mounted yet" React 경고를 낸다.
    autoResetAll: false,
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
