"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import styles from "./styles.module.css";


import { cn } from "@SH_UI_UTILS@";
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
    <BaseSelect.Value className={cn(styles.select__value, className)} {...props}>
      {(value) =>
        value !== null && value !== undefined && value !== "" ? (
          (value as React.ReactNode)
        ) : (
          <span className={styles.select__placeholder}>{placeholder}</span>
        )
      }
    </BaseSelect.Value>
  );
}

/**
 * Select 트리거. 자체로 `<button>` 을 렌더 (chevron icon 포함) — 자식으로
 * 또 다른 button (예: 커스텀 Button) 을 넣지 말 것. 트리거를 다른 엘리먼트
 * 로 바꾸려면 Base UI 의 `render` prop:
 *
 *   <SelectTrigger render={<Button variant='secondary'>{...}</Button>} />
 */
export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger>, "className"> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Trigger
    ref={ref}
    className={cn(styles.select__trigger, className)}
    {...props}
  >
    {children}
    <BaseSelect.Icon className={styles.select__icon} aria-hidden>
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
  Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Popup>, "className"> & {
    className?: string;
    container?: React.ComponentPropsWithoutRef<typeof BaseSelect.Portal>["container"];
  }
>(({ className, children, container, ...props }, ref) => (
  <BaseSelect.Portal container={container}>
    <BaseSelect.Positioner
      className={styles.select__positioner}
      sideOffset={4}
      align="start"
    >
      <BaseSelect.Popup
        ref={ref}
        className={cn(styles.select__content, className)}
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
  Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel>, "className"> & { className?: string }
>(({ className, ...props }, ref) => (
  <BaseSelect.GroupLabel
    ref={ref}
    className={cn(styles.select__label, className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Item>, "className"> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Item
    ref={ref}
    className={cn(styles.select__item, className)}
    {...props}
  >
    <BaseSelect.ItemIndicator className={styles.select__indicator} aria-hidden>
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
    <BaseSelect.ItemText className={styles["select__item-text"]}>
      {children}
    </BaseSelect.ItemText>
  </BaseSelect.Item>
));
SelectItem.displayName = "SelectItem";

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Separator>, "className"> & { className?: string }
>(({ className, ...props }, ref) => (
  <BaseSelect.Separator
    ref={ref}
    className={cn(styles.select__separator, className)}
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

/** 칩 X 버튼 등에서 개별 항목을 제거할 수 있도록 MultiSelect 내부 상태를 expose한다. */
type MultiSelectCtx = {
  values: string[];
  remove: (value: string) => void;
  clear: () => void;
};
const MultiSelectContext = React.createContext<MultiSelectCtx | null>(null);
export const useMultiSelect = () => {
  const ctx = React.useContext(MultiSelectContext);
  if (!ctx) throw new Error("useMultiSelect는 MultiSelect 하위에서만 사용할 수 있습니다.");
  return ctx;
};

export const MultiSelect = React.forwardRef<
  HTMLDivElement,
  Omit<BaseRootProps, "multiple" | "value" | "defaultValue" | "onValueChange"> & {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  }
>(({ value: valueProp, defaultValue, onValueChange, children, ...props }, _ref) => {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
  const values = isControlled ? valueProp! : internal;

  const commit = React.useCallback(
    (next: string[]) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const ctx = React.useMemo<MultiSelectCtx>(
    () => ({
      values,
      remove: (v) => commit(values.filter((x) => x !== v)),
      clear: () => commit([]),
    }),
    [values, commit],
  );

  return (
    <MultiSelectContext.Provider value={ctx}>
      <BaseSelect.Root multiple value={values} onValueChange={commit} {...props}>
        {children}
      </BaseSelect.Root>
    </MultiSelectContext.Provider>
  );
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
  render?: (
    values: string[],
    handlers: { remove: (value: string) => void; clear: () => void },
  ) => React.ReactNode;
  separator?: string;
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<typeof BaseSelect.Value>,
  "children" | "render"
>) {
  const { remove, clear } = useMultiSelect();
  return (
    <BaseSelect.Value className={cn(styles.select__value, className)} {...props}>
      {(value) => {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        if (arr.length === 0) {
          return <span className={styles.select__placeholder}>{placeholder}</span>;
        }
        return render ? render(arr, { remove, clear }) : arr.join(separator);
      }}
    </BaseSelect.Value>
  );
}
