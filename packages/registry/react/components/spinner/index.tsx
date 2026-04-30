import * as React from "react";
import "./styles.css";


import { cn } from "@SH_UI_UTILS@";
export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "role"> {
  size?: SpinnerSize;
  /** 접근성: 로딩 중임을 알리는 라벨. 기본 "로딩 중". */
  "aria-label"?: string;
}

/**
 * 짧은 비동기 작업의 로딩 표시. 200ms 이상 걸리는 요청에는 즉시 피드백을 준다는
 * 원칙(ui-states.md)에 맞춰 버튼·입력 등에 인라인으로 사용.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    { size = "md", className, "aria-label": ariaLabel = "로딩 중", ...props },
    ref,
  ) {
    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={cn("sh-ui-spinner", `sh-ui-spinner--${size}`, className)}
        {...props}
      >
        <span className="sh-ui-spinner__ring" aria-hidden />
      </span>
    );
  },
);
Spinner.displayName = "Spinner";
