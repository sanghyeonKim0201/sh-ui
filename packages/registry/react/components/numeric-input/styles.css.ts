import { style } from "@vanilla-extract/css";

export const numericInput = style({
  display: "inline-flex",
  alignItems: "baseline",
  gap: "2px",
  minWidth: "3rem",
  justifyContent: "flex-end",
});

export const numericInputInput = style({
  width: "2.5rem",
  padding: "2px 4px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "var(--text-xs)",
  lineHeight: 1.2,
  textAlign: "right",
  border: "1px solid transparent",
  borderRadius: "calc(var(--radius) - 4px)",
  background: "transparent",
  color: "var(--foreground)",
  appearance: "textfield",
  MozAppearance: "textfield",
  transition: "border-color var(--duration-fast) var(--ease-standard),\n    background-color var(--duration-fast) var(--ease-standard)",
  selectors: {
    "&::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    "&::-webkit-outer-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    "&:hover:not(:disabled):not(:focus)": {
      borderColor: "var(--border)",
    },
    "&:focus": {
      outline: "none",
      borderColor: "var(--foreground)",
      background: "var(--background)",
    },
    "&:focus-visible": {
      outline: "none",
      borderColor: "var(--foreground)",
      background: "var(--background)",
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: "var(--opacity-disabled)",
    },
  },
});

export const numericInputUnit = style({
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "var(--text-xs)",
  color: "var(--foreground-muted)",
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "numeric-input": numericInput,
  "numeric-input__input": numericInputInput,
  "numeric-input__unit": numericInputUnit,
};
