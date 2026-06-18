# Tree 컴포넌트 (Phase 1 코어) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sh-ui 에 데이터 주도 Tree 컴포넌트의 Phase 1 코어(확장/축소·단일 선택·키보드 네비·a11y)를 React + Flutter 로 추가한다.

**Architecture:** "가시 노드 평탄화(flatten)" 순수 함수로 키보드 네비를 계산하고, 재귀 렌더 컴포넌트는 표시만 담당한다. 상태(expanded/selected)는 제어/비제어 둘 다 지원해 headless 를 유지한다. React 는 자체 `div`+ARIA 구현, Flutter 는 StatefulWidget + ShUiTheme 토큰.

**Tech Stack:** React(TSX, `@SH_UI_UTILS@`/`cn`), vitest + @testing-library/react, Flutter(Dart, StatefulWidget), CSS 변수 토큰.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/tree-component`). React 테스트는 `packages/registry/react` 에서 `pnpm vitest run`.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `packages/registry/react/components/tree/types.ts` | `TreeNode`·`TreeProps`·`VisibleNode` 타입 |
| `packages/registry/react/components/tree/flatten.ts` | 가시 노드 평탄화 + 키보드 네비 순수 함수 |
| `packages/registry/react/components/tree/flatten.test.ts` | flatten/네비 단위 테스트 |
| `packages/registry/react/components/tree/index.tsx` | plain 변종 — 재귀 렌더 + 상태 + a11y + 키보드 |
| `packages/registry/react/components/tree/styles.css` | plain 스타일 (토큰 변수) |
| `packages/registry/react/components/tree/index.tailwind.tsx` | Tailwind 변종 |
| `packages/registry/react/components/tree/index.module.tsx` | CSS Modules 변종 |
| `packages/registry/react/components/tree/styles.module.css` | CSS Modules 스타일 |
| `packages/registry/react/components/tree/tree.test.tsx` | 컴포넌트 동작 테스트 |
| `packages/registry/react/registry.json` | `tree` 엔트리 추가 |
| `apps/docs/components/ui/tree/{index.tsx,styles.css}` | docs 복사본(plain, 로컬 `cx`) |
| `apps/docs/app/[locale]/(docs)/components/tree/{page.tsx,tree-live-demo.tsx,_demos/basic.tsx}` | docs 페이지 |
| `apps/docs/components/app-sidebar.tsx` | 사이드바 등록 |
| `apps/docs/app/[locale]/(docs)/components/page.tsx` | 인덱스 그리드 등록 |
| `packages/registry/flutter/widgets/sh_ui_tree.dart` | Flutter 위젯 |
| `apps/showcase/lib/widgets/sh_ui_tree.dart` | Flutter 복사본 |
| `packages/registry/flutter/registry.json` | `tree` 엔트리 |
| `packages/changelog/versions.json` | 릴리즈 엔트리 |

---

## Task 1: 타입 + flatten/네비 순수 함수

**Files:**
- Create: `packages/registry/react/components/tree/types.ts`
- Create: `packages/registry/react/components/tree/flatten.ts`
- Test: `packages/registry/react/components/tree/flatten.test.ts`

- [ ] **Step 1: 타입 정의**

`packages/registry/react/components/tree/types.ts`:

```ts
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

/** flatten 이 산출하는 가시 노드 — 키보드 네비·렌더 보조용 */
export interface VisibleNode {
  id: string;
  node: TreeNode;
  level: number;        // 0-based depth
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
  disabled: boolean;
  setSize: number;      // 같은 부모 아래 형제 수 (aria-setsize)
  posInSet: number;     // 1-based 위치 (aria-posinset)
}
```

- [ ] **Step 2: 실패하는 테스트 작성**

`packages/registry/react/components/tree/flatten.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { flattenVisible, nextFocusable, prevFocusable, findByTypeahead } from "./flatten";
import type { TreeNode } from "./types";

const tree: TreeNode[] = [
  { id: "a", label: "Apple", children: [
    { id: "a1", label: "Ant" },
    { id: "a2", label: "Arc", disabled: true },
  ] },
  { id: "b", label: "Banana" },
];

describe("flattenVisible", () => {
  it("닫힌 트리는 최상위만, hasChildren 표기", () => {
    const v = flattenVisible(tree, new Set());
    expect(v.map((n) => n.id)).toEqual(["a", "b"]);
    expect(v[0].hasChildren).toBe(true);
    expect(v[0].expanded).toBe(false);
    expect(v[1].hasChildren).toBe(false);
  });

  it("부모가 펼쳐지면 자식이 가시 + level/aria 메타", () => {
    const v = flattenVisible(tree, new Set(["a"]));
    expect(v.map((n) => n.id)).toEqual(["a", "a1", "a2", "b"]);
    const a1 = v[1];
    expect(a1.level).toBe(1);
    expect(a1.parentId).toBe("a");
    expect(a1.posInSet).toBe(1);
    expect(a1.setSize).toBe(2);
  });

  it("부모가 닫혀 있으면 자식은 안 보임", () => {
    const v = flattenVisible(tree, new Set(["a2-only-irrelevant"]));
    expect(v.map((n) => n.id)).toEqual(["a", "b"]);
  });
});

