import { style, keyframes } from "@vanilla-extract/css";

export const shUiCmIn = keyframes({
  "from": {
    opacity: 0,
    transform: "scale(0.96)",
  },
  "to": {
    opacity: 1,
    transform: "scale(1)",
  },
});

export const shUiCmOut = keyframes({
  "from": {
    opacity: 1,
    transform: "scale(1)",
  },
  "to": {
    opacity: 0,
    transform: "scale(0.96)",
  },
});

export const cm__trigger = style({
  display: "contents",
});

export const cm__positioner = style({
  outline: "none",
  zIndex: "var(--z-dropdown)",
});

export const cm__content = style({
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
  animation: "sh-ui-cm-in 140ms ease-out",
  outline: "none",
  selectors: {
    "&[data-ending-style]": {
      animation: "sh-ui-cm-out 100ms ease-in forwards",
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

export const cm__item = style({
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

export const cmItemText = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const cmItemCheck = style({
  paddingLeft: "1.75rem",
});

export const cmItemIndicator = style({
  position: "absolute",
  left: "0.5rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1rem",
  height: "1rem",
  color: "var(--foreground)",
});

export const cm__group = style({
  padding: 0,
});

export const cm__label = style({
  padding: "var(--space-2) var(--space-2) var(--space-1)",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-semibold)",
  color: "var(--foreground-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const cm__separator = style({
  height: "1px",
  background: "var(--border)",
  margin: "var(--space-1) 0",
});

export const cmSubArrow = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "auto",
  color: "var(--foreground-muted)",
});

export const cmSubTrigger = style({
  selectors: {
    "&[data-popup-open]": {
      background: "var(--background-muted)",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "cm__trigger": cm__trigger,
  "cm__positioner": cm__positioner,
  "cm__content": cm__content,
  "cm__item": cm__item,
  "cm__item-text": cmItemText,
  "cm__item--check": cmItemCheck,
  "cm__item-indicator": cmItemIndicator,
  "cm__group": cm__group,
  "cm__label": cm__label,
  "cm__separator": cm__separator,
  "cm__sub-arrow": cmSubArrow,
  "cm__sub-trigger": cmSubTrigger,
};
