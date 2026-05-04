"use client";

import * as React from "react";
import { cn } from "@SH_UI_UTILS@";
import styles from "./styles.module.css";

/* ───────────── types ───────────── */

interface HSV {
  h: number; // 0~360
  s: number; // 0~1
  v: number; // 0~1
}

interface HSVA extends HSV {
  a: number; // 0~1
}

export interface ColorPickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue" | "children"
  > {
  /** 제어 모드 색상값 (hex, 예: `"#FF8800"`). 6자리 / 3자리 / `#` 생략 모두 허용. */
  value?: string;
  /** 색상 변경 콜백. 항상 6자리 대문자 hex(`"#RRGGBB"`)로 통일되어 전달된다. */
  onChange?: (hex: string) => void;
  /**
   * 비제어 모드 초기값.
   * @default "#000000"
   */
  defaultValue?: string;
  /**
   * compound 모드. 미지정 시 기본 레이아웃(Saturation + Hue + Hex)이 자동 렌더된다.
   * 직접 조립하려면 `ColorPickerSaturation`/`Hue`/`Alpha`/`Hex`/`Swatches`를 자식으로 넘긴다.
   */
  children?: React.ReactNode;
}

/* ───────────── color math ───────────── */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function hsvToRgb({ h, s, v }: HSV): [number, number, number] {
  const c = v * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hh >= 0 && hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function hexToHsv(hex: string): HSV {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

function hsvToHex(hsv: HSV): string {
  const [r, g, b] = hsvToRgb(hsv);
  return rgbToHex(r, g, b);
}

const HEX_RE = /^#?[0-9a-f]{6}$/i;

/* ───────────── drag hook ───────────── */

function useDrag(onMove: (e: PointerEvent, el: HTMLElement) => void) {
  const ref = React.useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    onMove(e.nativeEvent, el);

    const onPointerMove = (ev: PointerEvent) => onMove(ev, el);
    const onPointerUp = (ev: PointerEvent) => {
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
    };
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
  };

  return { ref, onPointerDown };
}

/* ───────────── context ───────────── */

interface ColorPickerContextValue {
  hsva: HSVA;
  hex: string;
  /** 현재 hue에 해당하는 순색(pure) hex. SV 배경용. */
  pureHueHex: string;
  setHsv: (next: Partial<HSV>) => void;
  setAlpha: (a: number) => void;
  commitHex: (raw: string) => boolean;
}

const ColorPickerContext = React.createContext<ColorPickerContextValue | null>(null);

function useColorPicker() {
  const ctx = React.useContext(ColorPickerContext);
  if (!ctx) {
    throw new Error(
      "ColorPicker 하위 컴포넌트는 <ColorPicker> 내부에서만 사용할 수 있습니다.",
    );
  }
  return ctx;
}

/* ───────────── root ───────────── */

/**
 * HSV 모델 기반 색상 선택기. children을 생략하면 기본 레이아웃(SV + Hue + Hex)이 자동 렌더되고,
 * 직접 조립하려면 ColorPickerSaturation/Hue/Alpha/Hex/Swatches를 자식으로 넘긴다.
 * 외부 노출값은 항상 6자리 대문자 hex(`#RRGGBB`).
 */
export function ColorPicker({
  value: valueProp,
  onChange,
  defaultValue = "#000000",
  className,
  children,
  ...rest
}: ColorPickerProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = isControlled ? valueProp! : internal;

  const [hsva, setHsva] = React.useState<HSVA>(() => ({ ...hexToHsv(value), a: 1 }));

  /* 외부 value 변경 시 hsv 동기화 (우리가 내놓은 hex는 무시 — 무한 루프 방지) */
  const lastEmittedRef = React.useRef(value);
  React.useEffect(() => {
    if (value === lastEmittedRef.current) return;
    setHsva((prev) => ({ ...hexToHsv(value), a: prev.a }));
  }, [value]);

  const emit = React.useCallback(
    (next: HSVA) => {
      const hex = hsvToHex(next);
      lastEmittedRef.current = hex;
      setHsva(next);
      if (!isControlled) setInternal(hex);
      onChange?.(hex);
    },
    [isControlled, onChange],
  );

  const setHsv = React.useCallback(
    (partial: Partial<HSV>) => {
      const next: HSVA = { ...hsva, ...partial };
      const hex = hsvToHex(next);
      lastEmittedRef.current = hex;
      setHsva(next);
      if (!isControlled) setInternal(hex);
      onChange?.(hex);
    },
    [hsva, isControlled, onChange],
  );

  const setAlpha = React.useCallback((a: number) => {
    setHsva((prev) => ({ ...prev, a: clamp(a, 0, 1) }));
  }, []);

  const commitHex = React.useCallback(
    (raw: string) => {
      const v = raw.trim();
      if (!HEX_RE.test(v)) return false;
      const normalized = (v.startsWith("#") ? v : `#${v}`).toUpperCase();
      const nextHsv = hexToHsv(normalized);
      emit({ ...nextHsv, a: hsva.a });
      return true;
    },
    [emit, hsva.a],
  );

  const pureHueHex = React.useMemo(
    () => hsvToHex({ h: hsva.h, s: 1, v: 1 }),
    [hsva.h],
  );

  const ctx = React.useMemo<ColorPickerContextValue>(
    () => ({
      hsva,
      hex: value,
      pureHueHex,
      setHsv,
      setAlpha,
      commitHex,
    }),
    [hsva, value, pureHueHex, setHsv, setAlpha, commitHex],
  );

  return (
    <ColorPickerContext.Provider value={ctx}>
      <div
        className={cn(styles["color-picker"], className)}
        {...rest}
      >
        {children ?? (
          <>
            <ColorPickerSaturation />
            <ColorPickerHue />
            <ColorPickerHex />
          </>
        )}
      </div>
    </ColorPickerContext.Provider>
  );
}

/* ───────────── parts ───────────── */

export interface ColorPickerSaturationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPointerDown"> {}

/** 채도(S)와 명도(V)를 동시에 조절하는 2D 박스. 포인터 드래그로 조작. */
export function ColorPickerSaturation({
  className,
  style,
  ...rest
}: ColorPickerSaturationProps) {
  const { hsva, hex, pureHueHex, setHsv } = useColorPicker();
  const drag = useDrag((e, el) => {
    const r = el.getBoundingClientRect();
    const x = clamp((e.clientX - r.left) / r.width, 0, 1);
    const y = clamp((e.clientY - r.top) / r.height, 0, 1);
    setHsv({ s: x, v: 1 - y });
  });
  return (
    <div
      ref={drag.ref}
      onPointerDown={drag.onPointerDown}
      className={cn(styles["color-picker__sv"], className)}
      style={{ background: pureHueHex, ...style }}
      role="slider"
      aria-label="채도/명도"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsva.s * 100)}
      {...rest}
    >
      <div className={styles["color-picker__sv-saturation"]} />
      <div className={styles["color-picker__sv-value"]} />
      <div
        className={styles["color-picker__sv-thumb"]}
        style={{
          left: `${hsva.s * 100}%`,
          top: `${(1 - hsva.v) * 100}%`,
          background: hex,
        }}
      />
    </div>
  );
}

