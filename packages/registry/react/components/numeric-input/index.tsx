"use client";

import * as React from "react";
import "./styles.css";

function cx(...args: (string | undefined | null | false)[]) {
  return args.filter(Boolean).join(" ");
}

export interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
  > {
  /** 제어 모드 값. */
  value?: number;
  /** 비제어 모드 초기값. */
  defaultValue?: number;
  /** 값 변경 콜백. min/max 범위로 자동 clamp 된 값이 전달된다. */
  onValueChange?: (value: number) => void;
  /** 허용 최솟값. 입력값이 이보다 작으면 자동 clamp. */
  min?: number;
  /** 허용 최댓값. 입력값이 이보다 크면 자동 clamp. */
  max?: number;
  /** 화살표 버튼·키보드 step 폭. 디폴트 1. */
  step?: number;
  /** 값 우측에 부착할 단위 표시 (px / ms / % / ° 등). */
  unit?: React.ReactNode;
}

/**
 * 슬라이더 동반·토큰 편집 등 컴팩트 컨텍스트에 적합한 숫자 입력.
 *
 * - 디폴트 외관: 보더 없이 monospace 우측 정렬 (값 표시 라벨처럼 보이지만 클릭 시 인라인 편집).
 * - hover/focus 시 보더가 드러나는 affordance.
 * - 입력값은 onChange 시점에 즉시 min/max 로 clamp.
 * - focus 시 select-all — 한 글자씩 지우는 대신 새 값 그대로 타이핑 가능.
 * - 일반 폼 입력에는 `Input` / `NumberInput` 사용 권장.
 */
export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      unit,
      className,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<number>(defaultValue ?? 0);
    const current = isControlled ? value! : internal;

    const clamp = (n: number) => {
      let v = n;
      if (min !== undefined && v < min) v = min;
      if (max !== undefined && v > max) v = max;
      return v;
    };

    return (
      <span className="sh-ui-numeric-input">
        <input
          ref={ref}
          type="number"
          className={cx("sh-ui-numeric-input__input", className)}
          value={current}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            const c = clamp(n);
            if (!isControlled) setInternal(c);
            onValueChange?.(c);
          }}
          onFocus={(e) => {
            e.currentTarget.select();
            onFocus?.(e);
          }}
          {...props}
        />
        {unit !== undefined && unit !== "" && (
          <span className="sh-ui-numeric-input__unit" aria-hidden>
            {unit}
          </span>
        )}
      </span>
    );
  },
);
NumericInput.displayName = "NumericInput";
