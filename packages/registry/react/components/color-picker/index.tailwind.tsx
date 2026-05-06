"use client";

import * as React from "react";

import { cn } from "@SH_UI_UTILS@";
interface HSV { h: number; s: number; v: number; }
interface HSVA extends HSV { a: number; }

export interface ColorPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "children"> {
  value?: string;
  onChange?: (hex: string) => void;
  defaultValue?: string;
  children?: React.ReactNode;
}

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }

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
  const max = Math.max(rn, gn, bn); const min = Math.min(rn, gn, bn);
  const d = max - min; let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max; const v = max;
  return { h, s, v };
}
function hsvToRgb({ h, s, v }: HSV): [number, number, number] {
  const c = v * s; const hh = h / 60;
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
function hexToHsv(hex: string): HSV { const [r, g, b] = hexToRgb(hex); return rgbToHsv(r, g, b); }
function hsvToHex(hsv: HSV): string { const [r, g, b] = hsvToRgb(hsv); return rgbToHex(r, g, b); }

const HEX_RE = /^#?[0-9a-f]{6}$/i;

function useDrag(onMove: (e: PointerEvent, el: HTMLElement) => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
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

interface ColorPickerContextValue {
  hsva: HSVA; hex: string; pureHueHex: string;
  setHsv: (next: Partial<HSV>) => void;
  setAlpha: (a: number) => void;
  commitHex: (raw: string) => boolean;
}
const ColorPickerContext = React.createContext<ColorPickerContextValue | null>(null);
function useColorPicker() {
  const ctx = React.useContext(ColorPickerContext);
  if (!ctx) throw new Error("ColorPicker 하위 컴포넌트는 <ColorPicker> 내부에서만 사용할 수 있습니다.");
  return ctx;
}

export function ColorPicker({
  value: valueProp, onChange, defaultValue = "#000000", className, children, ...rest
}: ColorPickerProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = isControlled ? valueProp! : internal;
  const [hsva, setHsva] = React.useState<HSVA>(() => ({ ...hexToHsv(value), a: 1 }));

  const lastEmittedRef = React.useRef(value);
  React.useEffect(() => {
    if (value === lastEmittedRef.current) return;
    setHsva((prev) => ({ ...hexToHsv(value), a: prev.a }));
  }, [value]);

  const setHsv = React.useCallback((partial: Partial<HSV>) => {
    const next: HSVA = { ...hsva, ...partial };
    const hex = hsvToHex(next);
    lastEmittedRef.current = hex;
    setHsva(next);
    if (!isControlled) setInternal(hex);
    onChange?.(hex);
  }, [hsva, isControlled, onChange]);

  const setAlpha = React.useCallback((a: number) => {
    setHsva((prev) => ({ ...prev, a: clamp(a, 0, 1) }));
  }, []);

  const commitHex = React.useCallback((raw: string) => {
    const v = raw.trim();
    if (!HEX_RE.test(v)) return false;
    const normalized = (v.startsWith("#") ? v : `#${v}`).toUpperCase();
    const nextHsv = hexToHsv(normalized);
    const next: HSVA = { ...nextHsv, a: hsva.a };
    const hex = hsvToHex(next);
    lastEmittedRef.current = hex;
    setHsva(next);
    if (!isControlled) setInternal(hex);
    onChange?.(hex);
    return true;
  }, [hsva.a, isControlled, onChange]);

  const pureHueHex = React.useMemo(() => hsvToHex({ h: hsva.h, s: 1, v: 1 }), [hsva.h]);
  const ctx = React.useMemo<ColorPickerContextValue>(
    () => ({ hsva, hex: value, pureHueHex, setHsv, setAlpha, commitHex }),
    [hsva, value, pureHueHex, setHsv, setAlpha, commitHex],
  );

  return (
    <ColorPickerContext.Provider value={ctx}>
      <div className={cn("flex flex-col gap-2.5 w-full select-none", className)} {...rest}>
        {children ?? (<><ColorPickerSaturation /><ColorPickerHue /><ColorPickerHex /></>)}
      </div>
    </ColorPickerContext.Provider>
  );
}

export interface ColorPickerSaturationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPointerDown"> {}

export function ColorPickerSaturation({ className, style, ...rest }: ColorPickerSaturationProps) {
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
      className={cn("relative w-full aspect-[4/3] rounded-[var(--radius)] cursor-crosshair overflow-hidden touch-none", className)}
      style={{ background: pureHueHex, ...style }}
      role="slider"
      aria-label="채도/명도"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hsva.s * 100)}
      {...rest}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#000,transparent)]" />
      <div
        className="absolute w-3.5 h-3.5 -ml-[0.4375rem] -mt-[0.4375rem] border-2 border-white rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.4)] pointer-events-none"
        style={{ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%`, background: hex }}
      />
    </div>
  );
}

export interface ColorPickerHueProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPointerDown"> {}

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
      className={cn("relative w-full h-3.5 rounded-full cursor-pointer touch-none bg-[linear-gradient(to_right,#f00_0%,#ff0_16.66%,#0f0_33.33%,#0ff_50%,#00f_66.66%,#f0f_83.33%,#f00_100%)]", className)}
      role="slider"
      aria-label="색조"
      aria-valuemin={0} aria-valuemax={360} aria-valuenow={Math.round(hsva.h)}
      {...rest}
    >
      <div
        className="absolute top-1/2 w-3.5 h-3.5 -ml-[0.4375rem] -translate-y-1/2 bg-white rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.4)] pointer-events-none"
        style={{ left: `${(hsva.h / 360) * 100}%` }}
      />
    </div>
  );
}

export interface ColorPickerAlphaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPointerDown"> {}

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
      className={cn("relative w-full h-3.5 rounded-full cursor-pointer touch-none overflow-hidden bg-white bg-[length:8px_8px] bg-[position:0_0,0_4px,4px_-4px,-4px_0] [background-image:linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)]", className)}
      role="slider"
      aria-label="투명도"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hsva.a * 100)}
      style={style}
      {...rest}
    >
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none" style={{ backgroundImage: gradient }} />
      <div
        className="absolute top-1/2 w-3.5 h-3.5 -ml-[0.4375rem] -translate-y-1/2 bg-white rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.4)] pointer-events-none"
        style={{ left: `${hsva.a * 100}%` }}
      />
    </div>
  );
}

export interface ColorPickerHexProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  showSwatch?: boolean;
}

export function ColorPickerHex({ className, showSwatch = true, ...rest }: ColorPickerHexProps) {
  const { hex, commitHex } = useColorPicker();
  const [draft, setDraft] = React.useState(hex);

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(hex);
  }, [hex]);

  const onCommit = () => { if (!commitHex(draft)) setDraft(hex); };

  return (
    <div
      className={cn("flex items-center gap-[var(--space-2)]", className)}
      {...rest}
    >
      {showSwatch && (
        <div
          className="w-7 h-7 rounded-[calc(var(--radius)-2px)] border border-border shrink-0"
          style={{ background: hex }}
          aria-hidden
        />
      )}
      <input
        ref={inputRef}
        type="text"
        className="flex-1 min-w-0 h-7 px-[var(--space-2)] border border-border rounded-[calc(var(--radius)-2px)] bg-background text-foreground font-mono text-[0.8125rem] uppercase focus:outline-none focus:border-foreground focus:shadow-[0_0_0_1px_var(--foreground)]"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); }
        }}
        spellCheck={false}
        aria-label="Hex"
      />
    </div>
  );
}

export interface ColorPickerSwatchesProps extends React.HTMLAttributes<HTMLDivElement> {
  colors: string[];
}

export function ColorPickerSwatches({ className, colors, ...rest }: ColorPickerSwatchesProps) {
  const { hex, commitHex } = useColorPicker();
  return (
    <div
      role="group"
      aria-label="미리 준비된 색상"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...rest}
    >
      {colors.map((c) => {
        const normalized = c.toUpperCase();
        const selected = normalized === hex.toUpperCase();
        return (
          <button
            key={c}
            type="button"
            className="w-5 h-5 p-0 border border-border rounded-[calc(var(--radius)-4px)] cursor-pointer transition-[transform,box-shadow] duration-[var(--duration-fast)] hover:scale-110 focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-primary focus-visible:outline-offset-2 data-[selected]:shadow-[0_0_0_2px_var(--background),0_0_0_3.5px_var(--foreground)]"
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
