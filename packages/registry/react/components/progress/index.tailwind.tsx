import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  value?: number;
  max?: number;
  "aria-label"?: string;
}

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
        className={cn(
          "relative w-full h-2 overflow-hidden bg-background-muted rounded-full",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-primary rounded-full transition-[width] duration-[var(--duration-base)] ease-out motion-reduce:transition-none",
            !isDeterminate &&
              "w-2/5 animate-[sh-ui-progress-slide_1.2s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:translate-x-3/4",
          )}
          style={isDeterminate ? { width: `${normalized}%` } : undefined}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-progress]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-progress", "");
  style.textContent = `@keyframes sh-ui-progress-slide { 0% { transform: translateX(-100%) } 100% { transform: translateX(250%) } }`;
  document.head.appendChild(style);
}
