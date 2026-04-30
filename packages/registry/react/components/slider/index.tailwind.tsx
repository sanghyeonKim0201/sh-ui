"use client";

import * as React from "react";


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
  if (!ctx) throw new Error("Slider 하위 컴포넌트는 <Slider> 안에서만 사용할 수 있습니다.");
  return ctx;
}

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
  "aria-label"?: string;
}

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
        value, setValue, min, max, step, disabled, ariaLabel,
        trackRef, setTrackEl, percent,
      }),
      [ariaLabel, disabled, max, min, percent, setTrackEl, setValue, step, value],
    );

    return (
      <SliderContext.Provider value={ctxValue}>
        <div
          ref={ref}
          {...rest}
          className={cn(
            "relative w-full py-[var(--space-2)] select-none",
            disabled && "opacity-[var(--opacity-disabled)] pointer-events-none",
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

export const SliderTrack = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SliderTrack({ className, onPointerDown: userOnPointerDown, children, ...props }, ref) {
    const { disabled, setValue, min, max, setTrackEl, trackRef } = useSliderContext();

    const mergedRef = React.useCallback(
      (el: HTMLDivElement | null) => {
        setTrackEl(el);
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
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
        className={cn(
          "relative w-full h-1.5 bg-background-muted rounded-full cursor-pointer touch-none",
          className,
        )}
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
  },
);
SliderTrack.displayName = "SliderTrack";

export const SliderRange = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SliderRange({ className, style, ...props }, ref) {
    const { percent } = useSliderContext();
    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-0 left-0 h-full bg-primary rounded-full pointer-events-none",
          className,
        )}
        style={{ width: percent, ...style }}
        {...props}
      />
    );
  },
);
SliderRange.displayName = "SliderRange";

export const SliderThumb = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "role" | "tabIndex">
>(function SliderThumb({ className, style, onKeyDown: userOnKeyDown, ...props }, ref) {
  const { value, setValue, min, max, step, disabled, ariaLabel, percent } = useSliderContext();

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    userOnKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    const big = e.shiftKey ? step * 10 : step;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault(); setValue(value + big); break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault(); setValue(value - big); break;
      case "Home": e.preventDefault(); setValue(min); break;
      case "End": e.preventDefault(); setValue(max); break;
      case "PageUp": e.preventDefault(); setValue(value + step * 10); break;
      case "PageDown": e.preventDefault(); setValue(value - step * 10); break;
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
      className={cn(
        "absolute top-1/2 w-4 h-4 -ml-2 -translate-y-1/2 bg-background border-2 border-primary rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)] cursor-grab transition-transform duration-[80ms] active:cursor-grabbing active:scale-110 active:-translate-y-1/2 focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2 [@media(hover:none)_and_(pointer:coarse)]:w-5 [@media(hover:none)_and_(pointer:coarse)]:h-5 [@media(hover:none)_and_(pointer:coarse)]:-ml-2.5",
        className,
      )}
      style={{ left: percent, ...style }}
      {...props}
    />
  );
});
SliderThumb.displayName = "SliderThumb";
