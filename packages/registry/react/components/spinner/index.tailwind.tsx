import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";


import { cn } from "@SH_UI_UTILS@";
const spinnerVariants = cva(
  "inline-flex items-center justify-center align-middle text-current",
  {
    variants: {
      size: {
        sm: "w-3.5 h-3.5",
        md: "w-[1.125rem] h-[1.125rem]",
        lg: "w-6 h-6",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>["size"]>;

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "role"> {
  size?: SpinnerSize;
  "aria-label"?: string;
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    { size = "md", className, "aria-label": ariaLabel = "로딩 중", ...props },
    ref,
  ) {
    const ringBorder = size === "sm" ? "border-[1.5px]" : "border-2";
    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={cn(spinnerVariants({ size }), className)}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block w-full h-full rounded-full border-current border-t-transparent opacity-80 animate-[sh-ui-spinner-rotate_0.8s_linear_infinite] motion-reduce:[animation-duration:3s]",
            ringBorder,
          )}
        />
      </span>
    );
  },
);
Spinner.displayName = "Spinner";

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-spinner]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-spinner", "");
  style.textContent = `@keyframes sh-ui-spinner-rotate { to { transform: rotate(360deg) } }`;
  document.head.appendChild(style);
}
