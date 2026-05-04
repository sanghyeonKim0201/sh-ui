import { style } from "@vanilla-extract/css";

export const codeEditor = style({
  position: "relative",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  background: "var(--background)",
  fontSize: "0.8125rem",
  lineHeight: 1.6,
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
    "& .cm-editor": {
      background: "transparent",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
    "& .cm-editor.cm-focused": {
      outline: "none",
    },
    "& .cm-scroller": {
      fontFamily: "inherit",
      minHeight: "var(--sh-ui-code-editor-min-height, 7.5rem)",
      maxHeight: "var(--sh-ui-code-editor-max-height, 25rem)",
    },
    "& .cm-content": {
      caretColor: "var(--foreground)",
      color: "var(--foreground)",
      padding: "var(--space-3) 0",
    },
    "& .cm-line": {
      padding: "0 var(--space-3)",
    },
    "& .cm-gutters": {
      background: "var(--background-subtle)",
      color: "var(--foreground-muted)",
      borderRight: "1px solid var(--border)",
    },
    "& .cm-activeLineGutter": {
      background: "var(--background-muted)",
    },
    "& .cm-activeLine": {
      background: "var(--background-muted)",
    },
    "& .cm-cursor": {
      borderLeftColor: "var(--foreground)",
    },
    "& .cm-dropCursor": {
      borderLeftColor: "var(--foreground)",
    },
    "& .cm-selectionBackground": {
      background: "var(--background-muted) !important",
    },
    "& .cm-editor .cm-selectionBackground": {
      background: "var(--background-muted) !important",
    },
    "& .cm-editor.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
      background: "var(--background-muted) !important",
    },
    "& ::selection": {
      background: "var(--background-muted) !important",
    },
    "& .cm-placeholder": {
      color: "var(--foreground-muted)",
    },
    "& .cm-tooltip": {
      background: "var(--background)",
      border: "1px solid var(--border)",
      color: "var(--foreground)",
      borderRadius: "calc(var(--radius) - 2px)",
    },
    "& .cm-tooltip-autocomplete > ul > li[aria-selected]": {
      background: "var(--background-muted)",
      color: "var(--foreground)",
    },
    "& .cm-matchingBracket": {
      background: "var(--background-muted)",
      color: "var(--foreground)",
    },
    "& .cm-nonmatchingBracket": {
      background: "var(--background-muted)",
      color: "var(--foreground)",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "code-editor": codeEditor,
};
