"use client";

import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui-components/react/context-menu";
import "./styles.css";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

/* ───────── Root ───────── */

export const ContextMenu = BaseContextMenu.Root;

/* ───────── Trigger ─────────
 * 우클릭(또는 long-press)을 감지하는 wrapper. 기본은 투명, 사용자는
 * 자신의 영역(Card, 이미지 등)에 적용하여 감싼다.
 */

export const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Trigger>>
>(function ContextMenuTrigger({ className, ...props }, ref) {
  return (
    <BaseContextMenu.Trigger
      ref={ref}
      className={cx("sh-ui-cm__trigger", className)}
      {...props}
    />
  );
});

/* ───────── Content ───────── */

export interface ContextMenuContentProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.Popup>
  > {
  container?: React.ComponentPropsWithoutRef<
    typeof BaseContextMenu.Portal
  >["container"];
}

export const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  ContextMenuContentProps
>(function ContextMenuContent({ className, children, container, ...props }, ref) {
  return (
    <BaseContextMenu.Portal container={container}>
      <BaseContextMenu.Positioner className="sh-ui-cm__positioner">
        <BaseContextMenu.Popup
          ref={ref}
          className={cx("sh-ui-cm__content", className)}
          {...props}
        >
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  );
});

/* ───────── Item ───────── */

export const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Item>>
>(function ContextMenuItem({ className, ...props }, ref) {
  return (
    <BaseContextMenu.Item
      ref={ref}
      className={cx("sh-ui-cm__item", className)}
      {...props}
    />
  );
});

/* ───────── CheckboxItem / RadioItem ───────── */

export const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.CheckboxItem>
  >
>(function ContextMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.CheckboxItem
      ref={ref}
      className={cx("sh-ui-cm__item", "sh-ui-cm__item--check", className)}
      {...props}
    >
      <span className="sh-ui-cm__item-indicator" aria-hidden>
        <BaseContextMenu.CheckboxItemIndicator>
          <CheckIcon />
        </BaseContextMenu.CheckboxItemIndicator>
      </span>
      <span className="sh-ui-cm__item-text">{children}</span>
    </BaseContextMenu.CheckboxItem>
  );
});

export const ContextMenuRadioGroup = BaseContextMenu.RadioGroup;

export const ContextMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.RadioItem>
  >
>(function ContextMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.RadioItem
      ref={ref}
      className={cx("sh-ui-cm__item", "sh-ui-cm__item--check", className)}
      {...props}
    >
      <span className="sh-ui-cm__item-indicator" aria-hidden>
        <BaseContextMenu.RadioItemIndicator>
          <DotIcon />
        </BaseContextMenu.RadioItemIndicator>
      </span>
      <span className="sh-ui-cm__item-text">{children}</span>
    </BaseContextMenu.RadioItem>
  );
});

/* ───────── Group / Label / Separator ───────── */

export const ContextMenuGroup = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Group>>
>(function ContextMenuGroup({ className, ...props }, ref) {
  return (
    <BaseContextMenu.Group
      ref={ref}
      className={cx("sh-ui-cm__group", className)}
      {...props}
    />
  );
});

export const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.GroupLabel>
  >
>(function ContextMenuLabel({ className, ...props }, ref) {
  return (
    <BaseContextMenu.GroupLabel
      ref={ref}
      className={cx("sh-ui-cm__label", className)}
      {...props}
    />
  );
});

export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function ContextMenuSeparator({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cx("sh-ui-cm__separator", className)}
      {...props}
    />
  );
});

/* ───────── Submenu ───────── */

export const ContextMenuSub = BaseContextMenu.SubmenuRoot;

export const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.SubmenuTrigger>
  >
>(function ContextMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.SubmenuTrigger
      ref={ref}
      className={cx("sh-ui-cm__item", "sh-ui-cm__sub-trigger", className)}
      {...props}
    >
      <span className="sh-ui-cm__item-text">{children}</span>
      <span className="sh-ui-cm__sub-arrow" aria-hidden>
        <ChevronRightIcon />
      </span>
    </BaseContextMenu.SubmenuTrigger>
  );
});

export const ContextMenuSubContent = ContextMenuContent;

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
