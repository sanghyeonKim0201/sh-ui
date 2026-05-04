import { style } from "@vanilla-extract/css";

export const pageToc = style({
  position: "fixed",
  top: "5rem",
  right: "1.5rem",
  width: "14rem",
  maxHeight: "calc(100vh - 7rem)",
  overflowY: "auto",
  padding: "0.75rem 0.5rem 0.75rem 1rem",
  borderLeft: "1px solid var(--border)",
  fontSize: "0.8125rem",
  zIndex: 5,
  "@media": {
    "(max-width: 80rem)": {
      display: "none",
    },
  },
});

export const pageTocLabel = style({
  fontWeight: 600,
  fontSize: "0.75rem",
  color: "var(--foreground-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "0.5rem",
});

export const pageTocList = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
  selectors: {
    [`& > li[data-level="3"] ${pageTocLink}`]: {
      paddingLeft: "1.25rem",
      fontSize: "0.8125em",
      color: "var(--foreground-subtle, var(--foreground-muted))",
    },
    [`& > li[data-level="4"] ${pageTocLink}`]: {
      paddingLeft: "1.25rem",
      fontSize: "0.8125em",
      color: "var(--foreground-subtle, var(--foreground-muted))",
    },
    [`& > li[data-level="5"] ${pageTocLink}`]: {
      paddingLeft: "2rem",
      fontSize: "0.75em",
      color: "var(--foreground-subtle, var(--foreground-muted))",
    },
    [`& > li[data-level="6"] ${pageTocLink}`]: {
      paddingLeft: "2rem",
      fontSize: "0.75em",
      color: "var(--foreground-subtle, var(--foreground-muted))",
    },
  },
});

export const pageTocLink = style({
  display: "block",
  padding: "0.25rem 0.5rem",
  borderRadius: "calc(var(--radius) - 4px)",
  color: "var(--foreground-muted)",
  textDecoration: "none",
  lineHeight: 1.4,
  transition: "color var(--duration-fast), background-color var(--duration-fast)",
  selectors: {
    "&:hover": {
      color: "var(--foreground)",
      background: "var(--background-subtle)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&[data-active="true"]": {
      color: "var(--foreground)",
      fontWeight: 600,
      background: "var(--background-subtle)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "page-toc": pageToc,
  "page-toc__label": pageTocLabel,
  "page-toc__list": pageTocList,
  "page-toc__link": pageTocLink,
};
