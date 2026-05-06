"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";


import { cn } from "@SH_UI_UTILS@";

/** 미지정 시의 기본 로케일. 기존 동작(한국어) 보존. */
export const DEFAULT_LOCALE = "ko-KR";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const formatIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function deriveWeekdayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2017, 0, 1 + i)));
}
function deriveMonthLabel(locale: string) {
  const fmt = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" });
  return (year: number, month: number) => fmt.format(new Date(year, month, 1));
}
function deriveYearLabel(locale: string) {
  const fmt = new Intl.DateTimeFormat(locale, { year: "numeric" });
  return (y: number) => fmt.format(new Date(y, 0, 1));
}
function deriveMonthSelectLabel(locale: string) {
  const fmt = new Intl.DateTimeFormat(locale, { month: "long" });
  return (m: number) => fmt.format(new Date(2017, m, 1));
}

export interface CalendarMessages {
  prevYear?: string;
  nextYear?: string;
  prevMonth?: string;
  nextMonth?: string;
  yearSelectLabel?: string;
  monthSelectLabel?: string;
}

const MESSAGES_KO: Required<CalendarMessages> = {
  prevYear: "이전 해",
  nextYear: "다음 해",
  prevMonth: "이전 달",
  nextMonth: "다음 달",
  yearSelectLabel: "연도",
  monthSelectLabel: "월",
};
const MESSAGES_EN: Required<CalendarMessages> = {
  prevYear: "Previous year",
  nextYear: "Next year",
  prevMonth: "Previous month",
  nextMonth: "Next month",
  yearSelectLabel: "Year",
  monthSelectLabel: "Month",
};
function defaultMessagesFor(locale: string): Required<CalendarMessages> {
  const lang = locale.toLowerCase().split(/[-_]/)[0];
  return lang === "ko" ? MESSAGES_KO : MESSAGES_EN;
}

function getDaysGrid(year: number, month: number, weekStartsOn: 0 | 1) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: { date: Date; current: boolean }[] = [];
  for (let i = startDay - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, prevDays - i), current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), current: true });
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) cells.push({ date: new Date(year, month + 1, d), current: false });
  }
  return cells;
}

function rotateWeekdays(labels: readonly string[], weekStartsOn: 0 | 1): string[] {
  if (weekStartsOn === 0) return [...labels];
  return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
}

export interface DateRange { from: Date; to: Date; }
export type CalendarMode = "single" | "multiple" | "range";

interface CalendarCommonProps {
  month?: Date; defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  min?: Date; max?: Date;
  disabled?: (date: Date) => boolean;
  showOutsideDays?: boolean;
  weekStartsOn?: 0 | 1;
  weekdayLabels?: readonly string[];
  formatMonthLabel?: (year: number, month: number) => string;
  /** BCP47 로케일. @default "ko-KR" */
  locale?: string;
  /** Nav/select aria-label override. */
  messages?: CalendarMessages;
  fromYear?: number; toYear?: number;
  className?: string;
  "aria-label"?: string;
  children?: React.ReactNode;
}

export type CalendarSingleProps = CalendarCommonProps & {
  mode?: "single"; value?: Date; defaultValue?: Date; onValueChange?: (date: Date | undefined) => void;
};
export type CalendarMultipleProps = CalendarCommonProps & {
  mode: "multiple"; value?: Date[]; defaultValue?: Date[]; onValueChange?: (dates: Date[]) => void;
};
export type CalendarRangeProps = CalendarCommonProps & {
  mode: "range"; value?: DateRange; defaultValue?: DateRange; onValueChange?: (range: DateRange | undefined) => void;
};
export type CalendarProps = CalendarSingleProps | CalendarMultipleProps | CalendarRangeProps;

