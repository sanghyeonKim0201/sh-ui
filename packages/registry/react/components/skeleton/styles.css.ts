import { style, keyframes } from "@vanilla-extract/css";

export const shUiSkeletonPulse = keyframes({
  "0%,
  100%": {
    opacity: 1,
  },
  "50%": {
    opacity: 0.55,
  },
});

export const skeleton = style({
  display: "block",
  width: "100%",
  height: "1rem",
  background: "var(--background-muted)",
  borderRadius: "calc(var(--radius) - 2px)",
  animation: "sh-ui-skeleton-pulse 1.6s ease-in-out infinite",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "skeleton": skeleton,
};
