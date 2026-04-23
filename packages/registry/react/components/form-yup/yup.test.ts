import { describe, it, expect } from "vitest";
import { yupSchema } from "./index";

const mockYupObj = {
  async validate(value: unknown, opts?: { abortEarly?: boolean }) {
    if ((value as any).email) return value;
    const err: any = new Error("validation");
    err.inner = [{ path: "email", message: "required" }];
    throw err;
  },
};

describe("yupSchema", () => {
  it("wraps yup schema into Standard Schema v1", async () => {
    const schema = yupSchema(mockYupObj);
    const r = await schema["~standard"].validate({ email: "" });
    if ("value" in r) throw new Error("should fail");
    expect(r.issues[0]).toMatchObject({ path: ["email"], message: "required" });
  });

  it("passes through on success", async () => {
    const schema = yupSchema(mockYupObj);
    const r = await schema["~standard"].validate({ email: "ok" });
    if (!("value" in r)) throw new Error("should pass");
    expect(r.value).toEqual({ email: "ok" });
  });
});
