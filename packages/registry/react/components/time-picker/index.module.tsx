"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import styles from "./styles.module.css";
import { cn } from "@SH_UI_UTILS@";

/* ───────── 순수 시각 헬퍼 (테스트 대상) ───────── */

export interface TimeSegments {
  /** 0–23 (항상 24시간제 내부 표현) */
  hours: number;
  /** 0–59 */
  minutes: number;
  /** 0–59 */
  seconds: number;
}

export function getSegments(date: Date): TimeSegments {
  return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() };
}

/** base의 날짜를 보존한 채 시/분/초만 교체한 새 Date. base 없으면 오늘 기준. */
export function applySegments(base: Date | undefined, seg: TimeSegments): Date {
  const d = base ? new Date(base) : new Date();
  d.setHours(seg.hours, seg.minutes, seg.seconds, 0);
  return d;
}

export function secondsOfDay(seg: TimeSegments): number {
  return seg.hours * 3600 + seg.minutes * 60 + seg.seconds;
}

export function timeSecondsOf(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

/** min/max를 하루 중 시각(초 offset)으로만 비교해 클램프. 날짜 부분 무시. */
export function clampSegments(seg: TimeSegments, min?: Date, max?: Date): TimeSegments {
  let s = secondsOfDay(seg);
  if (min !== undefined) s = Math.max(s, timeSecondsOf(min));
  if (max !== undefined) s = Math.min(s, timeSecondsOf(max));
  return { hours: Math.floor(s / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** [min, max] 양끝 포함 랩어라운드. */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min + 1;
  return (((value - min) % range) + range) % range + min;
}

export function inferHour12(locale: string): boolean {
  try {
    return new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hour12 ?? false;
  } catch {
    return false;
  }
}

export function to12h(hours24: number): { hour: number; meridiem: "am" | "pm" } {
  const meridiem: "am" | "pm" = hours24 < 12 ? "am" : "pm";
  const hour = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hour, meridiem };
}

export function from12h(hour12: number, meridiem: "am" | "pm"): number {
  const base = hour12 % 12; // 12 → 0
  return meridiem === "pm" ? base + 12 : base;
}

export function defaultFormatTime(
  date: Date,
  opts: { locale: string; showSeconds: boolean; hour12: boolean },
): string {
  return new Intl.DateTimeFormat(opts.locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: opts.showSeconds ? "2-digit" : undefined,
    hour12: opts.hour12,
  }).format(date);
}

/* ───────── React 컴포넌트 (compound) ───────── */

const DEFAULT_LOCALE = "ko-KR";

/* ───────── 아이콘 ───────── */

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────── locale 기반 기본 placeholder ───────── */

function defaultTimePlaceholder(locale: string): string {
  return locale.toLowerCase().split(/[-_]/)[0] === "ko" ? "시간 선택" : "Select time";
}

/* ───────── Context ───────── */

interface TimePickerContextValue {
  selected: Date | undefined;
  segments: TimeSegments;
  commit: (seg: TimeSegments) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  placeholder: string;
  locale: string;
  hour12: boolean;
  showSeconds: boolean;
  minuteStep: number;
  secondStep: number;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  ariaInvalid?: boolean | "true";
  formatTime: (date: Date) => string;
  // resolveMessages()가 항상 전 필드를 채워 반환하므로 소비 측(Segment label 등)에서
  // string | undefined 로 좁혀지지 않도록 Required로 선언한다.
  messages: Required<TimePickerMessages>;
}

const TimePickerContext = React.createContext<TimePickerContextValue | null>(null);

function useCtx(component: string) {
  const ctx = React.useContext(TimePickerContext);
  if (!ctx) throw new Error(`${component}는 <TimePicker> 내부에서 사용해야 합니다.`);
  return ctx;
}

/* ───────── aria 라벨 (i18n override 가능) ───────── */

export interface TimePickerMessages {
  hours?: string;
  minutes?: string;
  seconds?: string;
  meridiem?: string;
}

function resolveMessages(locale: string, m?: TimePickerMessages): Required<TimePickerMessages> {
  const ko = locale.toLowerCase().split(/[-_]/)[0] === "ko";
  return {
    hours: m?.hours ?? (ko ? "시" : "Hours"),
    minutes: m?.minutes ?? (ko ? "분" : "Minutes"),
    seconds: m?.seconds ?? (ko ? "초" : "Seconds"),
    meridiem: m?.meridiem ?? (ko ? "오전/오후" : "AM/PM"),
  };
}

/* ───────── Root ───────── */

export interface TimePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  /** 미지정 시 24시간제(false). AM/PM 세그먼트를 쓰려면 명시적으로 true. */
  hour12?: boolean;
  /** HH:MM:SS 표시 여부. @default false */
  showSeconds?: boolean;
  /** ↑/↓ 분 증감 단위. @default 1 */
  minuteStep?: number;
  /** ↑/↓ 초 증감 단위. @default 1 */
  secondStep?: number;
  /** 선택 가능 최소 시각(하루 중 시각으로 비교). */
  min?: Date;
  /** 선택 가능 최대 시각(하루 중 시각으로 비교). */
  max?: Date;
  /** 미선택 트리거 텍스트. 미지정 시 locale 기반. */
  placeholder?: string;
  /** @default "ko-KR" */
  locale?: string;
  /** 세그먼트 aria-label override. */
  messages?: TimePickerMessages;
  /** 트리거 표시 포맷터. 기본 Intl.DateTimeFormat. */
  formatTime?: (date: Date) => string;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-invalid"?: boolean | "true";
  className?: string;
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
  children?: React.ReactNode;
}

