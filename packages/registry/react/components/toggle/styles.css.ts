import { style } from "@vanilla-extract/css";

export const toggle = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.375rem",
  border: "1px solid transparent",
  borderRadius: "var(--radius)",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  cursor: "pointer",
  color: "var(--foreground-muted)",
  background: "transparent",
  transition: "background-color var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast)",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&[data-pressed]": {
      background: "var(--background-muted)",
      color: "var(--foreground)",
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
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const toggleSm = style({
  height: "var(--control-sm)",
  padding: "0 0.625rem",
  fontSize: "var(--text-sm)",
  "@media": {
    "(hover: none) and (pointer: coarse)": {
      height: "2.25rem",
    },
  },
});

export const toggleMd = style({
  height: "var(--control-md)",
  padding: "0 var(--space-3)",
  fontSize: "var(--text-sm)",
  "@media": {
    "(hover: none) and (pointer: coarse)": {
      height: "2.75rem",
    },
  },
});

export const toggleLg = style({
  height: "var(--control-lg)",
  padding: "0 var(--space-4)",
  fontSize: "var(--text-base)",
});

export const toggleOutline = style({
  borderColor: "var(--border)",
  selectors: {
    "&:hover:not(:disabled):not([data-pressed])": {
      background: "var(--background-muted)",
      color: "var(--foreground)",
    },
    "&[data-pressed]": {
      borderColor: "var(--border-strong)",
    },
  },
});

export const toggleGhost = style({
  selectors: {
    "&:hover:not(:disabled):not([data-pressed])": {
      background: "var(--background-muted)",
      color: "var(--foreground)",
    },
  },
});

export const toggleGroup = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  selectors: {
    "&[data-orientation="vertical"]": {
      flexDirection: "column",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "toggle": toggle,
  "toggle--sm": toggleSm,
  "toggle--md": toggleMd,
  "toggle--lg": toggleLg,
  "toggle--outline": toggleOutline,
  "toggle--ghost": toggleGhost,
  "toggle-group": toggleGroup,
};
