import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorAlign = "start" | "center" | "end";

export interface SeparatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  orientation?: SeparatorOrientation;
  /**
   * 라벨 정렬 — children 이 있을 때만 의미를 가진다. 기본 center.
   */
  align?: SeparatorAlign;
  /**
   * 의미 없는 시각적 구분선인지 여부. 기본 true(aria-hidden).
   */
  decorative?: boolean;
}

/**
 * 시각적 구분선 (Tailwind utility 변종). 두 변종을 한 컴포넌트로:
 *   - children 없음: 가로(height=1px) / 세로(width=1px)
 *   - children 있음: 가운데에 라벨이 있는 "──── label ────" 형식
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
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
          className={cn("bg-border shrink-0", sizing, className)}
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
Separator.displayName = "Separator";
