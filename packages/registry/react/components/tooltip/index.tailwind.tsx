import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

export const TooltipProvider = BaseTooltip.Provider;
export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

export interface TooltipContentProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup>
  > {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  showArrow?: boolean;
  container?: React.ComponentPropsWithoutRef<
    typeof BaseTooltip.Portal
  >["container"];
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    { className, children, side, align, sideOffset = 6, showArrow, container, ...props },
    ref,
  ) {
    return (
      <BaseTooltip.Portal container={container}>
        <BaseTooltip.Positioner
          className="z-[var(--z-tooltip,var(--z-popover))] outline-none"
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BaseTooltip.Popup
            ref={ref}
            className={cx(
              "px-2.5 py-1.5 bg-foreground text-background rounded-[calc(var(--radius)-2px)] text-[length:var(--text-xs)] leading-snug max-w-xs shadow-[0_4px_12px_rgba(0,0,0,0.12)] origin-[var(--transform-origin)] outline-none transition-[opacity,transform] duration-[120ms] ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100",
              className,
            )}
            {...props}
          >
            {showArrow && <BaseTooltip.Arrow className="text-foreground [&_svg]:block" />}
            {children}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    );
  },
);
