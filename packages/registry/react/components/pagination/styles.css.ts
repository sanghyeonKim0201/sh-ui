import { style } from "@vanilla-extract/css";

export const pagination = style({
  display: "flex",
  justifyContent: "center",
  fontSize: "var(--text-sm)",
  color: "var(--foreground)",
});

export const pagination__content = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.25rem",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const pagination__item = style({
  display: "inline-flex",
  alignItems: "center",
});

export const pagination__link = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.375rem",
  minWidth: "2.25rem",
  height: "2.25rem",
  padding: "0 0.75rem",
  borderRadius: "calc(var(--radius) - 2px)",
  border: "var(--border-width) solid transparent",
  background: "transparent",
  color: "var(--foreground)",
  textDecoration: "none",
  transition: "background-color var(--duration-fast),\n    border-color var(--duration-fast),\n    color var(--duration-fast)",
  cursor: "pointer",
  userSelect: "none",
  selectors: {
    "&[data-size="sm"]": {
      minWidth: "2rem",
      height: "2rem",
      padding: "0 0.5rem",
    },
    "&:hover": {
      background: "var(--background-muted)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&[data-active]": {
      background: "var(--foreground)",
      color: "var(--background)",
      fontWeight: "var(--weight-medium)",
    },
    "&[data-active]:hover": {
      background: "var(--foreground)",
      opacity: 0.9,
    },
    "&[aria-disabled="true"]": {
      pointerEvents: "none",
      opacity: 0.45,
    },
    "&[data-disabled]": {
      pointerEvents: "none",
      opacity: 0.45,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const pagination__nav = style({
  padding: "0 0.625rem",
});

export const pagination__ellipsis = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.25rem",
  height: "2.25rem",
  color: "var(--foreground-muted)",
});

export const pagination__sr = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "pagination": pagination,
  "pagination__content": pagination__content,
  "pagination__item": pagination__item,
  "pagination__link": pagination__link,
  "pagination__nav": pagination__nav,
  "pagination__ellipsis": pagination__ellipsis,
  "pagination__sr": pagination__sr,
};
