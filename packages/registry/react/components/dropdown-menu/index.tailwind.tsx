"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


const itemBase =
  "relative flex items-center gap-[var(--space-2)] py-2 px-3 rounded-[calc(var(--radius)-2px)] cursor-pointer outline-none select-none transition-colors duration-[80ms] data-[highlighted]:bg-background-muted hover:bg-background-muted data-[disabled]:opacity-[var(--opacity-disabled)] data-[disabled]:pointer-events-none motion-reduce:transition-none";
const itemCheck = "pl-7";

export const DropdownMenu = BaseMenu.Root;

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger>>
>(function DropdownMenuTrigger({ className, ...props }, ref) {
  return (
    <BaseMenu.Trigger
      ref={ref}
      className={cn(
        "font-[inherit] cursor-pointer focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
});

export interface DropdownMenuContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.Popup>> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  container?: React.ComponentPropsWithoutRef<typeof BaseMenu.Portal>["container"];
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(
    { className, children, side, align, sideOffset = 6, container, ...props },
    ref,
  ) {
    return (
      <BaseMenu.Portal container={container}>
        <BaseMenu.Positioner
          className="outline-none z-[var(--z-dropdown)]"
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BaseMenu.Popup
            ref={ref}
            className={cn(
              "min-w-40 max-h-[min(24rem,var(--available-height,24rem))] overflow-y-auto p-[var(--space-1)] bg-background text-foreground border border-border rounded-[var(--radius)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05)] text-[length:var(--text-sm)] origin-[var(--transform-origin)] animate-[sh-ui-dm-in_140ms_ease-out] data-[ending-style]:animate-[sh-ui-dm-out_100ms_ease-in_forwards] outline-none motion-reduce:animate-none motion-reduce:data-[ending-style]:animate-none",
              className,
            )}
            {...props}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    );
  },
);

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.Item>>
>(function DropdownMenuItem({ className, ...props }, ref) {
  return <BaseMenu.Item ref={ref} className={cn(itemBase, className)} {...props} />;
});

export interface DropdownMenuCheckboxItemProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>> {}

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <BaseMenu.CheckboxItem ref={ref} className={cn(itemBase, itemCheck, className)} {...props}>
      <span className="absolute left-2 inline-flex items-center justify-center w-4 h-4 text-foreground" aria-hidden>
        <BaseMenu.CheckboxItemIndicator>
          <CheckIcon />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
    </BaseMenu.CheckboxItem>
  );
});

export const DropdownMenuRadioGroup = BaseMenu.RadioGroup;

export interface DropdownMenuRadioItemProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>> {}

export const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuRadioItemProps
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <BaseMenu.RadioItem ref={ref} className={cn(itemBase, itemCheck, className)} {...props}>
      <span className="absolute left-2 inline-flex items-center justify-center w-4 h-4 text-foreground" aria-hidden>
        <BaseMenu.RadioItemIndicator>
          <DotIcon />
        </BaseMenu.RadioItemIndicator>
      </span>
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
    </BaseMenu.RadioItem>
  );
});

export const DropdownMenuGroup = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.Group>>
>(function DropdownMenuGroup({ className, ...props }, ref) {
  return <BaseMenu.Group ref={ref} className={cn("p-0", className)} {...props} />;
});

export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>>
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return (
    <BaseMenu.GroupLabel
      ref={ref}
      className={cn(
        "py-[var(--space-2)] px-[var(--space-2)] pb-[var(--space-1)] text-[length:var(--text-xs)] font-semibold text-foreground-muted uppercase tracking-[0.04em]",
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn("h-px bg-border my-[var(--space-1)]", className)}
        {...props}
      />
    );
  },
);

export const DropdownMenuSub = BaseMenu.SubmenuRoot;

export const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>>
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      className={cn(itemBase, "data-[popup-open]:bg-background-muted", className)}
      {...props}
    >
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
      <span className="inline-flex items-center justify-center ml-auto text-foreground-muted" aria-hidden>
        <ChevronRightIcon />
      </span>
    </BaseMenu.SubmenuTrigger>
  );
});

export const DropdownMenuSubContent = DropdownMenuContent;

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotIcon() {
  return <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden><circle cx="4" cy="4" r="3" /></svg>;
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-dm]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-dm", "");
  style.textContent = `
@keyframes sh-ui-dm-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes sh-ui-dm-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.96); } }
  `;
  document.head.appendChild(style);
}
