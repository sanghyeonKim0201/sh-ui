import { style, keyframes } from "@vanilla-extract/css";

export const shUiSelectIn = keyframes({
  "from": {
    opacity: 0,
    transform: "scale(0.96)",
  },
  "to": {
    opacity: 1,
    transform: "scale(1)",
  },
});

export const shUiSelectOut = keyframes({
  "from": {
    opacity: 1,
    transform: "scale(1)",
  },
  "to": {
    opacity: 0,
    transform: "scale(0.96)",
  },
});

export const select__trigger = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-2)",
  minWidth: "10rem",
  height: "var(--control-md)",
  padding: "0 var(--space-3)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: "var(--text-sm)",
  lineHeight: 1,
  cursor: "pointer",
  transition: "border-color var(--duration-fast), background-color var(--duration-fast)",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:hover:not(:disabled)": {
      borderColor: "var(--border-strong)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&[data-popup-open]": {
      borderColor: "var(--border-strong)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      pointerEvents: "none",
    },
    [`&[data-popup-open] ${select__icon}`]: {
      transform: "rotate(180deg)",
    },
  },
});

export const select__value = style({
  flex: "1 1 auto",
  textAlign: "left",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const select__placeholder = style({
  color: "var(--foreground-subtle)",
});

export const select__icon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--foreground-muted)",
  flexShrink: 0,
  transition: "transform var(--duration-fast)",
});

export const select__positioner = style({
  outline: "none",
  zIndex: "var(--z-dropdown)",
});

export const select__content = style({
  minWidth: "var(--anchor-width, 10rem)",
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
  animation: "sh-ui-select-in 140ms ease-out",
  selectors: {
    "&[data-ending-style]": {
      animation: "sh-ui-select-out 100ms ease-in forwards",
    },
  },
});

export const select__label = style({
  padding: "var(--space-2) var(--space-2) var(--space-1)",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-semibold)",
  color: "var(--foreground-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const select__item = style({
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
});

export const selectItemText = style({
  flex: 1,
});

export const select__indicator = style({
  order: 1,
  marginLeft: "auto",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--foreground)",
});

export const select__separator = style({
  height: "1px",
  background: "var(--border)",
  margin: "var(--space-1) 0",
});

export const select__chips = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  flexWrap: "nowrap",
  overflow: "hidden",
});

export const select__chip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  padding: "0.125rem 0.375rem 0.125rem var(--space-2)",
  fontSize: "var(--text-xs)",
  lineHeight: "1.25rem",
  background: "var(--background-muted)",
  borderRadius: "calc(var(--radius) - 2px)",
  whiteSpace: "nowrap",
});

export const selectChipRemove = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1rem",
  height: "1rem",
  padding: 0,
  border: 0,
  borderRadius: "999px",
  background: "transparent",
  color: "var(--foreground-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: 1,
  cursor: "pointer",
  transition: "background-color var(--duration-fast), color var(--duration-fast)",
  selectors: {
    "&:hover": {
      background: "var(--background)",
      color: "var(--foreground)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "1px",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "select__trigger": select__trigger,
  "select__value": select__value,
  "select__placeholder": select__placeholder,
  "select__icon": select__icon,
  "select__positioner": select__positioner,
  "select__content": select__content,
  "select__label": select__label,
  "select__item": select__item,
  "select__item-text": selectItemText,
  "select__indicator": select__indicator,
  "select__separator": select__separator,
  "select__chips": select__chips,
  "select__chip": select__chip,
  "select__chip-remove": selectChipRemove,
};
