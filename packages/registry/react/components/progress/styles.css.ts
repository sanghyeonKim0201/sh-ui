import { style, keyframes } from "@vanilla-extract/css";

export const shUiProgressSlide = keyframes({
  "0%": {
    transform: "translateX(-100%)",
  },
  "100%": {
    transform: "translateX(250%)",
  },
});

export const progress = style({
  position: "relative",
  width: "100%",
  height: "0.5rem",
  overflow: "hidden",
  background: "var(--background-muted)",
  borderRadius: "999px",
  selectors: {
    [`&[data-state="indeterminate"] ${progress__indicator}`]: {
      width: "40%",
      animation: "sh-ui-progress-slide 1.2s ease-in-out infinite",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      selectors: {
        [`&[data-state="indeterminate"] ${progress__indicator}`]: {
          animation: "none",
          transform: "translateX(75%)",
        },
      },
    },
  },
});

export const progress__indicator = style({
  height: "100%",
  background: "var(--primary)",
  borderRadius: "999px",
  transition: "width var(--duration-base) ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "progress": progress,
  "progress__indicator": progress__indicator,
};
