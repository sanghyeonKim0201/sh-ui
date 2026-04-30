import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 border border-transparent rounded-full font-medium leading-none whitespace-nowrap align-middle select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-background-muted text-foreground border-border",
        success: "bg-[var(--success,#16a34a)] text-white",
        warning: "bg-[var(--warning,#d97706)] text-white",
        danger: "bg-danger text-[var(--danger-foreground,#fff)]",
        outline: "bg-transparent text-foreground border-border-strong",
      },
      size: {
        sm: "h-5 px-1.5 text-[0.6875rem]",
        md: "h-6 text-[length:var(--text-xs)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ className, variant = "primary", size = "md", ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cx(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
