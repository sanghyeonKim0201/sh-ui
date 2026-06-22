export const dynamic = "force-static";

import { VariantSource } from "@/components/variant-source";
import { CodeTabs } from "@/components/ui/code-tabs";
import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import { DataTableDemo } from "./_demos/data-table";
import { DataTableFilterDemo } from "./_demos/data-table-filter";
import { DataTablePinResizeDemo } from "./_demos/data-table-pin-resize";
import { DataTableColumnDndDemo } from "./_demos/data-table-column-dnd";

export default function TablePage() {
  return (
    <main className="container">
      <h1>Table</h1>
      <p className="muted">
        시맨틱 <code>&lt;table&gt;</code> 프리미티브 8종. 스타일·접근성만 제공하고
        정렬·선택·페이지 같은 데이터 로직은 가지지 않는다 — 아래 데모처럼{" "}
        <a href="https://tanstack.com/table">TanStack Table v8</a> 같은 headless
        라이브러리와 조합해 데이터 테이블을 만든다. (Flutter: 후속)
      </p>

      <Preview>
        <Preview.Demo>
          <DataTableDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// TanStack Table v8 + sh-ui Table 프리미티브
const table = useReactTable({
  data,
  columns,
  state: { sorting, rowSelection },
  onSortingChange: setSorting,
  onRowSelectionChange: setRowSelection,
  enableRowSelection: true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 3 } },
});

<Table>
  <TableHeader>
    {table.getHeaderGroups().map((hg) => (
      <TableRow key={hg.id}>
        {hg.headers.map((h) => (
          <TableHead key={h.id} aria-sort={...}>
            <button onClick={h.column.getToggleSortingHandler()}>
              {flexRender(h.column.columnDef.header, h.getContext())}
            </button>
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>`,
            },
          ]}
        />
      </Preview>

      <h2>필터</h2>
      <p className="muted">
        전체 검색(<code>globalFilter</code>)과 역할 faceted 필터(체크박스 다중
        선택)를 <code>getFilteredRowModel</code>로 조합한다. 역할 컬럼은{" "}
        <code>filterFn: &quot;arrIncludesSome&quot;</code>로 선택된 값 중 하나라도
        일치하면 통과시킨다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableFilterDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// 전체 검색 + 역할 faceted 필터
const [globalFilter, setGlobalFilter] = React.useState("");
const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할", filterFn: "arrIncludesSome" },
  { accessorKey: "age", header: "나이" },
];

const table = useReactTable({
  data,
  columns,
  state: { sorting, globalFilter, columnFilters },
  onGlobalFilterChange: setGlobalFilter,
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(), // 필터 활성화
  getPaginationRowModel: getPaginationRowModel(),
});

// 전체 검색 input
<Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />

// 역할 faceted 체크박스 — 선택된 값 배열을 컬럼 필터로 전달
const roleCol = table.getColumn("role");
const selectedRoles = (roleCol?.getFilterValue() as string[]) ?? [];
const next = on ? [...selectedRoles, role] : selectedRoles.filter((r) => r !== role);
roleCol?.setFilterValue(next.length ? next : undefined);`,
            },
          ]}
        />
      </Preview>

      <h2>열 고정·리사이즈</h2>
      <p className="muted">
        <code>enableColumnPinning</code>으로 열을 좌/우에 sticky 고정하고(헤더의{" "}
        <code>⇤</code>/<code>⇥</code> 버튼), <code>enableColumnResizing</code> +{" "}
        <code>columnResizeMode: &quot;onChange&quot;</code>로 헤더 우측 핸들을 드래그해
        폭을 조절한다. 고정 위치는 <code>column.getStart(&quot;left&quot;)</code> /{" "}
        <code>getAfter(&quot;right&quot;)</code>로 계산하고, 폭은{" "}
        <code>table.getTotalSize()</code> / <code>column.getSize()</code>를{" "}
        <code>table-layout: fixed</code>와 함께 적용한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTablePinResizeDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// 열 고정 + 리사이즈
const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
  left: ["name"],
  right: [],
});

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "이름", size: 140 },
  { accessorKey: "email", header: "이메일", size: 220 },
  // …
];

const table = useReactTable({
  data,
  columns,
  state: { columnPinning },
  onColumnPinningChange: setColumnPinning,
  enableColumnPinning: true,
  enableColumnResizing: true,
  columnResizeMode: "onChange",
  getCoreRowModel: getCoreRowModel(),
});

