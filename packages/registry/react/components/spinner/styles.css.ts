import { style, keyframes } from "@vanilla-extract/css";

export const shUiSpinnerRotate = keyframes({
  "to": {
    transform: "rotate(360deg)",
  },
});

export const spinner = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  color: "currentColor",
});

export const spinnerSm = style({
  width: "0.875rem",
  height: "0.875rem",
  selectors: {
    [`& ${spinner__ring}`]: {
      borderWidth: "1.5px",
    },
  },
});

export const spinnerMd = style({
  width: "1.125rem",
  height: "1.125rem",
});

export const spinnerLg = style({
  width: "1.5rem",
  height: "1.5rem",
});

export const spinner__ring = style({
  display: "inline-block",
  width: "100%",
  height: "100%",
  border: "2px solid currentColor",
  borderRadius: "999px",
  borderTopColor: "transparent",
  opacity: 0.8,
  animation: "sh-ui-spinner-rotate 0.8s linear infinite",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animationDuration: "3s",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "spinner": spinner,
  "spinner--sm": spinnerSm,
  "spinner--md": spinnerMd,
  "spinner--lg": spinnerLg,
  "spinner__ring": spinner__ring,
};
