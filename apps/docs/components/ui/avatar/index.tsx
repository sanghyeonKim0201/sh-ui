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

/**
 * 사용자/엔티티를 대표하는 원형 이미지. `Avatar` 안에 `AvatarImage`와
 * `AvatarFallback`을 함께 둬, 이미지 로드 실패 시 자동으로 fallback이 표시되도록 한다.
 */
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

/** Avatar 내부의 실제 이미지. 로드 실패 시 자동으로 가려지고 fallback이 노출된다. */
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

/** 이미지가 로드되지 않을 때 표시되는 대체 콘텐츠. 이니셜이나 아이콘을 권장. */
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