describe("nextFocusable / prevFocusable", () => {
  const v = flattenVisible(tree, new Set(["a"])); // a, a1, a2(disabled), b
  it("다음 포커스는 disabled 를 건너뛴다", () => {
    expect(nextFocusable(v, "a1")?.id).toBe("b"); // a2 disabled skip
  });
  it("이전 포커스도 disabled 를 건너뛴다", () => {
    expect(prevFocusable(v, "b")?.id).toBe("a1");
  });
  it("끝에서 다음은 null", () => {
    expect(nextFocusable(v, "b")).toBeNull();
  });
  it("처음에서 이전은 null", () => {
    expect(prevFocusable(v, "a")).toBeNull();
  });
});

describe("findByTypeahead", () => {
  const v = flattenVisible(tree, new Set(["a"]));
  it("접두사로 다음 가시 노드를 찾는다 (대소문자 무시)", () => {
    expect(findByTypeahead(v, "ban", "a")?.id).toBe("b");
  });
  it("매치 없으면 null", () => {
    expect(findByTypeahead(v, "zz", "a")).toBeNull();
  });
  it("disabled 는 typeahead 대상에서 제외", () => {
    // 'arc'(a2) 는 disabled → 제외
    expect(findByTypeahead(v, "arc", "a")).toBeNull();
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm vitest run components/tree/flatten.test.ts`
Expected: FAIL — `Cannot find module './flatten'`

- [ ] **Step 4: flatten.ts 구현**

`packages/registry/react/components/tree/flatten.ts`:

```ts
import type { TreeNode, VisibleNode } from "./types";

/** label 이 문자열일 때만 typeahead 비교에 쓴다. */
function labelText(node: TreeNode): string {
  return typeof node.label === "string" ? node.label : "";
}

/**
 * 현재 펼쳐진 상태(expandedIds) 기준으로 화면에 보이는 노드를 1차원 배열로 평탄화한다.
 * 부모가 모두 펼쳐진 노드만 포함. 키보드 네비·렌더 보조의 단일 기준.
 */
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

/** fromId 다음부터 순환하며 접두사가 맞는 첫 enabled 가시 노드를 찾는다. */
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
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm vitest run components/tree/flatten.test.ts`
Expected: PASS (전체)

- [ ] **Step 6: 커밋**

```bash
git add packages/registry/react/components/tree/types.ts packages/registry/react/components/tree/flatten.ts packages/registry/react/components/tree/flatten.test.ts
git commit -m "feat(tree): 타입 + flatten/키보드 네비 순수 함수"
```

---

## Task 2: React Tree (plain) — 렌더 + 확장/선택

**Files:**
- Create: `packages/registry/react/components/tree/index.tsx`
- Create: `packages/registry/react/components/tree/styles.css`
- Test: `packages/registry/react/components/tree/tree.test.tsx`

**참고 패턴:** accordion `index.tsx` 의 `cn`/`@SH_UI_UTILS@` import, `forwardRef`, `data-size`, BEM 클래스(`sh-ui-tree*`) 관행을 그대로 따른다. Tree 는 Base UI primitive 가 없으므로 자체 `div`+role 구현.

- [ ] **Step 1: 실패하는 테스트 작성 (렌더 + 확장/선택)**

`packages/registry/react/components/tree/tree.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Tree } from "./index";
import type { TreeNode } from "./types";

const nodes: TreeNode[] = [
  { id: "a", label: "Apple", children: [{ id: "a1", label: "Ant" }] },
  { id: "b", label: "Banana" },
];

describe("Tree 렌더 + 상태", () => {
  it("role=tree 와 최상위 treeitem 을 렌더", () => {
    render(<Tree nodes={nodes} />);
    expect(screen.getByRole("tree")).toBeTruthy();
    const items = screen.getAllByRole("treeitem");
    expect(items.length).toBe(2); // 닫힌 상태: a, b
  });

  it("부모 toggle 클릭으로 비제어 확장 → 자식 노출", () => {
    render(<Tree nodes={nodes} />);
    fireEvent.click(screen.getByText("Apple"));
    expect(screen.getByText("Ant")).toBeTruthy();
    expect(screen.getByRole("treeitem", { name: /Apple/ }).getAttribute("aria-expanded")).toBe("true");
  });

  it("제어 selectedId 가 aria-selected 로 반영", () => {
    render(<Tree nodes={nodes} selectedId="b" />);
    expect(screen.getByRole("treeitem", { name: /Banana/ }).getAttribute("aria-selected")).toBe("true");
  });

  it("노드 클릭이 onSelect 를 호출", () => {
    const onSelect = vi.fn();
    render(<Tree nodes={nodes} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Banana"));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("aria-level 이 깊이를 반영", () => {
    render(<Tree nodes={nodes} defaultExpandedIds={["a"]} />);
    expect(screen.getByRole("treeitem", { name: /Ant/ }).getAttribute("aria-level")).toBe("2");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm vitest run components/tree/tree.test.tsx`
Expected: FAIL — `Cannot find module './index'` (또는 Tree export 없음)

- [ ] **Step 3: index.tsx 구현 (plain)**

`packages/registry/react/components/tree/index.tsx`:

```tsx
import * as React from "react";
import "./styles.css";
import { cn } from "@SH_UI_UTILS@";
import type { TreeNode, TreeProps } from "./types";
import { flattenVisible } from "./flatten";

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
  const [expanded, setExpanded] = useControllableSet(expandedIds, defaultExpandedIds, onExpandedChange);

  const isSelectedControlled = selectedId !== undefined;
  const [selInternal, setSelInternal] = React.useState<string | null>(defaultSelectedId ?? null);
  const selected = isSelectedControlled ? selectedId! : selInternal;
  const selectNode = (id: string | null) => {
    if (!isSelectedControlled) setSelInternal(id);
    onSelect?.(id);
  };

  const visible = flattenVisible(nodes, expanded);
  const [focusId, setFocusId] = React.useState<string | null>(visible[0]?.id ?? null);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  // 키보드 핸들러는 Task 3 에서 추가한다. 여기서는 렌더 + 클릭만.
  const onItemClick = (n: TreeNode, hasChildren: boolean) => {
    if (n.disabled) return;
    setFocusId(n.id);
    if (hasChildren) toggle(n.id);
    selectNode(n.id);
  };

  const renderNodes = (siblings: TreeNode[], level: number): React.ReactNode => (
    <div role={level === 0 ? undefined : "group"} className="sh-ui-tree__group">
      {siblings.map((n) => {
        const hasChildren = !!n.children?.length;
        const isExpanded = hasChildren && expanded.has(n.id);
        const meta = visible.find((v) => v.id === n.id);
        return (
          <div key={n.id} className="sh-ui-tree__node">
            <div
              role="treeitem"
              aria-level={(meta?.level ?? level) + 1}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-selected={selected === n.id}
              aria-disabled={n.disabled || undefined}
              aria-label={typeof n.label === "string" ? n.label : undefined}
              tabIndex={focusId === n.id ? 0 : -1}
              data-disabled={n.disabled || undefined}
              className={cn("sh-ui-tree__item", selected === n.id && "sh-ui-tree__item--selected")}
              onClick={() => onItemClick(n, hasChildren)}
            >
              <span className="sh-ui-tree__indent" style={{ width: `calc(var(--space-4) * ${meta?.level ?? level})` }} aria-hidden />
              {hasChildren ? (
                <span className="sh-ui-tree__chevron" data-expanded={isExpanded || undefined} aria-hidden>
                  ▸
                </span>
              ) : (
                <span className="sh-ui-tree__chevron sh-ui-tree__chevron--leaf" aria-hidden />
              )}
              {n.icon ? <span className="sh-ui-tree__icon" aria-hidden>{n.icon}</span> : null}
              <span className="sh-ui-tree__label">{renderLabel ? renderLabel(n) : n.label}</span>
            </div>
            {isExpanded ? renderNodes(n.children!, level + 1) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={ref}
      role="tree"
      data-size={size}
      className={cn("sh-ui-tree", className)}
    >
      {renderNodes(nodes, 0)}
    </div>
  );
});
```

> 참고: `▸` 텍스트 chevron 은 CSS 회전으로 펼침 표시(다음 스텝 styles.css). 아이콘 컴포넌트를 쓰는 다른 sh-ui 컴포넌트가 있으면 그 관행을 따라도 되지만, 의존성을 늘리지 않기 위해 코어는 텍스트 글리프 + CSS 회전을 쓴다.

- [ ] **Step 4: styles.css 작성 (토큰 변수만)**

`packages/registry/react/components/tree/styles.css`:

```css
.sh-ui-tree {
  display: flex;
  flex-direction: column;
  width: 100%;
  color: var(--foreground);
  font-size: 0.9375rem;
}
.sh-ui-tree[data-size="sm"] { font-size: var(--text-xs); }

.sh-ui-tree__group { display: flex; flex-direction: column; }

.sh-ui-tree__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-2);
  border-radius: calc(var(--radius) - 2px);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--duration-fast) var(--ease-standard);
}
.sh-ui-tree__item:not([data-disabled]):hover { background: var(--background-muted); }
.sh-ui-tree__item:focus-visible {
  outline: var(--border-width-strong) solid var(--ring);
  outline-offset: -2px;
}
.sh-ui-tree__item--selected { background: var(--background-muted); font-weight: var(--weight-medium); }
.sh-ui-tree__item[data-disabled] { color: var(--foreground-muted); cursor: not-allowed; }

.sh-ui-tree__chevron {
  display: inline-flex;
  width: var(--space-4);
  justify-content: center;
  transition: transform var(--duration-fast) var(--ease-standard);
}
.sh-ui-tree__chevron[data-expanded] { transform: rotate(90deg); }
.sh-ui-tree__chevron--leaf { visibility: hidden; }

.sh-ui-tree__icon { display: inline-flex; }
.sh-ui-tree__label { min-width: 0; overflow-wrap: anywhere; }

@media (prefers-reduced-motion: reduce) {
  .sh-ui-tree__item, .sh-ui-tree__chevron { transition: none; }
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm vitest run components/tree/tree.test.tsx`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add packages/registry/react/components/tree/index.tsx packages/registry/react/components/tree/styles.css packages/registry/react/components/tree/tree.test.tsx
git commit -m "feat(tree): plain 렌더 + 확장/선택 + a11y roles"
```

---

## Task 3: React 키보드 네비게이션

**Files:**
- Modify: `packages/registry/react/components/tree/index.tsx`
- Test: `packages/registry/react/components/tree/tree.test.tsx` (케이스 추가)

- [ ] **Step 1: 실패하는 테스트 추가**

`tree.test.tsx` 에 추가:

```tsx
import { fireEvent as fe } from "@testing-library/react";

describe("Tree 키보드", () => {
  function setup() {
    render(<Tree nodes={nodes} defaultExpandedIds={["a"]} defaultSelectedId="a" />);
    return screen.getByRole("tree");
  }

  it("ArrowDown 이 다음 가시 노드로 포커스 이동", () => {
    const tree = setup();
    const a = screen.getByRole("treeitem", { name: /Apple/ });
    a.focus();
    fe.keyDown(a, { key: "ArrowDown" });
    expect(screen.getByRole("treeitem", { name: /Ant/ }).getAttribute("tabindex")).toBe("0");
  });

  it("ArrowLeft 가 열린 부모를 축소", () => {
    setup();
    const a = screen.getByRole("treeitem", { name: /Apple/ });
    a.focus();
    fe.keyDown(a, { key: "ArrowLeft" });
    expect(a.getAttribute("aria-expanded")).toBe("false");
  });

  it("ArrowRight 가 닫힌 부모를 확장", () => {
    render(<Tree nodes={nodes} />);
    const a = screen.getByRole("treeitem", { name: /Apple/ });
    a.focus();
    fe.keyDown(a, { key: "ArrowRight" });
    expect(a.getAttribute("aria-expanded")).toBe("true");
  });

  it("Enter 가 포커스 노드를 선택", () => {
    const onSelect = vi.fn();
    render(<Tree nodes={nodes} onSelect={onSelect} />);
    const b = screen.getByRole("treeitem", { name: /Banana/ });
    b.focus();
    fe.keyDown(b, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("b");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm vitest run components/tree/tree.test.tsx`
Expected: FAIL — 키보드 핸들러 없음(포커스/aria 변화 안 일어남)

- [ ] **Step 3: 키보드 핸들러 구현**

`index.tsx` 에 `nextFocusable, prevFocusable, findByTypeahead` 를 import 에 추가:

```tsx
import { flattenVisible, nextFocusable, prevFocusable, findByTypeahead } from "./flatten";
```

`treeitem` div 에 `onKeyDown` 추가하고, 컴포넌트 본문에 핸들러를 정의한다. focus 이동은 DOM 의 `tabIndex`+`focus()` 로 처리하기 위해 컨테이너에 ref 맵을 둔다:

```tsx
// Tree 본문 상단(useState 들 아래)에 추가:
const itemRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
const focusNode = (id: string) => {
  setFocusId(id);
  itemRefs.current.get(id)?.focus();
};

const onItemKeyDown = (e: React.KeyboardEvent, n: TreeNode, hasChildren: boolean) => {
  const vis = flattenVisible(nodes, expanded);
  switch (e.key) {
    case "ArrowDown": {
      e.preventDefault();
      const nx = nextFocusable(vis, n.id);
      if (nx) focusNode(nx.id);
      break;
    }
    case "ArrowUp": {
      e.preventDefault();
      const pv = prevFocusable(vis, n.id);
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
        const meta = vis.find((v) => v.id === n.id);
        if (meta?.parentId) focusNode(meta.parentId);
      }
      break;
    }
    case "Home": {
      e.preventDefault();
      const first = vis.find((v) => !v.disabled);
      if (first) focusNode(first.id);
      break;
    }
    case "End": {
      e.preventDefault();
      for (let i = vis.length - 1; i >= 0; i--) if (!vis[i].disabled) { focusNode(vis[i].id); break; }
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
        const hit = findByTypeahead(vis, e.key, n.id);
        if (hit) focusNode(hit.id);
      }
    }
  }
};
```

`treeitem` div 에 ref 콜백과 onKeyDown 을 연결:

```tsx
<div
  role="treeitem"
  ref={(el) => { if (el) itemRefs.current.set(n.id, el); else itemRefs.current.delete(n.id); }}
  // ... 기존 속성들 ...
  onKeyDown={(e) => onItemKeyDown(e, n, hasChildren)}
>
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm vitest run components/tree/tree.test.tsx`
Expected: PASS (렌더 + 키보드 전체)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/tree/index.tsx packages/registry/react/components/tree/tree.test.tsx
git commit -m "feat(tree): 키보드 네비(화살표·Home/End·Enter·typeahead)"
```

---

## Task 4: Tailwind + CSS Modules 변종

**Files:**
- Create: `packages/registry/react/components/tree/index.tailwind.tsx`
- Create: `packages/registry/react/components/tree/index.module.tsx`
- Create: `packages/registry/react/components/tree/styles.module.css`

**참고:** accordion 의 `index.tailwind.tsx`(utility 클래스 + `var(--*)` 임베드)와 `index.module.tsx`(`styles` import + `styles.xxx`) 패턴을 그대로 따른다. 로직(상태·키보드·flatten 사용)은 Task 2-3 의 `index.tsx` 와 **동일**하게 복제하고, 차이는 className 표현 방식뿐이다.

- [ ] **Step 1: index.module.tsx 작성**

Task 2-3 의 `index.tsx` 를 복사하되:
- `import "./styles.css";` → `import styles from "./styles.module.css";`
- 모든 BEM 문자열 클래스(`"sh-ui-tree"`, `"sh-ui-tree__item"` 등)를 `styles.tree`, `styles.tree__item` 형태로 치환. 하이픈/수식자 클래스는 `styles["tree__item--selected"]` 형태.

- [ ] **Step 2: styles.module.css 작성**

Task 2 의 `styles.css` 내용을 복사하되, 셀렉터의 `.sh-ui-tree` → `.tree`, `.sh-ui-tree__item` → `.tree__item` 등으로 치환(CSS Modules 네임스페이스). 토큰 변수(`var(--*)`)는 그대로.

- [ ] **Step 3: index.tailwind.tsx 작성**

Task 2-3 의 `index.tsx` 로직을 복사하되, className 을 Tailwind utility 로 치환. accordion `index.tailwind.tsx` 의 패턴을 따라 `var(--*)` 를 `[...]` 임의값으로 임베드. 핵심 매핑:
- 아이템: `flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-2)] rounded-[calc(var(--radius)-2px)] cursor-pointer select-none transition-[background-color] duration-[var(--duration-fast)] hover:not-data-[disabled]:bg-background-muted focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-[-2px] data-[disabled]:text-foreground-muted data-[disabled]:cursor-not-allowed motion-reduce:transition-none`
- 선택 상태: 조건부 `bg-background-muted font-medium`
- chevron: `inline-flex w-[var(--space-4)] justify-center transition-transform data-[expanded]:rotate-90`

- [ ] **Step 4: 빌드 타입 체크**

Run: `cd packages/registry/react && pnpm tsc --noEmit`
Expected: 타입 에러 없음 (세 변종 모두 동일 props/타입 사용)

> 변종 파일은 dest 가 동일(`{components}/tree/index.tsx`)하라 한 프로젝트엔 하나만 설치되므로, 변종 간 동작 동일성은 코드리뷰로 보장한다. plain 변종이 테스트로 검증됨.

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/tree/index.tailwind.tsx packages/registry/react/components/tree/index.module.tsx packages/registry/react/components/tree/styles.module.css
git commit -m "feat(tree): tailwind·css-modules 변종"
```

---

## Task 5: registry.json 엔트리 + docs 복사본

**Files:**
- Modify: `packages/registry/react/registry.json`
- Create: `apps/docs/components/ui/tree/index.tsx`
- Create: `apps/docs/components/ui/tree/styles.css`

- [ ] **Step 1: registry.json 에 tree 엔트리 추가**

`packages/registry/react/registry.json` 의 `components` 객체에 추가(accordion 엔트리와 동일 구조; `types.ts`·`flatten.ts` 도 plain 의 동반 파일로 포함):

```json
"tree": {
  "name": "tree",
  "type": "component",
  "files": [
    { "src": "components/tree/index.tsx", "dest": "{components}/tree/index.tsx", "frameworks": ["plain"] },
    { "src": "components/tree/types.ts", "dest": "{components}/tree/types.ts", "frameworks": ["plain", "tailwind", "css-modules"] },
    { "src": "components/tree/flatten.ts", "dest": "{components}/tree/flatten.ts", "frameworks": ["plain", "tailwind", "css-modules"] },
    { "src": "components/tree/styles.css", "dest": "{components}/tree/styles.css", "frameworks": ["plain"] },
    { "src": "components/tree/index.tailwind.tsx", "dest": "{components}/tree/index.tsx", "frameworks": ["tailwind"] },
    { "src": "components/tree/index.module.tsx", "dest": "{components}/tree/index.tsx", "frameworks": ["css-modules"] },
    { "src": "components/tree/styles.module.css", "dest": "{components}/tree/styles.module.css", "frameworks": ["css-modules"] }
  ],
  "dependencies": [],
  "registryDependencies": ["utils"]
}
```

> `types.ts`/`flatten.ts` 는 모든 변종에 공통이라 frameworks 3개 모두 지정. Base UI 의존 없음(자체 구현)이라 `dependencies: []`, `cn` 때문에 `registryDependencies: ["utils"]`.

- [ ] **Step 2: registry.json 유효성 확인**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/registry/react/registry.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 3: docs 복사본 작성**

`apps/docs/components/ui/tree/index.tsx` — Task 2-3 의 plain `index.tsx` 를 복사하되, accordion docs 복사본 관행대로 `import { cn } from "@SH_UI_UTILS@"` 를 로컬 `cx` 로 교체:

```tsx
function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
```

그리고 모든 `cn(...)` 호출을 `cx(...)` 로, `import type { ... } from "./types"` 와 `from "./flatten"` 는 동일 경로로 유지(같은 폴더에 types.ts/flatten.ts 도 복사). 즉 `apps/docs/components/ui/tree/` 에 `index.tsx`, `styles.css`, `types.ts`, `flatten.ts` 4개를 둔다.

`apps/docs/components/ui/tree/styles.css` — Task 2 의 `styles.css` 동일 복사.

- [ ] **Step 4: docs 타입 체크**

Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | head -20`
Expected: tree 관련 타입 에러 없음 (기존 무관 에러가 있으면 무시하되 tree 신규 에러는 없어야)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/registry.json apps/docs/components/ui/tree/
git commit -m "feat(tree): registry 엔트리 + docs 복사본"
```

---

## Task 6: docs 페이지 + 네비 등록

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/tree/page.tsx`
- Create: `apps/docs/app/[locale]/(docs)/components/tree/tree-live-demo.tsx`
- Create: `apps/docs/app/[locale]/(docs)/components/tree/_demos/basic.tsx`
- Modify: `apps/docs/components/app-sidebar.tsx`
- Modify: `apps/docs/app/[locale]/(docs)/components/page.tsx`

**참고:** accordion 의 `page.tsx`/`accordion-live-demo.tsx`/`_demos/basic.tsx` 구조를 그대로 따른다(`export const dynamic = "force-static"`, `loadComponentSources("tree")`, `<CodeTabs>` React/Flutter 탭, `<PropsTable>`/`<SubComponents>`).

- [ ] **Step 1: `_demos/basic.tsx` — 데모 컴포넌트**

```tsx
"use client";
import * as React from "react";
import { Tree } from "@/components/ui/tree";
import type { TreeNode } from "@/components/ui/tree/types";

const nodes: TreeNode[] = [
  { id: "src", label: "src", children: [
    { id: "comp", label: "components", children: [
      { id: "btn", label: "button.tsx" },
      { id: "tree", label: "tree.tsx" },
    ] },
    { id: "idx", label: "index.ts" },
  ] },
  { id: "pkg", label: "package.json" },
];

export function TreeBasicDemo() {
  const [selected, setSelected] = React.useState<string | null>("btn");
  return <Tree nodes={nodes} defaultExpandedIds={["src", "comp"]} selectedId={selected} onSelect={setSelected} />;
}
```

- [ ] **Step 2: `tree-live-demo.tsx`**

accordion-live-demo.tsx 패턴 그대로, `componentName="tree"`, `demoCode` 는 위 basic 데모와 동일한 사용 예 문자열, `editorHeight={460}`.

- [ ] **Step 3: `page.tsx`**

accordion `page.tsx` 구조를 따라 작성: 헤더(h1 "Tree" + 한 줄 설명) → `<TreeLiveDemo {...loadComponentSources("tree")} />` → Installation(`npx sh-ui-cli add tree`, React/Flutter 탭) → Usage(import + 기본 코드) → Examples(기본 트리, 비제어 확장, disabled 노드) → `<PropsTable>`(nodes, expandedIds/defaultExpandedIds/onExpandedChange, selectedId/defaultSelectedId/onSelect, renderLabel, size). Flutter 탭 코드는 Task 7 의 `ShUiTree` API 와 일치시킨다.

PropsTable 행 예시(정확한 타입 명시):

```tsx
<PropsTable rows={[
  { prop: "nodes", type: "TreeNode[]", default: "—", description: "트리 노드 배열(재귀 children)." },
  { prop: "expandedIds", type: "string[]", default: "—", description: "펼친 노드 id (제어)." },
  { prop: "defaultExpandedIds", type: "string[]", default: "[]", description: "초기 펼침 (비제어)." },
  { prop: "onExpandedChange", type: "(ids: string[]) => void", default: "—", description: "펼침 변경 콜백." },
  { prop: "selectedId", type: "string | null", default: "—", description: "선택 노드 id (제어)." },
  { prop: "defaultSelectedId", type: "string | null", default: "null", description: "초기 선택 (비제어)." },
  { prop: "onSelect", type: "(id: string | null) => void", default: "—", description: "선택 변경 콜백." },
  { prop: "renderLabel", type: "(node: TreeNode) => ReactNode", default: "—", description: "라벨 커스텀 렌더." },
  { prop: "size", type: `"sm" | "md"`, default: `"md"`, description: "밀도." },
]} />
```

- [ ] **Step 4: 사이드바 등록**

`apps/docs/components/app-sidebar.tsx` 의 `components` 배열에 알파벳 위치(Toggle/Tooltip 부근)에 추가:

```tsx
{ title: "Tree", href: "/components/tree" },
```

- [ ] **Step 5: 인덱스 그리드 등록**

`apps/docs/app/[locale]/(docs)/components/page.tsx` 의 "Layout & Navigation" 그룹 `items` 에 추가:

```tsx
{ name: "Tree", slug: "tree", description: "계층 데이터 — 확장·선택·키보드 네비." },
```

- [ ] **Step 6: docs 빌드 확인 (페이지 렌더 + 검색 인덱스 자동 수집)**

Run: `cd apps/docs && pnpm build 2>&1 | tail -20`
Expected: 빌드 성공, `/components/tree` 정적 생성. (검색 인덱스는 빌드 시 자동 수집)

- [ ] **Step 7: 커밋**

```bash
git add apps/docs/app apps/docs/components/app-sidebar.tsx
git commit -m "feat(tree): docs 페이지 + 사이드바/인덱스 등록"
```

---

## Task 7: Flutter 위젯

**Files:**
- Create: `packages/registry/flutter/widgets/sh_ui_tree.dart`
- Create: `apps/showcase/lib/widgets/sh_ui_tree.dart`
- Modify: `packages/registry/flutter/registry.json`

**참고:** `packages/registry/flutter/widgets/sh_ui_accordion.dart` 패턴 — 모델 클래스, `StatefulWidget` 루트, `_State` 의 `Set<String>` 확장 추적, `Theme.of(context).extension<ShUiTheme>()` 토큰, `Semantics`, `AnimatedRotation`(chevron). React 와 기능 패리티: 확장/단일 선택/키보드(데스크톱)·탭(모바일)/a11y.

- [ ] **Step 1: 위젯 작성**

`packages/registry/flutter/widgets/sh_ui_tree.dart` — 다음 공개 API 를 구현:

```dart
class ShUiTreeNode {
  final String id;
  final String label;
  final List<ShUiTreeNode>? children;
  final IconData? icon;
  final bool disabled;
  const ShUiTreeNode({required this.id, required this.label, this.children, this.icon, this.disabled = false});
}

enum ShUiTreeSize { sm, md }

class ShUiTree extends StatefulWidget {
  final List<ShUiTreeNode> nodes;
  final Set<String>? expandedIds;          // 제어
  final Set<String>? defaultExpandedIds;   // 비제어 초기값
  final ValueChanged<Set<String>>? onExpandedChange;
  final String? selectedId;                // 제어
  final String? defaultSelectedId;
  final ValueChanged<String?>? onSelect;
  final ShUiTreeSize size;
  const ShUiTree({super.key, required this.nodes, this.expandedIds, this.defaultExpandedIds, this.onExpandedChange, this.selectedId, this.defaultSelectedId, this.onSelect, this.size = ShUiTreeSize.md});
  @override State<ShUiTree> createState() => _ShUiTreeState();
}
```

구현 요점(accordion 의 상태/토큰/애니메이션 패턴 적용):
- `_ShUiTreeState` 에서 `Set<String> _expanded` 와 `String? _selected` 를 제어/비제어로 관리(widget.expandedIds != null 이면 제어).
- 재귀 빌더로 노드를 들여쓰기(`shUi.spacing.s4 * level`)와 함께 그린다.
- 행: `Semantics(selected:, expanded:, label:, child: ...)` + `InkWell`/`GestureDetector` onTap → 부모면 toggle, 선택 콜백.
- chevron: `AnimatedRotation`(turns: expanded ? 0.25 : 0) + `Icon(Icons.chevron_right)`.
- 토큰: `shUi.colors.foreground/backgroundMuted/ring/border`, `shUi.spacing.*`, `shUi.radius.defaultRadius`, `shUi.duration.fast`, `shUi.opacity.disabled`, `shUi.text.sm`.
- 키보드(데스크톱/웹): `FocusableActionDetector` + `Shortcuts`/`Actions` 로 방향키/Enter 매핑. 모바일은 탭.
- disabled 노드는 onTap 무시 + `shUi.opacity.disabled` 적용.

- [ ] **Step 2: registry.json 엔트리**

`packages/registry/flutter/registry.json` 에 추가:

```json
"tree": {
  "name": "tree",
  "type": "widget",
  "files": [
    { "src": "widgets/sh_ui_tree.dart", "dest": "{widgets}/sh_ui_tree.dart" }
  ],
  "dependencies": [],
  "registryDependencies": ["tokens"]
}
```

- [ ] **Step 3: showcase 복사본**

`apps/showcase/lib/widgets/sh_ui_tree.dart` — Step 1 파일과 동일 복사.

- [ ] **Step 4: widget 테스트**

`apps/showcase` 의 기존 widget test 위치/패턴을 따라(`test/` 디렉토리) `sh_ui_tree_test.dart` 작성: 확장 토글로 자식 노출, 선택 onSelect 호출, `Semantics` selected/expanded 플래그 검증.

Run: `cd apps/showcase && flutter test test/sh_ui_tree_test.dart`
Expected: PASS

> Flutter 툴체인이 없으면 BLOCKED 로 보고(환경 문제). 위젯 코드와 registry 엔트리는 완성하되 테스트 실행 불가를 명시.

- [ ] **Step 5: registry.json 유효성 + 커밋**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/registry/flutter/registry.json','utf8')); console.log('OK')"`
Expected: `OK`

```bash
git add packages/registry/flutter/widgets/sh_ui_tree.dart apps/showcase/lib/widgets/sh_ui_tree.dart packages/registry/flutter/registry.json apps/showcase/test/sh_ui_tree_test.dart
git commit -m "feat(tree): Flutter ShUiTree 위젯 + showcase + registry"
```

---

## Task 8: 릴리즈 반영

**Files:**
- Modify: `packages/changelog/versions.json`

- [ ] **Step 1: 현재 최신 버전 확인**

Run: `node -e "const v=require('./packages/changelog/versions.json'); console.log(v.versions[0].version)"`
Expected: 최신 버전 출력. 새 버전은 MINOR 증가(예: 최신이 `0.116.0` 이면 `0.117.0`).

- [ ] **Step 2: versions.json 엔트리 prepend**

`versions` 배열 맨 앞에 추가(버전은 Step 1 기준 MINOR, 날짜 2026-06-18):

```json
{
  "version": "0.117.0",
  "date": "2026-06-18",
  "title": "Tree 컴포넌트 — 계층 데이터 확장·선택·키보드 네비",
  "type": "minor",
  "highlights": [
    "신규 Tree — 데이터 주도(nodes 배열) 계층 트리. 확장/축소 + 단일 선택(제어·비제어)",
    "WAI-ARIA Tree 패턴 — role=tree/treeitem/group, 화살표·Home/End·Enter·typeahead 키보드 네비",
    "React(plain·tailwind·css-modules) + Flutter(ShUiTree) 동시 제공. 풀 기능(다중선택·DnD·lazy·인라인편집)은 후속"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.117.0"
}
```

- [ ] **Step 3: 검증**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/changelog/versions.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: 커밋**

```bash
git add packages/changelog/versions.json
git commit -m "feat(tree): Tree Phase 1 코어 릴리즈 (v0.117.0)"
```

---

## 릴리즈 절차 (구현 완료 후, 사용자 확인 하에)

레포 정책(`CLAUDE.md`): dev 작업 → live PR → **태그는 live 에서**(npm publish 트리거).
1. dev push → `gh pr create --base live`.
2. CI 그린 → 머지 → live 에서 `v0.117.0` 태그 → publish.yml/release.yml 발동.
3. 머지·태그·publish 는 outward-facing — 각 단계 사용자 확인.

## 자기 점검 메모

- `flattenVisible`/`nextFocusable`/`prevFocusable`/`findByTypeahead` 시그니처는 Task 1 에서 고정, Task 2-3 에서 동일 사용.
- 세 CSS 변종은 동일 로직/타입(`TreeProps`)을 공유 — plain 만 테스트로 검증하고 변종은 className 표현만 다름(코드리뷰 보장).
- React/Flutter `Tree`/`ShUiTree` API 는 prop 이름이 대응(nodes/expandedIds/selectedId/onSelect/size) — docs Flutter 탭과 일치.
- 후속 phase(다중선택·DnD·lazy·인라인편집)는 spec 백로그에 기록, 이 plan 범위 밖.
