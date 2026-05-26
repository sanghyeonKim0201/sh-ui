import * as React from "react";
import styles from "./styles.module.css";


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
 * 시각적 구분선 (CSS Modules 변종). 두 변종을 한 컴포넌트로:
 *   - children 없음: 가로/세로 1px
 *   - children 있음: 가운데 라벨이 있는 "──── label ────" 형식
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
      return (
        <div
          ref={ref}
          role={decorative ? undefined : "separator"}
          aria-orientation={decorative ? undefined : orientation}
          aria-hidden={decorative || undefined}
          data-orientation={orientation}
          className={cn(
            styles.separator,
            styles[`separator--${orientation}`],
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
        className={cn(styles.separator__labeled, className)}
        {...props}
      >
        {align !== "start" ? (
          <span aria-hidden className={styles.separator__line} />
        ) : null}
        <span className={styles.separator__label}>{children}</span>
        {align !== "end" ? (
          <span aria-hidden className={styles.separator__line} />
        ) : null}
      </div>
    );
  },
);
Separator.displayName = "Separator";
