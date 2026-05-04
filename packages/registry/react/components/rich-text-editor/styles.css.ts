import { style } from "@vanilla-extract/css";

export const rte = style({
  display: "flex",
  flexDirection: "column",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  background: "var(--background)",
  overflow: "hidden",
  transition: "border-color var(--duration-fast)",
  selectors: {
    "&:focus-within": {
      borderColor: "var(--foreground)",
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&[data-readonly]": {
      background: "var(--background-subtle)",
    },
  },
});

export const rte__toolbar = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.125rem",
  padding: "var(--space-1) var(--space-2)",
  background: "var(--background-muted)",
  borderBottom: "1px solid var(--border)",
});

export const rte__btn = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.875rem",
  height: "1.875rem",
  padding: 0,
  background: "transparent",
  color: "var(--foreground-muted)",
  border: "1px solid transparent",
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  transition: "color var(--duration-fast),\n    background-color var(--duration-fast),\n    border-color var(--duration-fast)",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:hover:not(:disabled)": {
      color: "var(--foreground)",
      background: "var(--background)",
      borderColor: "var(--border)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "1px",
    },
    "&.is-active": {
      color: "var(--foreground)",
      background: "var(--background)",
      borderColor: "var(--border-strong)",
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

export const rte__sep = style({
  display: "inline-block",
  width: "1px",
  height: "1.25rem",
  margin: "0 var(--space-1)",
  background: "var(--border)",
});

export const rte__viewport = style({
  display: "flex",
  minHeight: "var(--sh-ui-rte-min-height, 9rem)",
  maxHeight: "var(--sh-ui-rte-max-height, 28rem)",
  overflowY: "auto",
  selectors: {
    "& > .ProseMirror": {
      flex: 1,
    },
  },
});

export const rte__content = style({
  outline: "none",
  padding: "var(--space-3) var(--space-4)",
  fontSize: "0.9375rem",
  lineHeight: 1.65,
  color: "var(--foreground)",
  selectors: {
    "& > :first-child": {
      marginTop: 0,
    },
    "& > :last-child": {
      marginBottom: 0,
    },
    "& p": {
      margin: "0 0 var(--space-3)",
    },
    "& h1": {
      margin: "var(--space-4) 0 var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    "& h2": {
      margin: "var(--space-4) 0 var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    "& h3": {
      margin: "var(--space-4) 0 var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    "& h4": {
      margin: "var(--space-4) 0 var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    "& h5": {
      margin: "var(--space-4) 0 var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    "& h6": {
      margin: "var(--space-4) 0 var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    "& h1": {
      fontSize: "1.5rem",
    },
    "& h2": {
      fontSize: "1.25rem",
    },
    "& h3": {
      fontSize: "1.125rem",
    },
    "& ul": {
      margin: "0 0 var(--space-3)",
      paddingLeft: "var(--space-5)",
    },
    "& ol": {
      margin: "0 0 var(--space-3)",
      paddingLeft: "var(--space-5)",
    },
    "& li": {
      marginBottom: "var(--space-1)",
    },
    "& li > p": {
      margin: 0,
    },
    "& blockquote": {
      margin: "0 0 var(--space-3)",
      padding: "var(--space-2) var(--space-3)",
      borderLeft: "3px solid var(--border-strong)",
      background: "var(--background-subtle)",
      color: "var(--foreground-muted)",
      borderRadius: "0 calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0",
    },
    "& blockquote > :last-child": {
      marginBottom: 0,
    },
    "& code": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: "0.875em",
      padding: "0.125rem 0.375rem",
      borderRadius: "calc(var(--radius) - 4px)",
      background: "var(--background-muted)",
      color: "var(--foreground)",
    },
    "& pre": {
      margin: "0 0 var(--space-3)",
      padding: "var(--space-3)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      background: "var(--background-subtle)",
      overflowX: "auto",
      fontSize: "0.8125rem",
      lineHeight: 1.6,
    },
    "& pre code": {
      padding: 0,
      background: "transparent",
      fontSize: "inherit",
    },
    "& hr": {
      border: 0,
      borderTop: "1px solid var(--border)",
      margin: "var(--space-4) 0",
    },
    "& a": {
      color: "var(--primary)",
      textDecoration: "underline",
      textUnderlineOffset: "2px",
    },
    "& a:hover": {
      textDecorationThickness: "2px",
    },
    "& p.is-editor-empty:first-child::before": {
      content: "attr(data-placeholder)",
      color: "var(--foreground-muted)",
      float: "left",
      pointerEvents: "none",
      height: 0,
    },
    "& .is-editor-empty:first-child::before": {
      content: "attr(data-placeholder)",
      color: "var(--foreground-muted)",
      float: "left",
      pointerEvents: "none",
      height: 0,
    },
    "& del": {
      color: "var(--foreground-muted)",
    },
    "& s": {
      color: "var(--foreground-muted)",
    },
    "& ::selection": {
      background: "var(--background-muted)",
    },
  },
});

export const rteIsEmpty = style({
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "rte": rte,
  "rte__toolbar": rte__toolbar,
  "rte__btn": rte__btn,
  "rte__sep": rte__sep,
  "rte__viewport": rte__viewport,
  "rte__content": rte__content,
  "rte__is-empty": rteIsEmpty,
};
