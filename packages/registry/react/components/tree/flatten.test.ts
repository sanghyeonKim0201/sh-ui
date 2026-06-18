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
  const v = flattenVisible(tree, new Set(["a"]));
  it("다음 포커스는 disabled 를 건너뛴다", () => {
    expect(nextFocusable(v, "a1")?.id).toBe("b");
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
    expect(findByTypeahead(v, "arc", "a")).toBeNull();
  });
});
