"use client";

import * as React from "react";
import { cn } from "@SH_UI_UTILS@";
import {
  adornment,
  affix,
  affixPrefix,
  affixSuffix,
  group,
  input,
  inputWrap,
  toggle,
  withPrefix,
  withSuffix,
} from "./styles.css";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** input 우측에 부착할 보조 노드(아이콘·단위·버튼 등). 더 많은 슬롯이 필요하면 InputGroup 사용. */
  suffix?: React.ReactNode;
  /** input 좌측에 부착할 보조 노드. */
  prefix?: React.ReactNode;
}

interface InputGroupContextValue {
  inGroup: true;
}

const InputGroupContext = React.createContext<InputGroupContextValue | null>(null);

function useInputGroup() {
  return React.useContext(InputGroupContext);
}

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  "aria-invalid"?: boolean | "true" | "false";
  disabled?: boolean;
}

/**
 * Input과 좌우 보조 요소(`InputAdornment`)를 한 박스로 묶는 컴파운드 래퍼.
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

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, input, textarea, select, a")) return;
      const inputEl = innerRef.current?.querySelector<HTMLInputElement>("input");
      inputEl?.focus();
    };

    return (
      <InputGroupContext.Provider value={{ inGroup: true }}>
        <div
          ref={mergedRef}
          className={cn(group, className)}
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

export interface InputAdornmentProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * 클릭이 input 으로 버블링되지 않도록 한다. 버튼·체크박스 등 인터랙티브 요소를
   * Adornment 에 담을 때 켤 것.
   *
   * @default false
   */
  interactive?: boolean;
}

export const InputAdornment = React.forwardRef<HTMLSpanElement, InputAdornmentProps>(
  ({ className, interactive, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(adornment, className)}
        data-interactive={interactive || undefined}
        {...props}
      />
    );
  },
);
InputAdornment.displayName = "InputAdornment";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", prefix, suffix, ...props }, ref) => {
    const groupCtx = useInputGroup();
    const hasAffix = Boolean(prefix || suffix);
    const inputEl = (
      <input
        ref={ref}
        type={type}
        className={cn(input, !!prefix && withPrefix, !!suffix && withSuffix, className)}
        data-in-group={groupCtx ? "" : undefined}
        {...props}
      />
    );

    if (!hasAffix) return inputEl;

    return (
      <div className={inputWrap} data-in-group={groupCtx ? "" : undefined}>
        {prefix && <span className={cn(affix, affixPrefix)}>{prefix}</span>}
        {inputEl}
        {suffix && <span className={cn(affix, affixSuffix)}>{suffix}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";

/* ───────── PasswordInput ───────── */

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M3 3l14 14M8 5a8 8 0 0 1 2-.3c5 0 8 5.3 8 5.3a13 13 0 0 1-2.3 2.9M12 12a2.5 2.5 0 0 1-3.4-3.4m-2.3-2.5A13 13 0 0 0 2 10s3 5.5 8 5.5a8 8 0 0 0 3.3-.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface PasswordInputProps extends Omit<InputProps, "type" | "suffix"> {
  /** 비밀번호 표시 토글 버튼을 숨긴다. @default false */
  hideToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hideToggle, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    const toggleBtn = hideToggle ? undefined : (
      <button
        type="button"
        className={toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    );

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        suffix={toggleBtn}
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";

/* ───────── NumberInput ───────── */

export interface NumberInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number | undefined) => void;
  thousandsSeparator?: boolean;
  min?: number;
  max?: number;
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
    ref,
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
      const allowedRe = allowNegative ? /[^\d-]/g : /[^\d]/g;
      let cleaned = raw.replace(allowedRe, "");
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
  },
);
NumberInput.displayName = "NumberInput";

/* ───────── PhoneInput (KR) ───────── */

const formatPhoneKR = (digits: string): string => {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";

  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }

  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
};

export interface PhoneInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (digits: string) => void;
}

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
  },
);
PhoneInput.displayName = "PhoneInput";

/* ───────── BusinessNumberInput (KR) ───────── */

const formatBRN = (digits: string): string => {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
};

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
  value?: string;
  defaultValue?: string;
  onValueChange?: (digits: string) => void;
  validateChecksum?: boolean;
}

export const BusinessNumberInput = React.forwardRef<HTMLInputElement, BusinessNumberInputProps>(
  (
    { value, defaultValue, onValueChange, validateChecksum, onBlur, "aria-invalid": ariaInvalidProp, ...rest },
    ref,
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
  },
);
BusinessNumberInput.displayName = "BusinessNumberInput";
