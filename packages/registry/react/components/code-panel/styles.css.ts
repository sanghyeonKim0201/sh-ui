import { style } from "@vanilla-extract/css";

export const code = style({
  position: "relative",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  background: "var(--background-subtle)",
  overflow: "hidden",
  fontSize: "0.8125rem",
  lineHeight: 1.6,
  margin: "var(--space-4) 0",
  selectors: {
    [`&:hover ${codeCopyFloating}`]: {
      opacity: 1,
    },
    [`&:focus-within ${codeCopyFloating}`]: {
      opacity: 1,
    },
  },
  "@media": {
    "(max-width: 640px)": {
      fontSize: "var(--text-xs)",
    },
  },
});

export const code__header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-3) var(--space-2) var(--space-4)",
  borderBottom: "1px solid var(--border)",
  background: "var(--background-muted)",
  fontSize: "var(--text-xs)",
  color: "var(--foreground-muted)",
});

export const code__filename = style({
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  color: "var(--foreground)",
});

export const codeCopyFloating = style({
  position: "absolute",
  top: "var(--space-2)",
  right: "var(--space-2)",
  zIndex: 1,
  opacity: 0,
  transition: "opacity var(--duration-fast)",
});

export const code__copy = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  padding: "var(--space-1) var(--space-2)",
  background: "var(--background)",
  color: "var(--foreground-muted)",
  border: "1px solid var(--border)",
  borderRadius: "calc(var(--radius) - 2px)",
  fontSize: "var(--text-xs)",
  lineHeight: 1,
  cursor: "pointer",
  transition: "color var(--duration-fast), border-color var(--duration-fast), background-color var(--duration-fast)",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:hover": {
      color: "var(--foreground)",
      borderColor: "var(--border-strong)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
});

export const codeCopyLabel = style({
  fontSize: "var(--text-xs)",
});

export const code__body = style({
  overflowX: "auto",
  selectors: {
    "& pre": {
      margin: 0,
      padding: "var(--space-3) var(--space-4)",
      background: "transparent !important",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: "inherit",
      lineHeight: "inherit",
      border: "none",
      borderRadius: 0,
    },
    "& code": {
      background: "transparent",
      padding: 0,
      fontSize: "inherit",
      display: "block",
    },
    "& .shiki": {
      color: "var(--shiki-light) !important",
      backgroundColor: "transparent !important",
    },
    "& .shiki span": {
      color: "var(--shiki-light) !important",
      backgroundColor: "transparent !important",
    },
    "&[data-line-numbers] pre code": {
      counterReset: "step",
      counterIncrement: "step 0",
    },
    "&[data-line-numbers] pre code .line::before": {
      content: "counter(step)",
      counterIncrement: "step",
      display: "inline-block",
      width: "1.75rem",
      marginRight: "var(--space-4)",
      textAlign: "right",
      color: "var(--foreground-muted)",
      opacity: 0.7,
      userSelect: "none",
    },
  },
});

export const dark = style({
  selectors: {
    [`& ${code__body} .shiki`]: {
      color: "var(--shiki-dark) !important",
      backgroundColor: "transparent !important",
    },
    [`& ${code__body} .shiki span`]: {
      color: "var(--shiki-dark) !important",
      backgroundColor: "transparent !important",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "code": code,
  "code__header": code__header,
  "code__filename": code__filename,
  "code__copy-floating": codeCopyFloating,
  "code__copy": code__copy,
  "code__copy-label": codeCopyLabel,
  "code__body": code__body,
  "dark": dark,
};
