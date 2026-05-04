import * as React from "react";
import { byKey, progress, progress__indicator } from "./styles.css";


import { cn } from "@SH_UI_UTILS@";
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** 0~100 사이의 현재 값. 생략 시 indeterminate 모드. */
  value?: number;
  /** 최댓값. 기본 100. */
  max?: number;
  /** 접근성: aria-label (시각적 라벨이 없으면 권장). */
  "aria-label"?: string;
}

/**
 * 작업 진행도를 가로 바로 표시. value가 없으면 무한 루프 indeterminate.
 *
 * - determinate: `<Progress value={40} />`
 * - indeterminate: `<Progress aria-label="로딩 중" />`
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    { value, max = 100, className, "aria-label": ariaLabel, ...props },
    ref,
  ) {
    const isDeterminate = value !== undefined;
    const normalized = isDeterminate ? clamp((value / max) * 100, 0, 100) : 0;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={isDeterminate ? 0 : undefined}
        aria-valuemax={isDeterminate ? max : undefined}
        aria-valuenow={isDeterminate ? value : undefined}
        data-state={isDeterminate ? "determinate" : "indeterminate"}
        className={cn(progress, className)}
        {...props}
      >
        <div
          className={progress__indicator}
          style={isDeterminate ? { width: `${normalized}%` } : undefined}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";
