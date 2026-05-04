"use client";

import * as React from "react";
import { cn } from "@SH_UI_UTILS@";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../select";
import "./styles.css";

/* ───────── Helpers ───────── */

/** 미지정 시의 기본 로케일. 기존 동작(한국어) 보존. */
export const DEFAULT_LOCALE = "ko-KR";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const toDateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

const formatIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Intl 기반 short weekday 라벨, Sunday-first 7개. */
function deriveWeekdayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2017-01-01 은 일요일 — 안전한 기준점.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(2017, 0, 1 + i)),
  );
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

/** Calendar 의 비-날짜 텍스트(aria-label 등). 일부만 override 가능. */
export interface CalendarMessages {
  /** 1년 이전 버튼 aria-label. */
  prevYear?: string;
  /** 1년 다음 버튼 aria-label. */
  nextYear?: string;
  /** 1개월 이전 버튼 aria-label. */
  prevMonth?: string;
  /** 1개월 다음 버튼 aria-label. */
  nextMonth?: string;
  /** 연도 select aria-label. */
  yearSelectLabel?: string;
  /** 월 select aria-label. */
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

  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevDays - i), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(year, month + 1, d), current: false });
    }
  }

  return cells;
}

function rotateWeekdays(labels: readonly string[], weekStartsOn: 0 | 1): string[] {
  if (weekStartsOn === 0) return [...labels];
  return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
}

/* ───────── Types ───────── */

export interface DateRange {
  /** 시작일 (포함). */
  from: Date;
  /** 종료일 (포함). */
  to: Date;
}

export type CalendarMode = "single" | "multiple" | "range";

interface CalendarCommonProps {
  /** 표시 중인 월 (controlled). */
  month?: Date;
  /** 표시 월의 초기값 (uncontrolled). */
  defaultMonth?: Date;
  /** 표시 월 변경 콜백. */
  onMonthChange?: (month: Date) => void;
  /** 동시에 표시할 월 개수. compound(children 사용) 모드에서는 1로 강제된다. @default 1 */
  numberOfMonths?: number;
  /** 선택 가능 최소 날짜 (포함). */
  min?: Date;
  /** 선택 가능 최대 날짜 (포함). */
  max?: Date;
  /** 날짜별 비활성 콜백. */
  disabled?: (date: Date) => boolean;
  /** 외부 날짜(이전/다음 달) 표시 여부. @default true */
  showOutsideDays?: boolean;
  /** 주의 시작 요일. 0=일, 1=월. @default 0 */
  weekStartsOn?: 0 | 1;
  /** 요일 라벨 (Sunday-first 7개). 미지정 시 `locale` 기반 자동 생성. */
  weekdayLabels?: readonly string[];
  /** 월 헤더 그룹의 aria-label 포맷. 미지정 시 `locale` 기반 자동 생성. */
  formatMonthLabel?: (year: number, month: number) => string;
  /**
   * BCP47 로케일 (예: `"en-US"`, `"ja-JP"`, `"ko-KR"`). 요일·월·연도 라벨이 `Intl.DateTimeFormat` 으로
   * 자동 생성된다. 개별 포맷터(`weekdayLabels`/`formatMonthLabel`/`CalendarYearSelect.formatYear` 등) 가
   * 우선되고, 미지정 항목만 이 로케일에서 파생.
   * @default "ko-KR"
   */
  locale?: string;
  /**
   * Nav 버튼/select 의 aria-label 등 비-날짜 텍스트 override. 미지정 시 `locale` 의 언어 코드(`ko`/`en`)
   * 기반 기본값. 다른 언어를 쓸 땐 해당 언어 문자열을 직접 넘긴다.
   */
  messages?: CalendarMessages;
  /** 연도 dropdown 시작 연도. */
  fromYear?: number;
  /** 연도 dropdown 끝 연도. */
  toYear?: number;
  /** 캘린더 컨테이너 클래스. */
  className?: string;
  /** 그리드 aria-label. 미지정 시 월 라벨 사용. */
  "aria-label"?: string;
  /**
   * Compound 모드. 미지정 시 기본 레이아웃이 자동 렌더된다.
   * 직접 조립하려면 `CalendarHeader`/`CalendarGrid` 등을 children 으로 넘긴다.
   */
  children?: React.ReactNode;
}

export type CalendarSingleProps = CalendarCommonProps & {
  mode?: "single";
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
};

export type CalendarMultipleProps = CalendarCommonProps & {
  mode: "multiple";
  value?: Date[];
  defaultValue?: Date[];
  onValueChange?: (dates: Date[]) => void;
};

export type CalendarRangeProps = CalendarCommonProps & {
  mode: "range";
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
};

