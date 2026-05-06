"use client";

import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
export interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
  > {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: React.ReactNode;
}

const inputClasses =
  "w-10 px-1 py-0.5 font-mono text-[length:var(--text-xs)] leading-tight text-right border border-transparent rounded-[calc(var(--radius)-4px)] bg-transparent text-foreground appearance-none [-moz-appearance:textfield] transition-[border-color,background-color] duration-[var(--duration-fast)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0 hover:not-disabled:not-focus:border-border focus:outline-none focus:border-primary focus:bg-background focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)]";

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    { value, defaultValue, onValueChange, min, max, step = 1, unit, className, onFocus, onBlur, onKeyDown, ...props },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<number>(defaultValue ?? 0);
    const current = isControlled ? value! : internal;

    const [buffer, setBuffer] = React.useState<string>(() => String(current));
    const focusedRef = React.useRef(false);

    React.useEffect(() => {
      if (!focusedRef.current) setBuffer(String(current));
    }, [current]);

    const clamp = (n: number) => {
      let v = n;
      if (min !== undefined && v < min) v = min;
      if (max !== undefined && v > max) v = max;
      return v;
    };

    const commit = (n: number): number => {
      const c = clamp(n);
      if (!isControlled) setInternal(c);
      onValueChange?.(c);
      return c;
    };

    return (
      <span className="inline-flex items-baseline gap-[2px] min-w-[3rem] justify-end">
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn(inputClasses, className)}
          value={buffer}
          onChange={(e) => {
            const raw = e.target.value;
            setBuffer(raw);
            if (raw === "" || raw === "-" || raw === "." || raw === "-.") return;
            const n = Number(raw);
            if (Number.isFinite(n)) commit(n);
          }}
          onFocus={(e) => {
            focusedRef.current = true;
            const t = e.currentTarget;
            setTimeout(() => t.select(), 0);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focusedRef.current = false;
            const n = Number(buffer);
            if (buffer !== "" && Number.isFinite(n)) {
              const c = commit(n);
              setBuffer(String(c));
            } else {
              setBuffer(String(current));
            }
            onBlur?.(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next = commit(current + step);
              setBuffer(String(next));
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = commit(current - step);
              setBuffer(String(next));
            } else if (e.key === "Enter") {
              e.currentTarget.blur();
            }
            onKeyDown?.(e);
          }}
          {...props}
        />
        {unit !== undefined && unit !== "" && (
          <span className="font-mono text-[length:var(--text-xs)] text-foreground-muted" aria-hidden>
            {unit}
          </span>
        )}
      </span>
    );
  },
);
NumericInput.displayName = "NumericInput";
