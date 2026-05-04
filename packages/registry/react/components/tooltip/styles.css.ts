import { style } from "@vanilla-extract/css";

export const tooltip__positioner = style({
  zIndex: "var(--z-tooltip, var(--z-popover))",
  outline: "none",
});

export const tooltip__content = style({
  padding: "0.375rem 0.625rem",
  background: "var(--foreground)",
  color: "var(--background)",
  borderRadius: "calc(var(--radius) - 2px)",
  fontSize: "var(--text-xs)",
  lineHeight: 1.4,
  maxWidth: "20rem",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  transformOrigin: "var(--transform-origin)",
  outline: "none",
  transition: "opacity 120ms ease,\n    transform 120ms ease",
  selectors: {
    "&[data-starting-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
    "&[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.96)",
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

export const tooltip__arrow = style({
  color: "var(--foreground)",
  selectors: {
    "& svg": {
      display: "block",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "tooltip__positioner": tooltip__positioner,
  "tooltip__content": tooltip__content,
  "tooltip__arrow": tooltip__arrow,
};
