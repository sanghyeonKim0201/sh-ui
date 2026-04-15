/**
 * className 합성 헬퍼.
 * - falsy(null/false/undefined/"") 값은 자동 제외
 * - 객체 형태 `{ "is-active": true }` 지원
 *
 *   cn("base", isActive && "active", { "with-icon": hasIcon }, className)
 */
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: boolean | null | undefined }
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const push = (v: ClassValue) => {
    if (!v && v !== 0) return;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
      return;
    }
    if (Array.isArray(v)) {
      for (const item of v) push(item);
      return;
    }
    if (typeof v === "object") {
      for (const key in v) {
        if (v[key]) out.push(key);
      }
    }
  };

  for (const input of inputs) push(input);
  return out.join(" ");
}
