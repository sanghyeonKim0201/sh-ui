import * as React from "react";
import "./styles.css";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * 사용자 액션을 트리거하는 기본 버튼. variant로 시각적 위계(primary/secondary/ghost/danger/link)를,
 * size로 크기를 결정한다. 페이지 이동 목적이면 anchor를 감싼 `link` variant를 사용할 것.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    const classes = [
      "sh-ui-button",
      `sh-ui-button--${variant}`,
      `sh-ui-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = "Button";
