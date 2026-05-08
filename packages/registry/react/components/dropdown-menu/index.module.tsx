"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import styles from "./styles.module.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


/* ───────── Root ───────── */

export const DropdownMenu = BaseMenu.Root;

/* ───────── Trigger ───────── */

/**
 * DropdownMenu 를 여는 트리거. 자체로 `<button>` 을 렌더 — 자식으로 또 다른
 * button (예: 커스텀 Button) 을 넣지 말 것. 다른 엘리먼트로 슬롯하려면 Base
 * UI 의 `render` prop:
 *
 *   <DropdownMenuTrigger render={<Button variant='ghost'>메뉴</Button>} />
 */
export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger>>
>(function DropdownMenuTrigger({ className, ...props }, ref) {
  return (
    <BaseMenu.Trigger
      ref={ref}
      className={cn(styles.dm__trigger, className)}
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
        className={styles.dm__positioner}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup
          ref={ref}
          className={cn(styles.dm__content, className)}
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
      className={cn(styles.dm__item, className)}
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
      className={cn(styles.dm__item, styles["dm__item--check"], className)}
      {...props}
    >
      <span className={styles["dm__item-indicator"]} aria-hidden>
        <BaseMenu.CheckboxItemIndicator>
          <CheckIcon />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <span className={styles["dm__item-text"]}>{children}</span>
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
      className={cn(styles.dm__item, styles["dm__item--check"], className)}
      {...props}
    >
      <span className={styles["dm__item-indicator"]} aria-hidden>
        <BaseMenu.RadioItemIndicator>
          <DotIcon />
        </BaseMenu.RadioItemIndicator>
      </span>
      <span className={styles["dm__item-text"]}>{children}</span>
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
      className={cn(styles.dm__group, className)}
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
      className={cn(styles.dm__label, className)}
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
      className={cn(styles.dm__separator, className)}
      {...props}
    />
  );
});

/* ───────── Submenu ───────── */

export const DropdownMenuSub = BaseMenu.SubmenuRoot;

/**
 * 서브메뉴 트리거. 부모 메뉴 항목으로 동작하며 hover/우향 화살표로 서브를
 * 연다. 다른 엘리먼트로 슬롯하려면 Base UI 의 `render` prop 사용.
 */
export const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>
  >
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      className={cn(styles.dm__item, styles["dm__sub-trigger"], className)}
      {...props}
    >
      <span className={styles["dm__item-text"]}>{children}</span>
      <span className={styles["dm__sub-arrow"]} aria-hidden>
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
