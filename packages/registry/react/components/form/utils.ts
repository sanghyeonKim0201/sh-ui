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
