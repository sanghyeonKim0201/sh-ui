import type { StandardSchemaV1 } from "../form/types";

// yup 의 schema / ValidationError 는 느슨하게 정의 (peerDep — 직접 import 하지 않음)
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
