import { style } from "@vanilla-extract/css";

export const accordion = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  selectors: {
    [`&[data-size="sm"] ${accordion__trigger}`]: {
      padding: "var(--space-2) var(--space-1)",
      fontSize: "var(--text-xs)",
      lineHeight: 1.2,
    },
    [`&[data-size="sm"] ${accordion__chevron}`]: {
      width: "12px",
      height: "12px",
    },
    [`&[data-size="sm"] ${accordion__content}`]: {
      padding: "0 var(--space-1) var(--space-2)",
      fontSize: "var(--text-xs)",
      lineHeight: 1.5,
    },
  },
});

export const accordion__item = style({
  borderBottom: "1px solid var(--border)",
  selectors: {
    "&:first-child": {
      borderTop: "1px solid var(--border)",
    },
  },
});

export const accordion__header = style({
  margin: 0,
  font: "inherit",
});

export const accordion__trigger = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-4)",
  width: "100%",
  padding: "var(--space-4) var(--space-1)",
  background: "transparent",
  border: "none",
  color: "var(--foreground)",
  fontSize: "0.9375rem",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1.4,
  textAlign: "left",
  cursor: "pointer",
  transition: "background-color var(--duration-fast) var(--ease-standard)",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:not([disabled]):not([data-disabled]):hover": {
      background: "var(--background-muted)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
      borderRadius: "calc(var(--radius) - 2px)",
    },
    "&[disabled]": {
      cursor: "not-allowed",
      color: "var(--foreground-muted)",
    },
    "&[data-disabled]": {
      cursor: "not-allowed",
      color: "var(--foreground-muted)",
    },
    [`&[data-panel-open] ${accordion__chevron}`]: {
      transform: "rotate(180deg)",
    },
  },
});

export const accordionTriggerLabel = style({
  minWidth: 0,
  overflowWrap: "anywhere",
});

export const accordion__chevron = style({
  flexShrink: 0,
  color: "var(--foreground-muted)",
  transition: "transform 180ms var(--ease-standard)",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const accordion__panel = style({
  overflow: "hidden",
  height: "var(--accordion-panel-height)",
  transition: "height var(--duration-slow) var(--ease-standard)",
  selectors: {
    "&[data-starting-style]": {
      height: 0,
    },
    "&[data-ending-style]": {
      height: 0,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const accordion__content = style({
  padding: "0 var(--space-1) var(--space-4)",
  fontSize: "var(--text-sm)",
  lineHeight: 1.6,
  color: "var(--foreground-muted)",
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "accordion": accordion,
  "accordion__item": accordion__item,
  "accordion__header": accordion__header,
  "accordion__trigger": accordion__trigger,
  "accordion__trigger-label": accordionTriggerLabel,
  "accordion__chevron": accordion__chevron,
  "accordion__panel": accordion__panel,
  "accordion__content": accordion__content,
};
