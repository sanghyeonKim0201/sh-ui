import { style, styleVariants } from "@vanilla-extract/css";

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-2)",
  border: "1px solid transparent",
  borderRadius: "var(--radius)",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  cursor: "pointer",
  transition:
    "background-color var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast), transform 80ms ease-out, filter 80ms",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",

  selectors: {
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      pointerEvents: "none",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--ring)",
      outlineOffset: "2px",
    },
    "&:active:not(:disabled)": {
      transform: "scale(0.97)",
      transitionDuration: "40ms",
    },
  },

  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const sizes = styleVariants({
  sm: {
    height: "var(--control-sm)",
    padding: "0 var(--space-3)",
    fontSize: "var(--text-sm)",
    "@media": {
      "(hover: none) and (pointer: coarse)": {
        height: "2.25rem",
      },
    },
  },
  md: {
    height: "var(--control-md)",
    padding: "0 var(--space-4)",
    fontSize: "var(--text-sm)",
    "@media": {
      "(hover: none) and (pointer: coarse)": {
        height: "2.75rem",
      },
    },
  },
  lg: {
    height: "var(--control-lg)",
    padding: "0 var(--space-5)",
    fontSize: "var(--text-base)",
  },
});

export const variants = styleVariants({
  primary: {
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
    selectors: {
      "&:hover": {
        backgroundColor: "var(--primary-hover)",
      },
    },
  },
  secondary: {
    backgroundColor: "var(--background-muted)",
    color: "var(--foreground)",
    borderColor: "var(--border)",
    selectors: {
      "&:hover": {
        backgroundColor: "var(--background-subtle)",
      },
    },
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--foreground)",
    selectors: {
      "&:hover": {
        backgroundColor: "var(--background-muted)",
      },
    },
  },
  danger: {
    backgroundColor: "var(--danger)",
    color: "var(--danger-foreground)",
  },
  link: {
    backgroundColor: "transparent",
    color: "var(--foreground)",
    borderColor: "transparent",
    height: "auto",
    padding: 0,
    textUnderlineOffset: "3px",
    selectors: {
      "&:hover": {
        textDecoration: "underline",
      },
      "&:active:not(:disabled)": {
        transform: "none",
        filter: "none",
        color: "var(--foreground-muted)",
      },
    },
  },
});
