import { style } from "@vanilla-extract/css";

export const tabs = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
  width: "100%",
  selectors: {
    "&[data-orientation="vertical"]": {
      flexDirection: "row",
    },
    [`&[data-orientation="vertical"] > ${tabs__list}`]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
    [`&[data-variant="underline"] > ${tabs__list}`]: {
      width: "100%",
      gap: 0,
      boxShadow: "inset 0 -1px 0 var(--border)",
    },
    [`&[data-variant="underline"] ${tabs__trigger}`]: {
      padding: "0.625rem var(--space-4)",
    },
    [`&[data-variant="underline"] ${tabs__indicator}`]: {
      top: "var(--active-tab-top)",
      left: "var(--active-tab-left)",
      width: "var(--active-tab-width)",
      height: "var(--active-tab-height)",
      boxShadow: "inset 0 -2px 0 var(--foreground)",
    },
    [`&[data-variant="underline"][data-orientation="vertical"] > ${tabs__list}`]: {
      width: "auto",
      boxShadow: "inset -1px 0 0 var(--border)",
    },
    [`&[data-variant="underline"][data-orientation="vertical"] ${tabs__indicator}`]: {
      boxShadow: "inset -2px 0 0 var(--foreground)",
    },
    [`&[data-variant="pill"] > ${tabs__list}`]: {
      padding: "var(--space-1)",
      background: "var(--background-muted, var(--background))",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
    },
    [`&[data-variant="pill"] ${tabs__trigger}`]: {
      padding: "0.375rem var(--space-3)",
      borderRadius: "calc(var(--radius) - 2px)",
    },
    [`&[data-variant="pill"] ${tabs__indicator}`]: {
      top: "var(--active-tab-top)",
      left: "var(--active-tab-left)",
      width: "var(--active-tab-width)",
      height: "var(--active-tab-height)",
      background: "var(--background)",
      borderRadius: "calc(var(--radius) - 2px)",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
    },
    [`&[data-variant="plain"] ${tabs__trigger}`]: {
      padding: "0.375rem var(--space-2)",
      borderRadius: "calc(var(--radius) - 2px)",
    },
    [`&[data-variant="plain"] ${tabs__trigger}[data-selected]`]: {
      background: "var(--background-muted, transparent)",
    },
    [`&[data-variant="plain"] ${tabs__indicator}`]: {
      display: "none",
    },
  },
});

export const tabs__list = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  width: "fit-content",
});

export const tabs__trigger = style({
  position: "relative",
  zIndex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.375rem",
  padding: "var(--space-2) var(--space-3)",
  background: "transparent",
  color: "var(--foreground-muted, var(--foreground))",
  border: 0,
  fontSize: "var(--text-sm)",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  cursor: "pointer",
  transition: "color var(--duration-fast), background-color var(--duration-fast)",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  whiteSpace: "nowrap",
  selectors: {
    "&:hover:not(:disabled):not([data-selected])": {
      color: "var(--foreground)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&[data-selected]": {
      color: "var(--foreground)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
});

export const tabs__indicator = style({
  position: "absolute",
  transition: "top 180ms, left 180ms, width 180ms, height 180ms",
  zIndex: 0,
  pointerEvents: "none",
  selectors: {
    "&[data-activation-direction="none"]": {
      transition: "none",
    },
  },
});

export const tabs__content = style({
  outline: "none",
  selectors: {
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
      borderRadius: "var(--radius)",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "tabs": tabs,
  "tabs__list": tabs__list,
  "tabs__trigger": tabs__trigger,
  "tabs__indicator": tabs__indicator,
  "tabs__content": tabs__content,
};
