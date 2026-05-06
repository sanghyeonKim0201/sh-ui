"use client";

import * as React from "react";
import "./styles.css";

import { cn } from "@SH_UI_UTILS@";
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** input 우측에 부착할 보조 노드(아이콘·단위·버튼 등). 더 많은 슬롯이 필요하면 InputGroup 사용. */
  suffix?: React.ReactNode;
  /** input 좌측에 부착할 보조 노드. */
  prefix?: React.ReactNode;
}


/* ───────── InputGroup + InputAdornment (compound) ─────────
 * <InputGroup>
 *   <InputAdornment><SearchIcon /></InputAdornment>
 *   <Input placeholder="검색..." />
 *   <InputAdornment><ClearButton /></InputAdornment>
 * </InputGroup>
 *
 * InputGroup이 공용 보더/포커스 링을 담당하고, 내부 Input은 자신의 보더를
 * 감춘다(data-in-group 기반). Adornment 위치는 children 순서로 결정한다.
 */

interface InputGroupContextValue {
  inGroup: true;
}

const InputGroupContext = React.createContext<InputGroupContextValue | null>(
  null,
);

function useInputGroup() {
  return React.useContext(InputGroupContext);
}

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * invalid 상태를 그룹 전체에 적용. 자식 input의 보더가 위험색으로 바뀌고,
   * 스크린리더에 오류 상태가 노출된다.
   */
  "aria-invalid"?: boolean | "true" | "false";
  /** disabled 상태를 그룹 전체에 적용. 그룹 내 input/Adornment 모두에 전파된다. */
  disabled?: boolean;
}

/**
 * Input과 좌우 보조 요소(`InputAdornment`)를 한 박스로 묶는 컴파운드 래퍼.
 * 그룹 영역 어디를 클릭해도 내부 input에 포커스가 이동하고, `aria-invalid`/`disabled`가 자식 전체에 전파된다.
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  (
    {
      className,
      children,
      "aria-invalid": ariaInvalid,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const mergedRef = React.useCallback(
      (el: HTMLDivElement | null) => {
        innerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref],
    );

    // 그룹 어느 곳을 클릭해도 내부 input에 포커스
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, input, textarea, select, a")) return;
      const input = innerRef.current?.querySelector<HTMLInputElement>("input");
      input?.focus();
    };

    return (
      <InputGroupContext.Provider value={{ inGroup: true }}>
        <div
          ref={mergedRef}
          className={cn("sh-ui-input-group", className)}
          data-disabled={disabled || undefined}
          aria-invalid={ariaInvalid}
          onClick={handleClick}
          {...props}
        >
          {children}
        </div>
      </InputGroupContext.Provider>
    );
  },
);
InputGroup.displayName = "InputGroup";

export interface InputAdornmentProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * 클릭이 input으로 버블링되지 않도록 한다. 버튼·체크박스 등 인터랙티브 요소를
   * Adornment에 담을 때 켤 것 — 그러지 않으면 클릭이 input 포커스로 가로채진다.
   *
   * @default false
   */
  interactive?: boolean;
}

/**
 * InputGroup 안에 들어가는 보조 슬롯. 위치는 children 순서로 결정한다.
 * 버튼 등 인터랙티브 요소를 담을 때는 `interactive`를 켜 input 포커스 가로채기를 막을 것.
 */
export const InputAdornment = React.forwardRef<
  HTMLSpanElement,
  InputAdornmentProps
>(({ className, interactive, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("sh-ui-input-group__adornment", className)}
      data-interactive={interactive || undefined}
      {...props}
    />
  );
});
InputAdornment.displayName = "InputAdornment";

