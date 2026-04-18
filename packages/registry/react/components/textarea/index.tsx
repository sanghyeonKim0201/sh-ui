"use client";

import * as React from "react";
import "./styles.css";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cx("sh-ui-textarea", className)}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