function ChevronLeftIcon() {
  return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden><path d="M10 3 5.5 8 10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChevronRightIcon() {
  return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden><path d="M6 3 10.5 8 6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChevronDoubleLeftIcon() {
  return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden><path d="M8 3 3.5 8 8 13M13 3 8.5 8 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChevronDoubleRightIcon() {
  return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden><path d="M3 3 7.5 8 3 13M8 3 12.5 8 8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

interface CalendarContextValue {
  visibleMonth: Date;
  monthIndex: number;
  monthsLength: number;
  yearOptions: number[];
  setYearForVisible: (y: number) => void;
  setMonthForVisible: (m: number) => void;
  prevMonth: () => void; nextMonth: () => void;
  prevYear: () => void; nextYear: () => void;
  weekStartsOn: 0 | 1;
  weekdayLabels: string[];
  showOutsideDays: boolean;
  formatMonthLabel: (year: number, month: number) => string;
  defaultFormatYear: (y: number) => string;
  defaultFormatMonth: (m: number) => string;
  messages: Required<CalendarMessages>;
  ariaLabel?: string;
  isSelected: (date: Date) => boolean;
  isInRange: (date: Date) => { inRange: boolean; isStart: boolean; isEnd: boolean };
  isDisabled: (date: Date) => boolean;
  handleSelect: (date: Date) => void;
  setHoverDate: (date: Date | undefined) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isFirstMonth: boolean;
  isLastMonth: boolean;
}

const CalendarContext = React.createContext<CalendarContextValue | null>(null);

function useCalendarContext(component: string) {
  const ctx = React.useContext(CalendarContext);
  if (!ctx) throw new Error(`${component}는 <Calendar> 내부에서 사용해야 합니다.`);
  return ctx;
}

export function Calendar(props: CalendarProps) {
  const {
    mode = "single", month: monthProp, defaultMonth, onMonthChange,
    numberOfMonths: numberOfMonthsProp = 1,
    min, max, disabled, showOutsideDays = true, weekStartsOn = 0,
    weekdayLabels: weekdayLabelsProp,
    formatMonthLabel: formatMonthLabelProp,
    locale = DEFAULT_LOCALE,
    messages: messagesProp,
    fromYear, toYear, className, "aria-label": ariaLabel, children,
  } = props as CalendarCommonProps & { mode?: CalendarMode };

  const numberOfMonths = children ? 1 : Math.max(1, numberOfMonthsProp);

  const isControlled = "value" in props && props.value !== undefined;
  const [internalSingle, setInternalSingle] = React.useState<Date | undefined>(
    mode === "single" ? (props as CalendarSingleProps).defaultValue : undefined,
  );
  const [internalMultiple, setInternalMultiple] = React.useState<Date[]>(
    mode === "multiple" ? (props as CalendarMultipleProps).defaultValue ?? [] : [],
  );
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>(
    mode === "range" ? (props as CalendarRangeProps).defaultValue : undefined,
  );

  const singleValue = isControlled ? (props as CalendarSingleProps).value : internalSingle;
  const multipleValue = isControlled ? (props as CalendarMultipleProps).value ?? [] : internalMultiple;
  const rangeValue = isControlled ? (props as CalendarRangeProps).value : internalRange;

  const [picking, setPicking] = React.useState<Date | undefined>(undefined);
  const [hoverDate, setHoverDate] = React.useState<Date | undefined>(undefined);

  const monthControlled = monthProp !== undefined;
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => {
    if (defaultMonth) return startOfMonth(defaultMonth);
    if (mode === "single" && singleValue) return startOfMonth(singleValue);
    if (mode === "multiple" && multipleValue.length > 0) return startOfMonth(multipleValue[0]);
    if (mode === "range" && rangeValue?.from) return startOfMonth(rangeValue.from);
    return startOfMonth(new Date());
  });
  const currentMonth = monthControlled ? startOfMonth(monthProp!) : internalMonth;

  const setMonth = React.useCallback((next: Date) => {
    const normalized = startOfMonth(next);
    if (!monthControlled) setInternalMonth(normalized);
    onMonthChange?.(normalized);
  }, [monthControlled, onMonthChange]);

  const [focusedDate, setFocusedDate] = React.useState<Date>(() => {
    if (mode === "single" && singleValue) return singleValue;
    if (mode === "range" && rangeValue?.from) return rangeValue.from;
    return new Date();
  });

  const localeWeekdays = React.useMemo(() => deriveWeekdayLabels(locale), [locale]);
  const localeMonthLabel = React.useMemo(() => deriveMonthLabel(locale), [locale]);
  const localeYearLabel = React.useMemo(() => deriveYearLabel(locale), [locale]);
  const localeMonthSelectLabel = React.useMemo(() => deriveMonthSelectLabel(locale), [locale]);
  const resolvedMessages = React.useMemo<Required<CalendarMessages>>(
    () => ({ ...defaultMessagesFor(locale), ...messagesProp }),
    [locale, messagesProp],
  );

  const weekdayLabels = React.useMemo(() => {
    const base = weekdayLabelsProp ?? localeWeekdays;
    return rotateWeekdays(base, weekStartsOn);
  }, [weekdayLabelsProp, localeWeekdays, weekStartsOn]);

  const formatMonthLabel = formatMonthLabelProp ?? localeMonthLabel;

  const nowYear = new Date().getFullYear();
  const resolvedFromYear = fromYear ?? min?.getFullYear() ?? nowYear - 10;
  const resolvedToYear = toYear ?? max?.getFullYear() ?? nowYear + 10;
  const yearOptions = React.useMemo(() => {
    const out: number[] = [];
    const start = Math.min(resolvedFromYear, resolvedToYear);
    const end = Math.max(resolvedFromYear, resolvedToYear);
    for (let y = start; y <= end; y++) out.push(y);
    return out;
  }, [resolvedFromYear, resolvedToYear]);

  const isDateDisabled = React.useCallback((date: Date) => {
    const d = toDateOnly(date);
    if (min && d < toDateOnly(min)) return true;
    if (max && d > toDateOnly(max)) return true;
    if (disabled?.(date)) return true;
    return false;
  }, [min, max, disabled]);

  const isDateSelected = React.useCallback((date: Date) => {
    if (mode === "single") return !!singleValue && isSameDay(date, singleValue);
    if (mode === "multiple") return multipleValue.some((d) => isSameDay(d, date));
    if (mode === "range") {
      if (picking) return isSameDay(date, picking);
      if (rangeValue?.from && isSameDay(date, rangeValue.from)) return true;
      if (rangeValue?.to && isSameDay(date, rangeValue.to)) return true;
      return false;
    }
    return false;
  }, [mode, singleValue, multipleValue, rangeValue, picking]);

  const getRangeState = React.useCallback((date: Date) => {
    if (mode !== "range") return { inRange: false, isStart: false, isEnd: false };
    const from = picking ?? rangeValue?.from;
    if (!from) return { inRange: false, isStart: false, isEnd: false };
    const to = picking ? hoverDate : rangeValue?.to;
    if (!to) return { inRange: false, isStart: isSameDay(date, from), isEnd: false };
    const [rStart, rEnd] = from <= to ? [from, to] : [to, from];
    const s = toDateOnly(rStart);
    const e = toDateOnly(rEnd);
    const d = toDateOnly(date);
    return { inRange: d >= s && d <= e, isStart: isSameDay(d, s), isEnd: isSameDay(d, e) };
  }, [mode, picking, hoverDate, rangeValue]);

  const handleSelect = React.useCallback((date: Date) => {
    if (mode === "single") {
      if (!isControlled) setInternalSingle(date);
      (props as CalendarSingleProps).onValueChange?.(date);
      return;
    }
    if (mode === "multiple") {
      const exists = multipleValue.some((d) => isSameDay(d, date));
      const next = exists ? multipleValue.filter((d) => !isSameDay(d, date)) : [...multipleValue, date];
      if (!isControlled) setInternalMultiple(next);
      (props as CalendarMultipleProps).onValueChange?.(next);
      return;
    }
    if (mode === "range") {
      if (!picking) { setPicking(date); return; }
      const [from, to] = picking <= date ? [picking, date] : [date, picking];
      const range: DateRange = { from, to };
      setPicking(undefined); setHoverDate(undefined);
      if (!isControlled) setInternalRange(range);
      (props as CalendarRangeProps).onValueChange?.(range);
    }
  }, [mode, isControlled, multipleValue, picking, props]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    let next: Date | null = null;
    const cursor = focusedDate;
    switch (e.key) {
      case "ArrowLeft": next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1); break;
      case "ArrowRight": next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1); break;
      case "ArrowUp": next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 7); break;
      case "ArrowDown": next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7); break;
      case "PageUp": next = new Date(cursor.getFullYear(), cursor.getMonth() - 1, cursor.getDate()); break;
      case "PageDown": next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate()); break;
      case "Home": next = new Date(cursor.getFullYear(), cursor.getMonth(), 1); break;
      case "End": next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0); break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isDateDisabled(cursor)) handleSelect(cursor);
        return;
      default: return;
    }
    e.preventDefault();
    if (!next || isDateDisabled(next)) return;
    setFocusedDate(next);
    const visibleEnd = addMonths(currentMonth, numberOfMonths - 1);
    if (next < currentMonth) setMonth(addMonths(currentMonth, -1));
    else if (next > new Date(visibleEnd.getFullYear(), visibleEnd.getMonth() + 1, 0)) setMonth(addMonths(currentMonth, 1));
  }, [focusedDate, isDateDisabled, handleSelect, currentMonth, numberOfMonths, setMonth]);

  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(currentMonth, i));

  const buildMonthContext = (visibleMonth: Date, idx: number): CalendarContextValue => ({
    visibleMonth, monthIndex: idx, monthsLength: numberOfMonths, yearOptions,
    setYearForVisible: (y) => {
      const yearDiff = y - visibleMonth.getFullYear();
      setMonth(new Date(currentMonth.getFullYear() + yearDiff, currentMonth.getMonth(), 1));
    },
    setMonthForVisible: (m) => setMonth(addMonths(currentMonth, m - visibleMonth.getMonth())),
    prevMonth: () => setMonth(addMonths(currentMonth, -1)),
    nextMonth: () => setMonth(addMonths(currentMonth, 1)),
    prevYear: () => setMonth(addMonths(currentMonth, -12)),
    nextYear: () => setMonth(addMonths(currentMonth, 12)),
    weekStartsOn, weekdayLabels, showOutsideDays, formatMonthLabel,
    defaultFormatYear: localeYearLabel,
    defaultFormatMonth: localeMonthSelectLabel,
    messages: resolvedMessages,
    ariaLabel,
    isSelected: isDateSelected, isInRange: getRangeState, isDisabled: isDateDisabled,
    handleSelect,
    setHoverDate: mode === "range" ? setHoverDate : () => {},
    onKeyDown: handleKeyDown,
    isFirstMonth: idx === 0, isLastMonth: idx === numberOfMonths - 1,
  });

  return (
    <div
      className={cn("inline-flex gap-[var(--space-4)] select-none", numberOfMonths > 1 && "flex-wrap", className)}
      aria-label={ariaLabel}
    >
      {children
        ? <CalendarContext.Provider value={buildMonthContext(months[0], 0)}>{children}</CalendarContext.Provider>
        : months.map((m, idx) => (
          <CalendarContext.Provider key={`${m.getFullYear()}-${m.getMonth()}`} value={buildMonthContext(m, idx)}>
            <div className="w-[17.5rem]">
              <CalendarHeader>
                {idx === 0 ? <CalendarPrevYearButton /> : <CalendarNavPlaceholder />}
                {idx === 0 ? <CalendarPrevMonthButton /> : <CalendarNavPlaceholder />}
                <div className="inline-flex items-center gap-[var(--space-1)] flex-1 justify-center">
                  <CalendarYearSelect />
                  <CalendarMonthSelect />
                </div>
                {idx === months.length - 1 ? <CalendarNextMonthButton /> : <CalendarNavPlaceholder />}
                {idx === months.length - 1 ? <CalendarNextYearButton /> : <CalendarNavPlaceholder />}
              </CalendarHeader>
              <CalendarGrid />
            </div>
          </CalendarContext.Provider>
        ))}
    </div>
  );
}

