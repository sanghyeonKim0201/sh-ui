"use client";

import * as React from "react";
import {
  type ColumnDef,
  type Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
}

const initialData: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", team: "Core" },
  { id: "2", name: "이도윤", role: "Designer", team: "Design" },
  { id: "3", name: "박서연", role: "Engineer", team: "Web" },
  { id: "4", name: "최민준", role: "PM", team: "Product" },
  { id: "5", name: "정하은", role: "Engineer", team: "Web" },
  { id: "6", name: "강지우", role: "PM", team: "Web" },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "team", header: "팀" },
];

function DraggableRow({ row }: { row: Row<Person> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });
  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        background: isDragging ? "var(--background-muted)" : undefined,
      }}
    >
      <TableCell style={{ width: "var(--control-md)" }}>
        <button
          type="button"
          aria-label={`${row.original.name} 행 순서 변경 핸들`}
          {...attributes}
          {...listeners}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "grab",
            color: "inherit",
            fontSize: "var(--text-sm)",
            opacity: 0.6,
            touchAction: "none",
            lineHeight: 1,
          }}
        >
          ⠿
        </button>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTableRowDndDemo() {
  const [rows, setRows] = React.useState<Person[]>(initialData);
  const rowIds = React.useMemo(() => rows.map((r) => r.id), [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // @dnd-kit 의 aria-describedby 자동 id 가 SSR↔클라이언트에서 어긋나는 하이드레이션
  // 미스매치를 막기 위해 안정적인 id 를 준다(Phase 5 학습).
  const dndContextId = React.useId();

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((prev) => {
        const oldIndex = prev.findIndex((r) => r.id === active.id);
        const newIndex = prev.findIndex((r) => r.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead scope="col" aria-label="순서" />
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
            <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
              {table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} row={row} />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}
