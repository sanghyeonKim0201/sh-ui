"use client";

/**
 * 토큰 편집기·그라데이션 빌더 안에서 슬라이더 옆 값 표시 + 키보드 입력 양쪽 역할.
 * 외관은 <code> 처럼 우측 정렬 monospace, 클릭/탭 시 인라인 편집. min/max 로 clamp.
 *
 * className 'sh-create-numeric' 의 스피너 숨김·hover 보더는 globals.css 에 정의.
 */
export function NumericInput({
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
  ariaLabel,
  width,
  unitWidth,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  ariaLabel: string;
  /** 입력 box 폭 override (기본 2.5rem). */
  width?: string;
  /** 전체 컨테이너 minWidth (기본 3rem). */
  unitWidth?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.125rem",
        minWidth: unitWidth ?? "3rem",
        justifyContent: "flex-end",
      }}
    >
      <input
        type="number"
        className="sh-create-numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        onFocus={(e) => e.currentTarget.select()}
        aria-label={ariaLabel}
        style={width ? { width } : undefined}
      />
      {unit && (
        <code style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>
          {unit}
        </code>
      )}
    </span>
  );
}
