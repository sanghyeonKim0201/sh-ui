import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

const avatarVariants = cva(
  "relative inline-flex items-center justify-center shrink-0 align-middle overflow-hidden rounded-full bg-background-muted text-foreground-muted font-medium select-none",
  {
    variants: {
      size: {
        sm: "w-7 h-7 text-[length:var(--text-xs)]",
        md: "w-10 h-10 text-[0.8125rem]",
        lg: "w-12 h-12 text-[length:var(--text-sm)]",
        xl: "w-16 h-16 text-[length:var(--text-base)]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;

export interface AvatarProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>
  > {
  size?: AvatarSize;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar({ className, size = "md", ...props }, ref) {
    return (
      <BaseAvatar.Root
        ref={ref}
        className={cx(avatarVariants({ size }), className)}
        {...props}
      />
    );
  },
);

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseAvatar.Image>>
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <BaseAvatar.Image
      ref={ref}
      className={cx("w-full h-full object-cover block", className)}
      {...props}
    />
  );
});

export const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseAvatar.Fallback>>
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <BaseAvatar.Fallback
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center w-full h-full uppercase tracking-[0.02em]",
        className,
      )}
      {...props}
    />
  );
});
