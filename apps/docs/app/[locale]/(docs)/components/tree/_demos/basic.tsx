"use client";
import * as React from "react";
import { Tree } from "@/components/ui/tree";
import type { TreeNode } from "@/components/ui/tree/types";

const nodes: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "comp",
        label: "components",
        children: [
          { id: "btn", label: "button.tsx" },
          { id: "tree", label: "tree.tsx" },
        ],
      },
      { id: "idx", label: "index.ts" },
    ],
  },
  { id: "pkg", label: "package.json" },
];

export function TreeBasicDemo() {
  const [selected, setSelected] = React.useState<string | null>("btn");
  return (
    <Tree
      nodes={nodes}
      defaultExpandedIds={["src", "comp"]}
      selectedId={selected}
      onSelect={setSelected}
    />
  );
}

const disabledNodes: TreeNode[] = [
  {
    id: "docs",
    label: "docs",
    children: [
      { id: "intro", label: "intro.md" },
      { id: "draft", label: "draft.md (작성 중)", disabled: true },
    ],
  },
  { id: "readme", label: "README.md" },
  { id: "secret", label: "secret/ (잠김)", disabled: true },
];

export function TreeDisabledDemo() {
  return <Tree nodes={disabledNodes} defaultExpandedIds={["docs"]} />;
}

const uncontrolledNodes: TreeNode[] = [
  {
    id: "app",
    label: "app",
    children: [
      {
        id: "routes",
        label: "routes",
        children: [
          { id: "home", label: "home.tsx" },
          { id: "about", label: "about.tsx" },
        ],
      },
      { id: "main", label: "main.tsx" },
    ],
  },
  { id: "config", label: "config.json" },
];

export function TreeUncontrolledDemo() {
  return (
    <Tree
      nodes={uncontrolledNodes}
      defaultExpandedIds={["app"]}
      defaultSelectedId="main"
    />
  );
}
