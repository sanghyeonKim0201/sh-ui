import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverClose = BasePopover.Close;

export interface PopoverContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Popup>> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
  showArrow?: boolean;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    { className, children, side, align, sideOffset = 8, container, showArrow, ...props },
    ref,
  ) {
    return (
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner
          className="z-[var(--z-popover)] outline-none"
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BasePopover.Popup
            ref={ref}
            className={cn(
              "min-w-48 p-[var(--space-2)] bg-background text-foreground border border-border rounded-[var(--radius)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] outline-none text-[length:var(--text-sm)] leading-snug origin-[var(--transform-origin)] transition-[opacity,transform] duration-[140ms] ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100 focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2",
              className,
            )}
            {...props}
          >
            {showArrow && <BasePopover.Arrow className="text-background [&_svg]:block" />}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

export const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Title>>
>(function PopoverTitle({ className, ...props }, ref) {
  return (
    <BasePopover.Title
      ref={ref}
      className={cn("m-0 mb-[var(--space-1)] font-semibold text-[0.9375rem]", className)}
      {...props}
    />
  );
});

export const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Description>>
>(function PopoverDescription({ className, ...props }, ref) {
  return (
    <BasePopover.Description
      ref={ref}
      className={cn("m-0 text-foreground-muted text-[0.8125rem]", className)}
      {...props}
    />
  );
});