/**
 * 시각(시·분·초) 선택. 트리거 클릭 시 팝오버 세그먼트 스피너가 열린다.
 * children 생략 시 Trigger + Content + Field가 자동 렌더된다.
 */
export function TimePicker({
  value,
  defaultValue,
  onValueChange,
  hour12,
  showSeconds = false,
  minuteStep = 1,
  secondStep = 1,
  min,
  max,
  placeholder,
  locale = DEFAULT_LOCALE,
  messages,
  formatTime,
  disabled,
  readOnly,
  "aria-invalid": ariaInvalid,
  className,
  container,
  children,
}: TimePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
  const selected = isControlled ? value : internal;
  const [open, setOpen] = React.useState(false);

  // 실제 Intl 구현은 en-US/ko-KR 모두 resolvedOptions().hour12 === true를 반환하므로
  // inferHour12(locale)을 기본값으로 쓰면 명시적 요청 없이도 12시간제가 강제된다.
  // 트리거 표시/시 세그먼트 랩어라운드 모두 24시간제가 기본이어야 하므로, hour12는
  // 호출자가 명시했을 때만 켠다. inferHour12는 필요 시 소비자가 직접 조합해 쓸 수 있도록 export만 유지.
  const resolvedHour12 = hour12 ?? false;
  const resolvedPlaceholder = placeholder ?? defaultTimePlaceholder(locale);
  const resolvedMessages = React.useMemo(() => resolveMessages(locale, messages), [locale, messages]);

  const segments = selected ? getSegments(selected) : { hours: 0, minutes: 0, seconds: 0 };

  const commit = React.useCallback(
    (seg: TimeSegments) => {
      const clamped = clampSegments(seg, min, max);
      const next = applySegments(selected, clamped);
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [selected, min, max, isControlled, onValueChange],
  );

  const resolvedFormat = React.useCallback(
    (d: Date) => (formatTime ? formatTime(d) : defaultFormatTime(d, { locale, showSeconds, hour12: resolvedHour12 })),
    [formatTime, locale, showSeconds, resolvedHour12],
  );

  const ctx = React.useMemo<TimePickerContextValue>(
    () => ({
      selected,
      segments,
      commit,
      open,
      setOpen,
      placeholder: resolvedPlaceholder,
      locale,
      hour12: resolvedHour12,
      showSeconds,
      minuteStep,
      secondStep,
      min,
      max,
      disabled,
      readOnly,
      ariaInvalid,
      formatTime: resolvedFormat,
      messages: resolvedMessages,
    }),
    [selected, segments, commit, open, resolvedPlaceholder, locale, resolvedHour12, showSeconds, minuteStep, secondStep, min, max, disabled, readOnly, ariaInvalid, resolvedFormat, resolvedMessages],
  );

  return (
    <TimePickerContext.Provider value={ctx}>
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        {children ?? (
          <>
            <TimePickerTrigger className={className} />
            <TimePickerContent container={container}>
              <TimePickerField />
            </TimePickerContent>
          </>
        )}
      </BasePopover.Root>
    </TimePickerContext.Provider>
  );
}

/* ───────── Trigger ───────── */

export interface TimePickerTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?:
    | React.ReactNode
    | ((state: { value: Date | undefined; formatted: string | undefined; placeholder: string }) => React.ReactNode);
}