/**
 * 한 줄 텍스트 입력. `prefix`/`suffix`로 아이콘이나 단위 등을 한 input 안에 붙일 수 있고,
 * 더 많은 보조 요소가 필요하면 `InputGroup`+`InputAdornment` 조합을 사용한다.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", prefix, suffix, ...props }, ref) => {
    const group = useInputGroup();
    const hasAffix = Boolean(prefix || suffix);
    const input = (
      <input
        ref={ref}
        type={type}
        className={cn(
          "sh-ui-input",
          !!prefix && "sh-ui-input--with-prefix",
          !!suffix && "sh-ui-input--with-suffix",
          className,
        )}
        data-in-group={group ? "" : undefined}
        {...props}
      />
    );

    if (!hasAffix) return input;

    return (
      <div className="sh-ui-input-wrap" data-in-group={group ? "" : undefined}>
        {prefix && <span className="sh-ui-input__affix sh-ui-input__affix--prefix">{prefix}</span>}
        {input}
        {suffix && <span className="sh-ui-input__affix sh-ui-input__affix--suffix">{suffix}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";

/* ───────── NumberInput ─────────
 * 정수 입력 + 천 단위 콤마(옵션). value/onValueChange는 number | undefined.
 */

export interface NumberInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> {
  /** 제어 모드 값. `undefined`는 빈 입력. */
  value?: number;
  /** 비제어 모드 초기값. */
  defaultValue?: number;
  /** 값 변경 콜백. 빈 입력일 때 `undefined`가 전달된다. */
  onValueChange?: (value: number | undefined) => void;
  /**
   * 천 단위 콤마 자동 포맷.
   * @default true
   */
  thousandsSeparator?: boolean;
  /** 허용 최솟값. blur 시 자동 클램프된다. */
  min?: number;
  /** 허용 최댓값. blur 시 자동 클램프된다. */
  max?: number;
  /**
   * 음수 입력 허용 여부.
   * @default true
   */
  allowNegative?: boolean;
}

const formatNumber = (digits: string, thousandsSeparator: boolean): string => {
  if (digits === "" || digits === "-") return digits;
  const negative = digits.startsWith("-");
  const body = negative ? digits.slice(1) : digits;
  if (!body) return negative ? "-" : "";
  const formatted = thousandsSeparator
    ? body.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : body;
  return negative ? `-${formatted}` : formatted;
};

const parseNumber = (s: string): number | undefined => {
  const cleaned = s.replace(/[^\d-]/g, "");
  if (!cleaned || cleaned === "-") return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * 정수 입력 + 천 단위 콤마 자동 포맷. `value`는 `number | undefined`이고 표시 문자열과 분리되어 있다.
 * blur 시 `min`/`max` 범위로 자동 클램프되며, 음수 허용은 `allowNegative`로 토글한다.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      thousandsSeparator = true,
      min,
      max,
      allowNegative = true,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const initial =
      defaultValue !== undefined ? formatNumber(String(defaultValue), thousandsSeparator) : "";
    const [internal, setInternal] = React.useState(initial);

    const display = isControlled
      ? value === undefined
        ? ""
        : formatNumber(String(value), thousandsSeparator)
      : internal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // 허용 문자만 남김
      const allowedRe = allowNegative ? /[^\d-]/g : /[^\d]/g;
      let cleaned = raw.replace(allowedRe, "");
      // "-"는 맨 앞에만
      if (allowNegative) cleaned = cleaned.replace(/(?!^)-/g, "");
      const formatted = formatNumber(cleaned, thousandsSeparator);
      if (!isControlled) setInternal(formatted);
      onValueChange?.(parseNumber(cleaned));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const n = parseNumber(display);
      if (n !== undefined) {
        let clamped = n;
        if (min !== undefined && clamped < min) clamped = min;
        if (max !== undefined && clamped > max) clamped = max;
        if (clamped !== n) {
          const f = formatNumber(String(clamped), thousandsSeparator);
          if (!isControlled) setInternal(f);
          onValueChange?.(clamped);
        }
      }
      onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        {...rest}
      />
    );
  }
);
NumberInput.displayName = "NumberInput";

/* ───────── PhoneInput (KR) ─────────
 * 한국 전화번호 자동 하이픈. 010-1234-5678, 02-1234-5678, 031-123-4567 등.
 * onValueChange는 숫자만(13자 이하) 콜백.
 */

