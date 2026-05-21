import * as React from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export interface ScrollAreaProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseScrollArea.Root>> {
  orientation?: "vertical" | "horizontal" | "both";
  viewportClassName?: string;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    { className, viewportClassName, children, orientation = "vertical", ...props },
    ref,
  ) {
    const showVertical = orientation === "vertical" || orientation === "both";
    const showHorizontal = orientation === "horizontal" || orientation === "both";

    return (
      <BaseScrollArea.Root className={cn("relative overflow-hidden", className)} {...props}>
        <BaseScrollArea.Viewport
          ref={ref}
          className={cn(
            "h-full w-full outline-none [overscroll-behavior:contain] focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:[outline-offset:-2px]",
            viewportClassName,
          )}
        >
          {children}
        </BaseScrollArea.Viewport>
        {showVertical && (
          <BaseScrollArea.Scrollbar
            orientation="vertical"
            className="flex w-2.5 touch-none select-none bg-transparent p-[2px] opacity-0 transition-opacity duration-150 hover:opacity-100 data-[hovering]:opacity-100 data-[scrolling]:opacity-100 motion-reduce:transition-none"
          >
            <BaseScrollArea.Thumb className="flex-1 rounded-full bg-border-strong transition-colors duration-100 hover:bg-foreground-muted [[data-scrolling]_&]:bg-foreground-muted motion-reduce:transition-none" />
          </BaseScrollArea.Scrollbar>
        )}
        {showHorizontal && (
          <BaseScrollArea.Scrollbar
            orientation="horizontal"
            className="flex h-2.5 flex-col touch-none select-none bg-transparent p-[2px] opacity-0 transition-opacity duration-150 hover:opacity-100 data-[hovering]:opacity-100 data-[scrolling]:opacity-100 motion-reduce:transition-none"
          >
            <BaseScrollArea.Thumb className="flex-1 rounded-full bg-border-strong transition-colors duration-100 hover:bg-foreground-muted [[data-scrolling]_&]:bg-foreground-muted motion-reduce:transition-none" />
          </BaseScrollArea.Scrollbar>
        )}
        {orientation === "both" && (
          <BaseScrollArea.Corner className="bg-transparent" />
        )}
      </BaseScrollArea.Root>
    );
  },
);