// 고정 열의 sticky 위치 — 같은 쪽에 여러 열이 고정되면 offset 누적
function pinnedStyle(column: Column<Person>): React.CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? \`\${column.getStart("left")}px\` : undefined,
    right: pinned === "right" ? \`\${column.getAfter("right")}px\` : undefined,
    background: "var(--background)", // 스크롤된 비고정 셀을 가림
    zIndex: 1,
  };
}

// 테이블/셀 폭 — table-layout: fixed 와 함께
<Table style={{ width: table.getTotalSize(), tableLayout: "fixed" }}>
  <th style={{ width: header.getSize(), ...pinnedStyle(header.column) }}>
    {/* 헤더 우측 리사이즈 핸들 */}
    <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} />
  </th>

// 열 고정 토글
column.pin("left"); // "right" | false`,
            },
          ]}
        />
      </Preview>

      <h2>열 순서 변경 (드래그앤드롭)</h2>
      <p className="muted">
        TanStack <code>columnOrder</code> state 와 <code>@dnd-kit</code>을 조합해 헤더
        그립(<code>⠿</code>)을 끌어 열 순서를 바꾼다. 바디 셀은{" "}
        <code>columnOrder</code>를 자동으로 따라간다. 키보드도 지원한다 — 핸들에
        포커스 후 Space로 잡고 <code>←</code>/<code>→</code>로 이동, Space로 놓는다.
      </p>
      <Preview>
        <Preview.Demo>
          <DataTableColumnDndDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// 열 순서 변경 — TanStack columnOrder + @dnd-kit
const [columnOrder, setColumnOrder] = React.useState<string[]>(
  () => columns.map((c) => c.accessorKey),
);

const table = useReactTable({
  data,
  columns,
  state: { columnOrder },
  onColumnOrderChange: setColumnOrder,
  getCoreRowModel: getCoreRowModel(),
});

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);

function onDragEnd({ active, over }: DragEndEvent) {
  if (over && active.id !== over.id) {
    setColumnOrder((prev) =>
      arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id)),
    );
  }
}

// 헤더 셀 — useSortable 로 드래그, 그립 핸들에 listeners
function DraggableHead({ header }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: header.column.id });
  return (
    <TableHead ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}>
      <button {...attributes} {...listeners} style={{ cursor: "grab" }}>⠿</button>
      {flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  );
}

// 렌더 트리
<DndContext sensors={sensors} modifiers={[restrictToHorizontalAxis]} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
  <Table>
    <TableHeader>
      <TableRow>
        <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
          {headerGroup.headers.map((h) => <DraggableHead key={h.id} header={h} />)}
        </SortableContext>
      </TableRow>
    </TableHeader>
    {/* 바디 셀은 columnOrder 자동 반영 */}
  </Table>
</DndContext>`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add table

# 위 데이터 테이블 데모처럼 정렬/선택/페이지를 붙이려면
# headless 라이브러리를 별도로 설치한다:
npm install @tanstack/react-table`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="table" />

      <h2>Usage</h2>
      <p className="muted">
        프리미티브만으로 정적 표를 만들 수 있고, 데이터 로직은 TanStack Table 등과
        조합한다.
      </p>
      <CodePanel
        language="tsx"
        code={`import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

<Table>
  <TableCaption>2026년 1분기 매출</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>항목</TableHead>
      <TableHead>금액</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>구독</TableCell>
      <TableCell>₩1,200,000</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell>합계</TableCell>
      <TableCell>₩1,200,000</TableCell>
    </TableRow>
  </TableFooter>
</Table>`}
      />

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Table", description: "루트. <table> + 가로 스크롤 래퍼." },
          { name: "TableHeader", description: "<thead>." },
          { name: "TableBody", description: "<tbody>." },
          { name: "TableFooter", description: "<tfoot> — 합계/요약 행." },
          {
            name: "TableRow",
            description: 'tr. data-state="selected" 로 선택 강조.',
          },
          {
            name: "TableHead",
            description: 'th scope="col". 정렬 토글/인디케이터 슬롯.',
          },
          { name: "TableCell", description: "<td>." },
          { name: "TableCaption", description: "<caption> — 접근성 캡션." },
        ]}
      />

      <h2>스타일 커스터마이즈</h2>
      <p className="muted">
        8개 프리미티브 모두 네이티브 HTML 속성과 <code>className</code>을 그대로
        받는다. 정렬 인디케이터·선택 하이라이트(<code>data-state</code>)·zebra
        스트라이프 등은 <code>className</code>을 통해{" "}
        <code>.sh-ui-table__*</code> 셀렉터로 override 한다 —{" "}
        <a href="/guidelines">가이드라인</a> 참조.
      </p>
    </main>
  );
}
