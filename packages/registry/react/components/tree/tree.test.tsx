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
    expect(items.length).toBe(2);
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

  it("제어 expandedIds 는 외부 값이 우선 (클릭 무관)", () => {
    const { rerender } = render(<Tree nodes={nodes} expandedIds={["a"]} />);
    expect(screen.getByText("Ant")).toBeTruthy();
    rerender(<Tree nodes={nodes} expandedIds={[]} />);
    expect(screen.queryByText("Ant")).toBeNull();
  });

  it("disabled 노드 클릭은 onSelect 를 호출하지 않는다", () => {
    const onSelect = vi.fn();
    const dnodes = [
      { id: "x", label: "Xenon", disabled: true },
      { id: "y", label: "Yttrium" },
    ];
    render(<Tree nodes={dnodes} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Xenon"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("Tree 키보드", () => {
  function setup() {
    render(<Tree nodes={nodes} defaultExpandedIds={["a"]} defaultSelectedId="a" />);
    return screen.getByRole("tree");
  }

  it("ArrowDown 이 다음 가시 노드로 포커스 이동", () => {
    setup();
    const a = screen.getByRole("treeitem", { name: /Apple/ });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(screen.getByRole("treeitem", { name: /Ant/ }).getAttribute("tabindex")).toBe("0");
  });

  it("ArrowLeft 가 열린 부모를 축소", () => {
    setup();
    const a = screen.getByRole("treeitem", { name: /Apple/ });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(a.getAttribute("aria-expanded")).toBe("false");
  });

  it("ArrowRight 가 닫힌 부모를 확장", () => {
    render(<Tree nodes={nodes} />);
    const a = screen.getByRole("treeitem", { name: /Apple/ });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(a.getAttribute("aria-expanded")).toBe("true");
  });

  it("Enter 가 포커스 노드를 선택", () => {
    const onSelect = vi.fn();
    render(<Tree nodes={nodes} onSelect={onSelect} />);
    const b = screen.getByRole("treeitem", { name: /Banana/ });
    b.focus();
    fireEvent.keyDown(b, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("b");
  });
});
