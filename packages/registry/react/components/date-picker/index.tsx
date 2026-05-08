"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Calendar, DEFAULT_LOCALE, type CalendarMessages, type DateRange } from "../calendar";
import "./styles.css";

import { cn } from "@SH_UI_UTILS@";
export type { DateRange };

/* ───────── Helpers ───────── */


const formatDefault = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

/** locale 기반 단일 날짜 placeholder. 한국어 외에는 영어 fallback. */
function defaultDatePlaceholder(locale: string): string {
  const lang = locale.toLowerCase().split(/[-_]/)[0];
  return lang === "ko" ? "날짜 선택" : "Select date";
}

/** locale 기반 범위 placeholder. */
function defaultRangePlaceholder(locale: string): string {
  const lang = locale.toLowerCase().split(/[-_]/)[0];
  return lang === "ko" ? "시작일 ~ 종료일" : "Start date – end date";
}

/* ───────── Icons ───────── */

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
  locale: string;
  messages?: CalendarMessages;
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
   * 미선택 상태의 트리거 텍스트. 미지정 시 `locale` 기반 자동 생성("날짜 선택" / "Select date").
   */
  placeholder?: string;
  /**
   * BCP47 로케일. 내부 Calendar 와 placeholder 기본값에 모두 적용된다.
   * @default "ko-KR"
   */
  locale?: string;
  /** 내부 Calendar 의 nav/select aria-label override. */
  messages?: CalendarMessages;
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
   * Portal이 마운트될 DOM 노드. 토큰 스코프(다크 모드 등) 안에 popover를 띄우려면 해당 컨테이너 ref 전달.
   * @default document.body
   */
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
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
  placeholder,
  locale = DEFAULT_LOCALE,
  messages,
  disabled,
  readOnly,
  "aria-invalid": ariaInvalid,
  className,
  closeOnSelect = true,
  container,
  children,
}: DatePickerProps) {
  const resolvedPlaceholder = placeholder ?? defaultDatePlaceholder(locale);
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
  const selected = isControlled ? value : internal;

  const [open, setOpen] = React.useState(false);
  const [focusedDate, setFocusedDate] = React.useState<Date>(
    () => selected ?? new Date(),
  );

  React.useEffect(() => {
    if (open && selected) {
      setFocusedDate(startOfMonth(selected));
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
      placeholder: resolvedPlaceholder,
      locale,
      messages,
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
      resolvedPlaceholder,
      locale,
      messages,
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
            <DatePickerContent container={container}>
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
 * 캘린더 popover 를 여는 트리거 버튼. 자체로 `<button>` 을 렌더하므로 자식
 * 으로 또 다른 button (예: 커스텀 Button) 을 넣지 말 것 — button 중첩은
 * invalid HTML. 트리거 외관 커스터마이즈는 두 가지 방법:
 *
 * 1) `children` 에 함수 — 내부 텍스트만 커스터마이즈 (현재 값/포맷/placeholder 받아 직접 렌더):
 *      <DatePickerTrigger>{({ formatted, placeholder }) => formatted ?? placeholder}</DatePickerTrigger>
 *
 * 2) `className` 으로 직접 스타일링 — 별도 Button 컴포넌트로 감싸지 말고
 *    버튼 자체에 클래스 부여.
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
            className={cn(
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
        className={cn("sh-ui-date-picker__trigger", className)}
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
  /**
   * Portal이 마운트될 DOM 노드. 토큰 스코프(다크 모드 등) 안에 popover를 띄우려면 해당 컨테이너 ref 전달.
   * @default document.body
   */
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
}

/** 캘린더 popover 본문. portal로 마운트되며 `disabled`/`readOnly`이면 렌더되지 않는다. */
export const DatePickerContent = React.forwardRef<HTMLDivElement, DatePickerContentProps>(
  function DatePickerContent(
    { className, children, sideOffset = 4, side = "bottom", align = "start", container, ...props },
    ref,
  ) {
    const ctx = useDatePickerContext("DatePickerContent");
    if (ctx.disabled || ctx.readOnly) return null;

    return (
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner
          className="sh-ui-date-picker__positioner"
          sideOffset={sideOffset}
          side={side}
          align={align}
        >
          <BasePopover.Popup
            ref={ref}
            className={cn("sh-ui-date-picker__popup", className)}
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
      locale={ctx.locale}
      messages={ctx.messages}
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
        className={cn("sh-ui-date-picker__footer", className)}
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
   * 미선택 상태의 트리거 텍스트. 미지정 시 `locale` 기반 자동 생성.
   */
  placeholder?: string;
  /**
   * BCP47 로케일. 내부 Calendar 와 placeholder 기본값에 모두 적용.
   * @default "ko-KR"
   */
  locale?: string;
  /** 내부 Calendar 의 nav/select aria-label override. */
  messages?: CalendarMessages;
  /** 비활성. */
  disabled?: boolean;
  /** 읽기 전용. popover가 열리지 않는다. */
  readOnly?: boolean;
  /** invalid 상태. */
  "aria-invalid"?: boolean | "true";
  className?: string;
  /**
   * Portal이 마운트될 DOM 노드. 토큰 스코프(다크 모드 등) 안에 popover를 띄우려면 해당 컨테이너 ref 전달.
   * @default document.body
   */
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
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
      placeholder,
      locale = DEFAULT_LOCALE,
      messages,
      disabled,
      readOnly,
      "aria-invalid": ariaInvalid,
      className,
      container,
    },
    ref,
  ) {
    const resolvedPlaceholder = placeholder ?? defaultRangePlaceholder(locale);
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<DateRange | undefined>(defaultValue);
    const selected = isControlled ? value : internal;

    const [open, setOpen] = React.useState(false);
    const [calendarMonth, setCalendarMonth] = React.useState<Date>(
      () => selected?.from ?? new Date(),
    );

    React.useEffect(() => {
      if (open && selected?.from) {
        setCalendarMonth(startOfMonth(selected.from));
      }
    }, [open, selected?.from]);

    const handleRangeChange = (range: DateRange | undefined) => {
      if (!isControlled) setInternal(range);
      onValueChange?.(range);
      if (range) setOpen(false);
    };

    const displayText = selected
      ? `${formatDate(selected.from)} ~ ${formatDate(selected.to)}`
      : undefined;

    return (
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <BasePopover.Trigger
          ref={ref}
          className={cn("sh-ui-date-picker__trigger", className)}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-haspopup="dialog"
          onClick={(e) => {
            if (readOnly) e.preventDefault();
          }}
        >
          <span className={cn("sh-ui-date-picker__value", !displayText && "sh-ui-date-picker__placeholder")}>
            {displayText ?? resolvedPlaceholder}
          </span>
          <span className="sh-ui-date-picker__icon" aria-hidden>
            <CalendarIcon />
          </span>
        </BasePopover.Trigger>

        {!disabled && !readOnly && (
          <BasePopover.Portal container={container}>
            <BasePopover.Positioner
              className="sh-ui-date-picker__positioner"
              sideOffset={4}
              side="bottom"
              align="start"
            >
              <BasePopover.Popup className="sh-ui-date-picker__popup">
                <Calendar
                  mode="range"
                  value={selected}
                  onValueChange={handleRangeChange}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  min={min}
                  max={max}
                  locale={locale}
                  messages={messages}
                />
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        )}
      </BasePopover.Root>
    );
  },
);
