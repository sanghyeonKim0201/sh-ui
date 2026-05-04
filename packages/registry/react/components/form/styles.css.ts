import { style, keyframes } from "@vanilla-extract/css";

export const shUiFormErrorIn = keyframes({
  "from": {
    opacity: 0,
    transform: "translateY(-4px)",
  },
  "to": {
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4, 1rem)",
});

export const formSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4, 1rem)",
});

export const formField = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1, 0.25rem)",
  selectors: {
    "&[data-disabled]": {
      opacity: 0.6,
      pointerEvents: "none",
    },
  },
});

export const formError = style({
  color: "var(--color-danger, #dc2626)",
  fontSize: "var(--text-sm, 0.875rem)",
  margin: 0,
  animation: "sh-ui-form-error-in 150ms\n    var(--easing-out, cubic-bezier(0.16, 1, 0.3, 1))",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animationDuration: "0.01ms",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "form": form,
  "form-section": formSection,
  "form-field": formField,
  "form-error": formError,
};