export interface CalendarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CalendarHeader = React.forwardRef<HTMLDivElement, CalendarHeaderProps>(
  function CalendarHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn("flex items-center justify-between gap-[var(--space-1)] mb-[var(--space-2)]", className)} {...props} />;
  },
);

const navButtonClasses =
  "inline-flex items-center justify-center w-7 h-7 p-0 border-none rounded-[calc(var(--radius)-2px)] bg-transparent text-foreground-muted cursor-pointer shrink-0 transition-[background-color,color] duration-[var(--duration-fast)] hover:not-disabled:bg-background-muted hover:not-disabled:text-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 motion-reduce:transition-none";

function CalendarNavPlaceholder() {
  return <span className={cn(navButtonClasses, "invisible pointer-events-none")} aria-hidden />;
}

export interface CalendarNavButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: React.ReactNode;
}

function makeNavButton(
  displayName: string,
  defaultIcon: React.ReactNode,
  resolveDefaultLabel: (ctx: CalendarContextValue) => string,
  resolveHandler: (ctx: CalendarContextValue) => () => void,
) {
  const Component = React.forwardRef<HTMLButtonElement, CalendarNavButtonProps>(
    function NavButton({ className, children, "aria-label": ariaLabel, onClick, ...props }, ref) {
      const ctx = useCalendarContext(displayName);
      return (
        <button
          ref={ref}
          type="button"
          className={cn(navButtonClasses, className)}
          aria-label={ariaLabel ?? resolveDefaultLabel(ctx)}
          onClick={(e) => { resolveHandler(ctx)(); onClick?.(e); }}
          {...props}
        >
          {children ?? defaultIcon}
        </button>
      );
    },
  );
  Component.displayName = displayName;
  return Component;
}

