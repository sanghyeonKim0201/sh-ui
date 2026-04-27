import type { StandardSchemaV1 } from "../form/types";

// yup 의 schema / ValidationError 는 느슨하게 정의 (peerDep — 직접 import 하지 않음)
interface YupLikeSchema<T = unknown> {
  validate(value: unknown, opts?: { abortEarly?: boolean }): Promise<T>;
}

interface YupValidationError {
  inner: Array<{ path?: string; message: string }>;
}

/**
 * yup 스키마를 sh-ui Form이 사용하는 Standard Schema(v1)로 감싼다.
 * yup은 peerDependency라 직접 import하지 않으므로, 호출 측에서 만든 스키마를 그대로 넘기면 된다.
 */
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
