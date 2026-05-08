"use client";

import * as React from "react";
import "./styles.css";


function cx(...args: (string | undefined | false | null)[]) {
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
  /** 화살표 키 step 폭. 디폴트 1. */
  step?: number;
  /** 값 우측에 부착할 단위 표시 (px / ms / % / ° 등). */
  unit?: React.ReactNode;
}

/**
 * 슬라이더 동반·토큰 편집 등 컴팩트 컨텍스트에 적합한 숫자 입력.
 *
 * 구현 특이점:
 * - `type="text"` + `inputMode="decimal"` — type=number 가 Chrome 에서 select() 와
 *   selectionStart/End 를 지원하지 않아 "0 위에 2 타이핑 → 02" 회귀가 발생함.
 *   text 로 바꾸고 우리가 직접 숫자 검증/클램프.
 * - 내부 buffer state — "-", "1.", "" 같이 입력 중간 transient 상태 허용. 유효한
 *   숫자가 되는 순간 onValueChange 즉시 호출. 포커스 잃을 때 정규화.
 * - focus 시 setTimeout(0) → select() — mouseup 의 커서 재배치 이후에 selection
 *   적용되도록.
 * - ArrowUp/Down 으로 step 조정, Enter 로 blur(commit).
 *
 * 일반 폼 입력에는 `Input` / `NumberInput` 사용 권장.
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
      onBlur,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<number>(defaultValue ?? 0);
    const current = isControlled ? value! : internal;

    const [buffer, setBuffer] = React.useState<string>(() => String(current));
    const focusedRef = React.useRef(false);

    // 포커스 잡지 않은 동안 외부 value 변경되면 buffer 동기화.
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
      <span className="sh-ui-numeric-input">
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cx("sh-ui-numeric-input__input", className)}
          value={buffer}
          onChange={(e) => {
            const raw = e.target.value;
            setBuffer(raw);
            // 입력 중간 상태("", "-", ".", "-.") 는 commit 안 함 — 사용자 타이핑 흐름 유지.
            if (raw === "" || raw === "-" || raw === "." || raw === "-.") return;
            const n = Number(raw);
            if (Number.isFinite(n)) commit(n);
          }}
          onFocus={(e) => {
            focusedRef.current = true;
            const t = e.currentTarget;
            // setTimeout 0 로 미뤄야 mouseup 의 커서 재배치 이후에 select 가 적용됨.
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
              // 비어있거나 NaN — 마지막 유효 값으로 복원
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
          <span className="sh-ui-numeric-input__unit" aria-hidden>
            {unit}
          </span>
        )}
      </span>
    );
  },
);
NumericInput.displayName = "NumericInput";
