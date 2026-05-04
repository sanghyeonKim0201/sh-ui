import { style, keyframes } from "@vanilla-extract/css";

export const shUiDmIn = keyframes({
  "from": {
    opacity: 0,
    transform: "scale(0.96)",
  },
  "to": {
    opacity: 1,
    transform: "scale(1)",
  },
});

export const shUiDmOut = keyframes({
  "from": {
    opacity: 1,
    transform: "scale(1)",
  },
  "to": {
    opacity: 0,
    transform: "scale(0.96)",
  },
});

export const dm__trigger = style({
  font: "inherit",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
});

export const dm__positioner = style({
  outline: "none",
  zIndex: "var(--z-dropdown)",
});

export const dm__content = style({
  minWidth: "10rem",
  maxHeight: "min(24rem, var(--available-height, 24rem))",
  overflowY: "auto",
  padding: "var(--space-1)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08),\n    0 2px 4px -2px rgba(0, 0, 0, 0.05)",
  fontSize: "var(--text-sm)",
  transformOrigin: "var(--transform-origin)",
  animation: "sh-ui-dm-in 140ms ease-out",
  outline: "none",
  selectors: {
    "&[data-ending-style]": {
      animation: "sh-ui-dm-out 100ms ease-in forwards",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
      selectors: {
        "&[data-ending-style]": {
          animation: "none",
        },
      },
    },
  },
});

export const dm__item = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "0.5rem 0.75rem",
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  outline: "none",
  userSelect: "none",
  transition: "background-color 80ms",
  selectors: {
    "&[data-highlighted]": {
      background: "var(--background-muted)",
    },
    "&:hover": {
      background: "var(--background-muted)",
    },
    "&[data-disabled]": {
      opacity: "var(--opacity-disabled)",
      pointerEvents: "none",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const dmItemText = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const dmItemCheck = style({
  paddingLeft: "1.75rem",
});

export const dmItemIndicator = style({
  position: "absolute",
  left: "0.5rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1rem",
  height: "1rem",
  color: "var(--foreground)",
});

export const dm__group = style({
  padding: 0,
});

export const dm__label = style({
  padding: "var(--space-2) var(--space-2) var(--space-1)",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-semibold)",
  color: "var(--foreground-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const dm__separator = style({
  height: "1px",
  background: "var(--border)",
  margin: "var(--space-1) 0",
});

export const dmSubArrow = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "auto",
  color: "var(--foreground-muted)",
});

export const dmSubTrigger = style({
  selectors: {
    "&[data-popup-open]": {
      background: "var(--background-muted)",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "dm__trigger": dm__trigger,
  "dm__positioner": dm__positioner,
  "dm__content": dm__content,
  "dm__item": dm__item,
  "dm__item-text": dmItemText,
  "dm__item--check": dmItemCheck,
  "dm__item-indicator": dmItemIndicator,
  "dm__group": dm__group,
  "dm__label": dm__label,
  "dm__separator": dm__separator,
  "dm__sub-arrow": dmSubArrow,
  "dm__sub-trigger": dmSubTrigger,
};
