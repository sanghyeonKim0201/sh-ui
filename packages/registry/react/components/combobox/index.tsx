"use client";

import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import "./styles.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


/**
 * Select + Input의 결합 — 타이핑으로 목록이 자동 필터링된다.
 * Base UI Combobox를 래핑해 `items` 배열을 받으면 기본 필터가 `input` 값 기준으로 동작.
 *
 *   <Combobox items={fruits}>
 *     <ComboboxInput placeholder="과일 검색" />
 *     <ComboboxContent>
 *       <ComboboxList>
 *         {(item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
 *       </ComboboxList>
 *       <ComboboxEmpty>일치하는 항목 없음</ComboboxEmpty>
 *     </ComboboxContent>
 *   </Combobox>
 */
export const Combobox = BaseCombobox.Root;

export const ComboboxIcon = BaseCombobox.Icon;

/**
 * Combobox 토글 트리거. 자체로 `<button>` 을 렌더 — 자식으로 또 다른 button
 * (예: 커스텀 Button) 을 넣지 말 것. 다른 엘리먼트로 슬롯하려면 Base UI 의
 * `render` prop 사용.
 */
export const ComboboxTrigger = BaseCombobox.Trigger;

/**
 * 입력값 클리어 버튼. 자체로 `<button>` — 자식 button 중첩 금지. 다른
 * 엘리먼트 슬롯은 `render` prop.
 */
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
      className={cn("sh-ui-combobox__input", className)}
      {...props}
    />
  );
});

/** Portal + Positioner + Popup 래퍼. */
export const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.Popup>> & {
    container?: React.ComponentPropsWithoutRef<typeof BaseCombobox.Portal>["container"];
    sideOffset?: number;
  }
>(function ComboboxContent(
  { className, children, container, sideOffset = 4, ...props },
  ref,
) {
  return (
    <BaseCombobox.Portal container={container}>
      <BaseCombobox.Positioner
        className="sh-ui-combobox__positioner"
        sideOffset={sideOffset}
        align="start"
      >
        <BaseCombobox.Popup
          ref={ref}
          className={cn("sh-ui-combobox__content", className)}
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
      className={cn("sh-ui-combobox__item", className)}
      {...props}
    >
      <BaseCombobox.ItemIndicator className="sh-ui-combobox__item-indicator">
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
      <span className="sh-ui-combobox__item-text">{children}</span>
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
      className={cn("sh-ui-combobox__empty", className)}
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
      className={cn("sh-ui-combobox__group-label", className)}
      {...props}
    />
  );
});

/** 다중 선택 칩. */
export const ComboboxChip = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.Chip>>
>(function ComboboxChip({ className, ...props }, ref) {
  return (
    <BaseCombobox.Chip
      ref={ref}
      className={cn("sh-ui-combobox__chip", className)}
      {...props}
    />
  );
});

/** 칩 × 제거 버튼. */
export const ComboboxChipRemove = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseCombobox.ChipRemove>>
>(function ComboboxChipRemove({ className, children, ...props }, ref) {
  return (
    <BaseCombobox.ChipRemove
      ref={ref}
      className={cn("sh-ui-combobox__chip-remove", className)}
      {...props}
    >
      {children ?? "×"}
    </BaseCombobox.ChipRemove>
  );
});

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
