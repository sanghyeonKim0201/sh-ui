"use client";

import { useRef, useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { NumericInput } from "@/components/ui/numeric-input";

/** offset X/Y 의 클램프 범위 — 패드 시각 크기와 일치. */
const OFFSET_RANGE = 50;

/**
 * CSS box-shadow 문자열을 X/Y/Blur/Spread/Color/Alpha 로 분해해 시각적으로 편집.
 * 사용자가 raw `0 4px 12px rgba(0,0,0,0.12)` 를 외울 필요 없이 Figma 스타일로 입력.
 *
 * 입력 형식: `<x> <y> <blur> [<spread>] <color>` — color 는 #RRGGBB / #RRGGBBAA / rgb() / rgba().
 * 출력 형식: `<x>px <y>px <blur>px [<spread>px] <color>` — alpha != 100% 면 rgba(), 그 외엔 hex.
 *
 * 파싱 실패 시 디폴트 (0 1 2 0 #000000 8%) 로 폴백 — 그 값으로 onChange 가 즉시 트리거되지는 않음
 * (사용자가 첫 인터랙션 할 때 정상 값이 emit). 단일 레이어만 — 다중 shadow 는 v1 에선 미지원.
 */

export interface ShadowParts {
  x: number;
  y: number;
  blur: number;
  spread: number;
  /** #RRGGBB. */
  color: string;
  /** 0~100 (%). */
  alpha: number;
}

const DEFAULT_PARTS: ShadowParts = {
  x: 0, y: 1, blur: 2, spread: 0, color: "#000000", alpha: 8,
};

const HEX_RE = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export const parseShadow = (str: string): ShadowParts | null => {
  // tokenize 공백 단위, 단 괄호 내부는 보호 (rgba(0,0,0,0.5))
  const tokens: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i <= str.length; i++) {
    const c = str[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    if ((c === " " || i === str.length) && depth === 0) {
      const t = str.slice(start, i).trim();
      if (t) tokens.push(t);
      start = i + 1;
    }
  }
  if (tokens.length < 4 || tokens.length > 5) return null;
  const x = parseLen(tokens[0]);
  const y = parseLen(tokens[1]);
  const blur = parseLen(tokens[2]);
  if (x === null || y === null || blur === null) return null;
  let spread = 0;
  let colorStr: string;
  if (tokens.length === 4) {
    colorStr = tokens[3];
  } else {
    const sp = parseLen(tokens[3]);
    if (sp === null) return null;
    spread = sp;
    colorStr = tokens[4];
  }
  const c = parseColor(colorStr);
  if (!c) return null;
  return { x, y, blur, spread, color: c.hex, alpha: c.alpha };
};

const parseLen = (s: string): number | null => {
  const m = s.match(/^(-?[\d.]+)(?:px)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
};

const parseColor = (s: string): { hex: string; alpha: number } | null => {
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 6) {
      return { hex: `#${hex.toUpperCase()}`, alpha: 100 };
    }
    if (hex.length === 8) {
      return {
        hex: `#${hex.slice(0, 6).toUpperCase()}`,
        alpha: Math.round((parseInt(hex.slice(6, 8), 16) / 255) * 100),
      };
    }
    return null;
  }
  const m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(",").map((p) => p.trim());
    if (parts.length < 3 || parts.length > 4) return null;
    const r = parseInt(parts[0], 10);
    const g = parseInt(parts[1], 10);
    const b = parseInt(parts[2], 10);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    const alphaRaw = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    if (Number.isNaN(alphaRaw)) return null;
    const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0").toUpperCase()).join("")}`;
    return { hex, alpha: Math.max(0, Math.min(100, Math.round(alphaRaw * 100))) };
  }
  return null;
};

export const serializeShadow = (p: ShadowParts): string => {
  const lengths = [`${p.x}px`, `${p.y}px`, `${p.blur}px`];
  if (p.spread !== 0) lengths.push(`${p.spread}px`);
  let colorStr: string;
  if (p.alpha === 100 && HEX_RE.test(p.color)) {
    colorStr = p.color.toUpperCase();
  } else if (HEX_RE.test(p.color)) {
    const r = parseInt(p.color.slice(1, 3), 16);
    const g = parseInt(p.color.slice(3, 5), 16);
    const b = parseInt(p.color.slice(5, 7), 16);
    colorStr = `rgba(${r}, ${g}, ${b}, ${(p.alpha / 100).toFixed(2)})`;
  } else {
    // 비정상 hex — fallback
    colorStr = `rgba(0, 0, 0, ${(p.alpha / 100).toFixed(2)})`;
  }
  return `${lengths.join(" ")} ${colorStr}`;
};

