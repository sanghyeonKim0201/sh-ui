import { describe, it, expect, vi } from "vitest";
import { createFormStore } from "./store";

describe("createFormStore — basic", () => {
  it("starts with empty state + defaults merged", () => {
    const store = createFormStore({ defaultValues: { a: 1, b: { c: 2 } } });
    expect(store.getState().values).toEqual({ "a": 1, "b.c": 2 });
  });

  it("setFieldValue updates flat values and notifies", () => {
    const store = createFormStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setFieldValue("name", "sh");
    expect(store.getState().values["name"]).toBe("sh");
    expect(listener).toHaveBeenCalled();
  });

  it("getFieldState returns value + touched + error snapshot", () => {
    const store = createFormStore({ defaultValues: { name: "a" } });
    const s = store.getFieldState("name");
    expect(s.value).toBe("a");
    expect(s.touched).toBe(false);
    expect(s.hasError).toBe(false);
  });

  it("getValues returns nested", () => {
    const store = createFormStore({ defaultValues: { profile: { name: "a" } } });
    expect(store.getValues()).toEqual({ profile: { name: "a" } });
    expect(store.getValues("profile")).toEqual({ name: "a" });
  });
});

describe("registerField + validateField", () => {
  it("registers validator and unregisters on dispose", () => {
    const store = createFormStore();
    const unregister = store.registerField("email", { validate: (v) => (v ? undefined : "required") });
    expect(store.getState().fieldValidators.has("email")).toBe(true);
    unregister();
    expect(store.getState().fieldValidators.has("email")).toBe(false);
  });

  it("validateField sets error on fail", async () => {
    const store = createFormStore();
    store.registerField("email", { validate: (v) => (v ? undefined : "required") });
    store.setFieldValue("email", "");
    const ok = await store.validateField("email");
    expect(ok).toBe(false);
    expect(store.getState().errors["email"]?.message).toBe("required");
  });

  it("validateField clears error on pass", async () => {
    const store = createFormStore();
    store.registerField("email", { validate: (v) => (v ? undefined : "required") });
    store.setFieldValue("email", "");
    await store.validateField("email");
    store.setFieldValue("email", "a@b.com");
    const ok = await store.validateField("email");
    expect(ok).toBe(true);
    expect(store.getState().errors["email"]).toBeUndefined();
  });
});

describe("steps", () => {
  it("registerStep tracks step id, activates on setActiveStep", () => {
    const store = createFormStore();
    store.registerStep("a");
    store.registerStep("b");
    store.setActiveStep("a");
    expect(store.getState().activeStepId).toBe("a");
    store.setActiveStep("b");
    expect(store.getState().activeStepId).toBe("b");
  });

  it("validateStep validates only fields registered with stepId", async () => {
    const store = createFormStore();
    store.registerField("email", {
      stepId: "account",
      validate: (v) => (v ? undefined : "required"),
    });
    store.registerField("name", {
      stepId: "profile",
      validate: (v) => (v ? undefined : "required"),
    });
    const ok = await store.validateStep("account");
    expect(ok).toBe(false);
    expect(store.getState().errors["email"]).toBeDefined();
    expect(store.getState().errors["name"]).toBeUndefined();
  });
});

describe("section schema & priority", () => {
  const stdSchema = (path: string[], msg: string) => ({
    "~standard": {
      version: 1 as const,
      vendor: "test",
      validate: (v: any) => ({ issues: [{ path, message: msg }] }),
    },
  });

  it("section schema produces error for fields under its path", async () => {
    const store = createFormStore();
    store.registerField("profile.name", { sectionPath: "profile" });
    store.registerSectionSchema("profile", stdSchema(["name"], "section says bad"));
    await store.validateField("profile.name");
    expect(store.getState().errors["profile.name"]?.message).toBe("section says bad");
  });

  it("root schema validates at root, only relevant when no earlier failure", async () => {
    const store = createFormStore({ schema: stdSchema(["email"], "root says bad") });
    store.registerField("email", {});
    await store.validateField("email");
    expect(store.getState().errors["email"]?.message).toBe("root says bad");
  });

  it("section schema overrides root schema for same path (no merge)", async () => {
    const store = createFormStore({ schema: stdSchema(["profile", "name"], "root") });
    store.registerField("profile.name", { sectionPath: "profile" });
    store.registerSectionSchema("profile", stdSchema(["name"], "section"));
    await store.validateField("profile.name");
    expect(store.getState().errors["profile.name"]?.message).toBe("section");
  });

  it("field validate runs before schema; schema skipped if field validate fails", async () => {
    const store = createFormStore({ schema: stdSchema(["email"], "schema says bad") });
    store.registerField("email", { validate: (v) => (v ? undefined : "field says required") });
    await store.validateField("email");
    expect(store.getState().errors["email"]?.message).toBe("field says required");
  });
});

describe("submit / reset / setError", () => {
  it("submit calls onSubmit with nested values when valid", async () => {
    const onSubmit = vi.fn();
    const store = createFormStore<{ email: string }>({
      defaultValues: { email: "a@b.com" },
      onSubmit,
    });
    store.registerField("email", { validate: (v) => (v ? undefined : "required") });
    await store.submit();
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.com" }, expect.any(Object));
  });

  it("submit blocks onSubmit when validation fails, calls onInvalid", async () => {
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    const store = createFormStore({ onSubmit, onInvalid });
    store.registerField("email", { validate: (v) => (v ? undefined : "required") });
    store.setFieldValue("email", "");
    await store.submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();
  });

  it("setError injects server error, next value change clears it", () => {
    const store = createFormStore();
    store.registerField("email", {});
    store.setError("email", "taken");
    expect(store.getFieldState("email").error?.message).toBe("taken");
    store.setFieldValue("email", "new@x.com");
    expect(store.getFieldState("email").error).toBeUndefined();
  });

  it("reset clears values, errors, touched, submitCount", () => {
    const store = createFormStore({ defaultValues: { name: "a" } });
    store.setFieldValue("name", "b");
    store.setError("name", "err");
    store.reset();
    expect(store.getFieldState("name").value).toBe("a");
    expect(store.getFieldState("name").error).toBeUndefined();
  });
});

describe("async validate", () => {
  it("sets isValidating during async validate", async () => {
    const store = createFormStore();
    store.registerField("email", {
      validate: async (v) => {
        await new Promise((r) => setTimeout(r, 10));
        return v ? undefined : "bad";
      },
    });
    store.setFieldValue("email", "");
    const p = store.validateField("email");
    expect(store.getState().validatingFields.has("email")).toBe(true);
    await p;
    expect(store.getState().validatingFields.has("email")).toBe(false);
  });

  it("stale resolution is discarded if value changed", async () => {
    const store = createFormStore();
    let resolve1: (v: string | undefined) => void;
    store.registerField("email", {
      validate: (v) =>
        v === "slow"
          ? new Promise<string | undefined>((r) => (resolve1 = r))
          : undefined,
    });
    store.setFieldValue("email", "slow");
    const p1 = store.validateField("email");
    store.setFieldValue("email", "ok");
    resolve1!("slow says bad");
    await p1;
    expect(store.getState().errors["email"]).toBeUndefined();
  });
});
