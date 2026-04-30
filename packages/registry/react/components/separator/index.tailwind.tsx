import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  orientation?: SeparatorOrientation;
  /**
   * 의미 없는 시각적 구분선인지 여부. 기본 true(aria-hidden).
   * 스크린리더에도 섹션 구분을 알려야 하면 false.
   */
  decorative?: boolean;
}

/**
 * 시각적 구분선 (Tailwind utility 변종). 가로(height=1px) / 세로(width=1px).
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) {
    const sizing =
      orientation === "horizontal" ? "w-full h-px" : "w-px h-full self-stretch";
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
  },
);
Separator.displayName = "Separator";
