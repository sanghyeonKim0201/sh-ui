"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import "./styles.css";

/* ───────── Helpers ───────── */

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const toDateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const formatDefault = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const clampMonth = (year: number, month: number): [number, number] => {
  if (month < 0) return [year - 1, 11];
  if (month > 11) return [year + 1, 0];
  return [year, month];
};

function getDaysGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
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

/* ───────── Types ───────── */

export interface DateRange {
  /** 시작일 (포함). */
  from: Date;
  /** 종료일 (포함). */
  to: Date;
}

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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 6.5h12M5.5 2v2M10.5 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ───────── Context ───────── */

interface DatePickerContextValue {
  selected: Date | undefined;
  setSelected: (date: Date | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  focusedDate: Date;
  setFocusedDate: (date: Date) => void;
  formatDate: (date: Date) => string;
  placeholder: string;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  ariaInvalid?: boolean | "true";
  closeOnSelect: boolean;
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(null);

function useDatePickerContext(component: string) {
  const ctx = React.useContext(DatePickerContext);
  if (!ctx) {
    throw new Error(`${component}는 <DatePicker> 내부에서 사용해야 합니다.`);
  }
  return ctx;
}

/* ───────── Internal Calendar Grid (shared w/ range picker) ───────── */

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  min?: Date;
  max?: Date;
  focusedDate: Date;
  onFocusedDateChange: (date: Date) => void;
  rangeFrom?: Date;
  rangeTo?: Date;
  hoverDate?: Date;
  onHoverDate?: (date: Date | undefined) => void;
}

function Calendar({
  selected,
  onSelect,
  min,
  max,
  focusedDate,
  onFocusedDateChange,
  rangeFrom,
  rangeTo,
  hoverDate,
  onHoverDate,
}: CalendarProps) {
  const year = focusedDate.getFullYear();
  const month = focusedDate.getMonth();
  const cells = getDaysGrid(year, month);
  const today = new Date();

  const navigate = (newYear: number, newMonth: number) => {
    const [y, m] = clampMonth(newYear, newMonth);
    onFocusedDateChange(new Date(y, m, 1));
  };

  const isDisabled = (date: Date) => {
    if (min && date < toDateOnly(min)) return true;
    if (max && date > toDateOnly(max)) return true;
    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let next: Date | null = null;
    const cursor = selected ?? focusedDate;

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
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isDisabled(cursor)) onSelect(cursor);
        return;
      default:
        return;
    }

