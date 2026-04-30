/**
 * className 합성 헬퍼 (Tailwind 변종) — clsx + tailwind-merge.
 * - falsy 값 자동 제외
 * - 객체 형태 `{ "is-active": true }` 지원
 * - **Tailwind utility 충돌 머지** — `cn("bg-red-500", "bg-blue-500")` → `"bg-blue-500"`
 *   사용자가 `<Button className="bg-red-500" />` 로 default 를 깔끔히 override 가능.
 *
 *   cn("base", isActive && "active", { "with-icon": hasIcon }, className)
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type { ClassValue };

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