export interface ColorPickerHueProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPointerDown"> {}

/** 색상(H, 0~360°) 슬라이더. 무지개 그라데이션 위에 thumb이 위치. */
export function ColorPickerHue({ className, ...rest }: ColorPickerHueProps) {
  const { hsva, setHsv } = useColorPicker();
  const drag = useDrag((e, el) => {
    const r = el.getBoundingClientRect();
    const x = clamp((e.clientX - r.left) / r.width, 0, 1);
    setHsv({ h: x * 360 });
  });
  return (
    <div
      ref={drag.ref}
      onPointerDown={drag.onPointerDown}
      className={cn(styles["color-picker__hue"], className)}
      role="slider"
      aria-label="색조"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hsva.h)}
      {...rest}
    >
      <div
        className={styles["color-picker__hue-thumb"]}
        style={{ left: `${(hsva.h / 360) * 100}%` }}
      />
    </div>
  );
}

export interface ColorPickerAlphaProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPointerDown"> {}

/** 투명도(A, 0~100%) 슬라이더. 외부에 알파를 노출하지 않는 hex 모드와는 시각 표시용. */
export function ColorPickerAlpha({ className, style, ...rest }: ColorPickerAlphaProps) {
  const { hsva, hex, setAlpha } = useColorPicker();
  const drag = useDrag((e, el) => {
    const r = el.getBoundingClientRect();
    const x = clamp((e.clientX - r.left) / r.width, 0, 1);
    setAlpha(x);
  });
  const gradient = `linear-gradient(to right, rgba(0,0,0,0) 0%, ${hex} 100%)`;
  return (
    <div
      ref={drag.ref}
      onPointerDown={drag.onPointerDown}
      className={cn(styles["color-picker__alpha"], className)}
      role="slider"
      aria-label="투명도"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsva.a * 100)}
      style={style}
      {...rest}
    >
      <div
        className={styles["color-picker__alpha-track"]}
        style={{ backgroundImage: gradient }}
      />
      <div
        className={styles["color-picker__hue-thumb"]}
        style={{ left: `${hsva.a * 100}%` }}
      />
    </div>
  );
}

