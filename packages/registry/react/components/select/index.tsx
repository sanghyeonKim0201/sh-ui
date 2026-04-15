"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui-components/react/select";
import "./styles.css";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

export const Select = BaseSelect.Root;

/** shadcn 호환: <SelectValue placeholder="..." /> */
export function SelectValue({
  placeholder,
  className,
  ...props
}: { placeholder?: string; className?: string } & Omit<
  React.ComponentPropsWithoutRef<typeof BaseSelect.Value>,
  "children"
>) {
  return (
    <BaseSelect.Value className={cx("hyeon-select__value", className)} {...props}>
      {(value) =>
        value !== null && value !== undefined && value !== "" ? (
          (value as React.ReactNode)
        ) : (
          <span className="hyeon-select__placeholder">{placeholder}</span>
        )
      }
    </BaseSelect.Value>
  );
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Trigger
    ref={ref}
    className={cx("hyeon-select__trigger", className)}
    {...props}
  >
    {children}
    <BaseSelect.Icon className="hyeon-select__icon" aria-hidden>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

/** Portal + Positioner + Popup을 한 번에.
 *  container: portal이 마운트될 DOM 노드. 기본 body. 토큰 스코프 안에 띄우려면 해당 컨테이너 ref 전달. */
export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Popup> & {
    container?: React.ComponentPropsWithoutRef<typeof BaseSelect.Portal>["container"];
  }
>(({ className, children, container, ...props }, ref) => (
  <BaseSelect.Portal container={container}>
    <BaseSelect.Positioner
      className="hyeon-select__positioner"
      sideOffset={4}
      align="start"
    >
      <BaseSelect.Popup
        ref={ref}
        className={cx("hyeon-select__content", className)}
        {...props}
      >
        {children}
      </BaseSelect.Popup>
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectGroup = BaseSelect.Group;

export const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel>
>(({ className, ...props }, ref) => (
  <BaseSelect.GroupLabel
    ref={ref}
    className={cx("hyeon-select__label", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Item>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Item
    ref={ref}
    className={cx("hyeon-select__item", className)}
    {...props}
  >
    <BaseSelect.ItemIndicator className="hyeon-select__indicator" aria-hidden>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <path
          d="M3.5 8.5l3 3 6-7"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BaseSelect.ItemIndicator>
    <BaseSelect.ItemText className="hyeon-select__item-text">
      {children}
    </BaseSelect.ItemText>
  </BaseSelect.Item>
));
SelectItem.displayName = "SelectItem";

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Separator>
>(({ className, ...props }, ref) => (
  <BaseSelect.Separator
    ref={ref}
    className={cx("hyeon-select__separator", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

/* ───────── Multi-select ─────────
 *
 * Base UI Select의 `multiple` 모드를 얇게 래핑한 것.
 * Trigger/Content/Item/Group/Label/Separator는 그대로 재사용한다.
 */

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Root>;
export const MultiSelect = React.forwardRef<
  HTMLDivElement,
  Omit<BaseRootProps, "multiple" | "value" | "defaultValue" | "onValueChange"> & {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  }
>(({ ...props }, _ref) => {
  // @ts-expect-error — Base UI의 multiple 모드에서 value/onValueChange가 배열 타입
  return <BaseSelect.Root multiple {...props} />;
});
MultiSelect.displayName = "MultiSelect";

/**
 * 다중 선택 값 표시. 배열이 비면 placeholder, 있으면 join 또는 사용자 정의 renderer.
 *
 *   <MultiSelectValue placeholder="과일" />                       // "Apple, Banana"
 *   <MultiSelectValue placeholder="과일" render={(arr) => ...} /> // 커스텀 (칩 등)
 */
export function MultiSelectValue({
  placeholder,
  render,
  separator = ", ",
  className,
  ...props
}: {
  placeholder?: string;
  render?: (values: string[]) => React.ReactNode;
  separator?: string;
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<typeof BaseSelect.Value>,
  "children"
>) {
  return (
    <BaseSelect.Value className={cx("hyeon-select__value", className)} {...props}>
      {(value) => {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        if (arr.length === 0) {
          return <span className="hyeon-select__placeholder">{placeholder}</span>;
        }
        return render ? render(arr) : arr.join(separator);
      }}
    </BaseSelect.Value>
  );
}
