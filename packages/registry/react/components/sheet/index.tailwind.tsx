import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export const Sheet = BaseDrawer.Root;
export const SheetTrigger = BaseDrawer.Trigger;
export const SheetClose = BaseDrawer.Close;

export function SheetCloseX({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <BaseDrawer.Close
      className={cn(
        "absolute top-3 right-3 inline-flex items-center justify-center w-[var(--control-sm)] h-[var(--control-sm)] bg-transparent text-foreground-muted border-none rounded-[var(--radius)] cursor-pointer text-xl leading-none transition-colors duration-[var(--duration-fast)] hover:bg-background-subtle hover:text-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2",
        className,
      )}
      aria-label="닫기"
      {...props}
    >
      {children ?? "×"}
    </BaseDrawer.Close>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-[var(--space-1)] mb-[var(--space-4)]", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex justify-end gap-[var(--space-2)] mt-[var(--space-6)]",
        className,
      )}
      {...props}
    />
  );
}

export interface SheetContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDrawer.Popup>> {
  side?: "right" | "left" | "top" | "bottom";
  container?: React.ComponentPropsWithoutRef<typeof BaseDrawer.Portal>["container"];
}

const SIDE_CLASSES: Record<NonNullable<SheetContentProps["side"]>, string> = {
  right:
    "top-0 right-0 h-[100dvh] w-[calc(100%-2rem)] max-w-md border-l border-border data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  left:
    "top-0 left-0 h-[100dvh] w-[calc(100%-2rem)] max-w-md border-r border-border data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  top:
    "top-0 left-0 right-0 w-screen max-h-[calc(100dvh-4rem)] border-b border-border data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
  bottom:
    "bottom-0 left-0 right-0 w-screen max-h-[calc(100dvh-4rem)] border-t border-border data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
};

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  function SheetContent({ className, children, side = "right", container, ...props }, ref) {
    return (
      <BaseDrawer.Portal container={container}>
        <BaseDrawer.Backdrop className="fixed inset-0 z-[var(--z-overlay)] bg-black/25 backdrop-blur-md transition-opacity duration-[var(--duration-slow)] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDrawer.Popup
          ref={ref}
          data-side={side}
          className={cn(
            "fixed z-[var(--z-modal)] flex flex-col p-[var(--space-6)] bg-background text-foreground shadow-[var(--shadow-xl)] outline-none overflow-y-auto transition-[opacity,transform] duration-[var(--duration-slow)] focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:[outline-offset:-2px] motion-reduce:transition-none motion-reduce:data-[starting-style]:transform-none motion-reduce:data-[ending-style]:transform-none",
            SIDE_CLASSES[side],
            className,
          )}
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
      className={cn(
        "m-0 text-[length:var(--text-lg)] font-semibold text-balance",
        className,
      )}
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
      className={cn(
        "m-0 text-foreground-muted text-[length:var(--text-sm)] leading-normal",
        className,
      )}
      {...props}
    />
  );
});
