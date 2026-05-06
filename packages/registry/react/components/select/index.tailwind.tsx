"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";


import { cn } from "@SH_UI_UTILS@";
export const Select = BaseSelect.Root;

export function SelectValue({ placeholder, className, ...props }: { placeholder?: string; className?: string } & Omit<
  React.ComponentPropsWithoutRef<typeof BaseSelect.Value>, "children"
>) {
  return (
    <BaseSelect.Value className={cn("flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap", className)} {...props}>
      {(value) =>
        value !== null && value !== undefined && value !== "" ? (
          (value as React.ReactNode)
        ) : (
          <span className="text-foreground-subtle">{placeholder}</span>
        )
      }
    </BaseSelect.Value>
  );
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger>, "className"> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-between gap-[var(--space-2)] min-w-40 h-[var(--control-md)] px-[var(--space-3)] bg-background text-foreground border border-border rounded-[var(--radius)] text-[length:var(--text-sm)] leading-none cursor-pointer transition-[border-color,background-color] duration-[var(--duration-fast)] select-none hover:not-disabled:border-border-strong focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 data-[popup-open]:border-border-strong disabled:opacity-[var(--opacity-disabled)] disabled:pointer-events-none",
      className,
    )}
    {...props}
  >
    {children}
    <BaseSelect.Icon
      className="inline-flex items-center justify-center text-foreground-muted shrink-0 transition-transform duration-[var(--duration-fast)] [[data-popup-open]_&]:rotate-180"
      aria-hidden
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Popup>, "className"> & {
    className?: string;
    container?: React.ComponentPropsWithoutRef<typeof BaseSelect.Portal>["container"];
  }
>(({ className, children, container, ...props }, ref) => (
  <BaseSelect.Portal container={container}>
    <BaseSelect.Positioner className="outline-none z-[var(--z-dropdown)]" sideOffset={4} align="start">
      <BaseSelect.Popup
        ref={ref}
        className={cn(
          "min-w-[var(--anchor-width,10rem)] max-h-[min(24rem,var(--available-height,24rem))] overflow-y-auto p-[var(--space-1)] bg-background text-foreground border border-border rounded-[var(--radius)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05)] text-[length:var(--text-sm)] origin-[var(--transform-origin)] animate-[sh-ui-select-in_140ms_ease-out] data-[ending-style]:animate-[sh-ui-select-out_100ms_ease-in_forwards] motion-reduce:animate-none motion-reduce:data-[ending-style]:animate-none",
          className,
        )}
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
    className={cn(
      "py-[var(--space-2)] px-[var(--space-2)] pb-[var(--space-1)] text-[length:var(--text-xs)] font-semibold text-foreground-muted uppercase tracking-[0.04em]",
      className,
    )}
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
    className={cn(
      "flex items-center gap-[var(--space-2)] py-2 px-3 rounded-[calc(var(--radius)-2px)] cursor-pointer outline-none select-none transition-colors duration-[80ms] data-[highlighted]:bg-background-muted hover:bg-background-muted data-[disabled]:opacity-[var(--opacity-disabled)] data-[disabled]:pointer-events-none",
      className,
    )}
    {...props}
  >
    <BaseSelect.ItemIndicator
      className="order-1 ml-auto inline-flex items-center justify-center text-foreground"
      aria-hidden
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </BaseSelect.ItemIndicator>
    <BaseSelect.ItemText className="flex-1">{children}</BaseSelect.ItemText>
  </BaseSelect.Item>
));
SelectItem.displayName = "SelectItem";

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Separator>, "className"> & { className?: string }
>(({ className, ...props }, ref) => (
  <BaseSelect.Separator
    ref={ref}
    className={cn("h-px bg-border my-[var(--space-1)]", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

/* MultiSelect — 동일 로직, 위 컴포넌트 재사용 */

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Root>;

type MultiSelectCtx = { values: string[]; remove: (value: string) => void; clear: () => void; };
const MultiSelectContext = React.createContext<MultiSelectCtx | null>(null);
export const useMultiSelect = () => {
  const ctx = React.useContext(MultiSelectContext);
  if (!ctx) throw new Error("useMultiSelect는 MultiSelect 하위에서만 사용할 수 있습니다.");
  return ctx;
};

export const MultiSelect = React.forwardRef<
  HTMLDivElement,
  Omit<BaseRootProps, "multiple" | "value" | "defaultValue" | "onValueChange"> & {
    value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void;
  }
>(({ value: valueProp, defaultValue, onValueChange, children, ...props }, _ref) => {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
  const values = isControlled ? valueProp! : internal;

  const commit = React.useCallback((next: string[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }, [isControlled, onValueChange]);

  const ctx = React.useMemo<MultiSelectCtx>(() => ({
    values,
    remove: (v) => commit(values.filter((x) => x !== v)),
    clear: () => commit([]),
  }), [values, commit]);

  return (
    <MultiSelectContext.Provider value={ctx}>
      <BaseSelect.Root multiple value={values} onValueChange={commit} {...props}>{children}</BaseSelect.Root>
    </MultiSelectContext.Provider>
  );
});
MultiSelect.displayName = "MultiSelect";

export function MultiSelectValue({
  placeholder, render, separator = ", ", className, ...props
}: {
  placeholder?: string;
  render?: (values: string[], handlers: { remove: (value: string) => void; clear: () => void }) => React.ReactNode;
  separator?: string; className?: string;
} & Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Value>, "children" | "render">) {
  const { remove, clear } = useMultiSelect();
  return (
    <BaseSelect.Value className={cn("flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap", className)} {...props}>
      {(value) => {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        if (arr.length === 0) return <span className="text-foreground-subtle">{placeholder}</span>;
        return render ? render(arr, { remove, clear }) : arr.join(separator);
      }}
    </BaseSelect.Value>
  );
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-select]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-select", "");
  style.textContent = `
@keyframes sh-ui-select-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes sh-ui-select-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.96); } }
  `;
  document.head.appendChild(style);
}
