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
    const path = (issue.path ?? [])
      .map((seg) =>
        typeof seg === "object" && seg !== null
          ? String((seg as { key: PropertyKey }).key)
          : String(seg)
      )
      .join(".");
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

export function readHTML5Validity(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): FieldError | undefined {
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
