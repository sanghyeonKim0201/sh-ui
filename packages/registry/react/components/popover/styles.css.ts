import { style } from "@vanilla-extract/css";

export const popover__positioner = style({
  zIndex: "var(--z-popover)",
  outline: "none",
});

export const popover__content = style({
  minWidth: "12rem",
  padding: "var(--space-2)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  outline: "none",
  fontSize: "var(--text-sm)",
  lineHeight: 1.4,
  transformOrigin: "var(--transform-origin)",
  transition: "opacity 140ms ease,\n    transform 140ms ease",
  selectors: {
    "&[data-starting-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
    "&[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
      selectors: {
        "&[data-starting-style]": {
          transform: "none",
        },
        "&[data-ending-style]": {
          transform: "none",
        },
      },
    },
  },
});

export const popover__arrow = style({
  color: "var(--background)",
  selectors: {
    "& svg": {
      display: "block",
    },
  },
});

export const popover__title = style({
  margin: "0 0 var(--space-1)",
  fontWeight: "var(--weight-semibold)",
  fontSize: "0.9375rem",
});

export const popover__description = style({
  margin: 0,
  color: "var(--foreground-muted)",
  fontSize: "0.8125rem",
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "popover__positioner": popover__positioner,
  "popover__content": popover__content,
  "popover__arrow": popover__arrow,
  "popover__title": popover__title,
  "popover__description": popover__description,
};
