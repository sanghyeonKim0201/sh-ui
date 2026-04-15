import * as React from "react";
import "./styles.css";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    const classes = [
      "hyeon-button",
      `hyeon-button--${variant}`,
      `hyeon-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = "Button";
