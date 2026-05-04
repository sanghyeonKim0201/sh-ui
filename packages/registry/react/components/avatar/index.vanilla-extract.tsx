import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { byKey, avatar, avatarSm, avatarMd, avatarLg, avatarXl, avatar__image, avatar__fallback } from "./styles.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>
  > {
  /**
   * 크기.
   * - `sm` (24px) — 댓글·리스트 행
   * - `md` (32px) — 일반 (기본)
   * - `lg` (40px) — 헤더·프로필 카드
   * - `xl` (56px) — 프로필 페이지
   *
   * @default "md"
   */
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
        className={cn(avatar, byKey[`avatar--${size}`], className)}
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
      className={cn(avatar__image, className)}
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
      className={cn(avatar__fallback, className)}
      {...props}
    />
  );
});
