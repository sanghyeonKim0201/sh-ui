import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogCloseX({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <BaseDialog.Close
      className={cn(
        "absolute top-[var(--space-3)] right-[var(--space-3)] inline-flex items-center justify-center w-8 h-8 border-0 rounded-[calc(var(--radius)-2px)] bg-transparent text-foreground-muted text-[length:var(--text-lg)] leading-none cursor-pointer transition-[background-color,color] duration-[var(--duration-fast)] hover:bg-background-muted hover:text-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 motion-reduce:transition-none",
        className,
      )}
      aria-label="닫기"
      {...props}
    >
      {children ?? "×"}
    </BaseDialog.Close>
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-[var(--space-2)] pt-[var(--space-4)] border-t border-border mt-auto",
        className,
      )}
      {...props}
    />
  );
}

export interface DialogContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>> {
  container?: React.ComponentPropsWithoutRef<typeof BaseDialog.Portal>["container"];
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, container, ...props }, ref) {
    return (
      <BaseDialog.Portal container={container}>
        <BaseDialog.Backdrop className="fixed inset-0 z-[var(--z-overlay)] bg-black/25 backdrop-blur-md transition-opacity duration-[var(--duration-slow)] motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDialog.Popup
          ref={ref}
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[var(--z-modal)] flex flex-col w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-4rem)] p-[var(--space-6)] bg-background text-foreground border border-border rounded-[var(--radius)] shadow-[var(--shadow-xl)] outline-none overflow-y-auto transition-[opacity,transform] duration-[var(--duration-slow)] motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:translate-y-[calc(-50%+0.5rem)] data-[starting-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[ending-style]:translate-y-[calc(-50%+0.25rem)] data-[ending-style]:scale-[0.98] motion-reduce:data-[starting-style]:translate-y-[-50%] motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:translate-y-[-50%] motion-reduce:data-[ending-style]:scale-100 focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2",
            className,
          )}
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
      className={cn(
        "m-0 mb-[var(--space-1)] font-semibold text-[length:var(--text-lg)] leading-snug",
        className,
      )}
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
      className={cn(
        "m-0 mb-[var(--space-5)] text-foreground-muted text-[length:var(--text-sm)] leading-normal",
        className,
      )}
      {...props}
    />
  );
});
