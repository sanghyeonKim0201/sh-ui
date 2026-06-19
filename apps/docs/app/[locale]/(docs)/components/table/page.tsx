export const dynamic = "force-static";

import { VariantSource } from "@/components/variant-source";
import { CodeTabs } from "@/components/ui/code-tabs";
import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import { DataTableDemo } from "./_demos/data-table";

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
