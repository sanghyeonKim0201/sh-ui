"use client";

import * as React from "react";
import "./styles.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 입력 필드 오른쪽에 붙는 요소 (아이콘/버튼). 있으면 우측 padding이 자동으로 늘어남. */
  suffix?: React.ReactNode;
  /** 입력 필드 왼쪽에 붙는 요소. 있으면 좌측 padding이 자동으로 늘어남. */
  prefix?: React.ReactNode;
}

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", prefix, suffix, ...props }, ref) => {
    const hasAffix = Boolean(prefix || suffix);
    const input = (
      <input
        ref={ref}
        type={type}
        className={cx(
          "sh-ui-input",
          prefix && "sh-ui-input--with-prefix",
          suffix && "sh-ui-input--with-suffix",
          className,
        )}
        {...props}
      />
    );

    if (!hasAffix) return input;

    return (
      <div className="sh-ui-input-wrap">
        {prefix && <span className="sh-ui-input__affix sh-ui-input__affix--prefix">{prefix}</span>}
        {input}
        {suffix && <span className="sh-ui-input__affix sh-ui-input__affix--suffix">{suffix}</span>}
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
  /** 토글 아이콘을 숨기고 싶을 때 */
  hideToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hideToggle, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    const toggle = hideToggle ? undefined : (
      <button
        type="button"
        className="sh-ui-input__toggle"
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
        suffix={toggle}
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";

/* ───────── NumberInput ─────────
 * 정수 입력 + 천 단위 콤마(옵션). value/onValueChange는 number | undefined.
 */

export interface NumberInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number | undefined) => void;
  /** 천 단위 콤마 표시 (기본 true). */
  thousandsSeparator?: boolean;
  min?: number;
  max?: number;
  /** 음수 허용 (기본 true). */
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
  /** 숫자만의 문자열 (예: "01012345678"). */
  value?: string;
  defaultValue?: string;
  /** 숫자만의 문자열로 콜백. */
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

/** 한국 사업자등록번호 체크섬 검증. 10자리 입력만 유효. */
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
  /** 10자리 입력 시 체크섬 검증 → 실패 시 aria-invalid 자동 부착. */
  validateChecksum?: boolean;
}

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
