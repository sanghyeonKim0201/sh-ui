import { style } from "@vanilla-extract/css";

export const switch_ = style({
  display: "inline-flex",
  alignItems: "center",
  border: "none",
  borderRadius: "999px",
  background: "var(--background-muted)",
  cursor: "pointer",
  flexShrink: 0,
  padding: "0.125rem",
  transition: "background-color 150ms",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:hover:not([data-disabled])": {
      background: "var(--border-strong)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&[data-checked]": {
      background: "var(--primary)",
    },
    "&[data-checked]:hover:not([data-disabled])": {
      background: "var(--primary-hover)",
    },
    "&[data-disabled]": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0.01ms !important",
    },
  },
});

export const switchSm = style({
  width: "2rem",
  height: "1.125rem",
  selectors: {
    [`& ${switch__thumb}`]: {
      width: "0.875rem",
      height: "0.875rem",
    },
    [`&[data-checked] ${switch__thumb}`]: {
      transform: "translateX(0.875rem)",
    },
  },
});

export const switchMd = style({
  width: "2.5rem",
  height: "1.375rem",
  selectors: {
    [`& ${switch__thumb}`]: {
      width: "1.125rem",
      height: "1.125rem",
    },
    [`&[data-checked] ${switch__thumb}`]: {
      transform: "translateX(1.125rem)",
    },
  },
});

export const switch__thumb = style({
  display: "block",
  borderRadius: "999px",
  background: "white",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.12)",
  transition: "transform 150ms ease-out",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0.01ms !important",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "switch": switch_,
  "switch--sm": switchSm,
  "switch--md": switchMd,
  "switch__thumb": switch__thumb,
};
