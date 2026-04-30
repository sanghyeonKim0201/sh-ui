import * as React from "react";

import { cn } from "@SH_UI_UTILS@";
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * 필수 필드 표시. `true`면 LabelTitle 뒤에 `*` 표시.
   * (Tailwind 변종은 plain 변종의 `:has()` 인접 셀렉터 자동 감지를 지원하지 않음 — 명시적으로 prop 사용.)
   *
   * @default false
   */
  isRequired?: boolean;
}


export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, isRequired, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "flex flex-col gap-0.5 text-[length:var(--text-sm)] font-medium leading-snug text-foreground cursor-pointer select-none not-has-[[data-sh-ui-label-part]]:block",
        // 필수 표시 — title 이 있으면 title 뒤, 없으면 label 뒤에 * 부착
        isRequired &&
          "has-[[data-sh-ui-label-part='title']]:[&>[data-sh-ui-label-part='title']]:after:content-['_*'] has-[[data-sh-ui-label-part='title']]:[&>[data-sh-ui-label-part='title']]:after:text-danger has-[[data-sh-ui-label-part='title']]:[&>[data-sh-ui-label-part='title']]:after:font-semibold not-has-[[data-sh-ui-label-part='title']]:after:content-['_*'] not-has-[[data-sh-ui-label-part='title']]:after:text-danger not-has-[[data-sh-ui-label-part='title']]:after:font-semibold",
        className,
      )}
      data-required={isRequired || undefined}
      {...props}
    >
      {children}
    </label>
  ),
);
Label.displayName = "Label";

export function LabelTitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-sh-ui-label-part="title"
      className={cn("font-semibold text-[length:var(--text-sm)] text-foreground", className)}
      {...props}
    />
  );
}

export function LabelSubtitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-sh-ui-label-part="subtitle"
      className={cn("font-normal text-[0.8125rem] text-foreground", className)}
      {...props}
    />
  );
}

export function LabelDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-sh-ui-label-part="description"
      className={cn("m-0 font-normal text-[0.8125rem] leading-snug text-foreground-muted", className)}
      {...props}
    />
  );
}

export function LabelCaption({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-sh-ui-label-part="caption"
      className={cn(
        "m-0 font-normal text-[length:var(--text-xs)] leading-tight text-[var(--foreground-subtle,var(--foreground-muted))] opacity-75",
        className,
      )}
      {...props}
    />
  );
}
