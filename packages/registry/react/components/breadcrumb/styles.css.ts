import { style } from "@vanilla-extract/css";

export const breadcrumb = style({
  fontSize: "var(--text-sm)",
  color: "var(--foreground-muted)",
});

export const breadcrumb__list = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.375rem",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const breadcrumb__item = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  minWidth: 0,
});

export const breadcrumb__link = style({
  color: "var(--foreground-muted)",
  textDecoration: "none",
  borderRadius: "calc(var(--radius) - 2px)",
  padding: "0 0.125rem",
  transition: "color var(--duration-fast)",
  selectors: {
    "&:hover": {
      color: "var(--foreground)",
      textDecoration: "underline",
      textUnderlineOffset: "3px",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const breadcrumb__page = style({
  color: "var(--foreground)",
  fontWeight: "var(--weight-medium)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const breadcrumb__separator = style({
  display: "inline-flex",
  alignItems: "center",
  color: "var(--foreground-muted)",
  opacity: 0.6,
});

export const breadcrumb__ellipsis = style({
  display: "inline-flex",
  alignItems: "center",
  width: "1.5rem",
  height: "1.5rem",
  justifyContent: "center",
  color: "var(--foreground-muted)",
});

export const breadcrumbEllipsisSr = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "breadcrumb": breadcrumb,
  "breadcrumb__list": breadcrumb__list,
  "breadcrumb__item": breadcrumb__item,
  "breadcrumb__link": breadcrumb__link,
  "breadcrumb__page": breadcrumb__page,
  "breadcrumb__separator": breadcrumb__separator,
  "breadcrumb__ellipsis": breadcrumb__ellipsis,
  "breadcrumb__ellipsis-sr": breadcrumbEllipsisSr,
};
