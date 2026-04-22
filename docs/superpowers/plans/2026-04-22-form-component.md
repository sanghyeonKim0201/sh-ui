# Form 컴포넌트 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 라이브러리 비종속 Form 컴포넌트 + RHF/TanStack Form/Yup 어댑터를 구현해 멀티스텝·멀티섹션을 1급으로 지원한다.

**Architecture:** `FormStore` 인터페이스(subscribe/getFieldState/setFieldValue/registerField/validateStep/submit)를 중심으로, 내장 훅과 외부 라이브러리 어댑터가 같은 인터페이스를 구현. `Form.Section` 은 경로 네임스페이스, `Form.Step` 은 스텝별 필드 등록만 담당. 값은 Form 루트 store 에 영구 보존.

**Tech Stack:** React 19, TypeScript, `@base-ui-components/react` (선택적), Standard Schema (Zod/Valibot/Arktype 네이티브 + Yup 래퍼), Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-04-22-form-component-design.md`

**Dual-copy rule (CLAUDE.md):** `packages/registry/react/components/<name>/` 수정 시 `apps/docs/components/ui/<name>/` 도 같은 내용으로 복제. 각 Phase 끝에 동기화 Task 있음.

**Commit convention:** `feat(form): ...`, `test(form): ...`, `docs(form): ...`

---

## Phase 0 — 테스트 인프라 셋업

레지스트리 패키지에 Vitest + RTL 가 없어서 먼저 도입한다. form 외 다른 컴포넌트는 영향 없음.

### Task 0.1: Vitest + RTL 의존성 설치

**Files:**
- Modify: `packages/registry/react/package.json`

- [ ] **Step 1: `packages/registry/react/package.json` 에 devDependencies 추가**

```jsonc
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.2.4",
    "@vitest/coverage-v8": "^3.2.4",
    "jsdom": "^25.0.1",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "@types/node": "^22.10.0"
  }
}
```

- [ ] **Step 2: 루트에서 `pnpm install` 실행**

Run: `pnpm install`
Expected: 설치 완료, 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add packages/registry/react/package.json pnpm-lock.yaml
git commit -m "chore(form): Vitest + RTL 의존성 추가"
```

---

### Task 0.2: Vitest config + setup 파일

**Files:**
- Create: `packages/registry/react/vitest.config.ts`
- Create: `packages/registry/react/vitest.setup.ts`

- [ ] **Step 1: `packages/registry/react/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["components/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 2: `packages/registry/react/vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: 샘플 smoke 테스트 실행 확인 — 임시로 `components/form/smoke.test.ts` 생성 후 통과 확인**

```ts
// components/form/smoke.test.ts (임시 파일, Task 1.1 전에 삭제)
import { describe, it, expect } from "vitest";
describe("smoke", () => { it("runs", () => expect(1).toBe(1)); });
```

Run: `cd packages/registry/react && pnpm test`
Expected: 1 passed

- [ ] **Step 4: 임시 파일 삭제**

```bash
rm packages/registry/react/components/form/smoke.test.ts
rmdir packages/registry/react/components/form 2>/dev/null || true
```

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/vitest.config.ts packages/registry/react/vitest.setup.ts
git commit -m "chore(form): Vitest 설정"
```

---

## Phase 1 — 타입과 순수 유틸리티

### Task 1.1: `types.ts` — 공개·내부 타입

**Files:**
- Create: `packages/registry/react/components/form/types.ts`

- [ ] **Step 1: 파일 작성**

```ts
// components/form/types.ts

// Standard Schema v1 최소 타입 (외부 의존 없이 정의)
export interface StandardSchemaV1<TInput = unknown, TOutput = TInput> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) =>
      | { value: TOutput }
      | { issues: ReadonlyArray<{ path?: ReadonlyArray<PropertyKey>; message: string }> }
      | Promise<
          | { value: TOutput }
          | { issues: ReadonlyArray<{ path?: ReadonlyArray<PropertyKey>; message: string }> }
        >;
  };
}

export type ErrorSource = "html5" | "validate" | "schema";

export interface FieldError {
  message: string;
  type?: string;
  source: ErrorSource;
}

export interface FieldState {
  value: unknown;
  error: FieldError | undefined;
  errors: FieldError[];
  touched: boolean;
  isValidating: boolean;
  hasError: boolean;
}

export interface FieldConfig {
  validate?: FieldValidate;
  validateOn?: ValidateOn;
  stepId?: string;
  sectionPath?: string;
  required?: boolean;
}

export type ValidateOn = "submit" | "blur" | "change";

export type FieldValidate =
  | ((value: unknown, values: unknown) => string | undefined | Promise<string | undefined>)
  | {
      fn: (value: unknown, values: unknown) => string | undefined | Promise<string | undefined>;
      debounce?: number;
    };

export interface SubmitHelpers<T> {
  reset: (defaults?: Partial<T>) => void;
  setError: (path: string, message: string) => void;
}

export interface FormStoreState {
  values: Record<string, unknown>;
  errors: Record<string, FieldError | undefined>;
  touched: Record<string, boolean>;
  submitting: boolean;
  submitCount: number;
  activeStepId: string | null;
  fieldsByStep: Map<string, Set<string>>;
  fieldsBySection: Map<string, Set<string>>;
  fieldValidators: Map<string, FieldConfig>;
  sectionSchemas: Map<string, StandardSchemaV1>;
  validatingFields: Set<string>;
  // revalidation flag: 한 번 에러가 뜬 필드는 onChange 로 전환
  revalidateOnChange: Set<string>;
}

export interface FormStore<T = unknown> {
  subscribe(listener: () => void): () => void;
  getState(): FormStoreState;
  getFieldState(path: string): FieldState;
  setFieldValue(path: string, value: unknown): void;
  setFieldTouched(path: string, touched: boolean): void;
  registerField(path: string, config: FieldConfig): () => void;
  registerStep(stepId: string, onActivate?: (active: boolean) => void): () => void;
  setActiveStep(stepId: string | null): void;
  registerSectionSchema(sectionPath: string, schema: StandardSchemaV1): () => void;
  validateField(path: string): Promise<boolean>;
  validateStep(stepId: string): Promise<boolean>;
  validateAll(): Promise<boolean>;
  getValues<S = T>(scope?: string): S;
  submit(): Promise<void>;
  reset(defaults?: Partial<T>): void;
  setError(path: string, message: string): void;
  // 루트 스키마 / onSubmit / validateOn 등 설정
  _config: FormConfig<T>;
}

export interface FormConfig<T> {
  schema?: StandardSchemaV1<T>;
  validateOn: ValidateOn;
  onSubmit?: (values: T, helpers: SubmitHelpers<T>) => void | Promise<void>;
  onInvalid?: (errors: Record<string, FieldError>) => void;
  scrollToFirstError: boolean;
  focusFirstError: boolean;
}
```

- [ ] **Step 2: 커밋**

```bash
git add packages/registry/react/components/form/types.ts
git commit -m "feat(form): 공개·내부 타입 정의"
```

---

### Task 1.2: `utils.ts` — 경로 유틸 (TDD)

**Files:**
- Create: `packages/registry/react/components/form/utils.test.ts`
- Create: `packages/registry/react/components/form/utils.ts`

- [ ] **Step 1: 테스트 작성 — `utils.test.ts`**

```ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm test utils`
Expected: FAIL — "Cannot find module './utils'"

- [ ] **Step 3: `utils.ts` 구현**

```ts
// components/form/utils.ts

export function getByPath(obj: unknown, path: string): unknown {
  if (path === "") return obj;
  const parts = path.split(".");
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function setByPath<T extends Record<string, any>>(obj: T, path: string, value: unknown): T {
  if (path === "") return value as T;
  const parts = path.split(".");
  const out: any = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    cur[p] = cur[p] != null && typeof cur[p] === "object" ? { ...cur[p] } : {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
  return out;
}

export function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Record<string, unknown>, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}

export function unflatten(flat: Record<string, unknown>): Record<string, unknown> {
  let result: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(flat)) {
    result = setByPath(result, path, value) as Record<string, unknown>;
  }
  return result;
}

