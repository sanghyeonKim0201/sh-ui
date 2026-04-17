"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import "./styles.css";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

export const Dialog = BaseDialog.Root;

export const DialogTrigger = BaseDialog.Trigger;

export const DialogClose = BaseDialog.Close;

export function DialogCloseX({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <BaseDialog.Close
      className={cx("sh-ui-dialog__close", className)}
      aria-label="닫기"
      {...props}
    >
      {children ?? "×"}
    </BaseDialog.Close>
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("sh-ui-dialog__footer", className)} {...props} />;
}

export interface DialogContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>> {
  /** Portal이 마운트될 노드. 기본 body. */
  container?: React.ComponentPropsWithoutRef<typeof BaseDialog.Portal>["container"];
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, container, ...props }, ref) {
    return (
      <BaseDialog.Portal container={container}>
        <BaseDialog.Backdrop className="sh-ui-dialog__backdrop" />
        <BaseDialog.Popup
          ref={ref}
          className={cx("sh-ui-dialog__content", className)}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    );
  },
);

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDialog.Title>>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <BaseDialog.Title
      ref={ref}
      className={cx("sh-ui-dialog__title", className)}
      {...props}
    />
  );
});

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDialog.Description>>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <BaseDialog.Description
      ref={ref}
      className={cx("sh-ui-dialog__description", className)}
      {...props}
    />
  );
});
