import { style } from "@vanilla-extract/css";

export const menubar = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  padding: "var(--space-1)",
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  selectors: {
    "& .dm__trigger": {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-1)",
      padding: "var(--space-1) var(--space-3)",
      height: "var(--control-md)",
      border: 0,
      borderRadius: "calc(var(--radius) - 2px)",
      background: "transparent",
      color: "var(--foreground)",
      fontSize: "var(--text-sm)",
      lineHeight: 1,
      cursor: "pointer",
      transition: "background-color var(--duration-fast), color var(--duration-fast)",
    },
    "& .dm__trigger:hover": {
      background: "var(--background-muted)",
    },
    "& .dm__trigger[data-popup-open]": {
      background: "var(--background-muted)",
    },
    "& .dm__trigger:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "-1px",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      selectors: {
        "& .dm__trigger": {
          transition: "none",
        },
      },
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "menubar": menubar,
};