export const TimePickerTrigger = React.forwardRef<HTMLButtonElement, TimePickerTriggerProps>(
  function TimePickerTrigger({ className, children, onClick, ...props }, ref) {
    const ctx = useCtx("TimePickerTrigger");
    const displayText = ctx.selected ? ctx.formatTime(ctx.selected) : undefined;

    const renderContent = () => {
      if (typeof children === "function") {
        return children({ value: ctx.selected, formatted: displayText, placeholder: ctx.placeholder });
      }
      if (children !== undefined) return children;
      return (
        <>
          <span className={cn(styles.value, !displayText && styles.placeholder)}>
            {displayText ?? ctx.placeholder}
          </span>
          <span className={styles.icon} aria-hidden>
            <ClockIcon />
          </span>
        </>
      );
    };

    return (
      <BasePopover.Trigger
        ref={ref}
        className={cn(styles.trigger, className)}
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

/* ───────── Content ───────── */

export interface TimePickerContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BasePopover.Popup>, "className"> {
  className?: string;
  sideOffset?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["sideOffset"];
  side?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["side"];
  align?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["align"];
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
}

export const TimePickerContent = React.forwardRef<HTMLDivElement, TimePickerContentProps>(
  function TimePickerContent(
    { className, children, sideOffset = 4, side = "bottom", align = "start", container, ...props },
    ref,
  ) {
    const ctx = useCtx("TimePickerContent");
    if (ctx.disabled || ctx.readOnly) return null;
    return (
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner className={styles.positioner} sideOffset={sideOffset} side={side} align={align}>
          <BasePopover.Popup ref={ref} className={cn(styles.popup, className)} {...props}>
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

/* ───────── Segment (내부) ───────── */

type SegmentKind = "hours" | "minutes" | "seconds" | "meridiem";

interface SegmentProps {
  kind: SegmentKind;
  label: string;
  display: string;
  valueNow: number;
  valueMin: number;
  valueMax: number;
  onStep: (delta: number) => void;
  /** 숫자 키 입력 처리. 반환값이 true면 다음 세그먼트로 focus를 이동한다(auto-advance). */
  onDigit: (digit: number) => boolean;
  onMeridiem?: (m: "am" | "pm") => void;
  /** 타이핑 누적 버퍼 리셋(Backspace). 숫자 세그먼트만 제공, meridiem은 no-op. */
  onClear?: () => void;
}

function Segment({ kind, label, display, valueNow, valueMin, valueMax, onStep, onDigit, onMeridiem, onClear }: SegmentProps) {
  const focusSibling = (e: React.KeyboardEvent<HTMLDivElement>, dir: 1 | -1) => {
    const group = e.currentTarget.parentElement;
    const segs = group ? Array.from(group.querySelectorAll<HTMLElement>('[role="spinbutton"]')) : [];
    const idx = segs.indexOf(e.currentTarget);
    const next = segs[idx + dir];
    next?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp") { e.preventDefault(); onStep(1); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); onStep(-1); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      focusSibling(e, e.key === "ArrowRight" ? 1 : -1);
      return;
    }
    if (kind === "meridiem") {
      if (e.key.toLowerCase() === "a") { e.preventDefault(); onMeridiem?.("am"); }
      if (e.key.toLowerCase() === "p") { e.preventDefault(); onMeridiem?.("pm"); }
      return;
    }
    if (e.key === "Backspace") { e.preventDefault(); onClear?.(); return; }
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const advance = onDigit(Number(e.key));
      if (advance) focusSibling(e, 1);
    }
  };

  return (
    <div
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={kind === "meridiem" ? undefined : valueNow}
      aria-valuemin={kind === "meridiem" ? undefined : valueMin}
      aria-valuemax={kind === "meridiem" ? undefined : valueMax}
      aria-valuetext={display}
      className={styles.segment}
      onKeyDown={handleKeyDown}
    >
      {display}
    </div>
  );
}

/* ───────── Field (세그먼트 스피너 그룹) ───────── */

const pad2 = (n: number) => String(n).padStart(2, "0");

export function TimePickerField() {
  const ctx = useCtx("TimePickerField");
  const { segments, commit, minuteStep, secondStep, hour12, showSeconds, messages, locale } = ctx;
  // 타이핑 누적 버퍼: 세그먼트별 마지막 입력 자릿수 관리
  const typedRef = React.useRef<{ kind: SegmentKind | null; buf: string }>({ kind: null, buf: "" });

  const stepHours = (delta: number) => {
    if (hour12) {
      const { hour, meridiem } = to12h(segments.hours);
      const nextHour12 = wrap(hour + delta, 1, 12);
      commit({ ...segments, hours: from12h(nextHour12, meridiem) });
    } else {
      commit({ ...segments, hours: wrap(segments.hours + delta, 0, 23) });
    }
  };
  const stepMinutes = (delta: number) => commit({ ...segments, minutes: wrap(segments.minutes + delta * minuteStep, 0, 59) });
  const stepSeconds = (delta: number) => commit({ ...segments, seconds: wrap(segments.seconds + delta * secondStep, 0, 59) });

  /** 숫자 타이핑 처리. 반환값은 finished(다음 세그먼트로 auto-advance 해야 하는지) 여부. */
  const typeInto = (kind: "hours" | "minutes" | "seconds", digit: number, max: number, min = 0): boolean => {
    const t = typedRef.current;
    const buf = t.kind === kind ? t.buf + String(digit) : String(digit);
    let n = Number(buf);
    // 두 자리 초과 또는 다음 입력이 무의미하면 버퍼 리셋
    const finished = buf.length >= 2 || n * 10 > max;
    if (n > max) n = digit; // 새 자릿수로 재시작
    typedRef.current = finished ? { kind: null, buf: "" } : { kind, buf: String(n) };
    const clampedForKind = kind === "hours" && hour12 ? Math.max(min, Math.min(n, 12)) : Math.max(min, Math.min(n, max));
    if (kind === "hours") {
      const h = hour12 ? from12h(clampedForKind === 0 ? 12 : clampedForKind, to12h(segments.hours).meridiem) : clampedForKind;
      commit({ ...segments, hours: h });
    } else if (kind === "minutes") {
      commit({ ...segments, minutes: clampedForKind });
    } else {
      commit({ ...segments, seconds: clampedForKind });
    }
    return finished;
  };

  const clearTypedBuffer = () => { typedRef.current = { kind: null, buf: "" }; };

  const setMeridiem = (m: "am" | "pm") => {
    const { hour } = to12h(segments.hours);
    commit({ ...segments, hours: from12h(hour, m) });
  };

  const hourDisplay = hour12 ? pad2(to12h(segments.hours).hour) : pad2(segments.hours);
  const meridiemLabel = to12h(segments.hours).meridiem === "am"
    ? (locale.toLowerCase().startsWith("ko") ? "오전" : "AM")
    : (locale.toLowerCase().startsWith("ko") ? "오후" : "PM");

  return (
    <div className={styles.field} role="group" aria-label={messages.hours + " " + messages.minutes}>
      <Segment
        kind="hours"
        label={messages.hours}
        display={hourDisplay}
        valueNow={segments.hours}
        valueMin={hour12 ? 1 : 0}
        valueMax={hour12 ? 12 : 23}
        onStep={stepHours}
        onDigit={(d) => typeInto("hours", d, hour12 ? 12 : 23, hour12 ? 1 : 0)}
        onClear={clearTypedBuffer}
      />
      <span className={styles.separator} aria-hidden>:</span>
      <Segment
        kind="minutes"
        label={messages.minutes}
        display={pad2(segments.minutes)}
        valueNow={segments.minutes}
        valueMin={0}
        valueMax={59}
        onStep={stepMinutes}
        onDigit={(d) => typeInto("minutes", d, 59)}
        onClear={clearTypedBuffer}
      />
      {showSeconds && (
        <>
          <span className={styles.separator} aria-hidden>:</span>
          <Segment
            kind="seconds"
            label={messages.seconds}
            display={pad2(segments.seconds)}
            valueNow={segments.seconds}
            valueMin={0}
            valueMax={59}
            onStep={stepSeconds}
            onDigit={(d) => typeInto("seconds", d, 59)}
            onClear={clearTypedBuffer}
          />
        </>
      )}
      {hour12 && (
        <Segment
          kind="meridiem"
          label={messages.meridiem}
          display={meridiemLabel}
          valueNow={0}
          valueMin={0}
          valueMax={0}
          onStep={(delta) => setMeridiem(to12h(segments.hours).meridiem === "am" ? "pm" : "am")}
          onDigit={() => false}
          onMeridiem={setMeridiem}
        />
      )}
    </div>
  );
}

/* ───────── Footer ───────── */

export interface TimePickerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimePickerFooter = React.forwardRef<HTMLDivElement, TimePickerFooterProps>(
  function TimePickerFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn(styles.footer, className)} {...props} />;
  },
);

/* ───────── useTimePicker ───────── */

export function useTimePicker() {
  const ctx = useCtx("useTimePicker");
  return {
    value: ctx.selected,
    setValue: (d: Date | undefined) => (d ? ctx.commit(getSegments(d)) : ctx.commit({ hours: 0, minutes: 0, seconds: 0 })),
    open: ctx.open,
    setOpen: ctx.setOpen,
  };
}
