import { style } from "@vanilla-extract/css";

export const checkbox = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.125rem",
  height: "1.125rem",
  border: "1px solid var(--border-strong)",
  borderRadius: "calc(var(--radius) - 2px)",
  background: "var(--background)",
  color: "var(--primary-foreground)",
  cursor: "pointer",
  flexShrink: 0,
  transition: "background-color var(--duration-fast), border-color var(--duration-fast)",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:hover:not([data-disabled])": {
      borderColor: "var(--foreground)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&[data-checked]": {
      background: "var(--primary)",
      borderColor: "var(--primary)",
    },
    "&[data-indeterminate]": {
      background: "var(--primary)",
      borderColor: "var(--primary)",
    },
    "&[data-disabled]": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
  "@media": {
    "(hover: none) and (pointer: coarse)": {
      width: "1.25rem",
      height: "1.25rem",
    },
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const checkbox__indicator = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const checkboxGroup = style({
  display: "flex",
  gap: "0.625rem",
  selectors: {
    "&[data-orientation="vertical"]": {
      flexDirection: "column",
    },
    "&[data-orientation="horizontal"]": {
      flexDirection: "row",
      flexWrap: "wrap",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "checkbox": checkbox,
  "checkbox__indicator": checkbox__indicator,
  "checkbox-group": checkboxGroup,
};
