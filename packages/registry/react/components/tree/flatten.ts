import type { TreeNode, VisibleNode } from "./types";

function labelText(node: TreeNode): string {
  return typeof node.label === "string" ? node.label : "";
}

export function flattenVisible(nodes: TreeNode[], expanded: Set<string>): VisibleNode[] {
  const out: VisibleNode[] = [];
  const walk = (siblings: TreeNode[], level: number, parentId: string | null) => {
    siblings.forEach((node, i) => {
      const hasChildren = !!node.children && node.children.length > 0;
      const isExpanded = hasChildren && expanded.has(node.id);
      out.push({
        id: node.id,
        node,
        level,
        parentId,
        hasChildren,
        expanded: isExpanded,
        disabled: !!node.disabled,
        setSize: siblings.length,
        posInSet: i + 1,
      });
      if (isExpanded) walk(node.children!, level + 1, node.id);
    });
  };
  walk(nodes, 0, null);
  return out;
}

export function nextFocusable(visible: VisibleNode[], fromId: string): VisibleNode | null {
  const i = visible.findIndex((n) => n.id === fromId);
  if (i === -1) return null;
  for (let j = i + 1; j < visible.length; j++) {
    if (!visible[j].disabled) return visible[j];
  }
  return null;
}

export function prevFocusable(visible: VisibleNode[], fromId: string): VisibleNode | null {
  const i = visible.findIndex((n) => n.id === fromId);
  if (i === -1) return null;
  for (let j = i - 1; j >= 0; j--) {
    if (!visible[j].disabled) return visible[j];
  }
  return null;
}

export function findByTypeahead(
  visible: VisibleNode[],
  prefix: string,
  fromId: string,
): VisibleNode | null {
  const p = prefix.toLowerCase();
  if (!p) return null;
  const start = visible.findIndex((n) => n.id === fromId);
  const n = visible.length;
  for (let k = 1; k <= n; k++) {
    const cand = visible[(start + k) % n];
    if (cand.disabled) continue;
    if (labelText(cand.node).toLowerCase().startsWith(p)) return cand;
  }
  return null;
}
