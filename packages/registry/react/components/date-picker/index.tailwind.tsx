"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Calendar, type DateRange } from "../calendar";

import { cn } from "@SH_UI_UTILS@";
export type { DateRange };


const formatDefault = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const triggerClasses =
  "inline-flex items-center justify-between w-full h-[var(--control-md)] px-[var(--space-3)] bg-background text-foreground border border-border rounded-[var(--radius)] font-[inherit] text-[length:var(--text-sm)] leading-none cursor-pointer transition-[border-color,box-shadow] duration-[var(--duration-fast)] hover:not-disabled:border-border-strong focus-visible:outline-none focus-visible:border-foreground focus-visible:shadow-[0_0_0_1px_var(--foreground)] disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed disabled:bg-background-subtle aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:shadow-[0_0_0_1px_var(--danger)] [@media(hover:none)_and_(pointer:coarse)]:h-11 [@media(hover:none)_and_(pointer:coarse)]:text-[length:var(--text-base)]";

const popupClasses =
  "bg-background border border-border rounded-[var(--radius)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] outline-none p-[var(--space-3)] origin-[var(--transform-origin)] transition-[opacity,transform] duration-[140ms] ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 6.5h12M5.5 2v2M10.5 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface DatePickerContextValue {
  selected: Date | undefined;
  setSelected: (date: Date | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  focusedDate: Date;
  setFocusedDate: (date: Date) => void;
  formatDate: (date: Date) => string;
  placeholder: string;
  min?: Date; max?: Date; disabled?: boolean; readOnly?: boolean;
  ariaInvalid?: boolean | "true";
  closeOnSelect: boolean;
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(null);

function useDatePickerContext(component: string) {
  const ctx = React.useContext(DatePickerContext);
  if (!ctx) throw new Error(`${component}는 <DatePicker> 내부에서 사용해야 합니다.`);
  return ctx;
}

export interface DatePickerProps {
  value?: Date; defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  formatDate?: (date: Date) => string;
  min?: Date; max?: Date;
  placeholder?: string; disabled?: boolean; readOnly?: boolean;
  "aria-invalid"?: boolean | "true";
  className?: string; closeOnSelect?: boolean;
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
  children?: React.ReactNode;
}

export function DatePicker({
  value, defaultValue, onValueChange, formatDate = formatDefault,
  min, max, placeholder = "날짜 선택", disabled, readOnly,
  "aria-invalid": ariaInvalid, className, closeOnSelect = true, container, children,
}: DatePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
  const selected = isControlled ? value : internal;
  const [open, setOpen] = React.useState(false);
  const [focusedDate, setFocusedDate] = React.useState<Date>(() => selected ?? new Date());

  React.useEffect(() => {
    if (open && selected) setFocusedDate(startOfMonth(selected));
  }, [open, selected]);

  const setSelected = React.useCallback((date: Date | undefined) => {
    if (!isControlled) setInternal(date);
    onValueChange?.(date);
  }, [isControlled, onValueChange]);

  const ctx = React.useMemo<DatePickerContextValue>(
    () => ({
      selected, setSelected, open, setOpen, focusedDate, setFocusedDate,
      formatDate, placeholder, min, max, disabled, readOnly, ariaInvalid, closeOnSelect,
    }),
    [selected, setSelected, open, focusedDate, formatDate, placeholder, min, max, disabled, readOnly, ariaInvalid, closeOnSelect],
  );

  return (
    <DatePickerContext.Provider value={ctx}>
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        {children ?? (
          <>
            <DatePickerTrigger className={className} />
            <DatePickerContent container={container}><DatePickerCalendar /></DatePickerContent>
          </>
        )}
      </BasePopover.Root>
    </DatePickerContext.Provider>
  );
}

export interface DatePickerTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: React.ReactNode | ((state: {
    value: Date | undefined; formatted: string | undefined; placeholder: string;
  }) => React.ReactNode);
}

export const DatePickerTrigger = React.forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
  function DatePickerTrigger({ className, children, onClick, ...props }, ref) {
    const ctx = useDatePickerContext("DatePickerTrigger");
    const displayText = ctx.selected ? ctx.formatDate(ctx.selected) : undefined;
    const renderContent = () => {
      if (typeof children === "function") return children({ value: ctx.selected, formatted: displayText, placeholder: ctx.placeholder });
      if (children !== undefined) return children;
      return (
        <>
          <span className={cn("overflow-hidden text-ellipsis whitespace-nowrap", !displayText && "text-foreground-subtle")}>
            {displayText ?? ctx.placeholder}
          </span>
          <span className="shrink-0 inline-flex text-foreground-muted ml-[var(--space-2)]" aria-hidden>
            <CalendarIcon />
          </span>
        </>
      );
    };
    return (
      <BasePopover.Trigger
        ref={ref}
        className={cn(triggerClasses, className)}
        disabled={ctx.disabled}
        aria-invalid={ctx.ariaInvalid}
        aria-haspopup="dialog"
        onClick={(e) => { if (ctx.readOnly) e.preventDefault(); onClick?.(e); }}
        {...props}
      >
        {renderContent()}
      </BasePopover.Trigger>
    );
  },
);

