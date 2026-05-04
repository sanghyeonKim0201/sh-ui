import { style } from "@vanilla-extract/css";

export const radio = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.125rem",
  height: "1.125rem",
  border: "1px solid var(--border-strong)",
  borderRadius: "999px",
  background: "var(--background)",
  cursor: "pointer",
  flexShrink: 0,
  transition: "border-color var(--duration-fast)",
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
      borderColor: "var(--primary)",
    },
    "&[data-disabled]": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
    [`&[data-checked] ${radio__indicator}`]: {
      transform: "scale(1)",
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

export const radio__indicator = style({
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: "999px",
  background: "var(--primary)",
  transform: "scale(0)",
  transition: "transform var(--duration-fast) ease-out",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const radioGroup = style({
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
  "radio": radio,
  "radio__indicator": radio__indicator,
  "radio-group": radioGroup,
};
