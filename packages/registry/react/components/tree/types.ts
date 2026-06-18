import type * as React from "react";

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  children?: TreeNode[];
  icon?: React.ReactNode;
  disabled?: boolean;
}

export type TreeSize = "sm" | "md";

export interface TreeProps {
  nodes: TreeNode[];
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string | null) => void;
  renderLabel?: (node: TreeNode) => React.ReactNode;
  size?: TreeSize;
  className?: string;
}

export interface VisibleNode {
  id: string;
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
  disabled: boolean;
  setSize: number;
  posInSet: number;
}
