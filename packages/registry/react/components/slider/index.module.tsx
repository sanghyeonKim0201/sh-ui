"use client";

import * as React from "react";
import styles from "./styles.module.css";


import { cn } from "@SH_UI_UTILS@";
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function snap(value: number, step: number, min: number) {
  if (step <= 0) return value;
  return min + Math.round((value - min) / step) * step;
}

interface SliderContextValue {
  value: number;
  setValue: (next: number) => void;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  ariaLabel?: string;
  trackRef: React.RefObject<HTMLDivElement | null>;
  setTrackEl: (el: HTMLDivElement | null) => void;
  percent: string;
}

const SliderContext = React.createContext<SliderContextValue | null>(null);

function useSliderContext(): SliderContextValue {
  const ctx = React.useContext(SliderContext);
  if (!ctx) {
    throw new Error("Slider 하위 컴포넌트는 <Slider> 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}

/** 현재 Slider 상태를 읽을 수 있는 hook. 외부 라벨·커스텀 컨트롤에 사용. */
export function useSliderState(): Pick<
  SliderContextValue,
  "value" | "min" | "max" | "step" | "disabled"
> {
  const { value, min, max, step, disabled } = useSliderContext();
  return { value, min, max, step, disabled };
}

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** 접근성: aria-label. Thumb으로 전달됨. */
  "aria-label"?: string;
}

/**
 * 값 범위 안에서 단일 값을 선택. 마우스/터치 드래그 + 키보드(화살표/Home/End/PageUp·Down) 지원.
 *
 * 기본 렌더(자식 생략 시) — `<SliderTrack><SliderRange /><SliderThumb /></SliderTrack>`.
 * 커스텀 레이아웃이 필요하면 하위 컴포넌트를 직접 조합한다.
 */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  function Slider(
    {
      value: valueProp,
      defaultValue = 0,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      className,
      children,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const isControlled = valueProp !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const rawValue = isControlled ? (valueProp as number) : internal;
    const value = clamp(rawValue, min, max);

    const trackRef = React.useRef<HTMLDivElement | null>(null);
    const setTrackEl = React.useCallback((el: HTMLDivElement | null) => {
      trackRef.current = el;
    }, []);

    const setValue = React.useCallback(
      (next: number) => {
        const snapped = clamp(snap(next, step, min), min, max);
        if (snapped === value) return;
        if (!isControlled) setInternal(snapped);
        onValueChange?.(snapped);
      },
      [isControlled, max, min, onValueChange, step, value],
    );

    const ratio = max === min ? 0 : (value - min) / (max - min);
    const percent = `${ratio * 100}%`;

    const ctxValue = React.useMemo<SliderContextValue>(
      () => ({
        value,
        setValue,
        min,
        max,
        step,
        disabled,
        ariaLabel,
        trackRef,
        setTrackEl,
        percent,
      }),
      [ariaLabel, disabled, max, min, percent, setTrackEl, setValue, step, value],
    );

    return (
      <SliderContext.Provider value={ctxValue}>
        <div
          ref={ref}
          {...rest}
          className={cn(
            styles.slider,
            disabled && styles["slider--disabled"],
            className,
          )}
          data-disabled={disabled || undefined}
        >
          {children ?? (
            <SliderTrack>
              <SliderRange />
              <SliderThumb />
            </SliderTrack>
          )}
        </div>
      </SliderContext.Provider>
    );
  },
);
Slider.displayName = "Slider";

/* ───────── SliderTrack ─────────
 * 클릭/드래그 수신을 담당. 내부에 SliderRange + SliderThumb을 자식으로 조합.
 */
export const SliderTrack = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SliderTrack(
  { className, onPointerDown: userOnPointerDown, children, ...props },
  ref,
) {
  const { disabled, setValue, min, max, setTrackEl, trackRef } = useSliderContext();

  const mergedRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      setTrackEl(el);
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [ref, setTrackEl],
  );

  const moveToClient = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = clamp((clientX - r.left) / r.width, 0, 1);
    setValue(min + ratio * (max - min));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    userOnPointerDown?.(e);
    if (e.defaultPrevented || disabled) return;
    const el = trackRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    moveToClient(e.clientX);

    const onMove = (ev: PointerEvent) => moveToClient(ev.clientX);
    const onUp = (ev: PointerEvent) => {
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={mergedRef}
      className={cn(styles.slider__track, className)}
      onPointerDown={onPointerDown}
      {...props}
    >
      {children ?? (
        <>
          <SliderRange />
          <SliderThumb />
        </>
      )}
    </div>
  );
});
SliderTrack.displayName = "SliderTrack";

/* ───────── SliderRange ─────────
 * 선택된 값까지의 진행 바. 넓이는 Context의 percent로 계산.
 */
export const SliderRange = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SliderRange({ className, style, ...props }, ref) {
  const { percent } = useSliderContext();
  return (
    <div
      ref={ref}
      className={cn(styles.slider__range, className)}
      style={{ width: percent, ...style }}
      {...props}
    />
  );
});
SliderRange.displayName = "SliderRange";

/* ───────── SliderThumb ─────────
 * 키보드 포커스 및 조작 수신. aria-valuenow 등 접근성 속성을 담는다.
 */
export const SliderThumb = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "role" | "tabIndex">
>(function SliderThumb(
  { className, style, onKeyDown: userOnKeyDown, ...props },
  ref,
) {
  const { value, setValue, min, max, step, disabled, ariaLabel, percent } =
    useSliderContext();

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    userOnKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    const big = e.shiftKey ? step * 10 : step;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        setValue(value + big);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        setValue(value - big);
        break;
      case "Home":
        e.preventDefault();
        setValue(min);
        break;
      case "End":
        e.preventDefault();
        setValue(max);
        break;
      case "PageUp":
        e.preventDefault();
        setValue(value + step * 10);
        break;
      case "PageDown":
        e.preventDefault();
        setValue(value - step * 10);
        break;
    }
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
      className={cn(styles.slider__thumb, className)}
      style={{ left: percent, ...style }}
      {...props}
    />
  );
});
SliderThumb.displayName = "SliderThumb";