export const CalendarPrevYearButton = makeNavButton("CalendarPrevYearButton", <ChevronDoubleLeftIcon />, (ctx) => ctx.messages.prevYear, (ctx) => ctx.prevYear);
export const CalendarNextYearButton = makeNavButton("CalendarNextYearButton", <ChevronDoubleRightIcon />, (ctx) => ctx.messages.nextYear, (ctx) => ctx.nextYear);
export const CalendarPrevMonthButton = makeNavButton("CalendarPrevMonthButton", <ChevronLeftIcon />, (ctx) => ctx.messages.prevMonth, (ctx) => ctx.prevMonth);
export const CalendarNextMonthButton = makeNavButton("CalendarNextMonthButton", <ChevronRightIcon />, (ctx) => ctx.messages.nextMonth, (ctx) => ctx.nextMonth);

const calendarSelectTriggerClasses =
  "min-w-0 h-7 gap-[var(--space-1)] px-[var(--space-2)] bg-transparent border-transparent font-semibold text-[length:var(--text-sm)] text-foreground hover:not-disabled:bg-background-muted hover:not-disabled:border-transparent data-[popup-open]:bg-background-muted data-[popup-open]:border-transparent";

export interface CalendarYearSelectProps {
  className?: string;
  formatYear?: (year: number) => string;
}

