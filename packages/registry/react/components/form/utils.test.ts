import { describe, it, expect } from "vitest";
import { getByPath, setByPath, unflatten, flatten, scopedPath } from "./utils";

describe("getByPath", () => {
  it("returns value at dot path", () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getByPath(obj, "a.b.c")).toBe(42);
  });
  it("returns undefined for missing path", () => {
    expect(getByPath({}, "a.b")).toBeUndefined();
  });
  it("returns root when path empty", () => {
    const obj = { a: 1 };
    expect(getByPath(obj, "")).toEqual(obj);
  });
});

describe("setByPath", () => {
  it("creates nested structure", () => {
    expect(setByPath({}, "a.b.c", 1)).toEqual({ a: { b: { c: 1 } } });
  });
  it("preserves siblings", () => {
    expect(setByPath({ a: { x: 1 } }, "a.b", 2)).toEqual({ a: { x: 1, b: 2 } });
  });
});

describe("unflatten / flatten", () => {
  it("roundtrips", () => {
    const flat = { "a.b.c": 1, "a.d": 2, "e": 3 };
    const nested = unflatten(flat);
    expect(nested).toEqual({ a: { b: { c: 1 }, d: 2 }, e: 3 });
    expect(flatten(nested)).toEqual(flat);
  });
});

describe("scopedPath", () => {
  it("joins non-empty parts with dot", () => {
    expect(scopedPath("a", "b")).toBe("a.b");
  });
  it("skips empty parts", () => {
    expect(scopedPath("", "b")).toBe("b");
    expect(scopedPath("a", "")).toBe("a");
  });
});