const formatPhoneKR = (digits: string): string => {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";

  // 02로 시작: [2, 3-4, 4]
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }

  // 그 외(010, 031, …): [3, 3-4, 4]
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
};

export interface PhoneInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> {
  /** 제어 모드 값. 하이픈 포함/제외 모두 허용 — 표시용으로 자동 포맷됨. */
  value?: string;
  /** 비제어 모드 초기값. */
  defaultValue?: string;
  /** 값 변경 콜백. 하이픈을 뺀 숫자 문자열만 전달된다. */
  onValueChange?: (digits: string) => void;
}

/**
 * 한국 휴대폰·지역번호용 자동 하이픈 입력(010/02/031 등). `onValueChange`는 하이픈을 뺀
 * 숫자 문자열만 콜백한다. 국제화가 필요하면 별도 컴포넌트로 분리해 사용할 것.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, defaultValue, onValueChange, onBlur, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const initial = formatPhoneKR(defaultValue ?? "");
    const [internal, setInternal] = React.useState(initial);

    const display = isControlled ? formatPhoneKR(value ?? "") : internal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
      const formatted = formatPhoneKR(digits);
      if (!isControlled) setInternal(formatted);
      onValueChange?.(digits);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={display}
        onChange={handleChange}
        onBlur={onBlur}
        {...rest}
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";

/* ───────── BusinessNumberInput (KR 사업자등록번호) ─────────
 * XXX-XX-XXXXX (10자리). 옵션으로 체크섬 검증.
 */

const formatBRN = (digits: string): string => {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
};


/**
 * 한국 사업자등록번호(10자리) 체크섬 검증.
 * @param digits - 검증할 사업자번호 문자열. 하이픈 포함/제외 모두 허용.
 * @returns 체크섬 통과 여부. 길이가 10이 아니면 항상 `false`.
 * @example
 * isValidBRN("123-45-67890") // false
 * isValidBRN("1234567890") // 체크섬에 따라
 */
export function isValidBRN(digits: string): boolean {
  const d = digits.replace(/\D/g, "");
  if (d.length !== 10) return false;
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i], 10) * w[i];
  sum += Math.floor((parseInt(d[8], 10) * 5) / 10);
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(d[9], 10);
}

export interface BusinessNumberInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> {
  /** 제어 모드 값. 하이픈 포함/제외 모두 허용. */
  value?: string;
  /** 비제어 모드 초기값. */
  defaultValue?: string;
  /** 값 변경 콜백. 하이픈을 뺀 숫자 문자열만 전달된다. */
  onValueChange?: (digits: string) => void;
  /**
   * 켜면 10자리 입력 시 사업자번호 체크섬을 검증해 `aria-invalid`를 자동 부여한다.
   * 외부에서 `aria-invalid`를 명시하면 그 값이 우선한다.
   *
   * @default false
   */
  validateChecksum?: boolean;
}

/**
 * 한국 사업자등록번호(XXX-XX-XXXXX) 자동 하이픈 입력. `validateChecksum`을 켜면
 * 10자리 입력 시 체크섬을 검증해 `aria-invalid`를 자동 부여한다(외부에서 `aria-invalid`를 명시하면 우선).
 */
export const BusinessNumberInput = React.forwardRef<HTMLInputElement, BusinessNumberInputProps>(
  (
    { value, defaultValue, onValueChange, validateChecksum, onBlur, "aria-invalid": ariaInvalidProp, ...rest },
    ref
  ) => {
    const isControlled = value !== undefined;
    const initial = formatBRN(defaultValue ?? "");
    const [internal, setInternal] = React.useState(initial);

    const display = isControlled ? formatBRN(value ?? "") : internal;
    const digits = display.replace(/\D/g, "");

    const invalid =
      ariaInvalidProp !== undefined
        ? ariaInvalidProp
        : validateChecksum && digits.length === 10 && !isValidBRN(digits);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value.replace(/\D/g, "").slice(0, 10);
      const formatted = formatBRN(next);
      if (!isControlled) setInternal(formatted);
      onValueChange?.(next);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  }
);
BusinessNumberInput.displayName = "BusinessNumberInput";
