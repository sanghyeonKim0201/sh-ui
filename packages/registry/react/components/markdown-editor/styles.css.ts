import { style } from "@vanilla-extract/css";

export const mdEditor = style({
  display: "grid",
  gap: "var(--space-3)",
});

export const mdEditorRight = style({
  gridTemplateColumns: "1fr 1fr",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const mdEditorBottom = style({
  gridTemplateColumns: "1fr",
});

export const mdEditorNoPreview = style({
  gridTemplateColumns: "1fr",
});

export const mdEditorSource = style({
  minWidth: 0,
});

export const mdEditorPreview = style({
  minWidth: 0,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  background: "var(--background)",
  overflow: "hidden",
});

export const mdEditorPreviewInner = style({
  padding: "var(--space-3) var(--space-4)",
  minHeight: "var(--sh-ui-md-editor-min-height, 7.5rem)",
  maxHeight: "var(--sh-ui-md-editor-max-height, 25rem)",
  overflowY: "auto",
  fontSize: "0.875rem",
  lineHeight: 1.65,
  color: "var(--foreground)",
  selectors: {
    "& > :first-child": {
      marginTop: 0,
    },
    "& > :last-child": {
      marginBottom: 0,
    },
    "& h1": {
      marginTop: "var(--space-4)",
      marginBottom: "var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "var(--foreground)",
    },
    "& h2": {
      marginTop: "var(--space-4)",
      marginBottom: "var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "var(--foreground)",
    },
    "& h3": {
      marginTop: "var(--space-4)",
      marginBottom: "var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "var(--foreground)",
    },
    "& h4": {
      marginTop: "var(--space-4)",
      marginBottom: "var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "var(--foreground)",
    },
    "& h5": {
      marginTop: "var(--space-4)",
      marginBottom: "var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "var(--foreground)",
    },
    "& h6": {
      marginTop: "var(--space-4)",
      marginBottom: "var(--space-2)",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "var(--foreground)",
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
    "& h4": {
      fontSize: "1rem",
    },
    "& h5": {
      fontSize: "1rem",
    },
    "& h6": {
      fontSize: "1rem",
    },
    "& p": {
      marginTop: 0,
      marginBottom: "var(--space-3)",
    },
    "& ul": {
      marginTop: 0,
      marginBottom: "var(--space-3)",
    },
    "& ol": {
      marginTop: 0,
      marginBottom: "var(--space-3)",
    },
    "& blockquote": {
      marginTop: 0,
      marginBottom: "var(--space-3)",
    },
    "& pre": {
      marginTop: 0,
      marginBottom: "var(--space-3)",
    },
    "& table": {
      marginTop: 0,
      marginBottom: "var(--space-3)",
    },
    "& ul": {
      paddingLeft: "var(--space-5)",
    },
    "& ol": {
      paddingLeft: "var(--space-5)",
    },
    "& li": {
      marginBottom: "var(--space-1)",
    },
    "& li > input[type="checkbox"]": {
      marginRight: "var(--space-2)",
    },
    "& a": {
      color: "var(--primary)",
      textDecoration: "underline",
      textUnderlineOffset: "2px",
    },
    "& a:hover": {
      textDecorationThickness: "2px",
    },
    "& blockquote": {
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
      padding: "var(--space-3)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      background: "var(--background-subtle)",
      overflowX: "auto",
      fontSize: "0.8125rem",
      lineHeight: 1.6,
    },
    "& pre > code": {
      padding: 0,
      background: "transparent",
      fontSize: "inherit",
    },
    "& hr": {
      border: 0,
      borderTop: "1px solid var(--border)",
      margin: "var(--space-4) 0",
    },
    "& table": {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.875rem",
    },
    "& th": {
      padding: "var(--space-2) var(--space-3)",
      border: "1px solid var(--border)",
      textAlign: "left",
    },
    "& td": {
      padding: "var(--space-2) var(--space-3)",
      border: "1px solid var(--border)",
      textAlign: "left",
    },
    "& thead": {
      background: "var(--background-subtle)",
    },
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: "calc(var(--radius) - 2px)",
    },
    "& del": {
      color: "var(--foreground-muted)",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "md-editor": mdEditor,
  "md-editor--right": mdEditorRight,
  "md-editor--bottom": mdEditorBottom,
  "md-editor--no-preview": mdEditorNoPreview,
  "md-editor__source": mdEditorSource,
  "md-editor__preview": mdEditorPreview,
  "md-editor__preview-inner": mdEditorPreviewInner,
};