export interface ColorPickerHexProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * input 좌측에 현재 색상 미리보기 swatch 표시 여부.
   * @default true
   */
  showSwatch?: boolean;
}

/** Hex 직접 입력 + 좌측 swatch. blur·Enter 시 검증·커밋되며 잘못된 값은 이전 값으로 되돌린다. */
export function ColorPickerHex({
  className,
  showSwatch = true,
  ...rest
}: ColorPickerHexProps) {
  const { hex, commitHex } = useColorPicker();
  const [draft, setDraft] = React.useState(hex);

  // 외부 hex 변경 시 draft 동기화 (단, 포커스 중이 아닐 때만)
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(hex);
  }, [hex]);

  const onCommit = () => {
    if (!commitHex(draft)) setDraft(hex);
  };

  return (
    <div
      className={cn(styles["color-picker__row"], className)}
      {...rest}
    >
      {showSwatch && (
        <div
          className={styles["color-picker__swatch"]}
          style={{ background: hex }}
          aria-hidden
        />
      )}
      <input
        ref={inputRef}
        type="text"
        className={styles["color-picker__hex"]}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        spellCheck={false}
        aria-label="Hex"
      />
    </div>
  );
}

export interface ColorPickerSwatchesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 표시할 hex 색상 목록. 항목 클릭 시 해당 색상으로 즉시 commit된다.
   * 형식은 `"#RRGGBB"` 권장 (입력 시 대소문자는 자동 정규화).
   */
  colors: string[];
}

/** 미리 정의된 색상 팔레트 그리드. 각 항목 클릭 시 그 색상으로 즉시 커밋한다. */
export function ColorPickerSwatches({
  className,
  colors,
  ...rest
}: ColorPickerSwatchesProps) {
  const { hex, commitHex } = useColorPicker();
  return (
    <div
      role="group"
      aria-label="미리 준비된 색상"
      className={cn(styles["color-picker__swatches"], className)}
      {...rest}
    >
      {colors.map((c) => {
        const normalized = c.toUpperCase();
        const selected = normalized === hex.toUpperCase();
        return (
          <button
            key={c}
            type="button"
            className={styles["color-picker__swatch-btn"]}
            aria-label={c}
            aria-pressed={selected}
            data-selected={selected || undefined}
            style={{ background: c }}
            onClick={() => commitHex(c)}
          />
        );
      })}
    </div>
  );
}