export interface DatePickerContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BasePopover.Popup>, "className"> {
  className?: string;
  sideOffset?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["sideOffset"];
  side?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["side"];
  align?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["align"];
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
}

export const DatePickerContent = React.forwardRef<HTMLDivElement, DatePickerContentProps>(
  function DatePickerContent(
    { className, children, sideOffset = 4, side = "bottom", align = "start", container, ...props },
    ref,
  ) {
    const ctx = useDatePickerContext("DatePickerContent");
    if (ctx.disabled || ctx.readOnly) return null;
    return (
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner className="z-[var(--z-popover)] outline-none" sideOffset={sideOffset} side={side} align={align}>
          <BasePopover.Popup ref={ref} className={cn(popupClasses, className)} {...props}>
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

export function DatePickerCalendar() {
  const ctx = useDatePickerContext("DatePickerCalendar");
  const handleSelect = (date: Date | undefined) => {
    ctx.setSelected(date);
    if (date && ctx.closeOnSelect) ctx.setOpen(false);
  };
  return (
    <Calendar
      mode="single"
      value={ctx.selected}
      onValueChange={handleSelect}
      month={ctx.focusedDate}
      onMonthChange={ctx.setFocusedDate}
      min={ctx.min}
      max={ctx.max}
    />
  );
}

export interface DatePickerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const DatePickerFooter = React.forwardRef<HTMLDivElement, DatePickerFooterProps>(
  function DatePickerFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-end gap-[var(--space-2)] mt-[var(--space-2)] pt-[var(--space-2)] border-t border-border",
          className,
        )}
        {...props}
      />
    );
  },
);

export function useDatePicker() {
  const ctx = useDatePickerContext("useDatePicker");
  return {
    value: ctx.selected, setValue: ctx.setSelected,
    open: ctx.open, setOpen: ctx.setOpen,
    focusedDate: ctx.focusedDate, setFocusedDate: ctx.setFocusedDate,
  };
}

export interface DateRangePickerProps {
  value?: DateRange; defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  formatDate?: (date: Date) => string;
  min?: Date; max?: Date;
  placeholder?: string; disabled?: boolean; readOnly?: boolean;
  "aria-invalid"?: boolean | "true";
  className?: string;
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
}

export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    { value, defaultValue, onValueChange, formatDate = formatDefault, min, max,
      placeholder = "시작일 ~ 종료일", disabled, readOnly, "aria-invalid": ariaInvalid, className, container },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<DateRange | undefined>(defaultValue);
    const selected = isControlled ? value : internal;
    const [open, setOpen] = React.useState(false);
    const [calendarMonth, setCalendarMonth] = React.useState<Date>(() => selected?.from ?? new Date());

    React.useEffect(() => {
      if (open && selected?.from) setCalendarMonth(startOfMonth(selected.from));
    }, [open, selected?.from]);

    const handleRangeChange = (range: DateRange | undefined) => {
      if (!isControlled) setInternal(range);
      onValueChange?.(range);
      if (range) setOpen(false);
    };

    const displayText = selected ? `${formatDate(selected.from)} ~ ${formatDate(selected.to)}` : undefined;

    return (
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <BasePopover.Trigger
          ref={ref}
          className={cn(triggerClasses, className)}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-haspopup="dialog"
          onClick={(e) => { if (readOnly) e.preventDefault(); }}
        >
          <span className={cn("overflow-hidden text-ellipsis whitespace-nowrap", !displayText && "text-foreground-subtle")}>
            {displayText ?? placeholder}
          </span>
          <span className="shrink-0 inline-flex text-foreground-muted ml-[var(--space-2)]" aria-hidden>
            <CalendarIcon />
          </span>
        </BasePopover.Trigger>

        {!disabled && !readOnly && (
          <BasePopover.Portal container={container}>
            <BasePopover.Positioner className="z-[var(--z-popover)] outline-none" sideOffset={4} side="bottom" align="start">
              <BasePopover.Popup className={popupClasses}>
                <Calendar
                  mode="range"
                  value={selected}
                  onValueChange={handleRangeChange}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  min={min}
                  max={max}
                />
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        )}
      </BasePopover.Root>
    );
  },
);
