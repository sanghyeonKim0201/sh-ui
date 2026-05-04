import { style } from "@vanilla-extract/css";

export const card = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-6)",
  padding: "var(--space-6) 0",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",

  "@media": {
    "(max-width: 640px)": {
      gap: "var(--space-4)",
      padding: "var(--space-4) 0",
    },
  },
});

export const action = style({
  gridColumn: 2,
  gridRow: "1 / span 2",
  alignSelf: "start",
  justifySelf: "end",
});

export const header = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridAutoRows: "auto",
  rowGap: "0.375rem",
  padding: "0 var(--space-6)",

  selectors: {
    [`&:has(.${action})`]: {
      gridTemplateColumns: "1fr auto",
    },
  },

  "@media": {
    "(max-width: 640px)": {
      paddingLeft: "var(--space-4)",
      paddingRight: "var(--space-4)",
    },
  },
});

export const title = style({
  fontSize: "var(--text-base)",
  fontWeight: "var(--weight-semibold)",
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
});

export const description = style({
  fontSize: "var(--text-sm)",
  lineHeight: 1.5,
  color: "var(--foreground-muted)",
});

export const content = style({
  padding: "0 var(--space-6)",
  fontSize: "var(--text-sm)",
  lineHeight: 1.6,

  "@media": {
    "(max-width: 640px)": {
      paddingLeft: "var(--space-4)",
      paddingRight: "var(--space-4)",
    },
  },
});

export const footer = style({
  padding: "0 var(--space-6)",
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",

  "@media": {
    "(max-width: 640px)": {
      paddingLeft: "var(--space-4)",
      paddingRight: "var(--space-4)",
      flexWrap: "wrap",
    },
  },
});
