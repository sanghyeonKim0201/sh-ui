"use client";

import * as React from "react";
import "./styles.css";

export interface ColorPickerProps {
  /** 현재 색상 (hex, e.g. "#FF8800"). */
  value?: string;
  /** 변경 콜백. */
  onChange?: (hex: string) => void;
  /** 비제어 모드 초기값. */
  defaultValue?: string;
  className?: string;
}

interface HSV {
  h: number; // 0~360
  s: number; // 0~1
  v: number; // 0~1
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

/* ───────────── component ───────────── */

export function ColorPicker({
  value: valueProp,
  onChange,
  defaultValue = "#000000",
  className,
}: ColorPickerProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = isControlled ? valueProp! : internal;

  const [hsv, setHsv] = React.useState<HSV>(() => hexToHsv(value));
  const [hexInput, setHexInput] = React.useState(value);

  /* 외부 value 변경 시 hsv/hexInput 동기화 (단, 우리가 만든 hex는 무시 — 무한 루프 방지) */
  const lastEmittedRef = React.useRef(value);
  React.useEffect(() => {
    if (value === lastEmittedRef.current) return;
    setHsv(hexToHsv(value));
    setHexInput(value);
  }, [value]);

  const emit = React.useCallback(
    (nextHsv: HSV) => {
      const hex = hsvToHex(nextHsv);
      lastEmittedRef.current = hex;
      setHsv(nextHsv);
      setHexInput(hex);
      if (!isControlled) setInternal(hex);
      onChange?.(hex);
    },
    [isControlled, onChange]
  );

  /* SV 영역 드래그 */
  const sv = useDrag((e, el) => {
    const r = el.getBoundingClientRect();
    const x = clamp((e.clientX - r.left) / r.width, 0, 1);
    const y = clamp((e.clientY - r.top) / r.height, 0, 1);
    emit({ ...hsv, s: x, v: 1 - y });
  });

  /* Hue 슬라이더 드래그 */
  const hue = useDrag((e, el) => {
    const r = el.getBoundingClientRect();
    const x = clamp((e.clientX - r.left) / r.width, 0, 1);
    emit({ ...hsv, h: x * 360 });
  });

  const onHexCommit = () => {
    const v = hexInput.trim();
    if (HEX_RE.test(v)) {
      const normalized = (v.startsWith("#") ? v : `#${v}`).toUpperCase();
      const nextHsv = hexToHsv(normalized);
      emit(nextHsv);
    } else {
      setHexInput(value);
    }
  };

  const pureHueHex = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  return (
    <div className={["hyeon-color-picker", className].filter(Boolean).join(" ")}>
      {/* SV 영역 */}
      <div
        className="hyeon-color-picker__sv"
        ref={sv.ref}
        onPointerDown={sv.onPointerDown}
        style={{ background: pureHueHex }}
        role="slider"
        aria-label="채도/명도"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s * 100)}
      >
        <div className="hyeon-color-picker__sv-saturation" />
        <div className="hyeon-color-picker__sv-value" />
        <div
          className="hyeon-color-picker__sv-thumb"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            background: value,
          }}
        />
      </div>

      {/* Hue 슬라이더 */}
      <div
        className="hyeon-color-picker__hue"
        ref={hue.ref}
        onPointerDown={hue.onPointerDown}
        role="slider"
        aria-label="색조"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
      >
        <div
          className="hyeon-color-picker__hue-thumb"
          style={{ left: `${(hsv.h / 360) * 100}%` }}
        />
      </div>

      {/* Hex 인풋 + 미리보기 */}
      <div className="hyeon-color-picker__row">
        <div
          className="hyeon-color-picker__swatch"
          style={{ background: value }}
          aria-hidden
        />
        <input
          type="text"
          className="hyeon-color-picker__hex"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={onHexCommit}
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
    </div>
  );
}
