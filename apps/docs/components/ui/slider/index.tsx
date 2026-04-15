"use client";

import * as React from "react";
import "./styles.css";

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** 접근성: aria-label */
  "aria-label"?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function snap(value: number, step: number, min: number) {
  if (step <= 0) return value;
  return min + Math.round((value - min) / step) * step;
}

export function Slider({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  "aria-label": ariaLabel,
  ...rest
}: SliderProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = clamp(isControlled ? valueProp! : internal, min, max);

  const trackRef = React.useRef<HTMLDivElement>(null);

  const setValue = (next: number) => {
    const snapped = clamp(snap(next, step, min), min, max);
    if (snapped === value) return;
    if (!isControlled) setInternal(snapped);
    onValueChange?.(snapped);
  };

  const moveToClient = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = clamp((clientX - r.left) / r.width, 0, 1);
    setValue(min + ratio * (max - min));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
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

  const ratio = max === min ? 0 : (value - min) / (max - min);
  const percent = `${ratio * 100}%`;

  return (
    <div
      {...rest}
      className={["sh-ui-slider", disabled && "sh-ui-slider--disabled", className]
        .filter(Boolean)
        .join(" ")}
      data-disabled={disabled || undefined}
    >
      <div
        ref={trackRef}
        className="sh-ui-slider__track"
        onPointerDown={onPointerDown}
      >
        <div className="sh-ui-slider__range" style={{ width: percent }} />
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown}
          className="sh-ui-slider__thumb"
          style={{ left: percent }}
        />
      </div>
    </div>
  );
}
