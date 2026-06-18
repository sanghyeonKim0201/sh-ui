export const dynamic = "force-static";

import { VariantSource } from "@/components/variant-source";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import {
  TreeBasicDemo,
  TreeDisabledDemo,
  TreeUncontrolledDemo,
} from "./_demos/basic";

export default function TreePage() {
  return (
    <main className="container">
      <h1>Tree</h1>
      <p className="muted">
        계층 데이터를 표시하는 트리 뷰 — 확장/접힘, 선택, 키보드 네비게이션(화살표·
        Home/End·Enter·typeahead)을 지원한다. React는 <code>nodes</code> 배열을
        받아 평탄화해 렌더하며, Flutter는 <code>ShUiTree</code>에{" "}
        <code>nodes</code>·<code>expandedIds</code>·<code>selectedId</code>를
        넘겨 구성한다. Flutter Phase-1 키보드는 화살표·Enter/Space까지
        지원하며 typeahead는 React 전용이다.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <TreeBasicDemo />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const nodes: TreeNode[] = [
  { id: "src", label: "src", children: [
    { id: "comp", label: "components", children: [
      { id: "btn", label: "button.tsx" },
      { id: "tree", label: "tree.tsx" },
    ] },
    { id: "idx", label: "index.ts" },
  ] },
  { id: "pkg", label: "package.json" },
];

const [selected, setSelected] = useState<string | null>("btn");

<Tree
  nodes={nodes}
  defaultExpandedIds={["src", "comp"]}
  selectedId={selected}
  onSelect={setSelected}
/>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiTree(
  nodes: [
    ShUiTreeNode(id: 'src', label: 'src', children: [
      ShUiTreeNode(id: 'comp', label: 'components', children: [
        ShUiTreeNode(id: 'btn', label: 'button.tsx'),
        ShUiTreeNode(id: 'tree', label: 'tree.tsx'),
      ]),
      ShUiTreeNode(id: 'idx', label: 'index.ts'),
    ]),
    ShUiTreeNode(id: 'pkg', label: 'package.json'),
  ],
  expandedIds: const {'src', 'comp'},
  selectedId: selected,
  onSelect: (id) => setState(() => selected = id),
)`,
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
            code: `npx sh-ui-cli add tree`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add tree

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_tree.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="tree" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Tree } from "@/components/ui/tree";
import type { TreeNode } from "@/components/ui/tree/types";

const nodes: TreeNode[] = [
  { id: "a", label: "폴더 A", children: [
    { id: "a1", label: "파일 A-1" },
  ] },
  { id: "b", label: "파일 B" },
];

<Tree nodes={nodes} defaultExpandedIds={["a"]} />`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_tree.dart';

ShUiTree(
  nodes: [
    ShUiTreeNode(id: 'a', label: '폴더 A', children: [
      ShUiTreeNode(id: 'a1', label: '파일 A-1'),
    ]),
    ShUiTreeNode(id: 'b', label: '파일 B'),
  ],
  expandedIds: const {'a'},
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>기본 — 제어 선택</h3>
      <p className="muted">
        <code>selectedId</code>/<code>onSelect</code>로 선택 상태를 제어하고,{" "}
        <code>defaultExpandedIds</code>로 초기 확장 노드를 지정한다. 자식이 있는
        노드를 클릭하면 확장이 토글된다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <TreeBasicDemo />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [selected, setSelected] = useState<string | null>("btn");

<Tree
  nodes={nodes}
  defaultExpandedIds={["src", "comp"]}
  selectedId={selected}
  onSelect={setSelected}
/>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiTree(
  nodes: nodes,
  expandedIds: const {'src', 'comp'},
  selectedId: selected,
  onSelect: (id) => setState(() => selected = id),
)`,
            },
          ]}
        />
      </Preview>

      <h3>비활성화된 노드</h3>
      <p className="muted">
        <code>disabled: true</code>인 노드는 선택·확장되지 않고 키보드
        네비게이션에서도 건너뛴다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <TreeDisabledDemo />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const nodes: TreeNode[] = [
  { id: "docs", label: "docs", children: [
    { id: "intro", label: "intro.md" },
    { id: "draft", label: "draft.md (작성 중)", disabled: true },
  ] },
  { id: "secret", label: "secret/ (잠김)", disabled: true },
];

<Tree nodes={nodes} defaultExpandedIds={["docs"]} />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiTree(
  nodes: [
    ShUiTreeNode(id: 'docs', label: 'docs', children: [
      ShUiTreeNode(id: 'intro', label: 'intro.md'),
      ShUiTreeNode(id: 'draft', label: 'draft.md (작성 중)', disabled: true),
    ]),
    ShUiTreeNode(id: 'secret', label: 'secret/ (잠김)', disabled: true),
  ],
  expandedIds: const {'docs'},
)`,
            },
          ]}
        />
      </Preview>

      <h3>비제어 — defaultExpandedIds</h3>
      <p className="muted">
        <code>expandedIds</code>/<code>onExpandedChange</code> 없이{" "}
        <code>defaultExpandedIds</code>·<code>defaultSelectedId</code>만 주면
        트리가 확장/선택 상태를 내부적으로 관리한다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <TreeUncontrolledDemo />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Tree
  nodes={nodes}
  defaultExpandedIds={["app"]}
  defaultSelectedId="main"
