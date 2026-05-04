import { style } from "@vanilla-extract/css";

export const combobox__input = style({
  display: "inline-flex",
  width: "100%",
  minWidth: "10rem",
  height: "var(--control-md)",
  padding: "0 var(--space-3)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: "var(--text-sm)",
  lineHeight: 1,
  outline: "none",
  transition: "border-color var(--duration-fast)",
  selectors: {
    "&::placeholder": {
      color: "var(--foreground-subtle)",
    },
    "&:hover:not(:disabled)": {
      borderColor: "var(--border-strong)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      pointerEvents: "none",
    },
  },
});

export const combobox__positioner = style({
  zIndex: "var(--z-dropdown)",
  outline: "none",
  width: "var(--anchor-width)",
});

export const combobox__content = style({
  maxHeight: "min(20rem, var(--available-height))",
  overflowY: "auto",
  padding: "var(--space-1)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  outline: "none",
  transformOrigin: "var(--transform-origin)",
  transition: "opacity 140ms ease, transform 140ms ease",
  selectors: {
    "&[data-starting-style]": {
      opacity: 0,
      transform: "scale(0.97)",
    },
    "&[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.97)",
    },
  },
});

export const combobox__item = style({
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "0.375rem 0.75rem",
  fontSize: "var(--text-sm)",
  lineHeight: 1.4,
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  userSelect: "none",
  outline: "none",
  selectors: {
    "&[data-highlighted]": {
      background: "var(--background-muted)",
    },
    "&:hover": {
      background: "var(--background-muted)",
    },
    "&[data-selected]": {
      color: "var(--foreground)",
      fontWeight: "var(--weight-medium)",
    },
    "&[data-disabled]": {
      opacity: "var(--opacity-disabled)",
      pointerEvents: "none",
    },
  },
});

export const comboboxItemIndicator = style({
  order: 1,
  marginLeft: "auto",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--foreground)",
});

export const comboboxItemText = style({
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const combobox__empty = style({
  padding: "var(--space-3) var(--space-2)",
  textAlign: "center",
  fontSize: "0.8125rem",
  color: "var(--foreground-muted)",
});

export const comboboxGroupLabel = style({
  padding: "0.375rem var(--space-2) var(--space-1)",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-semibold)",
  color: "var(--foreground-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const combobox__chip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  padding: "0.125rem 0.375rem 0.125rem var(--space-2)",
  marginRight: "var(--space-1)",
  fontSize: "var(--text-xs)",
  lineHeight: "1.25rem",
  background: "var(--background-muted)",
  borderRadius: "calc(var(--radius) - 2px)",
  whiteSpace: "nowrap",
});

export const comboboxChipRemove = style({
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
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "combobox__input": combobox__input,
  "combobox__positioner": combobox__positioner,
  "combobox__content": combobox__content,
  "combobox__item": combobox__item,
  "combobox__item-indicator": comboboxItemIndicator,
  "combobox__item-text": comboboxItemText,
  "combobox__empty": combobox__empty,
  "combobox__group-label": comboboxGroupLabel,
  "combobox__chip": combobox__chip,
  "combobox__chip-remove": comboboxChipRemove,
};
