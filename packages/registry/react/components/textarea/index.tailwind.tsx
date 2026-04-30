import * as React from "react";

import { cn } from "@SH_UI_UTILS@";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}


export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "block w-full min-h-20 px-[var(--space-3)] py-[var(--space-2)] bg-background text-foreground border border-border rounded-[var(--radius)] font-[inherit] text-[length:var(--text-sm)] leading-normal resize-y transition-[border-color,box-shadow] duration-[var(--duration-fast)] placeholder:text-foreground-subtle hover:not-disabled:not-focus:border-border-strong focus:outline-none focus:border-foreground focus:shadow-[0_0_0_1px_var(--foreground)] disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed disabled:bg-background-subtle read-only:bg-background-subtle aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_1px_var(--danger)] [@media(hover:none)_and_(pointer:coarse)]:text-[length:var(--text-base)]",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