    e.preventDefault();
    if (next && !isDisabled(next)) {
      if (next.getMonth() !== month || next.getFullYear() !== year) {
        onFocusedDateChange(new Date(next.getFullYear(), next.getMonth(), 1));
      }
      onSelect(next);
    }
  };

  const getRangeState = (date: Date) => {
    if (!rangeFrom) return { inRange: false, isStart: false, isEnd: false };

    const end = rangeTo ?? hoverDate;
    if (!end) return { inRange: false, isStart: isSameDay(date, rangeFrom), isEnd: false };

    let [rStart, rEnd] = rangeFrom <= end ? [rangeFrom, end] : [end, rangeFrom];
    rStart = toDateOnly(rStart);
    rEnd = toDateOnly(rEnd);
    const d = toDateOnly(date);

    return {
      inRange: d >= rStart && d <= rEnd,
      isStart: isSameDay(d, rStart),
      isEnd: isSameDay(d, rEnd),
    };
  };

  const monthLabel = `${year}년 ${month + 1}월`;

  return (
    <div className="sh-ui-calendar" role="group" aria-label={monthLabel}>
      <div className="sh-ui-calendar__header">
        <button
          type="button"
          className="sh-ui-calendar__nav"
          onClick={() => navigate(year, month - 1)}
          aria-label="이전 달"
        >
          <ChevronLeftIcon />
        </button>
        <span className="sh-ui-calendar__title">{monthLabel}</span>
        <button
          type="button"
          className="sh-ui-calendar__nav"
          onClick={() => navigate(year, month + 1)}
          aria-label="다음 달"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="sh-ui-calendar__weekdays" role="row">
        {WEEK_LABELS.map((label) => (
          <span key={label} className="sh-ui-calendar__weekday" role="columnheader" aria-label={label}>
            {label}
          </span>
        ))}
      </div>

      <div
        className="sh-ui-calendar__grid"
        role="grid"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={monthLabel}
      >
        {cells.map(({ date, current }, i) => {
          const disabled = isDisabled(date);
          const isSelected = selected && isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          const { inRange, isStart, isEnd } = getRangeState(date);

          return (
            <button
              key={i}
              type="button"
              className={cx(
                "sh-ui-calendar__day",
                !current && "sh-ui-calendar__day--outside",
                isSelected && "sh-ui-calendar__day--selected",
                isToday && "sh-ui-calendar__day--today",
                inRange && "sh-ui-calendar__day--in-range",
                isStart && "sh-ui-calendar__day--range-start",
                isEnd && "sh-ui-calendar__day--range-end",
              )}
              disabled={disabled}
              tabIndex={-1}
              onClick={() => { if (!disabled) onSelect(date); }}
              onMouseEnter={() => onHoverDate?.(date)}
              onMouseLeave={() => onHoverDate?.(undefined)}
              aria-label={formatDefault(date)}
              aria-selected={isSelected || inRange || undefined}
              data-today={isToday || undefined}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── DatePicker Root ───────── */

export interface DatePickerProps {
  /** 제어 모드 선택값. `undefined`는 미선택. */
  value?: Date;
  /** 비제어 모드 초기값. */
  defaultValue?: Date;
  /** 값 변경 콜백. 미선택 상태로 전환되면 `undefined`. */
  onValueChange?: (date: Date | undefined) => void;
  /**
   * 트리거에 표시할 문자열 포맷터.
   * @default (d) => "YYYY-MM-DD"
   */
  formatDate?: (date: Date) => string;
  /** 선택 가능 최소 날짜 (포함). 이전 날짜는 비활성. */
  min?: Date;
  /** 선택 가능 최대 날짜 (포함). 이후 날짜는 비활성. */
  max?: Date;
  /**
   * 미선택 상태의 트리거 텍스트.
   * @default "날짜 선택"
   */
  placeholder?: string;
  /** 비활성. 트리거 클릭·키보드 모두 차단. */
  disabled?: boolean;
  /** 읽기 전용. 트리거 표시는 유지하되 popover가 열리지 않는다. */
  readOnly?: boolean;
  /** invalid 상태. 트리거 보더가 위험색으로 바뀌고 스크린리더에 오류로 노출. */
  "aria-invalid"?: boolean | "true";
  /**
   * children 없을 때(기본 레이아웃) Trigger로 전달된다.
   * children 조립 모드에서는 `DatePickerTrigger`에 직접 className을 넘긴다.
   */
  className?: string;
  /**
   * 날짜 선택 시 popover 자동 닫힘.
   * @default true
   */
  closeOnSelect?: boolean;
  /**
   * compound 모드. 미지정 시 기본 레이아웃(Trigger + Content + Calendar)이 자동 렌더된다.
   * 직접 조립하려면 `DatePickerTrigger`/`DatePickerContent`/`DatePickerCalendar`/`DatePickerFooter`를 자식으로 넘긴다.
   */
  children?: React.ReactNode;
}

/**
 * 단일 날짜 선택. 트리거 클릭 시 popover 캘린더가 열리고 키보드 화살표로 이동한다.
 * children을 생략하면 기본 레이아웃이 자동 렌더되며, 직접 조립하려면 DatePickerTrigger/Content/Calendar/Footer를 사용한다.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  formatDate = formatDefault,
  min,
  max,
  placeholder = "날짜 선택",
  disabled,
  readOnly,
  "aria-invalid": ariaInvalid,
  className,
  closeOnSelect = true,
  children,
}: DatePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
  const selected = isControlled ? value : internal;

  const [open, setOpen] = React.useState(false);
  const [focusedDate, setFocusedDate] = React.useState<Date>(
    () => selected ?? new Date(),
  );

  React.useEffect(() => {
    if (open && selected) {
      setFocusedDate(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [open, selected]);

  const setSelected = React.useCallback(
    (date: Date | undefined) => {
      if (!isControlled) setInternal(date);
      onValueChange?.(date);
    },
    [isControlled, onValueChange],
  );

  const ctx = React.useMemo<DatePickerContextValue>(
    () => ({
      selected,
      setSelected,
      open,
      setOpen,
      focusedDate,
      setFocusedDate,
      formatDate,
      placeholder,
      min,
      max,
      disabled,
      readOnly,
      ariaInvalid,
      closeOnSelect,
    }),
    [
      selected,
      setSelected,
      open,
      focusedDate,
      formatDate,
      placeholder,
      min,
      max,
      disabled,
      readOnly,
      ariaInvalid,
      closeOnSelect,
    ],
  );

  return (
    <DatePickerContext.Provider value={ctx}>
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        {children ?? (
          <>
            <DatePickerTrigger className={className} />
            <DatePickerContent>
              <DatePickerCalendar />
            </DatePickerContent>
          </>
        )}
      </BasePopover.Root>
    </DatePickerContext.Provider>
  );
}

/* ───────── DatePickerTrigger ───────── */

export interface DatePickerTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /**
   * 트리거 본문. 직접 노드를 넘기거나, 함수를 넘기면 현재 상태를 받아 직접 렌더할 수 있다.
   *
   * @example
   * <DatePickerTrigger>
   *   {({ formatted, placeholder }) => <span>{formatted ?? placeholder}</span>}
   * </DatePickerTrigger>
   */
  children?:
    | React.ReactNode
    | ((state: {
        /** 현재 선택된 Date. 미선택 시 `undefined`. */
        value: Date | undefined;
        /** `formatDate`로 포맷된 문자열. 미선택 시 `undefined`. */
        formatted: string | undefined;
        /** DatePicker `placeholder` prop. */
        placeholder: string;
      }) => React.ReactNode);
}

/**
 * 캘린더 popover를 여는 트리거 버튼. children에 함수를 넘기면 현재 값/포맷 문자열/placeholder를
 * 받아 직접 렌더할 수 있다.
 */
export const DatePickerTrigger = React.forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
  function DatePickerTrigger({ className, children, onClick, ...props }, ref) {
    const ctx = useDatePickerContext("DatePickerTrigger");
    const displayText = ctx.selected ? ctx.formatDate(ctx.selected) : undefined;

    const renderContent = () => {
      if (typeof children === "function") {
        return children({
          value: ctx.selected,
          formatted: displayText,
          placeholder: ctx.placeholder,
        });
      }
      if (children !== undefined) return children;
      return (
        <>
          <span
            className={cx(
              "sh-ui-date-picker__value",
              !displayText && "sh-ui-date-picker__placeholder",
            )}
          >
            {displayText ?? ctx.placeholder}
          </span>
          <span className="sh-ui-date-picker__icon" aria-hidden>
            <CalendarIcon />
          </span>
        </>
      );
    };

    return (
      <BasePopover.Trigger
        ref={ref}
        className={cx("sh-ui-date-picker__trigger", className)}
        disabled={ctx.disabled}
        aria-invalid={ctx.ariaInvalid}
        aria-haspopup="dialog"
        onClick={(e) => {
          if (ctx.readOnly) e.preventDefault();
          onClick?.(e);
        }}
        {...props}
      >
        {renderContent()}
      </BasePopover.Trigger>
    );
  },
);

/* ───────── DatePickerContent ───────── */

export interface DatePickerContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BasePopover.Popup>, "className"> {
  className?: string;
  /**
   * Trigger와 popover 간격(px).
   * @default 4
   */
  sideOffset?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["sideOffset"];
  /**
   * Trigger 기준 popover 방향. 공간 부족 시 자동 반대편으로 뒤집힘.
   * @default "bottom"
   */
  side?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["side"];
  /**
   * Trigger 축에서의 정렬.
   * @default "start"
   */
  align?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["align"];
}

/** 캘린더 popover 본문. portal로 마운트되며 `disabled`/`readOnly`이면 렌더되지 않는다. */
export const DatePickerContent = React.forwardRef<HTMLDivElement, DatePickerContentProps>(
  function DatePickerContent(
    { className, children, sideOffset = 4, side = "bottom", align = "start", ...props },
    ref,
  ) {
    const ctx = useDatePickerContext("DatePickerContent");
    if (ctx.disabled || ctx.readOnly) return null;

    return (
      <BasePopover.Portal>
        <BasePopover.Positioner
          className="sh-ui-date-picker__positioner"
          sideOffset={sideOffset}
          side={side}
          align={align}
        >
          <BasePopover.Popup
            ref={ref}
            className={cx("sh-ui-date-picker__popup", className)}
            {...props}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

/* ───────── DatePickerCalendar ───────── */

/** 월 단위 날짜 그리드. 화살표 키 이동, Home/End, Enter/Space 선택을 지원한다. */
export function DatePickerCalendar() {
  const ctx = useDatePickerContext("DatePickerCalendar");

  const handleSelect = (date: Date) => {
    ctx.setSelected(date);
    if (ctx.closeOnSelect) ctx.setOpen(false);
  };

  return (
    <Calendar
      selected={ctx.selected}
      onSelect={handleSelect}
      min={ctx.min}
      max={ctx.max}
      focusedDate={ctx.focusedDate}
      onFocusedDateChange={ctx.setFocusedDate}
    />
  );
}

/* ───────── DatePickerFooter ───────── */

export interface DatePickerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/** popover 하단 액션 영역. "오늘", "지우기" 같은 커스텀 버튼을 두는 슬롯. */
export const DatePickerFooter = React.forwardRef<HTMLDivElement, DatePickerFooterProps>(
  function DatePickerFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx("sh-ui-date-picker__footer", className)}
        {...props}
      />
    );
  },
);

/* ───────── useDatePicker (for custom footer actions) ───────── */

/** 커스텀 footer 액션에서 값/open 상태를 직접 다룰 때 사용. DatePicker 내부에서만 호출 가능. */
export function useDatePicker() {
  const ctx = useDatePickerContext("useDatePicker");
  return {
    value: ctx.selected,
    setValue: ctx.setSelected,
    open: ctx.open,
    setOpen: ctx.setOpen,
    focusedDate: ctx.focusedDate,
    setFocusedDate: ctx.setFocusedDate,
  };
}

/* ───────── DateRangePicker (단일 컴포넌트, 스코프 외) ───────── */

export interface DateRangePickerProps {
  /** 선택된 범위 (controlled). */
  value?: DateRange;
  /** 초기 범위 (uncontrolled). */
  defaultValue?: DateRange;
  /** 범위 변경 콜백. */
  onValueChange?: (range: DateRange | undefined) => void;
  /** 표시 포맷 함수. 기본 YYYY-MM-DD. */
  formatDate?: (date: Date) => string;
  /** 선택 가능 최소 날짜. */
  min?: Date;
  /** 선택 가능 최대 날짜. */
  max?: Date;
  /**
   * 미선택 상태의 트리거 텍스트.
   * @default "시작일 ~ 종료일"
   */
  placeholder?: string;
  /** 비활성. */
  disabled?: boolean;
  /** 읽기 전용. popover가 열리지 않는다. */
  readOnly?: boolean;
  /** invalid 상태. */
  "aria-invalid"?: boolean | "true";
  className?: string;
}

/**
 * 시작·종료일을 선택하는 범위 picker. 첫 클릭으로 시작일, 두 번째 클릭으로 종료일이 결정된다.
 * 호버 시 미리보기 범위가 시각화되고 두 번째 선택과 동시에 popover가 닫힌다.
 */
export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue,
      onValueChange,
      formatDate = formatDefault,
      min,
      max,
      placeholder = "시작일 ~ 종료일",
      disabled,
      readOnly,
      "aria-invalid": ariaInvalid,
      className,
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<DateRange | undefined>(defaultValue);
    const selected = isControlled ? value : internal;

    const [open, setOpen] = React.useState(false);
    const [picking, setPicking] = React.useState<Date | undefined>(undefined);
    const [hoverDate, setHoverDate] = React.useState<Date | undefined>(undefined);
    const [focusedDate, setFocusedDate] = React.useState(
      () => selected?.from ?? new Date(),
    );

    React.useEffect(() => {
      if (open) {
        setPicking(undefined);
        setHoverDate(undefined);
        if (selected?.from) {
          setFocusedDate(new Date(selected.from.getFullYear(), selected.from.getMonth(), 1));
        }
      }
    }, [open, selected?.from]);

    const handleSelect = (date: Date) => {
      if (!picking) {
        setPicking(date);
        return;
      }

      const [from, to] = picking <= date ? [picking, date] : [date, picking];
      const range: DateRange = { from, to };

      if (!isControlled) setInternal(range);
      onValueChange?.(range);
      setPicking(undefined);
      setHoverDate(undefined);
      setOpen(false);
    };

    const displayText = selected
      ? `${formatDate(selected.from)} ~ ${formatDate(selected.to)}`
      : undefined;

    return (
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <BasePopover.Trigger
          ref={ref}
          className={cx("sh-ui-date-picker__trigger", className)}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-haspopup="dialog"
          onClick={(e) => {
            if (readOnly) e.preventDefault();
          }}
        >
          <span className={cx("sh-ui-date-picker__value", !displayText && "sh-ui-date-picker__placeholder")}>
            {displayText ?? placeholder}
          </span>
          <span className="sh-ui-date-picker__icon" aria-hidden>
            <CalendarIcon />
          </span>
        </BasePopover.Trigger>

        {!disabled && !readOnly && (
          <BasePopover.Portal>
            <BasePopover.Positioner
              className="sh-ui-date-picker__positioner"
              sideOffset={4}
              side="bottom"
              align="start"
            >
              <BasePopover.Popup className="sh-ui-date-picker__popup">
                {picking && (
                  <p className="sh-ui-date-picker__hint">종료일을 선택하세요</p>
                )}
                <Calendar
                  selected={picking}
                  onSelect={handleSelect}
                  min={min}
                  max={max}
                  focusedDate={focusedDate}
                  onFocusedDateChange={setFocusedDate}
                  rangeFrom={picking ?? selected?.from}
                  rangeTo={picking ? undefined : selected?.to}
                  hoverDate={picking ? hoverDate : undefined}
                  onHoverDate={picking ? setHoverDate : undefined}
                />
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        )}
      </BasePopover.Root>
    );
  },
);
