import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerAlign = "start" | "center" | "end";

export interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  orientation?: DividerOrientation;
  /**
   * 라벨 정렬 — children 이 있을 때만 의미를 가진다. 기본 center.
   * `start` 면 라벨이 왼쪽에 붙고 오른쪽으로만 선이 뻗는다 (반대도 마찬가지).
   */
  align?: DividerAlign;
  /**
   * 의미 없는 시각적 구분선인지. 기본 true(aria-hidden).
   */
  decorative?: boolean;
}

/**
 * 시각적 구분선 (Tailwind utility 변종) — 가로/세로 1px (children 없음) 또는
 * 가운데 라벨이 있는 "──── label ────" 형식 (children 있음).
 */
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  function Divider(
    {
      className,
      orientation = "horizontal",
      align = "center",
      decorative = true,
      children,
      ...props
    },
    ref,
  ) {
    const hasLabel = children != null && children !== false;
    if (!hasLabel) {
      const sizing =
        orientation === "horizontal"
          ? "w-full h-px"
          : "w-px h-full self-stretch";
      return (
        <div
          ref={ref}
          role={decorative ? undefined : "separator"}
          aria-orientation={decorative ? undefined : orientation}
          aria-hidden={decorative || undefined}
          data-orientation={orientation}
          className={cn("shrink-0 bg-border", sizing, className)}
          {...props}
        />
      );
    }
    return (
      <div
        ref={ref}
        role={decorative ? undefined : "separator"}
        aria-orientation={decorative ? undefined : "horizontal"}
        data-orientation="horizontal"
        data-align={align}
        className={cn(
          "flex w-full shrink-0 items-center gap-[var(--space-3,0.75rem)]",
          className,
        )}
        {...props}
      >
        {align !== "start" ? (
          <span aria-hidden className="h-px flex-1 bg-border" />
        ) : null}
        <span className="text-[length:var(--text-xs,0.75rem)] font-semibold uppercase tracking-[0.04em] text-foreground-subtle">
          {children}
        </span>
        {align !== "end" ? (
          <span aria-hidden className="h-px flex-1 bg-border" />
        ) : null}
      </div>
    );
  },
);
Divider.displayName = "Divider";
