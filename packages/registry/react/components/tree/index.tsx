import * as React from "react";
import "./styles.css";
import { cn } from "@SH_UI_UTILS@";
import type { TreeNode, TreeProps } from "./types";
export type { TreeNode, TreeProps, TreeSize } from "./types";
import { flattenVisible, nextFocusable, prevFocusable, findByTypeahead } from "./flatten";

function useControllableSet(
  controlled: string[] | undefined,
  defaultValue: string[] | undefined,
  onChange?: (ids: string[]) => void,
) {
  const [internal, setInternal] = React.useState<Set<string>>(
    () => new Set(controlled ?? defaultValue ?? []),
  );
  const set = controlled ? new Set(controlled) : internal;
  const update = (next: Set<string>) => {
    if (!controlled) setInternal(next);
    onChange?.([...next]);
  };
  return [set, update] as const;
}

export const Tree = React.forwardRef<HTMLDivElement, TreeProps>(function Tree(
  {
    nodes,
    expandedIds,
    defaultExpandedIds,
    onExpandedChange,
    selectedId,
    defaultSelectedId,
    onSelect,
    renderLabel,
    size = "md",
    className,
  },
  ref,
) {
  const [expanded, setExpanded] = useControllableSet(
    expandedIds,
    defaultExpandedIds,
    onExpandedChange,
  );

  const isSelectedControlled = selectedId !== undefined;
  const [selInternal, setSelInternal] = React.useState<string | null>(
    defaultSelectedId ?? null,
  );
  const selected = isSelectedControlled ? selectedId! : selInternal;
  const selectNode = (id: string | null) => {
    if (!isSelectedControlled) setSelInternal(id);
    onSelect?.(id);
  };

  const visible = flattenVisible(nodes, expanded);
  const visibleMap = React.useMemo(() => new Map(visible.map((v) => [v.id, v])), [visible]);
  const [focusId, setFocusId] = React.useState<string | null>(visible[0]?.id ?? null);

  React.useEffect(() => {
    if (focusId && !visibleMap.has(focusId)) {
      setFocusId(visible[0]?.id ?? null);
    }
  }, [visibleMap, focusId, visible]);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const onItemClick = (n: TreeNode, hasChildren: boolean) => {
    if (n.disabled) return;
    setFocusId(n.id);
    if (hasChildren) toggle(n.id);
    selectNode(n.id);
  };

  const itemRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const focusNode = (id: string) => {
    setFocusId(id);
    itemRefs.current.get(id)?.focus();
  };

  const onItemKeyDown = (e: React.KeyboardEvent, n: TreeNode, hasChildren: boolean) => {
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nx = nextFocusable(visible, n.id);
        if (nx) focusNode(nx.id);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const pv = prevFocusable(visible, n.id);
        if (pv) focusNode(pv.id);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (hasChildren && !expanded.has(n.id)) toggle(n.id);
        else if (hasChildren) {
          const first = n.children!.find((c) => !c.disabled);
          if (first) focusNode(first.id);
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (hasChildren && expanded.has(n.id)) toggle(n.id);
        else {
          const meta = visibleMap.get(n.id);
          if (meta?.parentId) focusNode(meta.parentId);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const first = visible.find((v) => !v.disabled);
        if (first) focusNode(first.id);
        break;
      }
      case "End": {
        e.preventDefault();
        for (let i = visible.length - 1; i >= 0; i--)
          if (!visible[i].disabled) {
            focusNode(visible[i].id);
            break;
          }
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (!n.disabled) selectNode(n.id);
        break;
      }
      default: {
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const hit = findByTypeahead(visible, e.key, n.id);
          if (hit) focusNode(hit.id);
        }
      }
    }
  };

  const renderNodes = (siblings: TreeNode[], level: number): React.ReactNode => (
    <div role={level === 0 ? undefined : "group"} className="sh-ui-tree__group">
      {siblings.map((n) => {
        const hasChildren = !!n.children?.length;
        const isExpanded = hasChildren && expanded.has(n.id);
        const meta = visibleMap.get(n.id);
        const depth = meta?.level ?? level;
        return (
          <div key={n.id}>
            <div
              role="treeitem"
              ref={(el) => {
                if (el) itemRefs.current.set(n.id, el);
                else itemRefs.current.delete(n.id);
              }}
              aria-level={depth + 1}
              aria-setsize={meta?.setSize}
              aria-posinset={meta?.posInSet}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-selected={selected === n.id}
              aria-disabled={n.disabled || undefined}
              aria-label={typeof n.label === "string" ? n.label : undefined}
              tabIndex={focusId === n.id ? 0 : -1}
              data-disabled={n.disabled || undefined}
              className={cn(
                "sh-ui-tree__item",
                selected === n.id && "sh-ui-tree__item--selected",
              )}
              onClick={() => onItemClick(n, hasChildren)}
              onKeyDown={(e) => onItemKeyDown(e, n, hasChildren)}
            >
              <span
                className="sh-ui-tree__indent"
                style={{ width: `calc(var(--space-4) * ${depth})` }}
                aria-hidden
              />
              {hasChildren ? (
                <span
                  className="sh-ui-tree__chevron"
                  data-expanded={isExpanded || undefined}
                  aria-hidden
                >
                  ▸
                </span>
              ) : (
                <span className="sh-ui-tree__chevron sh-ui-tree__chevron--leaf" aria-hidden />
              )}
              {n.icon ? (
                <span className="sh-ui-tree__icon" aria-hidden>
                  {n.icon}
                </span>
              ) : null}
              <span className="sh-ui-tree__label">
                {renderLabel ? renderLabel(n) : n.label}
              </span>
            </div>
            {isExpanded ? renderNodes(n.children!, level + 1) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={ref} role="tree" data-size={size} className={cn("sh-ui-tree", className)}>
      {renderNodes(nodes, 0)}
    </div>
  );
});