export type CalendarProps =
  | CalendarSingleProps
  | CalendarMultipleProps
  | CalendarRangeProps;

/* ───────── Icons ───────── */

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M10 3 5.5 8 10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M6 3 10.5 8 6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDoubleLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M8 3 3.5 8 8 13M13 3 8.5 8 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDoubleRightIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M3 3 7.5 8 3 13M8 3 12.5 8 8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────── Context ───────── */

interface CalendarContextValue {
  /** 이 컨텍스트가 담당하는 월 (multi-month 의 경우 idx 별로 다름). */
  visibleMonth: Date;
  /** 현재 month index (multi-month). compound 모드에서는 항상 0. */
  monthIndex: number;
  monthsLength: number;

  yearOptions: number[];

  setYearForVisible: (y: number) => void;
  setMonthForVisible: (m: number) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  prevYear: () => void;
  nextYear: () => void;

  weekStartsOn: 0 | 1;
  weekdayLabels: string[];
  showOutsideDays: boolean;
  formatMonthLabel: (year: number, month: number) => string;
  /** YearSelect 가 자체 `formatYear` 를 받지 않을 때 사용할 로케일 기본값. */
  defaultFormatYear: (y: number) => string;
  /** MonthSelect 가 자체 `formatMonth` 를 받지 않을 때 사용할 로케일 기본값. */
  defaultFormatMonth: (m: number) => string;
  messages: Required<CalendarMessages>;
  ariaLabel?: string;

  isSelected: (date: Date) => boolean;
  isInRange: (date: Date) => { inRange: boolean; isStart: boolean; isEnd: boolean };
  isDisabled: (date: Date) => boolean;
  handleSelect: (date: Date) => void;
  setHoverDate: (date: Date | undefined) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;

  /** multi-month 일 때만 의미 있는 위치 표지. compound(single) 일 때는 항상 true. */
  isFirstMonth: boolean;
  isLastMonth: boolean;
}

const CalendarContext = React.createContext<CalendarContextValue | null>(null);

function useCalendarContext(component: string) {
  const ctx = React.useContext(CalendarContext);
  if (!ctx) {
    throw new Error(`${component}는 <Calendar> 내부에서 사용해야 합니다.`);
  }
  return ctx;
}

/* ───────── Calendar (root) ───────── */

/**
 * 인라인 날짜 캘린더. single/multiple/range 모드, 다중 월 표시, 키보드 내비게이션을 지원한다.
 * children 을 생략하면 기본 레이아웃이 자동 렌더되고, compound 파츠로 직접 조립도 가능하다.
 *
 * 팝오버에 띄우려면 `DatePicker` / `DateRangePicker`(date-picker) 를 사용한다.
 */
