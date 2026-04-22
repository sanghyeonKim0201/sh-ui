import { describe, it, expect } from "vitest";
import { runFieldValidate, runSchema, readHTML5Validity } from "./validation";

describe("runFieldValidate", () => {
  it("returns undefined on pass", async () => {
    const r = await runFieldValidate((v) => (v ? undefined : "required"), "ok", {});
    expect(r).toBeUndefined();
  });

  it("returns error on fail", async () => {
    const r = await runFieldValidate((v) => (v ? undefined : "required"), "", {});
    expect(r).toEqual({ message: "required", source: "validate", type: "custom" });
  });

  it("supports object form", async () => {
    const r = await runFieldValidate({ fn: (v) => (v === "x" ? undefined : "bad"), debounce: 100 }, "x", {});
    expect(r).toBeUndefined();
  });

  it("supports async fn", async () => {
    const r = await runFieldValidate(async (v) => (v === "ok" ? undefined : "no"), "ok", {});
    expect(r).toBeUndefined();
  });
});

describe("runSchema", () => {
  it("maps Standard Schema issues to path-keyed errors", async () => {
    const schema = {
      "~standard": {
        version: 1 as const,
        vendor: "test",
        validate: (v: any) => ({
          issues: [{ path: ["profile", "name"], message: "required" }],
        }),
      },
    };
    const errors = await runSchema(schema, { profile: { name: "" } }, "schema");
    expect(errors["profile.name"]).toEqual({ message: "required", source: "schema" });
  });

  it("returns empty object when schema passes", async () => {
    const schema = {
      "~standard": {
        version: 1 as const,
        vendor: "test",
        validate: (v: any) => ({ value: v }),
      },
    };
    const errors = await runSchema(schema, { x: 1 }, "schema");
    expect(errors).toEqual({});
  });
});

describe("readHTML5Validity", () => {
  it("returns undefined for empty validity", () => {
    const el = document.createElement("input");
    expect(readHTML5Validity(el)).toBeUndefined();
  });

  it("returns first ValidityState flag as type", () => {
    const el = document.createElement("input");
    el.required = true;
    const err = readHTML5Validity(el);
    expect(err?.source).toBe("html5");
    expect(err?.type).toBe("valueMissing");
  });
});