export function ShadowBuilder({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const parts = parseShadow(value) ?? DEFAULT_PARTS;
  const [colorOpen, setColorOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  // 빠른 pointerdown→pointermove 시 setState 가 아직 flush 되지 않아 첫 move 를
  // 놓치는 회귀를 막기 위해 sync ref 도 같이 보관.
  const draggingRef = useRef(false);
  const padRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<ShadowParts>) => {
    onChange(serializeShadow({ ...parts, ...patch }));
  };

  /**
   * 패드 중심을 원점(0,0) 으로 잡고, pointer 위치 → (X, Y) offset.
   * 1:1 px 매핑, [-50, +50] 클램프.
   */
  const applyXYFromPointer = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = Math.max(-OFFSET_RANGE, Math.min(OFFSET_RANGE, Math.round(clientX - cx)));
    const y = Math.max(-OFFSET_RANGE, Math.min(OFFSET_RANGE, Math.round(clientY - cy)));
    update({ x, y });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
    applyXYFromPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    applyXYFromPointer(e.clientX, e.clientY);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    draggingRef.current = false;
    setDragging(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <code
        style={{
          fontSize: "0.6875rem",
          color: "var(--foreground-muted)",
          whiteSpace: "nowrap",
        }}
      >
        --{label}
      </code>

      {/* XY 패드 — 클릭/드래그로 offset 설정. ColorPicker 의 색공간과 같은 패턴. */}
      <div
        ref={padRef}
        role="application"
        aria-label={`${label} XY offset 패드`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative",
          height: `${OFFSET_RANGE * 2}px`,
          background: "var(--background-muted)",
          border: "1px solid var(--border)",
          borderRadius: "calc(var(--radius) - 2px)",
          cursor: dragging ? "grabbing" : "crosshair",
          overflow: "hidden",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* 가운데 카드 — 실제 shadow 가 적용된 미리보기. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "2.25rem",
            height: "2.25rem",
            background: "var(--background)",
            borderRadius: "calc(var(--radius) - 4px)",
            boxShadow: value,
            pointerEvents: "none",
          }}
        />
        {/* 원점 마커 — 중심 표시. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "var(--foreground-muted)",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
        {/* 핸들 — 현재 (X, Y) 위치. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${parts.x}px), calc(-50% + ${parts.y}px))`,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--foreground)",
            border: "2px solid var(--background)",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.25)",
            pointerEvents: "none",
            transition: dragging ? "none" : "transform var(--duration-fast) var(--ease-standard)",
          }}
        />
      </div>

      {/* X / Y */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem" }}>
        <FieldRow label="X">
          <NumericInput
            value={parts.x}
            onValueChange={(v) => update({ x: v })}
            min={-50}
            max={50}
            unit="px"
            aria-label={`${label} X`}
          />
        </FieldRow>
        <FieldRow label="Y">
          <NumericInput
            value={parts.y}
            onValueChange={(v) => update({ y: v })}
            min={-50}
            max={50}
            unit="px"
            aria-label={`${label} Y`}
          />
        </FieldRow>
      </div>

      {/* Blur / Spread */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem" }}>
        <FieldRow label="Blur">
          <NumericInput
            value={parts.blur}
            onValueChange={(v) => update({ blur: v })}
            min={0}
            max={200}
            unit="px"
            aria-label={`${label} blur`}
          />
        </FieldRow>
        <FieldRow label="Spread">
          <NumericInput
            value={parts.spread}
            onValueChange={(v) => update({ spread: v })}
            min={-50}
            max={50}
            unit="px"
            aria-label={`${label} spread`}
          />
        </FieldRow>
      </div>

      {/* Color + Alpha */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={() => setColorOpen((v) => !v)}
          aria-label={`${label} color`}
          aria-expanded={colorOpen}
          style={{
            width: "1.5rem",
            height: "1.5rem",
            padding: 0,
            border: colorOpen ? "2px solid var(--foreground)" : "1px solid var(--border)",
            borderRadius: "calc(var(--radius) - 4px)",
            background: parts.color,
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <code
          style={{
            fontSize: "0.6875rem",
            color: "var(--foreground-muted)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {parts.color}
        </code>
        <NumericInput
          value={parts.alpha}
          onValueChange={(v) => update({ alpha: v })}
          min={0}
          max={100}
          unit="%"
          aria-label={`${label} alpha`}
        />
      </div>

      {colorOpen && (
        <div
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border)",
            borderRadius: "calc(var(--radius) - 2px)",
            background: "var(--background-subtle)",
          }}
        >
          <ColorPicker value={parts.color} onChange={(v) => update({ color: v })} />
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "center",
        gap: "0.375rem",
      }}
    >
      <code
        style={{
          fontSize: "0.6875rem",
          color: "var(--foreground-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </code>
      {children}
    </div>
  );
}