export function CalendarYearSelect({ className, formatYear }: CalendarYearSelectProps) {
  const ctx = useCalendarContext("CalendarYearSelect");
  const resolvedFormat = formatYear ?? ctx.defaultFormatYear;
  const year = ctx.visibleMonth.getFullYear();
  const items = ctx.yearOptions.includes(year) ? ctx.yearOptions : [...ctx.yearOptions, year].sort((a, b) => a - b);
  return (
    <Select value={String(year)} onValueChange={(v) => ctx.setYearForVisible(Number(v))}>
      <SelectTrigger className={cn(calendarSelectTriggerClasses, className)} aria-label={ctx.messages.yearSelectLabel}>
        <span>{resolvedFormat(year)}</span>
      </SelectTrigger>
      <SelectContent>
        {items.map((y) => <SelectItem key={y} value={String(y)}>{resolvedFormat(y)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export interface CalendarMonthSelectProps {
  className?: string;
  formatMonth?: (month: number) => string;
}

export function CalendarMonthSelect({ className, formatMonth }: CalendarMonthSelectProps) {
  const ctx = useCalendarContext("CalendarMonthSelect");
  const resolvedFormat = formatMonth ?? ctx.defaultFormatMonth;
  const month = ctx.visibleMonth.getMonth();
  return (
    <Select value={String(month)} onValueChange={(v) => ctx.setMonthForVisible(Number(v))}>
      <SelectTrigger className={cn(calendarSelectTriggerClasses, className)} aria-label={ctx.messages.monthSelectLabel}>
        <span>{resolvedFormat(month)}</span>
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 12 }, (_, m) => <SelectItem key={m} value={String(m)}>{resolvedFormat(m)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export interface CalendarGridProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CalendarGrid = React.forwardRef<HTMLDivElement, CalendarGridProps>(
  function CalendarGrid({ className, ...rest }, ref) {
    const ctx = useCalendarContext("CalendarGrid");
    const year = ctx.visibleMonth.getFullYear();
    const month = ctx.visibleMonth.getMonth();
    const cells = getDaysGrid(year, month, ctx.weekStartsOn);
    const today = new Date();
    const monthLabel = ctx.formatMonthLabel(year, month);
    const ariaLabel = ctx.ariaLabel ?? monthLabel;

    return (
      <div ref={ref} className={cn("", className)} {...rest}>
        <div className="grid grid-cols-7 mb-[var(--space-1)]" role="row">
          {ctx.weekdayLabels.map((label) => (
            <span key={label} className="flex items-center justify-center h-8 text-[length:var(--text-xs)] font-medium text-foreground-muted" role="columnheader" aria-label={label}>
              {label}
            </span>
          ))}
        </div>
        <div
          className="grid grid-cols-7 outline-none focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:rounded-[calc(var(--radius)-2px)]"
          role="grid"
          tabIndex={0}
          onKeyDown={ctx.onKeyDown}
          aria-label={ariaLabel}
        >
          {cells.map(({ date, current }, i) => {
            const dDisabled = ctx.isDisabled(date);
            const selected = ctx.isSelected(date);
            const isToday = isSameDay(date, today);
            const { inRange, isStart, isEnd } = ctx.isInRange(date);
            const hidden = !current && !ctx.showOutsideDays;
            if (hidden) return <span key={i} className="flex items-center justify-center w-full h-[2.375rem] min-w-0" aria-hidden />;

            const cellRangeBg = (inRange || isStart || isEnd) ? "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]" : "";
            const cellRangeRadius =
              isStart && !isEnd ? "rounded-l-[calc(var(--radius)-2px)]" :
              isEnd && !isStart ? "rounded-r-[calc(var(--radius)-2px)]" :
              isStart && isEnd ? "rounded-[calc(var(--radius)-2px)]" : "";

            return (
              <div key={i} className={cn("flex items-center justify-center w-full h-[2.375rem] min-w-0", cellRangeBg, cellRangeRadius)}>
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-center w-9 h-9 p-0 border-none rounded-[calc(var(--radius)-2px)] bg-transparent text-foreground text-[0.8125rem] font-[inherit] cursor-pointer transition-[background-color,color] duration-[var(--duration-fast)] hover:not-disabled:bg-background-muted focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed motion-reduce:transition-none",
                    !current && "text-[var(--foreground-subtle,var(--foreground-muted))] opacity-40",
                    isToday && "font-bold underline underline-offset-[0.125rem]",
                    selected && "bg-primary text-primary-foreground font-semibold hover:not-disabled:bg-primary-hover hover:not-disabled:text-primary-foreground",
                  )}
                  disabled={dDisabled}
                  tabIndex={-1}
                  onClick={() => { if (!dDisabled) ctx.handleSelect(date); }}
                  onMouseEnter={() => ctx.setHoverDate(date)}
                  onMouseLeave={() => ctx.setHoverDate(undefined)}
                  aria-label={formatIsoDate(date)}
                  aria-selected={selected || inRange || undefined}
                  data-today={isToday || undefined}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

export function useCalendar() {
  const ctx = useCalendarContext("useCalendar");
  return {
    visibleMonth: ctx.visibleMonth,
    monthIndex: ctx.monthIndex,
    monthsLength: ctx.monthsLength,
    setYear: ctx.setYearForVisible,
    setMonth: ctx.setMonthForVisible,
    prevMonth: ctx.prevMonth,
    nextMonth: ctx.nextMonth,
    prevYear: ctx.prevYear,
    nextYear: ctx.nextYear,
    yearOptions: ctx.yearOptions,
    isFirstMonth: ctx.isFirstMonth,
    isLastMonth: ctx.isLastMonth,
  };
}