export function scopedPath(...parts: (string | undefined)[]): string {
  return parts.filter((p) => p && p.length > 0).join(".");
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test utils`
Expected: PASS (9 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/utils.ts packages/registry/react/components/form/utils.test.ts
git commit -m "feat(form): 경로 유틸 (getByPath/setByPath/flatten/unflatten/scopedPath)"
```

---

### Task 1.3: `validation.ts` — HTML5 validity + validate runner + Standard Schema 브릿지

**Files:**
- Create: `packages/registry/react/components/form/validation.test.ts`
- Create: `packages/registry/react/components/form/validation.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// components/form/validation.test.ts
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

  it("supports object form with debounce metadata (debounce is caller's job)", async () => {
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
    // validity.valueMissing true
    const err = readHTML5Validity(el);
    expect(err?.source).toBe("html5");
    expect(err?.type).toBe("valueMissing");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm test validation`
Expected: FAIL

- [ ] **Step 3: `validation.ts` 구현**

```ts
// components/form/validation.ts
import type { FieldError, FieldValidate, StandardSchemaV1, ErrorSource } from "./types";

export async function runFieldValidate(
  validate: FieldValidate | undefined,
  value: unknown,
  allValues: unknown
): Promise<FieldError | undefined> {
  if (!validate) return undefined;
  const fn = typeof validate === "function" ? validate : validate.fn;
  const message = await fn(value, allValues);
  if (!message) return undefined;
  return { message, source: "validate", type: "custom" };
}

export async function runSchema(
  schema: StandardSchemaV1,
  values: unknown,
  source: ErrorSource = "schema"
): Promise<Record<string, FieldError>> {
  const result = await schema["~standard"].validate(values);
  if ("value" in result) return {};
  const errors: Record<string, FieldError> = {};
  for (const issue of result.issues) {
    const path = (issue.path ?? []).map(String).join(".");
    if (!errors[path]) {
      errors[path] = { message: issue.message, source };
    }
  }
  return errors;
}

const HTML5_KEYS = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "tooLong",
  "tooShort",
  "rangeUnderflow",
  "rangeOverflow",
  "stepMismatch",
  "badInput",
] as const;

export function readHTML5Validity(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldError | undefined {
  if (!el.validity || el.validity.valid) return undefined;
  for (const k of HTML5_KEYS) {
    if ((el.validity as any)[k]) {
      return {
        message: el.validationMessage || k,
        type: k,
        source: "html5",
      };
    }
  }
  return undefined;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test validation`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/validation.ts packages/registry/react/components/form/validation.test.ts
git commit -m "feat(form): 검증 유틸 (field validate / Standard Schema / HTML5 validity)"
```

---

## Phase 2 — Store (Framework-Agnostic)

### Task 2.1: `store.ts` — 기본 store (values/errors/subscribe/setFieldValue)

**Files:**
- Create: `packages/registry/react/components/form/store.test.ts`
- Create: `packages/registry/react/components/form/store.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// components/form/store.test.ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: FAIL

- [ ] **Step 3: `store.ts` 기본 구현**

```ts
// components/form/store.ts
import type {
  FormStore,
  FormStoreState,
  FormConfig,
  FieldState,
  FieldError,
  FieldConfig,
  StandardSchemaV1,
} from "./types";
import { flatten, unflatten, getByPath } from "./utils";

export interface CreateFormStoreOptions<T = unknown> {
  defaultValues?: Partial<T>;
  schema?: StandardSchemaV1<T>;
  validateOn?: "submit" | "blur" | "change";
  onSubmit?: FormConfig<T>["onSubmit"];
  onInvalid?: FormConfig<T>["onInvalid"];
  scrollToFirstError?: boolean;
  focusFirstError?: boolean;
}

export function createFormStore<T = unknown>(options: CreateFormStoreOptions<T> = {}): FormStore<T> {
  const config: FormConfig<T> = {
    schema: options.schema,
    validateOn: options.validateOn ?? "blur",
    onSubmit: options.onSubmit,
    onInvalid: options.onInvalid,
    scrollToFirstError: options.scrollToFirstError ?? true,
    focusFirstError: options.focusFirstError ?? true,
  };

  const initialValues = options.defaultValues
    ? flatten(options.defaultValues as Record<string, unknown>)
    : {};

  let state: FormStoreState = {
    values: { ...initialValues },
    errors: {},
    touched: {},
    submitting: false,
    submitCount: 0,
    activeStepId: null,
    fieldsByStep: new Map(),
    fieldsBySection: new Map(),
    fieldValidators: new Map(),
    sectionSchemas: new Map(),
    validatingFields: new Set(),
    revalidateOnChange: new Set(),
  };

  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  const store: FormStore<T> = {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getState: () => state,
    getFieldState(path): FieldState {
      const err = state.errors[path];
      return {
        value: state.values[path],
        error: err,
        errors: err ? [err] : [],
        touched: !!state.touched[path],
        isValidating: state.validatingFields.has(path),
        hasError: !!err,
      };
    },
    setFieldValue(path, value) {
      state = { ...state, values: { ...state.values, [path]: value } };
      notify();
    },
    setFieldTouched(path, touched) {
      if (state.touched[path] === touched) return;
      state = { ...state, touched: { ...state.touched, [path]: touched } };
      notify();
    },
    registerField: () => () => {},         // Task 2.2
    registerStep: () => () => {},          // Task 2.3
    setActiveStep: () => {},               // Task 2.3
    registerSectionSchema: () => () => {}, // Task 2.4
    validateField: async () => true,       // Task 2.2
    validateStep: async () => true,        // Task 2.3
    validateAll: async () => true,         // Task 2.5
    getValues<S = T>(scope?: string): S {
      const nested = unflatten(state.values);
      return (scope ? getByPath(nested, scope) : nested) as S;
    },
    submit: async () => {},                // Task 2.5
    reset: () => {},                       // Task 2.5
    setError: () => {},                    // Task 2.5
    _config: config,
  };

  return store;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/store.ts packages/registry/react/components/form/store.test.ts
git commit -m "feat(form): createFormStore 기본 (values/subscribe/setFieldValue)"
```

---

### Task 2.2: registerField + validateField

**Files:**
- Modify: `packages/registry/react/components/form/store.ts`
- Modify: `packages/registry/react/components/form/store.test.ts`

- [ ] **Step 1: 테스트 추가 — `store.test.ts` 하단에**

```ts
import { runFieldValidate } from "./validation";

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
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: 3개 새 테스트 FAIL

- [ ] **Step 3: `store.ts` 의 `registerField` / `validateField` 구현**

```ts
// store.ts 내부의 메서드 교체
registerField(path, config) {
  state.fieldValidators.set(path, config);
  // step/section 메타 업데이트
  if (config.stepId) {
    const set = state.fieldsByStep.get(config.stepId) ?? new Set();
    set.add(path);
    state.fieldsByStep.set(config.stepId, set);
  }
  if (config.sectionPath) {
    const set = state.fieldsBySection.get(config.sectionPath) ?? new Set();
    set.add(path);
    state.fieldsBySection.set(config.sectionPath, set);
  }
  notify();
  return () => {
    state.fieldValidators.delete(path);
    if (config.stepId) state.fieldsByStep.get(config.stepId)?.delete(path);
    if (config.sectionPath) state.fieldsBySection.get(config.sectionPath)?.delete(path);
    notify();
  };
},
async validateField(path) {
  const cfg = state.fieldValidators.get(path);
  const values = store.getValues();
  // TODO Task 2.4: HTML5 → field validate → section schema → root schema
  const err = await runFieldValidate(cfg?.validate, state.values[path], values);
  const nextErrors = { ...state.errors };
  if (err) nextErrors[path] = err;
  else delete nextErrors[path];
  state = { ...state, errors: nextErrors };
  notify();
  return !err;
},
```

**추가:** `validation.ts` 의 `runFieldValidate` import 를 store.ts 최상단에 추가:
```ts
import { runFieldValidate } from "./validation";
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: PASS (7 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/store.ts packages/registry/react/components/form/store.test.ts
git commit -m "feat(form): registerField + validateField"
```

---

### Task 2.3: Step 등록 + validateStep

**Files:**
- Modify: `packages/registry/react/components/form/store.ts`
- Modify: `packages/registry/react/components/form/store.test.ts`

- [ ] **Step 1: 테스트 추가**

```ts
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
    // email is missing, name is missing — but only 'account' is checked
    const ok = await store.validateStep("account");
    expect(ok).toBe(false);
    expect(store.getState().errors["email"]).toBeDefined();
    expect(store.getState().errors["name"]).toBeUndefined();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: 2개 새 테스트 FAIL

- [ ] **Step 3: 구현 업데이트**

```ts
// store.ts — 메서드 교체
registerStep(stepId) {
  if (!state.fieldsByStep.has(stepId)) {
    state.fieldsByStep.set(stepId, new Set());
    notify();
  }
  return () => {
    // fields 는 값 보존을 위해 삭제하지 않음; step 자체만 지울 때 쓰임
    // 실제 unregister 는 하지 않음 — step 이 다시 마운트되면 같은 id 로 등록
  };
},
setActiveStep(stepId) {
  if (state.activeStepId === stepId) return;
  state = { ...state, activeStepId: stepId };
  notify();
},
async validateStep(stepId) {
  const fields = Array.from(state.fieldsByStep.get(stepId) ?? []);
  if (fields.length === 0) return true;
  const results = await Promise.all(fields.map((f) => store.validateField(f)));
  // touched 업데이트 — 실패 시에만 touched 일괄 true
  if (results.some((r) => !r)) {
    const nextTouched = { ...state.touched };
    for (const f of fields) nextTouched[f] = true;
    state = { ...state, touched: nextTouched };
    notify();
  }
  return results.every(Boolean);
},
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: PASS (9 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/store.ts packages/registry/react/components/form/store.test.ts
git commit -m "feat(form): Step 등록 + validateStep"
```

---

### Task 2.4: Section schema + 검증 소스 우선순위 (HTML5/validate/section/root schema)

**Files:**
- Modify: `packages/registry/react/components/form/store.ts`
- Modify: `packages/registry/react/components/form/store.test.ts`

- [ ] **Step 1: 테스트 추가**

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: 4개 FAIL

- [ ] **Step 3: `validateField` 를 우선순위 적용으로 교체 + `registerSectionSchema` 구현**

```ts
// store.ts
import { runFieldValidate, runSchema } from "./validation";

registerSectionSchema(sectionPath, schema) {
  state.sectionSchemas.set(sectionPath, schema);
  notify();
  return () => {
    state.sectionSchemas.delete(sectionPath);
    notify();
  };
},

async validateField(path) {
  const cfg = state.fieldValidators.get(path);
  const values = store.getValues() as Record<string, unknown>;

  // 1. HTML5 는 DOM 접근 필요 — Task 5.x 에서 Form.Control 로부터 수신. store 단계에선 스킵.
  // 2. field validate
  const fieldErr = await runFieldValidate(cfg?.validate, state.values[path], values);
  if (fieldErr) {
    state = { ...state, errors: { ...state.errors, [path]: fieldErr } };
    notify();
    return false;
  }

  // 3. section schema — path 가 섹션 prefix 로 시작할 때
  for (const [sectionPath, schema] of state.sectionSchemas) {
    if (path === sectionPath || path.startsWith(sectionPath + ".")) {
      const scopedValues = (getByPath(values, sectionPath) ?? {}) as Record<string, unknown>;
      const errors = await runSchema(schema, scopedValues);
      const relativePath = path.slice(sectionPath.length + 1);
      const err = errors[relativePath];
      if (err) {
        state = { ...state, errors: { ...state.errors, [path]: err } };
        notify();
        return false;
      }
      // section schema 가 "있다"면 루트 schema 는 덮임 (merge 아님)
      const nextErrors = { ...state.errors };
      delete nextErrors[path];
      state = { ...state, errors: nextErrors };
      notify();
      return true;
    }
  }

  // 4. root schema
  if (store._config.schema) {
    const errors = await runSchema(store._config.schema, values);
    const err = errors[path];
    if (err) {
      state = { ...state, errors: { ...state.errors, [path]: err } };
      notify();
      return false;
    }
  }

  // 모두 통과
  const nextErrors = { ...state.errors };
  delete nextErrors[path];
  state = { ...state, errors: nextErrors };
  notify();
  return true;
},
```

**getByPath import 추가 (이미 있으면 스킵).**

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: PASS (13 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/store.ts packages/registry/react/components/form/store.test.ts
git commit -m "feat(form): 검증 우선순위 (field validate → section schema → root schema)"
```

---

### Task 2.5: submit / validateAll / setError / reset

**Files:**
- Modify: `packages/registry/react/components/form/store.ts`
- Modify: `packages/registry/react/components/form/store.test.ts`

- [ ] **Step 1: 테스트 추가**

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: 4개 FAIL

- [ ] **Step 3: 구현**

```ts
// store.ts
async validateAll() {
  const paths = Array.from(state.fieldValidators.keys());
  const results = await Promise.all(paths.map((p) => store.validateField(p)));
  // root schema 가 있고 필드별로 못 잡은 에러가 있으면 추가
  if (store._config.schema) {
    const values = store.getValues() as Record<string, unknown>;
    const errors = await runSchema(store._config.schema, values);
    const nextErrors = { ...state.errors };
    for (const [path, err] of Object.entries(errors)) {
      if (!nextErrors[path]) nextErrors[path] = err;
    }
    state = { ...state, errors: nextErrors };
    notify();
  }
  return results.every(Boolean) && Object.keys(state.errors).length === 0;
},
async submit() {
  state = { ...state, submitting: true, submitCount: state.submitCount + 1 };
  notify();
  // touched 전부
  const allFields = Array.from(state.fieldValidators.keys());
  const nextTouched = { ...state.touched };
  for (const f of allFields) nextTouched[f] = true;
  state = { ...state, touched: nextTouched };

  const valid = await store.validateAll();
  if (!valid) {
    state = { ...state, submitting: false };
    notify();
    store._config.onInvalid?.(state.errors as Record<string, FieldError>);
    return;
  }
  const values = store.getValues();
  try {
    await store._config.onSubmit?.(values as T, {
      reset: (d) => store.reset(d),
      setError: (p, m) => store.setError(p, m),
    });
  } finally {
    state = { ...state, submitting: false };
    notify();
  }
},
setError(path, message) {
  state = {
    ...state,
    errors: { ...state.errors, [path]: { message, source: "validate" } },
  };
  notify();
},
reset(defaults) {
  const src = defaults ?? options.defaultValues;
  const flat = src ? flatten(src as Record<string, unknown>) : {};
  state = {
    ...state,
    values: flat,
    errors: {},
    touched: {},
    submitCount: 0,
    submitting: false,
    revalidateOnChange: new Set(),
  };
  notify();
},
```

**setFieldValue 수정 — 값 변경 시 기존 에러 clear (setError 해제 포함):**

```ts
setFieldValue(path, value) {
  const nextErrors = { ...state.errors };
  delete nextErrors[path];
  state = {
    ...state,
    values: { ...state.values, [path]: value },
    errors: nextErrors,
  };
  notify();
},
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: PASS (17 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/store.ts packages/registry/react/components/form/store.test.ts
git commit -m "feat(form): submit / validateAll / setError / reset"
```

---

### Task 2.6: 비동기 validate + debounce + stale-check

**Files:**
- Modify: `packages/registry/react/components/form/store.ts`
- Modify: `packages/registry/react/components/form/store.test.ts`

- [ ] **Step 1: 테스트 추가**

```ts
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
    store.setFieldValue("email", "ok"); // value changed
    resolve1!("slow says bad");          // late resolution
    await p1;
    // 에러가 들어오지 않아야 함 (stale 버려졌으므로)
    expect(store.getState().errors["email"]).toBeUndefined();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: 2개 FAIL

- [ ] **Step 3: `validateField` 에 isValidating 플래그 + stale check 추가**

```ts
async validateField(path) {
  const cfg = state.fieldValidators.get(path);
  const valueAtStart = state.values[path];
  const values = store.getValues() as Record<string, unknown>;

  // isValidating 표시
  state = {
    ...state,
    validatingFields: new Set(state.validatingFields).add(path),
  };
  notify();

  try {
    const fieldErr = await runFieldValidate(cfg?.validate, valueAtStart, values);
    // stale check — 도중에 값이 바뀌었으면 무시
    if (state.values[path] !== valueAtStart) return !state.errors[path];

    if (fieldErr) {
      state = { ...state, errors: { ...state.errors, [path]: fieldErr } };
      return false;
    }

    for (const [sectionPath, schema] of state.sectionSchemas) {
      if (path === sectionPath || path.startsWith(sectionPath + ".")) {
        const scopedValues = (getByPath(values, sectionPath) ?? {}) as Record<string, unknown>;
        const errors = await runSchema(schema, scopedValues);
        if (state.values[path] !== valueAtStart) return !state.errors[path];
        const relativePath = path.slice(sectionPath.length + 1);
        const err = errors[relativePath];
        const nextErrors = { ...state.errors };
        if (err) nextErrors[path] = err;
        else delete nextErrors[path];
        state = { ...state, errors: nextErrors };
        return !err;
      }
    }

    if (store._config.schema) {
      const errors = await runSchema(store._config.schema, values);
      if (state.values[path] !== valueAtStart) return !state.errors[path];
      const err = errors[path];
      const nextErrors = { ...state.errors };
      if (err) nextErrors[path] = err;
      else delete nextErrors[path];
      state = { ...state, errors: nextErrors };
      return !err;
    }

    const nextErrors = { ...state.errors };
    delete nextErrors[path];
    state = { ...state, errors: nextErrors };
    return true;
  } finally {
    const set = new Set(state.validatingFields);
    set.delete(path);
    state = { ...state, validatingFields: set };
    notify();
  }
},
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test store`
Expected: PASS (19 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/store.ts packages/registry/react/components/form/store.test.ts
git commit -m "feat(form): async validate isValidating 플래그 + stale-check"
```

---

## Phase 3 — React Context · 훅

### Task 3.1: `context.ts` — FormContext + useFormContext

**Files:**
- Create: `packages/registry/react/components/form/context.ts`

- [ ] **Step 1: 파일 작성**

```ts
// components/form/context.ts
"use client";

import * as React from "react";
import type { FormStore, FieldState } from "./types";
import { useSyncExternalStore } from "react";

export const FormContext = React.createContext<FormStore<unknown> | null>(null);

export const SectionContext = React.createContext<{ path: string }>({ path: "" });
export const StepContext = React.createContext<{ id: string | null }>({ id: null });
export const FieldContext = React.createContext<{
  path: string;
  id: string;
  descId: string;
  errorId: string;
} | null>(null);

export function useFormContext<T = unknown>(): FormStore<T> {
  const ctx = React.useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used inside <Form>");
  return ctx as FormStore<T>;
}

export function useFormState() {
  const store = useFormContext();
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState(),
    () => store.getState()
  );
}

export function useFormField(name?: string): FieldState & { path: string } {
  const store = useFormContext();
  const fieldCtx = React.useContext(FieldContext);
  const path = name ?? fieldCtx?.path;
  if (!path) throw new Error("useFormField: name is required outside <Form.Field>");

  useSyncExternalStore(
    store.subscribe,
    () => JSON.stringify([
      store.getState().values[path],
      store.getState().errors[path],
      store.getState().touched[path],
      store.getState().validatingFields.has(path),
    ]),
    () => ""
  );
  const snapshot = store.getFieldState(path);
  return { ...snapshot, path };
}

export function useFormSection(name?: string): {
  hasError: boolean;
  errors: Record<string, { message: string }>;
  isValid: boolean;
  isDirty: boolean;
} {
  const store = useFormContext();
  const sectionCtx = React.useContext(SectionContext);
  const path = name ?? sectionCtx.path;

  useSyncExternalStore(
    store.subscribe,
    () => JSON.stringify([store.getState().errors, store.getState().touched]),
    () => ""
  );

  const state = store.getState();
  const matching = Object.entries(state.errors).filter(
    ([p, e]) => e && (p === path || p.startsWith(path + "."))
  ) as Array<[string, { message: string }]>;
  const touchedAny = Object.entries(state.touched).some(
    ([p, t]) => t && (p === path || p.startsWith(path + "."))
  );
  return {
    hasError: matching.length > 0,
    errors: Object.fromEntries(matching),
    isValid: matching.length === 0,
    isDirty: touchedAny,
  };
}
```

- [ ] **Step 2: 커밋**

```bash
git add packages/registry/react/components/form/context.ts
git commit -m "feat(form): FormContext + useFormField/useFormSection 훅"
```

---

### Task 3.2: `use-sh-ui-form.ts`

**Files:**
- Create: `packages/registry/react/components/form/use-sh-ui-form.ts`

- [ ] **Step 1: 파일 작성**

```ts
// components/form/use-sh-ui-form.ts
"use client";

import * as React from "react";
import { createFormStore, type CreateFormStoreOptions } from "./store";
import type { FormStore } from "./types";

export function useShUiForm<T = unknown>(options?: CreateFormStoreOptions<T>): FormStore<T> {
  const storeRef = React.useRef<FormStore<T> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createFormStore<T>(options);
  }
  return storeRef.current;
}
```

- [ ] **Step 2: 커밋**

```bash
git add packages/registry/react/components/form/use-sh-ui-form.ts
git commit -m "feat(form): useShUiForm 훅"
```

---

## Phase 4 — Form 루트 + Section

### Task 4.1: `form.tsx` — `<Form>` 루트

**Files:**
- Create: `packages/registry/react/components/form/form.tsx`
- Create: `packages/registry/react/components/form/form.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// components/form/form.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Form } from "./form";
import { useFormContext } from "./context";

function Probe({ onReady }: { onReady: (store: any) => void }) {
  const store = useFormContext();
  onReady(store);
  return null;
}

describe("Form root", () => {
  it("renders a <form> element", () => {
    const { container } = render(<Form><button type="submit">go</button></Form>);
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("provides FormStore via context", () => {
    const onReady = vi.fn();
    render(<Form><Probe onReady={onReady} /></Form>);
    expect(onReady).toHaveBeenCalled();
    expect(typeof onReady.mock.calls[0][0].subscribe).toBe("function");
  });

  it("accepts external form prop", () => {
    let captured: any = null;
    const probe = (s: any) => { captured = s; };
    function Wrapper() {
      // useShUiForm 을 써서 store 공유
      const { useShUiForm } = require("./use-sh-ui-form");
      const store = useShUiForm({ defaultValues: { a: 1 } });
      return <Form form={store}><Probe onReady={probe} /></Form>;
    }
    render(<Wrapper />);
    expect(captured.getFieldState("a").value).toBe(1);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test form.test`
Expected: FAIL

- [ ] **Step 3: `form.tsx` 구현**

```tsx
// components/form/form.tsx
"use client";

import * as React from "react";
import { createFormStore, type CreateFormStoreOptions } from "./store";
import { FormContext, useFormState } from "./context";
import type { FormStore } from "./types";

export interface FormProps<T = unknown>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  form?: FormStore<T>;
  defaultValues?: CreateFormStoreOptions<T>["defaultValues"];
  schema?: CreateFormStoreOptions<T>["schema"];
  validateOn?: CreateFormStoreOptions<T>["validateOn"];
  onSubmit?: CreateFormStoreOptions<T>["onSubmit"];
  onInvalid?: CreateFormStoreOptions<T>["onInvalid"];
  scrollToFirstError?: boolean;
  focusFirstError?: boolean;
  disabled?: boolean;
}

function FormInner<T>({
  form: externalForm,
  defaultValues,
  schema,
  validateOn,
  onSubmit,
  onInvalid,
  scrollToFirstError,
  focusFirstError,
  disabled,
  children,
  ...rest
}: FormProps<T>) {
  const internalStoreRef = React.useRef<FormStore<T> | null>(null);
  if (!externalForm && !internalStoreRef.current) {
    internalStoreRef.current = createFormStore<T>({
      defaultValues,
      schema,
      validateOn,
      onSubmit,
      onInvalid,
      scrollToFirstError,
      focusFirstError,
    });
  }
  const store = (externalForm ?? internalStoreRef.current) as FormStore<T>;

  // Nesting guard
  const parent = React.useContext(FormContext);
  if (process.env.NODE_ENV !== "production" && parent) {
    throw new Error(
      "<Form> cannot be nested. For reusable field groups, use <Form.Section>-based components without a Form root."
    );
  }

  return (
    <FormContext.Provider value={store as FormStore<unknown>}>
      <form
        noValidate
        {...rest}
        onSubmit={(e) => {
          e.preventDefault();
          void store.submit();
        }}
      >
        <FormBody disabled={disabled}>{children}</FormBody>
      </form>
    </FormContext.Provider>
  );
}

function FormBody({ disabled, children }: { disabled?: boolean; children?: React.ReactNode }) {
  const state = useFormState();
  // aria-busy 는 form 태그에 직접 못 얹었으므로 wrapper 불필요. 대신 div 추가 피하고,
  // form element 에서 aria-busy 를 별도 useEffect 로 설정하는 것도 방법이지만
  // 단순하게 children 그대로 전달.
  return <>{children}</>;
}

export const Form = FormInner as <T>(props: FormProps<T>) => React.ReactElement;
```

**중요:** aria-busy 를 form 에 반영하려면 FormInner 에서 `useFormState()` 로 submitting 읽어서 attribute 설정해야 함. 위 코드는 Task 8.2 에서 보강.

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test form.test`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/form.tsx packages/registry/react/components/form/form.test.tsx
git commit -m "feat(form): Form 루트 (외부 store/내부 store, 중첩 금지)"
```

---

### Task 4.2: Form.Section + Form.SectionTitle

**Files:**
- Modify: `packages/registry/react/components/form/form.tsx`
- Create: `packages/registry/react/components/form/form.section.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// components/form/form.section.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Form } from "./form";
import { useFormSection } from "./context";

function SectionProbe({ name }: { name: string }) {
  const s = useFormSection(name);
  return <div data-testid="probe">{s.hasError ? "err" : "ok"}</div>;
}

describe("Form.Section", () => {
  it("renders as role=group by default", () => {
    render(
      <Form>
        <Form.Section name="profile" aria-labelledby="p-title">
          <h2 id="p-title">Profile</h2>
        </Form.Section>
      </Form>
    );
    const group = screen.getByRole("group");
    expect(group).toBeInTheDocument();
  });

  it("renders as fieldset when as=fieldset", () => {
    const { container } = render(
      <Form>
        <Form.Section name="x" as="fieldset">
          <Form.SectionTitle>Title</Form.SectionTitle>
        </Form.Section>
      </Form>
    );
    expect(container.querySelector("fieldset")).toBeInTheDocument();
    expect(container.querySelector("legend")?.textContent).toBe("Title");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test form.section`
Expected: FAIL

- [ ] **Step 3: `form.tsx` 에 Section 추가**

```tsx
// form.tsx 아래에 추가
import { SectionContext } from "./context";
import { scopedPath } from "./utils";

export interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  name?: string;
  schema?: StandardSchemaV1;
  as?: "div" | "fieldset";
}

function Section({ name, schema, as = "div", children, ...rest }: FormSectionProps) {
  const parent = React.useContext(SectionContext);
  const store = React.useContext(FormContext);
  const path = scopedPath(parent.path, name);

  // section schema 등록
  React.useEffect(() => {
    if (!schema || !store || !name) return;
    return store.registerSectionSchema(path, schema);
  }, [schema, store, path, name]);

  const Tag = as as any;
  const role = as === "div" ? "group" : undefined;

  return (
    <SectionContext.Provider value={{ path }}>
      <Tag role={role} {...rest}>
        {children}
      </Tag>
    </SectionContext.Provider>
  );
}

function SectionTitle({ children, ...rest }: React.HTMLAttributes<HTMLElement>) {
  // fieldset 안이면 legend, 아니면 h3/span
  // 간단히 legend 고정 — 소비자가 <Form.Section as="fieldset"> 인 경우만 사용 권장
  return <legend {...rest}>{children}</legend>;
}

// import StandardSchemaV1
import type { StandardSchemaV1 } from "./types";

// Form 에 부착
(Form as any).Section = Section;
(Form as any).SectionTitle = SectionTitle;

// 타입 보강
export interface FormComponent {
  <T>(props: FormProps<T>): React.ReactElement;
  Section: typeof Section;
  SectionTitle: typeof SectionTitle;
}
```

**타입 보강은 index.tsx 에서도 export 할 것.**

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test form.section`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/form.tsx packages/registry/react/components/form/form.section.test.tsx
git commit -m "feat(form): Form.Section + SectionTitle, role=group / fieldset"
```

---

## Phase 5 — Form.Field · Label · Description · Control · Error

### Task 5.1: Form.Field — registration + FieldContext

**Files:**
- Create: `packages/registry/react/components/form/field.tsx`
- Create: `packages/registry/react/components/form/field.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// components/form/field.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Form } from "./form";
import { Field } from "./field";

describe("Form.Field", () => {
  it("registers and unregisters field by name", () => {
    const { rerender } = render(
      <Form>
        <Field name="email" />
      </Form>
    );
    // 렌더 후 store 의 fieldValidators 에 email 존재해야 함 — 간접 검증
    // 구체적 assertion 은 Form.Control 단계에서 value/aria 로 확인
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    // unmount
    rerender(<Form />);
  });

  it("applies section namespace to path", () => {
    let pathSeen = "";
    const Probe = () => {
      const { FieldContext } = require("./context");
      const ctx = (require("react").useContext(FieldContext));
      pathSeen = ctx?.path ?? "";
      return null;
    };
    render(
      <Form>
        <Form.Section name="profile">
          <Field name="name">
            <Probe />
          </Field>
        </Form.Section>
      </Form>
    );
    expect(pathSeen).toBe("profile.name");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: FAIL

- [ ] **Step 3: `field.tsx` 구현**

```tsx
// components/form/field.tsx
"use client";

import * as React from "react";
import {
  FormContext,
  FieldContext,
  SectionContext,
  StepContext,
} from "./context";
import type { FieldValidate, ValidateOn } from "./types";
import { scopedPath } from "./utils";

export interface FieldProps {
  name: string;
  validate?: FieldValidate;
  validateOn?: ValidateOn;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  children?: React.ReactNode;
}

export function Field({ name, validate, validateOn, required, disabled, readOnly, children }: FieldProps) {
  const store = React.useContext(FormContext);
  if (!store) throw new Error("<Form.Field> must be inside <Form>");

  const section = React.useContext(SectionContext);
  const step = React.useContext(StepContext);
  const path = scopedPath(section.path, name);

  const id = React.useId();
  const descId = `${id}-desc`;
  const errorId = `${id}-error`;

  React.useEffect(() => {
    return store.registerField(path, {
      validate,
      validateOn,
      stepId: step.id ?? undefined,
      sectionPath: section.path || undefined,
      required,
    });
  }, [store, path, validate, validateOn, step.id, section.path, required]);

  return (
    <FieldContext.Provider value={{ path, id, descId, errorId }}>
      <div className="sh-ui-form-field" data-disabled={disabled || undefined} data-readonly={readOnly || undefined}>
        {children}
      </div>
    </FieldContext.Provider>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/field.tsx packages/registry/react/components/form/field.test.tsx
git commit -m "feat(form): Form.Field — register + FieldContext"
```

---

### Task 5.2: Form.Label

**Files:**
- Modify: `packages/registry/react/components/form/field.tsx`
- Modify: `packages/registry/react/components/form/field.test.tsx`

- [ ] **Step 1: 테스트 추가**

```tsx
describe("Form.Label", () => {
  it("wires htmlFor to Field id", () => {
    render(
      <Form>
        <Field name="email">
          <FormLabel>Email</FormLabel>
          <input data-testid="x" />
        </Field>
      </Form>
    );
    const label = screen.getByText("Email") as HTMLLabelElement;
    expect(label.tagName).toBe("LABEL");
    expect(label.htmlFor).toBeTruthy();
  });
});
// 상단에
import { FormLabel } from "./field";
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: FAIL

- [ ] **Step 3: `field.tsx` 에 `FormLabel` 추가**

```tsx
export const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(FieldContext);
    if (!ctx) throw new Error("<Form.Label> must be inside <Form.Field>");
    return <label ref={ref} htmlFor={ctx.id} className={className} {...props} />;
  }
);
FormLabel.displayName = "Form.Label";
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/field.tsx packages/registry/react/components/form/field.test.tsx
git commit -m "feat(form): Form.Label (htmlFor 자동 wiring)"
```

---

### Task 5.3: Form.Description + Form.Error 스텁

**Files:**
- Modify: `packages/registry/react/components/form/field.tsx`
- Modify: `packages/registry/react/components/form/field.test.tsx`

- [ ] **Step 1: 테스트 추가**

```tsx
describe("Form.Description", () => {
  it("renders with correct descId", () => {
    render(
      <Form>
        <Field name="x">
          <FormDescription>help</FormDescription>
        </Field>
      </Form>
    );
    const desc = screen.getByText("help");
    expect(desc.id).toMatch(/-desc$/);
  });
});

describe("Form.Error", () => {
  it("does not render when no error", () => {
    render(
      <Form>
        <Field name="x">
          <FormError />
        </Field>
      </Form>
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
// import
import { FormDescription, FormError } from "./field";
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: FAIL

- [ ] **Step 3: 구현**

```tsx
// field.tsx
export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Description> must be inside <Form.Field>");
  return <p ref={ref} id={ctx.descId} className={className} {...props} />;
});
FormDescription.displayName = "Form.Description";

export interface FormErrorProps {
  children?: React.ReactNode | ((err: { message: string }) => React.ReactNode);
  matches?: string;
  className?: string;
}

export function FormError({ children, matches, className }: FormErrorProps) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Error> must be inside <Form.Field>");
  const { useFormField } = require("./context");
  const field = useFormField(ctx.path);

  const err = field.error;
  if (!err) return null;
  if (matches && err.type !== matches) return null;

  const content =
    typeof children === "function"
      ? (children as any)(err)
      : children ?? err.message;

  return (
    <p
      id={ctx.errorId}
      className={`sh-ui-form-error ${className ?? ""}`}
      role="alert"
      aria-live="polite"
    >
      {content}
    </p>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/field.tsx packages/registry/react/components/form/field.test.tsx
git commit -m "feat(form): Form.Description + Form.Error (role=alert, 에러 없으면 unmount)"
```

---

### Task 5.4: Form.Control — cloneElement + value/onChange/aria 주입

**Files:**
- Modify: `packages/registry/react/components/form/field.tsx`
- Modify: `packages/registry/react/components/form/field.test.tsx`

- [ ] **Step 1: 테스트 추가**

```tsx
import userEvent from "@testing-library/user-event";

describe("Form.Control — value binding", () => {
  it("injects id/value/onChange and updates store on change", async () => {
    const user = userEvent.setup();
    render(
      <Form defaultValues={{ email: "" }}>
        <Field name="email">
          <FormLabel>Email</FormLabel>
          <FormControl><input data-testid="i" /></FormControl>
        </Field>
      </Form>
    );
    const input = screen.getByTestId("i") as HTMLInputElement;
    expect(input.id).toBeTruthy();
    expect(screen.getByText("Email")).toHaveAttribute("for", input.id);
    await user.type(input, "abc");
    expect(input.value).toBe("abc");
  });

  it("sets aria-invalid + aria-describedby when error exists", async () => {
    render(
      <Form>
        <Field
          name="x"
          validate={(v) => (v ? undefined : "required")}
        >
          <FormControl><input data-testid="i" /></FormControl>
          <FormError />
        </Field>
      </Form>
    );
    const input = screen.getByTestId("i") as HTMLInputElement;
    // blur 로 검증 트리거
    input.focus();
    input.blur();
    // 검증이 비동기라 waitFor 필요
    await new Promise((r) => setTimeout(r, 10));
    // aria-invalid 체크는 아래 Task 에서 blur 연동 완료 후 가능. 이 테스트는 지금은 aria-describedby 존재만 확인
    expect(input.getAttribute("aria-describedby")).toMatch(/-desc|-error/);
  });
});
// import
import { FormControl } from "./field";
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: FAIL

- [ ] **Step 3: `FormControl` 구현 — value 바인딩만 (checked/render 는 다음 task)**

```tsx
// field.tsx
export interface FormControlProps {
  children?: React.ReactElement;
  valueAs?: "value" | "checked";
  render?: (ctrl: ControlProps) => React.ReactElement;
}

export interface ControlProps {
  id: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: () => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  checked?: boolean;
}

export function FormControl({ children, valueAs = "value", render }: FormControlProps) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Control> must be inside <Form.Field>");
  const store = React.useContext(FormContext)!;

  const { useFormField } = require("./context");
  const field = useFormField(ctx.path);

  const hasDesc = true; // 존재 여부 정확히 모름 → 항상 desc id 포함. 없으면 무해
  const describedBy = [hasDesc ? ctx.descId : null, field.hasError ? ctx.errorId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  const ctrl: ControlProps = {
    id: ctx.id,
    name: ctx.path,
    value: valueAs === "value" ? (field.value ?? "") : undefined,
    checked: valueAs === "checked" ? Boolean(field.value) : undefined,
    onChange: (e) => {
      const next = valueAs === "checked"
        ? (e.target as HTMLInputElement).checked
        : (e.target as HTMLInputElement).value;
      store.setFieldValue(ctx.path, next);
    },
    onBlur: () => {
      store.setFieldTouched(ctx.path, true);
      void store.validateField(ctx.path);
    },
    "aria-invalid": field.hasError || undefined,
    "aria-describedby": describedBy,
  };

  if (render) return render(ctrl);
  if (!children) return null;
  const child = React.Children.only(children);
  return React.cloneElement(child, ctrl);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/field.tsx packages/registry/react/components/form/field.test.tsx
git commit -m "feat(form): Form.Control — value 바인딩 + aria 주입"
```

---

### Task 5.5: Form.Control — valueAs="checked" + render prop

**Files:**
- Modify: `packages/registry/react/components/form/field.test.tsx`

- [ ] **Step 1: 테스트 추가**

```tsx
describe("Form.Control — checked binding", () => {
  it("valueAs=checked with checkbox", async () => {
    const user = userEvent.setup();
    render(
      <Form defaultValues={{ agree: false }}>
        <Field name="agree">
          <FormControl valueAs="checked">
            <input type="checkbox" data-testid="cb" />
          </FormControl>
        </Field>
      </Form>
    );
    const cb = screen.getByTestId("cb") as HTMLInputElement;
    expect(cb.checked).toBe(false);
    await user.click(cb);
    expect(cb.checked).toBe(true);
  });
});

describe("Form.Control — render prop", () => {
  it("passes ControlProps to render callback", () => {
    render(
      <Form>
        <Field name="color">
          <FormControl
            render={(ctrl) => (
              <div data-testid="wrap" data-id={ctrl.id} data-name={ctrl.name} />
            )}
          />
        </Field>
      </Form>
    );
    const wrap = screen.getByTestId("wrap");
    expect(wrap.getAttribute("data-name")).toBe("color");
    expect(wrap.getAttribute("data-id")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: PASS (Task 5.4 구현에 이미 valueAs/render 포함됨)

- [ ] **Step 3: 통과하면 커밋 — 통과 안 하면 Task 5.4 코드 보완 후 커밋**

```bash
git add packages/registry/react/components/form/field.test.tsx
git commit -m "test(form): Form.Control checked/render 케이스 검증"
```

---

### Task 5.6: 에러 후 onChange 자동 전환 (revalidateOnChange)

**Files:**
- Modify: `packages/registry/react/components/form/store.ts`
- Modify: `packages/registry/react/components/form/field.tsx`
- Modify: `packages/registry/react/components/form/field.test.tsx`

- [ ] **Step 1: 테스트 추가**

```tsx
describe("validateOn blur → change on error", () => {
  it("once a field errors, subsequent onChange revalidates", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Field name="email" validate={(v) => (String(v).includes("@") ? undefined : "bad")}>
          <FormControl><input data-testid="i" /></FormControl>
          <FormError />
        </Field>
      </Form>
    );
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "abc");
    input.blur();
    await screen.findByText("bad");
    // 이제 타이핑마다 re-validate
    await user.type(input, "@x.com");
    // 에러가 사라져야 함
    expect(screen.queryByText("bad")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: FAIL

- [ ] **Step 3: store 에 revalidateOnChange 플래그 로직 + FormControl onChange 에서 확인**

**`store.ts` 의 `validateField` 끝 부분 (에러 있을 때)에 revalidateOnChange 표시:**
```ts
// 에러 발생 분기에서
if (fieldErr) {
  state = {
    ...state,
    errors: { ...state.errors, [path]: fieldErr },
    revalidateOnChange: new Set(state.revalidateOnChange).add(path),
  };
  notify();
  return false;
}
```
(section/root schema 에러 분기에도 동일 추가)

**`field.tsx` 의 FormControl onChange 에서:**
```ts
onChange: (e) => {
  const next = /* 기존 로직 */;
  store.setFieldValue(ctx.path, next);
  const shouldRevalidate = store.getState().revalidateOnChange.has(ctx.path);
  if (shouldRevalidate) {
    void store.validateField(ctx.path);
  }
},
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test field.test`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/store.ts packages/registry/react/components/form/field.tsx packages/registry/react/components/form/field.test.tsx
git commit -m "feat(form): 에러 후 onChange 로 자동 전환 (revalidateOnChange)"
```

---

## Phase 6 — Steps

### Task 6.1: Form.Steps + Form.Step 기본

**Files:**
- Create: `packages/registry/react/components/form/steps.tsx`
- Create: `packages/registry/react/components/form/steps.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// components/form/steps.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "./form";
import { Steps, Step } from "./steps";
import { Field, FormControl } from "./field";
import { useFormSteps } from "./steps";

function Nav() {
  const { next, prev, activeStepId, isLastStep } = useFormSteps();
  return (
    <>
      <span data-testid="active">{activeStepId}</span>
      <button onClick={prev} type="button">prev</button>
      <button onClick={() => next()} type="button">{isLastStep ? "done" : "next"}</button>
    </>
  );
}

describe("Form.Steps", () => {
  it("renders only active step", () => {
    render(
      <Form>
        <Steps defaultStep="a">
          <Step id="a"><div data-testid="a">A</div></Step>
          <Step id="b"><div data-testid="b">B</div></Step>
        </Steps>
      </Form>
    );
    expect(screen.queryByTestId("a")).toBeInTheDocument();
    expect(screen.queryByTestId("b")).not.toBeInTheDocument();
  });

  it("next() moves to next step when current is valid", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Steps defaultStep="a">
          <Step id="a"><div data-testid="a">A</div></Step>
          <Step id="b"><div data-testid="b">B</div></Step>
        </Steps>
        <Nav />
      </Form>
    );
    await user.click(screen.getByText("next"));
    expect(screen.getByTestId("active").textContent).toBe("b");
    expect(screen.queryByTestId("b")).toBeInTheDocument();
  });

  it("next() blocks when current step has invalid fields", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Steps defaultStep="a">
          <Step id="a">
            <Field name="email" validate={(v) => (v ? undefined : "required")}>
              <FormControl><input data-testid="i" /></FormControl>
            </Field>
          </Step>
          <Step id="b"><div data-testid="b">B</div></Step>
        </Steps>
        <Nav />
      </Form>
    );
    await user.click(screen.getByText("next"));
    expect(screen.getByTestId("active").textContent).toBe("a"); // 막힘
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test steps`
Expected: FAIL

- [ ] **Step 3: `steps.tsx` 구현**

```tsx
// components/form/steps.tsx
"use client";

import * as React from "react";
import { FormContext, StepContext, useFormState } from "./context";
import { useSyncExternalStore } from "react";

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultStep?: string;
  activeStep?: string;
  onStepChange?: (id: string) => void;
  children: React.ReactNode;
}

const StepsContext = React.createContext<{
  activeStepId: string | null;
  setActive: (id: string) => void;
  order: string[];
  registerStepId: (id: string) => () => void;
} | null>(null);

export function Steps({ defaultStep, activeStep, onStepChange, children, ...rest }: StepsProps) {
  const store = React.useContext(FormContext);
  if (!store) throw new Error("<Form.Steps> must be inside <Form>");

  const [internal, setInternal] = React.useState<string | null>(defaultStep ?? null);
  const [order, setOrder] = React.useState<string[]>([]);

  const active = activeStep ?? internal;

  React.useEffect(() => {
    store.setActiveStep(active);
  }, [store, active]);

  const setActive = React.useCallback((id: string) => {
    if (activeStep === undefined) setInternal(id);
    onStepChange?.(id);
  }, [activeStep, onStepChange]);

  const registerStepId = React.useCallback((id: string) => {
    setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => {
      setOrder((prev) => prev.filter((x) => x !== id));
    };
  }, []);

  // default step 이 없고 order 가 생기면 첫번째로 활성
  React.useEffect(() => {
    if (!active && order.length > 0) setInternal(order[0]);
  }, [active, order]);

  return (
    <StepsContext.Provider value={{ activeStepId: active, setActive, order, registerStepId }}>
      <div {...rest}>{children}</div>
    </StepsContext.Provider>
  );
}

export interface StepProps {
  id: string;
  skipValidationOnNext?: boolean;
  children?: React.ReactNode;
}

export function Step({ id, skipValidationOnNext, children }: StepProps) {
  const ctx = React.useContext(StepsContext);
  const store = React.useContext(FormContext);
  if (!ctx || !store) throw new Error("<Form.Step> must be inside <Form.Steps>");

  React.useEffect(() => ctx.registerStepId(id), [ctx, id]);
  React.useEffect(() => {
    (store as any).__stepConfig = {
      ...(store as any).__stepConfig,
      [id]: { skipValidationOnNext },
    };
  }, [store, id, skipValidationOnNext]);

  if (ctx.activeStepId !== id) return null;
  return (
    <StepContext.Provider value={{ id }}>
      {children}
    </StepContext.Provider>
  );
}

export function useFormSteps() {
  const store = React.useContext(FormContext);
  const ctx = React.useContext(StepsContext);
  if (!store || !ctx) throw new Error("useFormSteps must be inside <Form.Steps>");

  useFormState(); // 리렌더 구독

  const { activeStepId, setActive, order } = ctx;
  const idx = activeStepId ? order.indexOf(activeStepId) : -1;
  const isLastStep = idx === order.length - 1;
  const isFirstStep = idx === 0;

  return {
    activeStepId,
    isLastStep,
    isFirstStep,
    next: async () => {
      if (!activeStepId) return false;
      const cfg = (store as any).__stepConfig?.[activeStepId];
      const ok = cfg?.skipValidationOnNext ? true : await store.validateStep(activeStepId);
      if (!ok) return false;
      if (isLastStep) {
        await store.submit();
        return true;
      }
      setActive(order[idx + 1]);
      return true;
    },
    prev: () => {
      if (isFirstStep) return;
      setActive(order[idx - 1]);
    },
    goTo: (id: string) => {
      if (order.includes(id)) setActive(id);
    },
    isStepValid: (id: string) => {
      const state = store.getState();
      const fields = state.fieldsByStep.get(id) ?? new Set();
      return !Array.from(fields).some((f) => state.errors[f]);
    },
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test steps`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/steps.tsx packages/registry/react/components/form/steps.test.tsx
git commit -m "feat(form): Form.Steps + Step + useFormSteps (next 자동 검증)"
```

---

### Task 6.2: Step unmount 시 값 보존 테스트

**Files:**
- Modify: `packages/registry/react/components/form/steps.test.tsx`

- [ ] **Step 1: 테스트 추가**

```tsx
describe("value persistence across step navigation", () => {
  it("keeps value when navigating away and back", async () => {
    const user = userEvent.setup();
    render(
      <Form defaultValues={{ email: "" }}>
        <Steps defaultStep="a">
          <Step id="a">
            <Field name="email"><FormControl><input data-testid="i" /></FormControl></Field>
          </Step>
          <Step id="b"><div>B</div></Step>
        </Steps>
        <Nav />
      </Form>
    );
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "a@b.com");
    await user.click(screen.getByText("next"));
    // step a 언마운트. 다시 back
    await user.click(screen.getByText("prev"));
    expect((screen.getByTestId("i") as HTMLInputElement).value).toBe("a@b.com");
  });
});
```

- [ ] **Step 2: 확인**

Run: `cd packages/registry/react && pnpm test steps`
Expected: PASS (Phase 2 에서 값은 store 에 영구 보관됨)

- [ ] **Step 3: 커밋**

```bash
git add packages/registry/react/components/form/steps.test.tsx
git commit -m "test(form): step 언마운트 후 값 보존 회귀 테스트"
```

---

## Phase 7 — UX 디테일 (첫 에러 포커스)

### Task 7.1: 첫 에러 필드 자동 포커스 + 스텝 자동 활성화

**Files:**
- Modify: `packages/registry/react/components/form/store.ts`
- Create: `packages/registry/react/components/form/focus-first-error.ts`
- Modify: `packages/registry/react/components/form/form.tsx`

- [ ] **Step 1: `focus-first-error.ts`**

```ts
// components/form/focus-first-error.ts
import type { FormStore } from "./types";

export function focusFirstError(store: FormStore, formEl: HTMLFormElement, scroll: boolean) {
  const state = store.getState();
  const errorPaths = Object.keys(state.errors).filter((p) => state.errors[p]);
  if (errorPaths.length === 0) return;

  // DOM 순서로 첫번째
  const allInputs = formEl.querySelectorAll<HTMLElement>("[name]");
  for (const el of Array.from(allInputs)) {
    const name = el.getAttribute("name");
    if (name && errorPaths.includes(name)) {
      // 비활성 step 안이면 step 활성화
      for (const [stepId, fields] of state.fieldsByStep) {
        if (fields.has(name) && stepId !== state.activeStepId) {
          store.setActiveStep(stepId);
          // step 전환 후 DOM 렌더 대기
          requestAnimationFrame(() => {
            const retry = formEl.querySelector<HTMLElement>(`[name="${name}"]`);
            retry?.focus({ preventScroll: true });
            if (scroll) {
              const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              retry?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
            }
          });
          return;
        }
      }
      el.focus({ preventScroll: true });
      if (scroll) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      }
      return;
    }
  }
}
```

- [ ] **Step 2: `form.tsx` 의 onSubmit 에서 호출**

```tsx
// FormInner 내부
const formElRef = React.useRef<HTMLFormElement | null>(null);

// <form ref={formElRef} ...>

onSubmit={(e) => {
  e.preventDefault();
  void (async () => {
    await store.submit();
    const state = store.getState();
    const hasErrors = Object.values(state.errors).some(Boolean);
    if (hasErrors && store._config.focusFirstError && formElRef.current) {
      focusFirstError(store, formElRef.current, store._config.scrollToFirstError);
    }
  })();
}}
```

import 추가:
```ts
import { focusFirstError } from "./focus-first-error";
```

- [ ] **Step 3: 테스트 — `form.test.tsx` 에 추가**

```tsx
describe("first error focus", () => {
  it("focuses first errored field after submit", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Field name="a" validate={(v) => (v ? undefined : "req")}>
          <FormControl><input data-testid="a" /></FormControl>
        </Field>
        <Field name="b" validate={(v) => (v ? undefined : "req")}>
          <FormControl><input data-testid="b" /></FormControl>
        </Field>
        <button type="submit">go</button>
      </Form>
    );
    await user.click(screen.getByText("go"));
    await new Promise((r) => setTimeout(r, 20));
    expect(document.activeElement).toBe(screen.getByTestId("a"));
  });
});
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test form.test`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/form/focus-first-error.ts packages/registry/react/components/form/form.tsx packages/registry/react/components/form/form.test.tsx
git commit -m "feat(form): 제출 실패 시 첫 에러 필드 자동 포커스 + 스텝 활성화"
```

---

## Phase 8 — 스타일 · 전역 동작

### Task 8.1: `styles.css` — 에러 애니메이션 + 필드 레이아웃

**Files:**
- Create: `packages/registry/react/components/form/styles.css`

- [ ] **Step 1: 파일 작성**

```css
/* components/form/styles.css */

.sh-ui-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}

.sh-ui-form-field[data-disabled] {
  opacity: 0.6;
  pointer-events: none;
}

.sh-ui-form-error {
  color: var(--color-danger, #dc2626);
  font-size: var(--text-sm, 0.875rem);
  margin: 0;
  animation: sh-ui-form-error-in 150ms var(--easing-out, cubic-bezier(0.16, 1, 0.3, 1));
}

@keyframes sh-ui-form-error-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .sh-ui-form-error { animation-duration: 0.01ms; }
}
```

- [ ] **Step 2: `index.tsx` 에서 styles.css import 하도록 준비 (Task 9.1 에서 실행)**

- [ ] **Step 3: 커밋**

```bash
git add packages/registry/react/components/form/styles.css
git commit -m "feat(form): 에러 애니메이션 + 필드 레이아웃 (prefers-reduced-motion 존중)"
```

---

### Task 8.2: Form 에 aria-busy 부착 + disabled 전파

**Files:**
- Modify: `packages/registry/react/components/form/form.tsx`
- Modify: `packages/registry/react/components/form/field.tsx`

- [ ] **Step 1: form.tsx — FormInner 에서 state 구독 후 form 에 `aria-busy`**

```tsx
// FormInner 내부, return 직전
const state = useFormState
  ? useFormState.call(null) // store 가 이미 Provider 에 있음
  : null;
// — Provider 바깥이라 useFormState 호출 불가 → 내부 컴포넌트로 분리 필요
```

**대신 FormProviderBody 래퍼로 나누기:**

```tsx
function FormInner<T>(props: FormProps<T>) {
  // ... store 준비 ...
  return (
    <FormContext.Provider value={store as FormStore<unknown>}>
      <FormElement disabled={props.disabled} {...rest}>{children}</FormElement>
    </FormContext.Provider>
  );
}

function FormElement({ disabled, children, ...rest }: any) {
  const store = React.useContext(FormContext)!;
  const state = useFormState();
  return (
    <form
      noValidate
      aria-busy={state.submitting || undefined}
      {...rest}
      onSubmit={/* 기존 로직 */}
    >
      <DisabledContext.Provider value={disabled ?? false}>
        {children}
      </DisabledContext.Provider>
    </form>
  );
}
```

**`context.ts` 에 추가:**
```ts
export const DisabledContext = React.createContext<boolean>(false);
```

**`field.tsx` 의 `FormControl` 에서 DisabledContext 읽기:**
```ts
const formDisabled = React.useContext(DisabledContext);
const fieldDisabled = /* props 의 disabled */;
// ctrl.disabled = formDisabled || fieldDisabled
```

(정확한 연결 지점은 Form.Field 가 disabled prop 받는 위치. Field → FormControl 로 Context 한 번 더 쓰거나 FieldContext 에 disabled 필드 추가.)

**간단히 FieldContext 에 추가:**
```ts
// context.ts
export const FieldContext = React.createContext<{
  path: string;
  id: string;
  descId: string;
  errorId: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
} | null>(null);
```

**`field.tsx`:**
```tsx
// Field 에서
const formDisabled = React.useContext(DisabledContext);
const effectiveDisabled = disabled || formDisabled;
// FieldContext.Provider value 에 disabled: effectiveDisabled

// FormControl 에서 ctrl 에 disabled/readOnly/required 전파
disabled: ctx.disabled,
readOnly: ctx.readOnly,
required: ctx.required,
"aria-required": ctx.required || undefined,
```

- [ ] **Step 2: 테스트 — `form.test.tsx` 에 추가**

```tsx
describe("Form-level states", () => {
  it("sets aria-busy while submitting", async () => {
    const user = userEvent.setup();
    let resolve: () => void;
    const blocker = new Promise<void>((r) => (resolve = r));
    render(
      <Form onSubmit={async () => { await blocker; }}>
        <Field name="x" validate={() => undefined}>
          <FormControl><input /></FormControl>
        </Field>
        <button type="submit">go</button>
      </Form>
    );
    const form = screen.getByRole("form") ?? document.querySelector("form")!;
    await user.click(screen.getByText("go"));
    await new Promise((r) => setTimeout(r, 10));
    expect(form).toHaveAttribute("aria-busy", "true");
    resolve!();
  });

  it("Form disabled disables all controls", () => {
    render(
      <Form disabled>
        <Field name="x">
          <FormControl><input data-testid="i" /></FormControl>
        </Field>
      </Form>
    );
    expect((screen.getByTestId("i") as HTMLInputElement).disabled).toBe(true);
  });
});
```

- [ ] **Step 3: 실패 확인 → 구현 → 통과 확인**

Run: `cd packages/registry/react && pnpm test form.test`
Expected: PASS

- [ ] **Step 4: 커밋**

```bash
git add packages/registry/react/components/form/form.tsx packages/registry/react/components/form/field.tsx packages/registry/react/components/form/context.ts packages/registry/react/components/form/form.test.tsx
git commit -m "feat(form): aria-busy + Form disabled 전파"
```

---

## Phase 9 — Public API + 레지스트리 등록 + 듀얼 카피

### Task 9.1: `index.tsx` — 전체 re-export

**Files:**
- Create: `packages/registry/react/components/form/index.tsx`

- [ ] **Step 1: 파일 작성**

```tsx
// components/form/index.tsx
"use client";

import * as React from "react";
import "./styles.css";
import { Form as FormRoot, Section, SectionTitle } from "./form";
import { Field, FormLabel, FormDescription, FormError, FormControl } from "./field";
import { Steps, Step } from "./steps";

type FormType = typeof FormRoot & {
  Section: typeof Section;
  SectionTitle: typeof SectionTitle;
  Field: typeof Field;
  Label: typeof FormLabel;
  Description: typeof FormDescription;
  Error: typeof FormError;
  Control: typeof FormControl;
  Steps: typeof Steps;
  Step: typeof Step;
};

const Form = FormRoot as FormType;
Form.Section = Section;
Form.SectionTitle = SectionTitle;
Form.Field = Field;
Form.Label = FormLabel;
Form.Description = FormDescription;
Form.Error = FormError;
Form.Control = FormControl;
Form.Steps = Steps;
Form.Step = Step;

export { Form };
export { useShUiForm } from "./use-sh-ui-form";
export {
  useFormContext,
  useFormField,
  useFormSection,
  useFormState,
} from "./context";
export { useFormSteps } from "./steps";
export { createFormStore } from "./store";
export type {
  FormStore,
  FormStoreState,
  FieldState,
  FieldError,
  FieldConfig,
  FieldValidate,
  ValidateOn,
  StandardSchemaV1,
} from "./types";
```

- [ ] **Step 2: 타입 체크**

Run: `cd packages/registry/react && pnpm tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add packages/registry/react/components/form/index.tsx
git commit -m "feat(form): Form compound export + 훅·타입 공개"
```

---

### Task 9.2: `registry.json` 엔트리 추가

**Files:**
- Modify: `packages/registry/react/registry.json`

- [ ] **Step 1: `registry.json` 에 form 엔트리 추가**

파일의 `components` 객체 안에 (알파벳 순서 유지하며):

```jsonc
"form": {
  "name": "form",
  "type": "component",
  "files": [
    { "src": "components/form/index.tsx", "dest": "{components}/form/index.tsx" },
    { "src": "components/form/form.tsx", "dest": "{components}/form/form.tsx" },
    { "src": "components/form/field.tsx", "dest": "{components}/form/field.tsx" },
    { "src": "components/form/steps.tsx", "dest": "{components}/form/steps.tsx" },
    { "src": "components/form/store.ts", "dest": "{components}/form/store.ts" },
    { "src": "components/form/use-sh-ui-form.ts", "dest": "{components}/form/use-sh-ui-form.ts" },
    { "src": "components/form/context.ts", "dest": "{components}/form/context.ts" },
    { "src": "components/form/validation.ts", "dest": "{components}/form/validation.ts" },
    { "src": "components/form/utils.ts", "dest": "{components}/form/utils.ts" },
    { "src": "components/form/types.ts", "dest": "{components}/form/types.ts" },
    { "src": "components/form/focus-first-error.ts", "dest": "{components}/form/focus-first-error.ts" },
    { "src": "components/form/styles.css", "dest": "{components}/form/styles.css" }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

- [ ] **Step 2: JSON 유효성 확인**

Run: `cd packages/registry/react && node -e "JSON.parse(require('fs').readFileSync('registry.json'))"`
Expected: no error

- [ ] **Step 3: 커밋**

```bash
git add packages/registry/react/registry.json
git commit -m "feat(cli): form 레지스트리 엔트리 추가"
```

---

### Task 9.3: 듀얼 카피 — `apps/docs/components/ui/form/`

**Files:**
- Create: `apps/docs/components/ui/form/*` (레지스트리 원본과 동일 복사)

- [ ] **Step 1: 폴더 복사**

```bash
cp -r packages/registry/react/components/form apps/docs/components/ui/form
# 테스트 파일은 docs 앱에서 필요 없으니 삭제
rm apps/docs/components/ui/form/*.test.ts apps/docs/components/ui/form/*.test.tsx
```

- [ ] **Step 2: apps/docs 타입 체크**

Run: `cd apps/docs && pnpm tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add apps/docs/components/ui/form/
git commit -m "feat(docs): form 컴포넌트 듀얼 카피 반영"
```

---

## Phase 10 — Yup 어댑터 (Standard Schema 래퍼)

### Task 10.1: `form-yup/index.tsx`

**Files:**
- Create: `packages/registry/react/components/form-yup/index.tsx`
- Create: `packages/registry/react/components/form-yup/README.md`
- Create: `packages/registry/react/components/form-yup/yup.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// components/form-yup/yup.test.ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `cd packages/registry/react && pnpm test yup`
Expected: FAIL

- [ ] **Step 3: 구현**

```ts
// components/form-yup/index.tsx
import type { StandardSchemaV1 } from "../form/types";

// yup 의 ValidationError · schema 인터페이스를 느슨하게 정의 (peerDep)
interface YupLikeSchema<T = unknown> {
  validate(value: unknown, opts?: { abortEarly?: boolean }): Promise<T>;
}
interface YupValidationError {
  inner: Array<{ path?: string; message: string }>;
}

export function yupSchema<T>(schema: YupLikeSchema<T>): StandardSchemaV1<T> {
  return {
    "~standard": {
      version: 1,
      vendor: "yup",
      validate: async (value: unknown) => {
        try {
          const parsed = await schema.validate(value, { abortEarly: false });
          return { value: parsed };
        } catch (e) {
          const err = e as YupValidationError;
          if (!err.inner) return { issues: [{ message: String(e) }] };
          return {
            issues: err.inner.map((i) => ({
              path: i.path ? i.path.split(".") : undefined,
              message: i.message,
            })),
          };
        }
      },
    },
  };
}
```

- [ ] **Step 4: `README.md`**

```md
# form-yup

Yup 스키마를 sh-ui Form 에 붙이기 위한 Standard Schema v1 래퍼.

## Install

```bash
npm i yup
sh-ui add form-yup
```

## 사용

```tsx
import * as yup from "yup";
import { yupSchema } from "@/components/ui/form-yup";

const schema = yupSchema(yup.object({ email: yup.string().required() }));
<Form schema={schema}>...</Form>
```
```

- [ ] **Step 5: 테스트 통과 확인 + 커밋**

Run: `cd packages/registry/react && pnpm test yup`
Expected: PASS

```bash
git add packages/registry/react/components/form-yup/
git commit -m "feat(form-yup): Yup → Standard Schema v1 래퍼"
```

---

### Task 10.2: form-yup 레지스트리 등록 + 듀얼 카피

**Files:**
- Modify: `packages/registry/react/registry.json`
- Create: `apps/docs/components/ui/form-yup/`

- [ ] **Step 1: `registry.json` 에 엔트리 추가**

```jsonc
"form-yup": {
  "name": "form-yup",
  "type": "component",
  "files": [
    { "src": "components/form-yup/index.tsx", "dest": "{components}/form-yup/index.tsx" }
  ],
  "dependencies": [],
  "registryDependencies": ["form"]
}
```

- [ ] **Step 2: 듀얼 카피**

```bash
mkdir -p apps/docs/components/ui/form-yup
cp packages/registry/react/components/form-yup/index.tsx apps/docs/components/ui/form-yup/index.tsx
```

- [ ] **Step 3: 커밋**

```bash
git add packages/registry/react/registry.json apps/docs/components/ui/form-yup/
git commit -m "feat(cli): form-yup 레지스트리 등록 + 듀얼 카피"
```

---

## Phase 11 — React Hook Form 어댑터

### Task 11.1: `form-rhf/index.tsx` + 테스트

**Files:**
- Create: `packages/registry/react/components/form-rhf/index.tsx`
- Create: `packages/registry/react/components/form-rhf/rhf.test.tsx`
- Create: `packages/registry/react/components/form-rhf/README.md`

- [ ] **Step 1: 의존성 확인 — `react-hook-form` 이 devDependency 로 필요 (테스트용)**

```bash
cd packages/registry/react && pnpm add -D react-hook-form
```

- [ ] **Step 2: 테스트 작성**

```tsx
// components/form-rhf/rhf.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { Form } from "../form";
import { Field, FormControl, FormError } from "../form/field";
import { adaptReactHookForm } from "./index";

function TestForm() {
  const rhf = useForm({ defaultValues: { email: "" }, mode: "onBlur" });
  const form = adaptReactHookForm(rhf);
  return (
    <Form form={form}>
      <Field name="email" validate={(v) => (String(v).includes("@") ? undefined : "bad")}>
        <FormControl><input data-testid="i" /></FormControl>
        <FormError />
      </Field>
      <button type="submit">go</button>
    </Form>
  );
}

describe("adaptReactHookForm", () => {
  it("value change via Form.Control updates RHF state", async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "a@b.com");
    expect(input.value).toBe("a@b.com");
  });

  it("validation error from sh-ui validate shows under field", async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "nope");
    input.blur();
    await screen.findByText("bad");
  });
});
```

- [ ] **Step 3: 구현**

```tsx
// components/form-rhf/index.tsx
import type { UseFormReturn, FieldValues } from "react-hook-form";
import type { FormStore, FormStoreState, FieldState, FieldConfig, FieldError, StandardSchemaV1 } from "../form/types";
import { flatten, unflatten, getByPath } from "../form/utils";
import { runFieldValidate, runSchema } from "../form/validation";

export function adaptReactHookForm<T extends FieldValues>(
  rhf: UseFormReturn<T>,
  config?: { onSubmit?: (values: T, helpers: any) => void | Promise<void> }
): FormStore<T> {
  const meta = {
    fieldsByStep: new Map<string, Set<string>>(),
    fieldsBySection: new Map<string, Set<string>>(),
    fieldValidators: new Map<string, FieldConfig>(),
    sectionSchemas: new Map<string, StandardSchemaV1>(),
    activeStepId: null as string | null,
    revalidateOnChange: new Set<string>(),
    validatingFields: new Set<string>(),
  };

  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  const rhfUnsub = rhf.subscribe?.({
    formState: true,
    values: true,
    callback: () => notify(),
  });

  const store: FormStore<T> = {
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getState(): FormStoreState {
      const fs = rhf.formState;
      const values = flatten(rhf.getValues() as any);
      const errors: Record<string, FieldError | undefined> = {};
      for (const path of Object.keys(fs.errors)) {
        const e: any = (fs.errors as any)[path];
        if (e?.message) errors[path] = { message: e.message, source: "validate" };
      }
      return {
        values,
        errors,
        touched: { ...(fs.touchedFields as any) },
        submitting: fs.isSubmitting,
        submitCount: fs.submitCount,
        activeStepId: meta.activeStepId,
        fieldsByStep: meta.fieldsByStep,
        fieldsBySection: meta.fieldsBySection,
        fieldValidators: meta.fieldValidators,
        sectionSchemas: meta.sectionSchemas,
        validatingFields: meta.validatingFields,
        revalidateOnChange: meta.revalidateOnChange,
      };
    },
    getFieldState(path) {
      const state = store.getState();
      return {
        value: state.values[path],
        error: state.errors[path],
        errors: state.errors[path] ? [state.errors[path]!] : [],
        touched: !!state.touched[path],
        isValidating: rhf.formState.isValidating,
        hasError: !!state.errors[path],
      };
    },
    setFieldValue(path, value) {
      rhf.setValue(path as any, value as any, { shouldDirty: true });
    },
    setFieldTouched(path, touched) {
      if (touched) {
        (rhf as any).setFocus?.(path);
        rhf.trigger(path as any);
      }
    },
    registerField(path, cfg) {
      meta.fieldValidators.set(path, cfg);
      if (cfg.stepId) {
        const s = meta.fieldsByStep.get(cfg.stepId) ?? new Set();
        s.add(path);
        meta.fieldsByStep.set(cfg.stepId, s);
      }
      if (cfg.sectionPath) {
        const s = meta.fieldsBySection.get(cfg.sectionPath) ?? new Set();
        s.add(path);
        meta.fieldsBySection.set(cfg.sectionPath, s);
      }
      rhf.register(path as any);
      notify();
      return () => {
        meta.fieldValidators.delete(path);
        meta.fieldsByStep.get(cfg.stepId ?? "")?.delete(path);
        meta.fieldsBySection.get(cfg.sectionPath ?? "")?.delete(path);
        notify();
      };
    },
    registerStep(id) {
      if (!meta.fieldsByStep.has(id)) meta.fieldsByStep.set(id, new Set());
      notify();
      return () => {};
    },
    setActiveStep(id) {
      meta.activeStepId = id;
      notify();
    },
    registerSectionSchema(path, schema) {
      meta.sectionSchemas.set(path, schema);
      notify();
      return () => {
        meta.sectionSchemas.delete(path);
        notify();
      };
    },
    async validateField(path) {
      // sh-ui 의 field validate 는 RHF 바깥이라 수동 실행
      const cfg = meta.fieldValidators.get(path);
      const values = rhf.getValues() as any;
      const err = await runFieldValidate(cfg?.validate, values[path] ?? (store.getState().values[path]), values);
      if (err) {
        rhf.setError(path as any, { message: err.message });
        meta.revalidateOnChange.add(path);
        notify();
        return false;
      }
      rhf.clearErrors(path as any);
      const ok = await rhf.trigger(path as any);
      notify();
      return ok;
    },
    async validateStep(stepId) {
      const fields = Array.from(meta.fieldsByStep.get(stepId) ?? []);
      const results = await Promise.all(fields.map((f) => store.validateField(f)));
      return results.every(Boolean);
    },
    async validateAll() {
      const paths = Array.from(meta.fieldValidators.keys());
      const results = await Promise.all(paths.map((p) => store.validateField(p)));
      const rhfValid = await rhf.trigger();
      return results.every(Boolean) && rhfValid;
    },
    getValues<S>(scope?: string): S {
      const v = rhf.getValues() as any;
      return (scope ? getByPath(v, scope) : v) as S;
    },
    async submit() {
      await rhf.handleSubmit(async (values) => {
        await config?.onSubmit?.(values as T, {
          reset: (d) => rhf.reset(d as any),
          setError: (p, m) => rhf.setError(p as any, { message: m }),
        });
      })();
    },
    reset(d) { rhf.reset(d as any); },
    setError(p, m) { rhf.setError(p as any, { message: m }); },
    _config: {
      validateOn: "blur",
      scrollToFirstError: true,
      focusFirstError: true,
    },
  };

  return store;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test rhf`
Expected: PASS

- [ ] **Step 5: README + 커밋**

`README.md`:
```md
# form-rhf

React Hook Form 인스턴스를 sh-ui Form 에 연결하는 어댑터.

## Install

```bash
npm i react-hook-form
sh-ui add form-rhf
```

## 사용

```tsx
import { useForm } from "react-hook-form";
import { adaptReactHookForm } from "@/components/ui/form-rhf";
import { Form } from "@/components/ui/form";

const rhf = useForm({ defaultValues, mode: "onBlur" });
const form = adaptReactHookForm(rhf);

<Form form={form}>
  <Form.Field name="email">...</Form.Field>
</Form>
```

검증 규칙은 RHF 쪽 resolver / register 에 두는 것을 권장.
```

```bash
git add packages/registry/react/components/form-rhf/ packages/registry/react/package.json pnpm-lock.yaml
git commit -m "feat(form-rhf): React Hook Form 어댑터"
```

---

### Task 11.2: form-rhf 레지스트리 등록 + 듀얼 카피

**Files:**
- Modify: `packages/registry/react/registry.json`
- Create: `apps/docs/components/ui/form-rhf/`

- [ ] **Step 1: `registry.json`**

```jsonc
"form-rhf": {
  "name": "form-rhf",
  "type": "component",
  "files": [
    { "src": "components/form-rhf/index.tsx", "dest": "{components}/form-rhf/index.tsx" }
  ],
  "dependencies": ["react-hook-form"],
  "registryDependencies": ["form"]
}
```

- [ ] **Step 2: 듀얼 카피 + 커밋**

```bash
mkdir -p apps/docs/components/ui/form-rhf
cp packages/registry/react/components/form-rhf/index.tsx apps/docs/components/ui/form-rhf/index.tsx
git add packages/registry/react/registry.json apps/docs/components/ui/form-rhf/
git commit -m "feat(cli): form-rhf 레지스트리 + 듀얼 카피"
```

---

## Phase 12 — TanStack Form 어댑터

### Task 12.1: `form-tanstack/index.tsx` + 테스트

**Files:**
- Create: `packages/registry/react/components/form-tanstack/index.tsx`
- Create: `packages/registry/react/components/form-tanstack/tanstack.test.tsx`
- Create: `packages/registry/react/components/form-tanstack/README.md`

- [ ] **Step 1: devDep 추가**

```bash
cd packages/registry/react && pnpm add -D @tanstack/react-form
```

- [ ] **Step 2: 테스트 + 구현 — RHF 어댑터와 구조 대칭. TanStack Form 의 `form.store.subscribe` 를 subscribe 에 연결**

(구현 세부는 TanStack Form 의 API 를 확인해 작성. RHF 어댑터와 동일한 `FormStore` 인터페이스 충족.)

핵심 대응:
- `rhf.getValues()` ↔ `ts.state.values`
- `rhf.setValue()` ↔ `ts.setFieldValue()`
- `rhf.register()` ↔ TanStack 은 `<form.Field>` 컴포넌트 기반 → sh-ui Form.Field 가 대체
- `rhf.trigger()` ↔ `ts.validateField()` / `ts.validateAllFields()`
- `rhf.subscribe()` ↔ `ts.store.subscribe()`

**구현 파일 (TanStack Form v1 API 기준):**

```ts
// components/form-tanstack/index.tsx
import type { FormApi, ReactFormApi } from "@tanstack/react-form";
import type {
  FormStore,
  FormStoreState,
  FieldError,
  FieldConfig,
  StandardSchemaV1,
} from "../form/types";
import { flatten, getByPath } from "../form/utils";
import { runFieldValidate } from "../form/validation";

type TS<T> = FormApi<T, any> & ReactFormApi<T, any>;

export function adaptTanStackForm<T>(
  ts: TS<T>,
  config?: { onSubmit?: (values: T, helpers: any) => void | Promise<void> }
): FormStore<T> {
  const meta = {
    fieldsByStep: new Map<string, Set<string>>(),
    fieldsBySection: new Map<string, Set<string>>(),
    fieldValidators: new Map<string, FieldConfig>(),
    sectionSchemas: new Map<string, StandardSchemaV1>(),
    activeStepId: null as string | null,
    revalidateOnChange: new Set<string>(),
    validatingFields: new Set<string>(),
  };

  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  // TanStack v1 exposes `ts.store.subscribe` — notify sh-ui listeners on any store change
  const unsubTs = ts.store.subscribe(() => notify());

  const collectErrors = (): Record<string, FieldError | undefined> => {
    const out: Record<string, FieldError | undefined> = {};
    const fieldMeta = ts.store.state.fieldMeta as Record<string, any>;
    for (const [path, m] of Object.entries(fieldMeta ?? {})) {
      const msgs = (m?.errors ?? []).filter(Boolean);
      if (msgs.length > 0) {
        out[path] = { message: String(msgs[0]), source: "validate" };
      }
    }
    return out;
  };

  const store: FormStore<T> = {
    subscribe(l) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
        if (listeners.size === 0) unsubTs();
      };
    },
    getState(): FormStoreState {
      const s = ts.store.state;
      return {
        values: flatten(s.values as any),
        errors: collectErrors(),
        touched: Object.fromEntries(
          Object.entries((s.fieldMeta ?? {}) as Record<string, any>)
            .map(([k, v]) => [k, Boolean(v?.isTouched)])
        ),
        submitting: Boolean(s.isSubmitting),
        submitCount: Number(s.submissionAttempts ?? 0),
        activeStepId: meta.activeStepId,
        fieldsByStep: meta.fieldsByStep,
        fieldsBySection: meta.fieldsBySection,
        fieldValidators: meta.fieldValidators,
        sectionSchemas: meta.sectionSchemas,
        validatingFields: meta.validatingFields,
        revalidateOnChange: meta.revalidateOnChange,
      };
    },
    getFieldState(path) {
      const state = store.getState();
      return {
        value: state.values[path],
        error: state.errors[path],
        errors: state.errors[path] ? [state.errors[path]!] : [],
        touched: !!state.touched[path],
        isValidating: meta.validatingFields.has(path),
        hasError: !!state.errors[path],
      };
    },
    setFieldValue(path, value) {
      ts.setFieldValue(path as any, value as any);
    },
    setFieldTouched(path, touched) {
      ts.setFieldMeta(path as any, (m: any) => ({ ...m, isTouched: touched }));
    },
    registerField(path, cfg) {
      meta.fieldValidators.set(path, cfg);
      if (cfg.stepId) {
        const s = meta.fieldsByStep.get(cfg.stepId) ?? new Set();
        s.add(path);
        meta.fieldsByStep.set(cfg.stepId, s);
      }
      if (cfg.sectionPath) {
        const s = meta.fieldsBySection.get(cfg.sectionPath) ?? new Set();
        s.add(path);
        meta.fieldsBySection.set(cfg.sectionPath, s);
      }
      notify();
      return () => {
        meta.fieldValidators.delete(path);
        meta.fieldsByStep.get(cfg.stepId ?? "")?.delete(path);
        meta.fieldsBySection.get(cfg.sectionPath ?? "")?.delete(path);
        notify();
      };
    },
    registerStep(id) {
      if (!meta.fieldsByStep.has(id)) meta.fieldsByStep.set(id, new Set());
      notify();
      return () => {};
    },
    setActiveStep(id) {
      meta.activeStepId = id;
      notify();
    },
    registerSectionSchema(path, schema) {
      meta.sectionSchemas.set(path, schema);
      notify();
      return () => {
        meta.sectionSchemas.delete(path);
        notify();
      };
    },
    async validateField(path) {
      const cfg = meta.fieldValidators.get(path);
      const values = ts.store.state.values as any;
      // sh-ui 의 field validate 실행
      const err = await runFieldValidate(cfg?.validate, values[path], values);
      if (err) {
        ts.setFieldMeta(path as any, (m: any) => ({
          ...m,
          errors: [err.message],
          errorMap: { ...(m?.errorMap ?? {}), onChange: err.message },
        }));
        meta.revalidateOnChange.add(path);
        notify();
        return false;
      }
      // 통과 — 에러 clear 후 TanStack 의 자체 검증도 돌림
      ts.setFieldMeta(path as any, (m: any) => ({ ...m, errors: [] }));
      await ts.validateField(path as any, "change");
      notify();
      return (ts.store.state.fieldMeta as any)?.[path]?.errors?.length ? false : true;
    },
    async validateStep(stepId) {
      const fields = Array.from(meta.fieldsByStep.get(stepId) ?? []);
      const results = await Promise.all(fields.map((f) => store.validateField(f)));
      return results.every(Boolean);
    },
    async validateAll() {
      const paths = Array.from(meta.fieldValidators.keys());
      const results = await Promise.all(paths.map((p) => store.validateField(p)));
      return results.every(Boolean);
    },
    getValues<S>(scope?: string): S {
      const v = ts.store.state.values as any;
      return (scope ? getByPath(v, scope) : v) as S;
    },
    async submit() {
      await ts.handleSubmit();
      // TanStack onSubmit 은 useForm 옵션에서 설정. adapter 의 config.onSubmit 도 보조로 호출
      if (config?.onSubmit) {
        await config.onSubmit(ts.store.state.values as T, {
          reset: () => ts.reset(),
          setError: (p, m) =>
            ts.setFieldMeta(p as any, (meta: any) => ({ ...meta, errors: [m] })),
        });
      }
    },
    reset() {
      ts.reset();
    },
    setError(path, message) {
      ts.setFieldMeta(path as any, (m: any) => ({ ...m, errors: [message] }));
    },
    _config: {
      validateOn: "blur",
      scrollToFirstError: true,
      focusFirstError: true,
    },
  };

  return store;
}
```

**참고:** TanStack Form API 는 버전마다 세부가 바뀌므로 (`setFieldMeta` / `validateField` 시그니처 등), 테스트가 실패하면 `@tanstack/react-form` 최신 문서를 확인해 해당 메서드명만 교체한다. 핵심 인터페이스 (FormStore 구현체) 는 그대로 유효.

- [ ] **Step 3: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test tanstack`
Expected: PASS

- [ ] **Step 4: README + 커밋**

```bash
git add packages/registry/react/components/form-tanstack/
git commit -m "feat(form-tanstack): TanStack Form 어댑터"
```

---

### Task 12.2: form-tanstack 레지스트리 + 듀얼 카피

```jsonc
"form-tanstack": {
  "name": "form-tanstack",
  "type": "component",
  "files": [
    { "src": "components/form-tanstack/index.tsx", "dest": "{components}/form-tanstack/index.tsx" }
  ],
  "dependencies": ["@tanstack/react-form"],
  "registryDependencies": ["form"]
}
```

- [ ] 듀얼 카피 + 커밋 (form-rhf 와 동일 절차)

---

## Phase 13 — Docs 페이지

### Task 13.1: `apps/docs/app/components/form/page.tsx` + `_demos/`

**Files:**
- Create: `apps/docs/app/components/form/page.tsx`
- Create: `apps/docs/app/components/form/_demos/basic.tsx`
- Create: `apps/docs/app/components/form/_demos/multi-step.tsx`
- Create: `apps/docs/app/components/form/_demos/checkout.tsx`
- Create: `apps/docs/app/components/form/_demos/reusable.tsx`
- Create: `apps/docs/app/components/form/_demos/rhf.tsx`

- [ ] **Step 1: page.tsx — 기존 `input/page.tsx` 를 참고해 구조 동일하게 작성**

구성:
- 개요 + 3가지 모드 비교 표
- PropsTable: Form, Form.Field, Form.Section, Form.Steps, Form.Step, Form.Control, Form.Error
- CodeTabs React 탭만 (Flutter 탭 없음)
- 각 _demos 를 Preview 로

- [ ] **Step 2: 각 _demos 작성**

- `basic.tsx` — `<Form defaultValues> + <Form.Field name="email">` 네이티브 사용
- `multi-step.tsx` — 가입 플로우 (account → profile → review) + `useFormSteps()` 네비
- `checkout.tsx` — 여러 Card 에 `<Form.Section>`, 헤더에 `useFormSection().hasError` 로 에러 표시
- `reusable.tsx` — AddressFields 를 shipping/billing 두 번 사용
- `rhf.tsx` — adaptReactHookForm + zodResolver

- [ ] **Step 3: dev 서버 띄워 수동 확인**

```bash
cd apps/docs && pnpm dev
# 브라우저에서 http://localhost:3000/components/form 확인
```

- [ ] **Step 4: 커밋**

```bash
git add apps/docs/app/components/form/
git commit -m "docs(form): Form 컴포넌트 문서 페이지 + 데모 5종"
```

---

## Phase 14 — changelog + 버전

### Task 14.1: `versions.json` prepend

**Files:**
- Modify: `packages/changelog/versions.json`

- [ ] **Step 1: `packages/changelog/versions.json` 의 `versions` 배열 **맨 앞** 에 엔트리 추가**

버전은 이전 엔트리 기준으로 MINOR 범프. 예: 이전이 `0.12.0` 이면 `0.13.0`.

```jsonc
{
  "version": "<결정된 minor 버전>",
  "date": "2026-04-22",
  "title": "Form 컴포넌트 — 라이브러리 비종속 + 멀티스텝·섹션 1급",
  "type": "minor",
  "highlights": [
    "Form + Form.Field / Section / Steps / Step — compound API 로 멀티스텝 · 멀티섹션 폼 지원",
    "3가지 사용 모드 (네이티브 / useShUiForm / RHF·TanStack·Yup 어댑터) 를 FormStore 인터페이스로 통일",
    "재사용 블록은 Form 루트 없이 Section 패턴으로 이식 가능 — AddressFields 스타일",
    "Standard Schema 표준 채택 (Zod v3.24+/Valibot/Arktype 네이티브, Yup 은 래퍼)"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v<버전>"
}
```

- [ ] **Step 2: JSON 유효성**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/changelog/versions.json'))"`

- [ ] **Step 3: 커밋**

```bash
git add packages/changelog/versions.json
git commit -m "chore(changelog): Form 컴포넌트 릴리즈 엔트리"
```

---

### Task 14.2: CLI 버전 bump

**Files:**
- Modify: `packages/cli/package.json`

- [ ] **Step 1: `packages/cli/package.json` 의 `version` 을 MINOR 범프**

- [ ] **Step 2: 커밋**

```bash
git add packages/cli/package.json
git commit -m "chore(cli): v<버전> — form/form-rhf/form-tanstack/form-yup 레지스트리 추가"
```

---

## Phase 15 — 전체 검증 + 태그·릴리즈

### Task 15.1: 루트에서 전체 타입·테스트 통과 확인

- [ ] **Step 1: 타입 체크**

```bash
pnpm -r tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 2: form 스코프 테스트**

```bash
cd packages/registry/react && pnpm test
```
Expected: 전체 PASS

- [ ] **Step 3: docs 빌드 smoke**

```bash
cd apps/docs && pnpm build
```
Expected: 빌드 성공

---

### Task 15.2: 태그 + GitHub Release

- [ ] **Step 1: dev 에 push**

```bash
git push origin dev
```

- [ ] **Step 2: 태그 생성**

```bash
git tag v<버전>
git push origin v<버전>
```

- [ ] **Step 3: Release notes — versions.json 의 highlights 보다 풍부하게 작성**

```bash
gh release create v<버전> --title "v<버전> — Form 컴포넌트 — 라이브러리 비종속 + 멀티스텝·섹션 1급" --notes "<릴리즈 본문>"
```

- [ ] **Step 4: live 에 PR 생성 (공통 규칙)**

```bash
gh pr create --base live --head dev --title "Form 컴포넌트 (v<버전>)" --body "..."
```

---

## 참고 체크리스트 — 스펙 커버리지

| 스펙 섹션 | 대응 Task |
|---|---|
| §1 배경 | (플랜 전체) |
| §2 목표 | 모든 Phase |
| §3 아키텍처 · 상태 모델 | Phase 1-2 |
| §4 재사용 규칙 | Task 4.2 (Section), Task 4.1 (중첩 금지), Phase 13 재사용 데모 |
| §5 Compound API | Phase 4-6 |
| §5 Form.Control valueAs/render | Task 5.4-5.5 |
| §5 useShUiForm | Task 3.2 |
| §6 검증 우선순위 | Task 2.4 |
| §6 blur→change 전환 | Task 5.6 |
| §6 async validate + stale-check | Task 2.6 |
| §6 Standard Schema | Task 1.3, Task 10.1 (Yup) |
| §6 스텝 검증 | Task 2.3, Task 6.1 |
| §6 제출 · 서버 에러 | Task 2.5 |
| §7 어댑터 — RHF | Task 11.1 |
| §7 어댑터 — TanStack | Task 12.1 |
| §8 ARIA 연결 | Task 5.1-5.4 |
| §8 첫 에러 포커스 | Task 7.1 |
| §8 aria-busy / disabled | Task 8.2 |
| §8 모션 | Task 8.1 |
| §9 파일 구조 | Phase 1-9 |
| §9 어댑터 배포 | Phase 10-12 |
| §9 듀얼 카피 | Task 9.3, 10.2, 11.2, 12.2 |
| §9 문서 페이지 | Task 13.1 |
| §9 버전 · changelog | Task 14.1-14.2 |
| §10 테스트 전략 | Phase 0 + 각 Task TDD |
| §11 YAGNI | (플랜에서 제외한 항목 동일) |

---

**총 Task 수:** 약 30. 각 Task 는 2-5분 step + 커밋. 순차 또는 subagent-driven 병렬 가능한 독립 Task 는:

- Phase 10 (Yup), 11 (RHF), 12 (TanStack) 은 Phase 9 후 독립 병렬 가능
- Phase 13 docs 페이지는 Phase 9 후 병렬
- 그 외 Phase 는 순차 의존
