"use client";

import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


export const Combobox = BaseCombobox.Root;
export const ComboboxIcon = BaseCombobox.Icon;
export const ComboboxTrigger = BaseCombobox.Trigger;
export const ComboboxClear = BaseCombobox.Clear;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxGroup = BaseCombobox.Group;
export const ComboboxChips = BaseCombobox.Chips;

export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.Input>>
>(function ComboboxInput({ className, ...props }, ref) {
  return (
    <BaseCombobox.Input
      ref={ref}
      className={cn(
        "inline-flex w-full min-w-40 h-[var(--control-md)] px-[var(--space-3)] bg-background text-foreground border border-border rounded-[var(--radius)] text-[length:var(--text-sm)] leading-none outline-none transition-[border-color] duration-[var(--duration-fast)] placeholder:text-foreground-subtle hover:not-disabled:border-border-strong focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-[var(--opacity-disabled)] disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
});

export const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.Popup>> & {
    container?: React.ComponentPropsWithoutRef<typeof BaseCombobox.Portal>["container"];
    sideOffset?: number;
  }
>(function ComboboxContent({ className, children, container, sideOffset = 4, ...props }, ref) {
  return (
    <BaseCombobox.Portal container={container}>
      <BaseCombobox.Positioner
        className="z-[var(--z-dropdown)] outline-none w-[var(--anchor-width)]"
        sideOffset={sideOffset}
        align="start"
      >
        <BaseCombobox.Popup
          ref={ref}
          className={cn(
            "max-h-[min(20rem,var(--available-height))] overflow-y-auto p-[var(--space-1)] bg-background text-foreground border border-border rounded-[var(--radius)] shadow-[0_8px_24px_rgba(0,0,0,0.08)] outline-none origin-[var(--transform-origin)] transition-[opacity,transform] duration-[140ms] ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.97]",
            className,
          )}
          {...props}
        >
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
});

export const ComboboxList = BaseCombobox.List;

export const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.Item>>
>(function ComboboxItem({ className, children, ...props }, ref) {
  return (
    <BaseCombobox.Item
      ref={ref}
      className={cn(
        "flex items-center gap-[var(--space-2)] py-1.5 px-3 text-[length:var(--text-sm)] leading-snug rounded-[calc(var(--radius)-2px)] cursor-pointer select-none outline-none data-[highlighted]:bg-background-muted hover:bg-background-muted data-[selected]:text-foreground data-[selected]:font-medium data-[disabled]:opacity-[var(--opacity-disabled)] data-[disabled]:pointer-events-none",
        className,
      )}
      {...props}
    >
      <BaseCombobox.ItemIndicator className="order-1 ml-auto inline-flex items-center justify-center text-foreground">
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
    </BaseCombobox.Item>
  );
});

export const ComboboxEmpty = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.Empty>>
>(function ComboboxEmpty({ className, ...props }, ref) {
  return (
    <BaseCombobox.Empty
      ref={ref}
      className={cn(
        "py-[var(--space-3)] px-[var(--space-2)] text-center text-[0.8125rem] text-foreground-muted",
        className,
      )}
      {...props}
    />
  );
});

export const ComboboxGroupLabel = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.GroupLabel>>
>(function ComboboxGroupLabel({ className, ...props }, ref) {
  return (
    <BaseCombobox.GroupLabel
      ref={ref}
      className={cn(
        "py-1.5 px-[var(--space-2)] pb-[var(--space-1)] text-[length:var(--text-xs)] font-semibold text-foreground-muted uppercase tracking-[0.04em]",
        className,
      )}
      {...props}
    />
  );
});

export const ComboboxChip = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.Chip>>
>(function ComboboxChip({ className, ...props }, ref) {
  return (
    <BaseCombobox.Chip
      ref={ref}
      className={cn(
        "inline-flex items-center gap-[var(--space-1)] py-0.5 pr-1.5 pl-[var(--space-2)] mr-[var(--space-1)] text-[length:var(--text-xs)] leading-5 bg-background-muted rounded-[calc(var(--radius)-2px)] whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
});

export const ComboboxChipRemove = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.ChipRemove>>
>(function ComboboxChipRemove({ className, children, ...props }, ref) {
  return (
    <BaseCombobox.ChipRemove
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 p-0 border-0 rounded-full bg-transparent text-foreground-muted text-[length:var(--text-sm)] leading-none cursor-pointer transition-[background-color,color] duration-[var(--duration-fast)] hover:bg-background hover:text-foreground motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children ?? "×"}
    </BaseCombobox.ChipRemove>
  );
});

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
