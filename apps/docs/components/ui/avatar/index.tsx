"use client";

import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import "./styles.css";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>
  > {
  /** 크기 변형. 기본 `md`. */
  size?: AvatarSize;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar({ className, size = "md", ...props }, ref) {
    return (
      <BaseAvatar.Root
        ref={ref}
        className={cx("sh-ui-avatar", `sh-ui-avatar--${size}`, className)}
        {...props}
      />
    );
  },
);

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseAvatar.Image>
  >
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <BaseAvatar.Image
      ref={ref}
      className={cx("sh-ui-avatar__image", className)}
      {...props}
    />
  );
});

export const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseAvatar.Fallback>
  >
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <BaseAvatar.Fallback
      ref={ref}
      className={cx("sh-ui-avatar__fallback", className)}
      {...props}
    />
  );
});
