import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import styles from "./styles.module.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

/**
 * 화면 가장자리에서 슬라이드 인 하는 side drawer 컨테이너.
 */
export const Sheet = BaseDrawer.Root;

export const SheetTrigger = BaseDrawer.Trigger;
export const SheetClose = BaseDrawer.Close;

/** 우상단에 배치되는 X 닫기 버튼. */
export function SheetCloseX({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <BaseDrawer.Close
      className={cn(styles["sheet__close"], className)}
      aria-label="닫기"
      {...props}
    >
      {children ?? "×"}
    </BaseDrawer.Close>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles["sheet__header"], className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles["sheet__footer"], className)} {...props} />;
}

export interface SheetContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDrawer.Popup>> {
  /**
   * Sheet 가 슬라이드 인 하는 방향.
   * @default "right"
   */
  side?: "right" | "left" | "top" | "bottom";
  container?: React.ComponentPropsWithoutRef<typeof BaseDrawer.Portal>["container"];
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  function SheetContent({ className, children, side = "right", container, ...props }, ref) {
    return (
      <BaseDrawer.Portal container={container}>
        <BaseDrawer.Backdrop className={styles["sheet__backdrop"]} />
        <BaseDrawer.Popup
          ref={ref}
          data-side={side}
          className={cn(styles["sheet__content"], className)}
          {...props}
        >
          {children}
        </BaseDrawer.Popup>
      </BaseDrawer.Portal>
    );
  },
);

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDrawer.Title>>
>(function SheetTitle({ className, ...props }, ref) {
  return (
    <BaseDrawer.Title
      ref={ref}
      className={cn(styles["sheet__title"], className)}
      {...props}
    />
  );
});

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDrawer.Description>>
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <BaseDrawer.Description
      ref={ref}
      className={cn(styles["sheet__description"], className)}
      {...props}
    />
  );
});
