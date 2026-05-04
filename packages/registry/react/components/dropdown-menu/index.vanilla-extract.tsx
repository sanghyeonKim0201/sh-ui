"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { byKey, dm__trigger, dm__positioner, dm__content, dm__item, dmItemText, dmItemCheck, dmItemIndicator, dm__group, dm__label, dm__separator, dmSubArrow, dmSubTrigger } from "./styles.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


/* ───────── Root ───────── */

export const DropdownMenu = BaseMenu.Root;

/* ───────── Trigger ───────── */

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger>>
>(function DropdownMenuTrigger({ className, ...props }, ref) {
  return (
    <BaseMenu.Trigger
      ref={ref}
      className={cn(dm__trigger, className)}
      {...props}
    />
  );
});

/* ───────── Content ─────────
 * Portal + Positioner + Popup을 한 컴포넌트로 묶는다. Popover와 동일한 관용.
 */

export interface DropdownMenuContentProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseMenu.Popup>
  > {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Trigger-Popup 간격(px). 기본 6. */
  sideOffset?: number;
  container?: React.ComponentPropsWithoutRef<
    typeof BaseMenu.Portal
  >["container"];
}

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(function DropdownMenuContent(
  { className, children, side, align, sideOffset = 6, container, ...props },
  ref,
) {
  return (
    <BaseMenu.Portal container={container}>
      <BaseMenu.Positioner
        className={dm__positioner}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup
          ref={ref}
          className={cn(dm__content, className)}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
});

/* ───────── Item ───────── */

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.Item>>
>(function DropdownMenuItem({ className, ...props }, ref) {
  return (
    <BaseMenu.Item
      ref={ref}
      className={cn(dm__item, className)}
      {...props}
    />
  );
});

/* ───────── CheckboxItem ───────── */

export interface DropdownMenuCheckboxItemProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>
  > {}

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <BaseMenu.CheckboxItem
      ref={ref}
      className={cn(dm__item, dmItemCheck, className)}
      {...props}
    >
      <span className={dmItemIndicator} aria-hidden>
        <BaseMenu.CheckboxItemIndicator>
          <CheckIcon />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <span className={dmItemText}>{children}</span>
    </BaseMenu.CheckboxItem>
  );
});

/* ───────── RadioGroup / RadioItem ───────── */

export const DropdownMenuRadioGroup = BaseMenu.RadioGroup;

export interface DropdownMenuRadioItemProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>
  > {}

export const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuRadioItemProps
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <BaseMenu.RadioItem
      ref={ref}
      className={cn(dm__item, dmItemCheck, className)}
      {...props}
    >
      <span className={dmItemIndicator} aria-hidden>
        <BaseMenu.RadioItemIndicator>
          <DotIcon />
        </BaseMenu.RadioItemIndicator>
      </span>
      <span className={dmItemText}>{children}</span>
    </BaseMenu.RadioItem>
  );
});

/* ───────── Group / Label ───────── */

export const DropdownMenuGroup = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.Group>>
>(function DropdownMenuGroup({ className, ...props }, ref) {
  return (
    <BaseMenu.Group
      ref={ref}
      className={cn(dm__group, className)}
      {...props}
    />
  );
});

export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>>
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return (
    <BaseMenu.GroupLabel
      ref={ref}
      className={cn(dm__label, className)}
      {...props}
    />
  );
});

/* ───────── Separator ─────────
 * Base UI Menu에 전용 Separator가 없어 role="separator" div로 대체.
 */

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn(dm__separator, className)}
      {...props}
    />
  );
});

/* ───────── Submenu ───────── */

export const DropdownMenuSub = BaseMenu.SubmenuRoot;

export const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>
  >
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      className={cn(dm__item, dmSubTrigger, className)}
      {...props}
    >
      <span className={dmItemText}>{children}</span>
      <span className={dmSubArrow} aria-hidden>
        <ChevronRightIcon />
      </span>
    </BaseMenu.SubmenuTrigger>
  );
});

/** Submenu 내용물 — 최상위 Content와 동일한 포털 구조. */
export const DropdownMenuSubContent = DropdownMenuContent;

/* ───────── 기본 아이콘 ───────── */

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden>
      <circle cx="4" cy="4" r="3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