/>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiTree(
  nodes: nodes,
  defaultExpandedIds: const {'app'},
  defaultSelectedId: 'main',
)`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          {
            name: "Tree",
            description: (
              <>
                루트. <code>nodes</code> 배열을 평탄화해{" "}
                <code>role=&quot;tree&quot;</code>로 렌더한다.
              </>
            ),
          },
          {
            name: "TreeNode",
            description: (
              <>
                노드 모델. <code>id</code>·<code>label</code>·
                <code>children</code>·<code>icon</code>·<code>disabled</code>.
              </>
            ),
          },
          {
            name: "ShUiTree",
            description: (
              <>
                Flutter 루트. <code>nodes</code>·<code>expandedIds</code>·
                <code>selectedId</code>·<code>onSelect</code>를 받는다.
              </>
            ),
          },
          {
            name: "ShUiTreeNode",
            description: (
              <>
                Flutter 노드 모델. <code>id</code>·<code>label</code>·
                <code>children</code>·<code>disabled</code>.
              </>
            ),
          },
        ]}
      />

      <h2>API Reference</h2>
      <PropsTable
        rows={[
          {
            prop: "nodes",
            type: "TreeNode[]",
            description: "렌더할 트리 노드 배열.",
          },
          {
            prop: "expandedIds",
            type: "string[]",
            description: "확장된 노드 id 목록 (controlled).",
          },
          {
            prop: "defaultExpandedIds",
            type: "string[]",
            default: "[]",
            description: "초기 확장 노드 id 목록 (uncontrolled).",
          },
          {
            prop: "onExpandedChange",
            type: "(ids: string[]) => void",
            description: "확장 상태 변경 콜백.",
          },
          {
            prop: "selectedId",
            type: "string | null",
            description: "선택된 노드 id (controlled).",
          },
          {
            prop: "defaultSelectedId",
            type: "string | null",
            default: "null",
            description: "초기 선택 노드 id (uncontrolled).",
          },
          {
            prop: "onSelect",
            type: "(id: string | null) => void",
            description: "선택 변경 콜백.",
          },
          {
            prop: "renderLabel",
            type: "(node: TreeNode) => ReactNode",
            description: "라벨 커스텀 렌더러. 기본은 node.label.",
          },
          {
            prop: "size",
            type: `"sm" | "md"`,
            default: `"md"`,
            description: "밀도. sm은 좁은 사이드바용 컴팩트 변형.",
          },
          {
            prop: "className",
            type: "string",
            default: "—",
            description: "루트 요소 클래스. .sh-ui-tree__item 등 셀렉터로 스타일을 덮어쓸 때 사용.",
          },
        ]}
      />

      <h2>스타일 커스터마이즈</h2>
      <p className="muted">
        Tree는 네이티브 HTML 속성과 <code>className</code>을 그대로 받는다.
        들여쓰기·아이콘·선택 하이라이트 색은 <code>styles.css</code>의 토큰 변수로
        조정하거나 <code>className</code>을 통해 <code>.sh-ui-tree__item</code> 등
        셀렉터로 override 한다 — <a href="/guidelines">가이드라인</a> 참조.
      </p>
    </main>
  );
}
