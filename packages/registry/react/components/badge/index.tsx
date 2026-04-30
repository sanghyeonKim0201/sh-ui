import * as React from "react";
import "./styles.css";


import { cn } from "@SH_UI_UTILS@";
export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "outline";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

/**
 * 상태·카테고리·수량 등을 짧게 표기하는 인라인 라벨. 의미 전달이 색에만
 * 의존하지 않도록 텍스트나 아이콘과 함께 사용할 것.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ className, variant = "primary", size = "md", ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(
          "sh-ui-badge",
          `sh-ui-badge--${variant}`,
          `sh-ui-badge--${size}`,
          className,
        )}
        {...props}
      />
    );
  },
);
