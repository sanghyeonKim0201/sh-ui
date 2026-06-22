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
            {paddingTop > 0 ? <tr aria-hidden style={{ height: paddingTop }} /> : null}
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
            {paddingBottom > 0 ? <tr aria-hidden style={{ height: paddingBottom }} /> : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
