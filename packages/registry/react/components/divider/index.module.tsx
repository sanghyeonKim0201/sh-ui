import * as React from "react";
import styles from "./styles.module.css";


import { cn } from "@SH_UI_UTILS@";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerAlign = "start" | "center" | "end";

export interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  orientation?: DividerOrientation;
  align?: DividerAlign;
  decorative?: boolean;
}

/**
 * 시각적 구분선 (CSS Modules 변종) — 가로/세로 1px 또는 라벨이 있는
 * "──── label ────" 형식.
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
      return (
        <div
          ref={ref}
          role={decorative ? undefined : "separator"}
          aria-orientation={decorative ? undefined : orientation}
          aria-hidden={decorative || undefined}
          data-orientation={orientation}
          className={cn(
            styles.divider,
            styles.divider__plain,
            styles[`divider--${orientation}`],
            className,
          )}
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
        className={cn(styles.divider, styles.divider__labeled, className)}
        {...props}
      >
        {align !== "start" ? (
          <span aria-hidden className={styles.divider__line} />
        ) : null}
        <span className={styles.divider__label}>{children}</span>
        {align !== "end" ? (
          <span aria-hidden className={styles.divider__line} />
        ) : null}
      </div>
    );
  },
);
Divider.displayName = "Divider";
