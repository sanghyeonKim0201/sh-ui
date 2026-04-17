import * as React from "react";
import "./styles.css";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** 필수 필드 표시. true이면 ::after로 * 표시. Input에 required가 있으면 CSS :has()로 자동 감지되므로 보통 불필요. */
  isRequired?: boolean;
}

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, isRequired, ...props }, ref) => (
    <label
      ref={ref}
      className={cx("sh-ui-label", className)}
      data-required={isRequired || undefined}
      {...props}
    >
      {children}
    </label>
  ),
);
Label.displayName = "Label";

export function LabelTitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("sh-ui-label__title", className)} {...props} />;
}

export function LabelSubtitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("sh-ui-label__subtitle", className)} {...props} />;
}

export function LabelDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("sh-ui-label__description", className)} {...props} />;
}

export function LabelCaption({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("sh-ui-label__caption", className)} {...props} />;
}
