import type { TreeNode, VisibleNode } from "./types";

/**
 * 노드 label 을 typeahead 비교용 문자열로 변환한다.
 * label 이 string 이면 그 값을, JSX 등 비문자열 ReactNode 면 "" 를 반환한다
 * (비문자열 라벨 노드는 typeahead 검색 대상에서 제외됨).
 */
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
