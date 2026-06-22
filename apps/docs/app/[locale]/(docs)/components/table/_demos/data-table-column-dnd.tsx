"use client";

import * as React from "react";
import {
  type ColumnDef,
  type Header,
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
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
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
  email: string;
  team: string;
  age: number;
}

const data: Person[] = [
  { id: "1", name: "김상현", role: "Maintainer", email: "sh@sh-ui.dev", team: "Core", age: 29 },
  { id: "2", name: "이도윤", role: "Designer", email: "doyun@sh-ui.dev", team: "Design", age: 34 },
  { id: "3", name: "박서연", role: "Engineer", email: "seoyeon@sh-ui.dev", team: "Web", age: 27 },
  { id: "4", name: "최민준", role: "PM", email: "minjun@sh-ui.dev", team: "Product", age: 41 },
  { id: "5", name: "정하은", role: "Engineer", email: "haeun@sh-ui.dev", team: "Web", age: 23 },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  { accessorKey: "email", header: "이메일" },
  { accessorKey: "team", header: "팀" },
  { accessorKey: "age", header: "나이" },
];

function DraggableHead({ header }: { header: Header<Person, unknown> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: header.column.id });
  const label = (header.column.columnDef.header as string) ?? header.column.id;
  return (
    <TableHead
      ref={setNodeRef}
      scope="col"
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1 : undefined,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
        <button
          type="button"
          aria-label={`${label} 열 순서 변경 핸들`}
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
        {flexRender(header.column.columnDef.header, header.getContext())}
      </span>
    </TableHead>
  );
}

export function DataTableColumnDndDemo() {
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((c) => (c as { accessorKey?: string }).accessorKey as string),
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { columnOrder },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // @dnd-kit 은 기본적으로 내부 카운터로 aria-describedby id 를 만들어 SSR↔클라이언트
  // 하이드레이션 미스매치를 일으킨다. React.useId 로 안정적인 id 를 주입해 일치시킨다.
  const dndContextId = React.useId();

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={onDragEnd}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                  {headerGroup.headers.map((header) => (
                    <DraggableHead key={header.id} header={header} />
                  ))}
                </SortableContext>
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
    </DndContext>
  );
}