export function Calendar(props: CalendarProps) {
  const {
    mode = "single",
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths: numberOfMonthsProp = 1,
    min,
    max,
    disabled,
    showOutsideDays = true,
    weekStartsOn = 0,
    weekdayLabels: weekdayLabelsProp,
    formatMonthLabel: formatMonthLabelProp,
    locale = DEFAULT_LOCALE,
    messages: messagesProp,
    fromYear,
    toYear,
    className,
    "aria-label": ariaLabel,
    children,
  } = props as CalendarCommonProps & { mode?: CalendarMode };

  // compound(children) 모드에서는 단일 월로 강제 (multi-month 헤더 조립은 본 버전 스코프 외).
  const numberOfMonths = children ? 1 : Math.max(1, numberOfMonthsProp);

  /* selected value (controlled / uncontrolled) */
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

  const singleValue = isControlled
    ? (props as CalendarSingleProps).value
    : internalSingle;
  const multipleValue = isControlled
    ? (props as CalendarMultipleProps).value ?? []
    : internalMultiple;
  const rangeValue = isControlled
    ? (props as CalendarRangeProps).value
    : internalRange;

  /* range picking state */
  const [picking, setPicking] = React.useState<Date | undefined>(undefined);
  const [hoverDate, setHoverDate] = React.useState<Date | undefined>(undefined);

  /* displayed month (controlled / uncontrolled) */
  const monthControlled = monthProp !== undefined;
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => {
    if (defaultMonth) return startOfMonth(defaultMonth);
    if (mode === "single" && singleValue) return startOfMonth(singleValue);
    if (mode === "multiple" && multipleValue.length > 0) return startOfMonth(multipleValue[0]);
    if (mode === "range" && rangeValue?.from) return startOfMonth(rangeValue.from);
    return startOfMonth(new Date());
  });
  const currentMonth = monthControlled ? startOfMonth(monthProp!) : internalMonth;

  const setMonth = React.useCallback(
    (next: Date) => {
      const normalized = startOfMonth(next);
      if (!monthControlled) setInternalMonth(normalized);
      onMonthChange?.(normalized);
    },
    [monthControlled, onMonthChange],
  );

  /* focused cursor for keyboard nav */
  const [focusedDate, setFocusedDate] = React.useState<Date>(() => {
    if (mode === "single" && singleValue) return singleValue;
    if (mode === "range" && rangeValue?.from) return rangeValue.from;
    return new Date();
  });

  /* locale-derived defaults */
  const localeWeekdays = React.useMemo(() => deriveWeekdayLabels(locale), [locale]);
  const localeMonthLabel = React.useMemo(() => deriveMonthLabel(locale), [locale]);
  const localeYearLabel = React.useMemo(() => deriveYearLabel(locale), [locale]);
  const localeMonthSelectLabel = React.useMemo(
    () => deriveMonthSelectLabel(locale),
    [locale],
  );
  const resolvedMessages = React.useMemo<Required<CalendarMessages>>(
    () => ({ ...defaultMessagesFor(locale), ...messagesProp }),
    [locale, messagesProp],
  );

  /* weekday labels */
  const weekdayLabels = React.useMemo(() => {
    const base = weekdayLabelsProp ?? localeWeekdays;
    return rotateWeekdays(base, weekStartsOn);
  }, [weekdayLabelsProp, localeWeekdays, weekStartsOn]);

  const formatMonthLabel = formatMonthLabelProp ?? localeMonthLabel;

  /* year options */
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

  /* selection helpers */
  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const d = toDateOnly(date);
      if (min && d < toDateOnly(min)) return true;
      if (max && d > toDateOnly(max)) return true;
      if (disabled?.(date)) return true;
      return false;
    },
    [min, max, disabled],
  );

  const isDateSelected = React.useCallback(
    (date: Date) => {
      if (mode === "single") return !!singleValue && isSameDay(date, singleValue);
      if (mode === "multiple") return multipleValue.some((d) => isSameDay(d, date));
      if (mode === "range") {
        if (picking) return isSameDay(date, picking);
        if (rangeValue?.from && isSameDay(date, rangeValue.from)) return true;
        if (rangeValue?.to && isSameDay(date, rangeValue.to)) return true;
        return false;
      }
      return false;
    },
    [mode, singleValue, multipleValue, rangeValue, picking],
  );

  const getRangeState = React.useCallback(
    (date: Date) => {
      if (mode !== "range") return { inRange: false, isStart: false, isEnd: false };

      const from = picking ?? rangeValue?.from;
      if (!from) return { inRange: false, isStart: false, isEnd: false };

      const to = picking ? hoverDate : rangeValue?.to;
      if (!to) {
        return { inRange: false, isStart: isSameDay(date, from), isEnd: false };
      }

      const [rStart, rEnd] = from <= to ? [from, to] : [to, from];
      const s = toDateOnly(rStart);
      const e = toDateOnly(rEnd);
      const d = toDateOnly(date);

      return {
        inRange: d >= s && d <= e,
        isStart: isSameDay(d, s),
        isEnd: isSameDay(d, e),
      };
    },
    [mode, picking, hoverDate, rangeValue],
  );

  const handleSelect = React.useCallback(
    (date: Date) => {
      if (mode === "single") {
        if (!isControlled) setInternalSingle(date);
        (props as CalendarSingleProps).onValueChange?.(date);
        return;
      }

      if (mode === "multiple") {
        const exists = multipleValue.some((d) => isSameDay(d, date));
        const next = exists
          ? multipleValue.filter((d) => !isSameDay(d, date))
          : [...multipleValue, date];
        if (!isControlled) setInternalMultiple(next);
        (props as CalendarMultipleProps).onValueChange?.(next);
        return;
      }

      if (mode === "range") {
        if (!picking) {
          setPicking(date);
          return;
        }
        const [from, to] = picking <= date ? [picking, date] : [date, picking];
        const range: DateRange = { from, to };
        setPicking(undefined);
        setHoverDate(undefined);
        if (!isControlled) setInternalRange(range);
        (props as CalendarRangeProps).onValueChange?.(range);
      }
    },
    [mode, isControlled, multipleValue, picking, props],
  );

  /* keyboard nav */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      let next: Date | null = null;
      const cursor = focusedDate;

      switch (e.key) {
        case "ArrowLeft":
          next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
          break;
        case "ArrowRight":
          next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
          break;
        case "ArrowUp":
          next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 7);
          break;
        case "ArrowDown":
          next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7);
          break;
        case "PageUp":
          next = new Date(cursor.getFullYear(), cursor.getMonth() - 1, cursor.getDate());
          break;
        case "PageDown":
          next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
          break;
        case "Home":
          next = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
          break;
        case "End":
          next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (!isDateDisabled(cursor)) handleSelect(cursor);
          return;
        default:
          return;
      }

      e.preventDefault();
      if (!next || isDateDisabled(next)) return;

      setFocusedDate(next);

      const visibleEnd = addMonths(currentMonth, numberOfMonths - 1);
      if (next < currentMonth) {
        setMonth(addMonths(currentMonth, -1));
      } else if (next > new Date(visibleEnd.getFullYear(), visibleEnd.getMonth() + 1, 0)) {
        setMonth(addMonths(currentMonth, 1));
      }
    },
    [focusedDate, isDateDisabled, handleSelect, currentMonth, numberOfMonths, setMonth],
  );

  /* months to render */
  const months = Array.from({ length: numberOfMonths }, (_, i) =>
    addMonths(currentMonth, i),
  );

  /* per-month context factory */
  const buildMonthContext = (visibleMonth: Date, idx: number): CalendarContextValue => ({
    visibleMonth,
    monthIndex: idx,
    monthsLength: numberOfMonths,
    yearOptions,
    setYearForVisible: (y) => {
      const yearDiff = y - visibleMonth.getFullYear();
      setMonth(new Date(currentMonth.getFullYear() + yearDiff, currentMonth.getMonth(), 1));
    },
    setMonthForVisible: (m) => {
      setMonth(addMonths(currentMonth, m - visibleMonth.getMonth()));
    },
    prevMonth: () => setMonth(addMonths(currentMonth, -1)),
    nextMonth: () => setMonth(addMonths(currentMonth, 1)),
    prevYear: () => setMonth(addMonths(currentMonth, -12)),
    nextYear: () => setMonth(addMonths(currentMonth, 12)),
    weekStartsOn,
    weekdayLabels,
    showOutsideDays,
    formatMonthLabel,
    defaultFormatYear: localeYearLabel,
    defaultFormatMonth: localeMonthSelectLabel,
    messages: resolvedMessages,
    ariaLabel,
    isSelected: isDateSelected,
    isInRange: getRangeState,
    isDisabled: isDateDisabled,
    handleSelect,
    setHoverDate: mode === "range" ? setHoverDate : () => {},
    onKeyDown: handleKeyDown,
    isFirstMonth: idx === 0,
    isLastMonth: idx === numberOfMonths - 1,
  });

  return (
    <div
      className={cn("sh-ui-calendar", numberOfMonths > 1 && "sh-ui-calendar--multi", className)}
      aria-label={ariaLabel}
    >
      {children
        ? (
          <CalendarContext.Provider value={buildMonthContext(months[0], 0)}>
            {children}
          </CalendarContext.Provider>
        )
        : months.map((m, idx) => (
          <CalendarContext.Provider
            key={`${m.getFullYear()}-${m.getMonth()}`}
            value={buildMonthContext(m, idx)}
          >
            <div className="sh-ui-calendar__month">
              <CalendarHeader>
                {idx === 0 ? <CalendarPrevYearButton /> : <CalendarNavPlaceholder />}
                {idx === 0 ? <CalendarPrevMonthButton /> : <CalendarNavPlaceholder />}
                <div className="sh-ui-calendar__title">
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

/* ───────── Compound: Header ───────── */

export interface CalendarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

/** 헤더 컨테이너. 화살표/dropdown 등을 children 으로 자유롭게 배치. */
export const CalendarHeader = React.forwardRef<HTMLDivElement, CalendarHeaderProps>(
  function CalendarHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn("sh-ui-calendar__header", className)} {...props} />;
  },
);

function CalendarNavPlaceholder() {
  return <span className="sh-ui-calendar__nav sh-ui-calendar__nav--placeholder" aria-hidden />;
}

/* ───────── Compound: Nav buttons ───────── */

export interface CalendarNavButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** 버튼 본문. 미지정 시 기본 화살표 아이콘. */
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
          className={cn("sh-ui-calendar__nav", className)}
          aria-label={ariaLabel ?? resolveDefaultLabel(ctx)}
          onClick={(e) => {
            resolveHandler(ctx)();
            onClick?.(e);
          }}
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

/** 1년 이전. */
export const CalendarPrevYearButton = makeNavButton(
  "CalendarPrevYearButton",
  <ChevronDoubleLeftIcon />,
  (ctx) => ctx.messages.prevYear,
  (ctx) => ctx.prevYear,
);

/** 1년 다음. */
export const CalendarNextYearButton = makeNavButton(
  "CalendarNextYearButton",
  <ChevronDoubleRightIcon />,
  (ctx) => ctx.messages.nextYear,
  (ctx) => ctx.nextYear,
);

/** 1개월 이전. */
export const CalendarPrevMonthButton = makeNavButton(
  "CalendarPrevMonthButton",
  <ChevronLeftIcon />,
  (ctx) => ctx.messages.prevMonth,
  (ctx) => ctx.prevMonth,
);

/** 1개월 다음. */
export const CalendarNextMonthButton = makeNavButton(
  "CalendarNextMonthButton",
  <ChevronRightIcon />,
  (ctx) => ctx.messages.nextMonth,
  (ctx) => ctx.nextMonth,
);

/* ───────── Compound: Year / Month select ───────── */

export interface CalendarYearSelectProps {
  /** select trigger 의 className. */
  className?: string;
  /** label 표시 포맷. 미지정 시 Calendar `locale` 기반 자동 생성. */
  formatYear?: (year: number) => string;
}

/** 연도 dropdown. sh-ui Select 로 구현. */
export function CalendarYearSelect({
  className,
  formatYear,
}: CalendarYearSelectProps) {
  const ctx = useCalendarContext("CalendarYearSelect");
  const resolvedFormat = formatYear ?? ctx.defaultFormatYear;
  const year = ctx.visibleMonth.getFullYear();
  const items = ctx.yearOptions.includes(year)
    ? ctx.yearOptions
    : [...ctx.yearOptions, year].sort((a, b) => a - b);

  return (
    <Select
      value={String(year)}
      onValueChange={(v) => ctx.setYearForVisible(Number(v))}
    >
      <SelectTrigger
        className={cn("sh-ui-calendar__select-trigger", className)}
        aria-label={ctx.messages.yearSelectLabel}
      >
        <span className="sh-ui-calendar__select-value">{resolvedFormat(year)}</span>
      </SelectTrigger>
      <SelectContent className="sh-ui-calendar__select-popup">
        {items.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {resolvedFormat(y)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface CalendarMonthSelectProps {
  className?: string;
  /** label 표시 포맷. 미지정 시 Calendar `locale` 기반 자동 생성. */
  formatMonth?: (month: number) => string;
}

/** 월 dropdown. */
export function CalendarMonthSelect({
  className,
  formatMonth,
}: CalendarMonthSelectProps) {
  const ctx = useCalendarContext("CalendarMonthSelect");
  const resolvedFormat = formatMonth ?? ctx.defaultFormatMonth;
  const month = ctx.visibleMonth.getMonth();
  return (
    <Select
      value={String(month)}
      onValueChange={(v) => ctx.setMonthForVisible(Number(v))}
    >
      <SelectTrigger
        className={cn("sh-ui-calendar__select-trigger", className)}
        aria-label={ctx.messages.monthSelectLabel}
      >
        <span className="sh-ui-calendar__select-value">{resolvedFormat(month)}</span>
      </SelectTrigger>
      <SelectContent className="sh-ui-calendar__select-popup">
        {Array.from({ length: 12 }, (_, m) => (
          <SelectItem key={m} value={String(m)}>
            {resolvedFormat(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ───────── Compound: Grid ───────── */

export interface CalendarGridProps extends React.HTMLAttributes<HTMLDivElement> {}

/** 요일 헤더 + 일자 버튼 그리드. */
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
      <div ref={ref} className={cn("sh-ui-calendar__grid-wrap", className)} {...rest}>
        <div className="sh-ui-calendar__weekdays" role="row">
          {ctx.weekdayLabels.map((label) => (
            <span
              key={label}
              className="sh-ui-calendar__weekday"
              role="columnheader"
              aria-label={label}
            >
              {label}
            </span>
          ))}
        </div>

        <div
          className="sh-ui-calendar__grid"
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

            if (hidden) {
              return <span key={i} className="sh-ui-calendar__cell sh-ui-calendar__cell--hidden" aria-hidden />;
            }

            return (
              <div
                key={i}
                className={cn(
                  "sh-ui-calendar__cell",
                  inRange && "sh-ui-calendar__cell--in-range",
                  isStart && "sh-ui-calendar__cell--range-start",
                  isEnd && "sh-ui-calendar__cell--range-end",
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "sh-ui-calendar__day",
                    !current && "sh-ui-calendar__day--outside",
                    selected && "sh-ui-calendar__day--selected",
                    isToday && "sh-ui-calendar__day--today",
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

/* ───────── Hook: useCalendar ───────── */

/** Calendar 내부에서 visible month/탐색 핸들러를 직접 다룰 때 사용. */
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
