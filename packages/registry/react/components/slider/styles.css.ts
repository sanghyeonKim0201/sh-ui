import { style } from "@vanilla-extract/css";

export const slider = style({
  position: "relative",
  width: "100%",
  padding: "var(--space-2) 0",
  userSelect: "none",
  WebkitUserSelect: "none",
});

export const sliderDisabled = style({
  opacity: "var(--opacity-disabled)",
  pointerEvents: "none",
});

export const slider__track = style({
  position: "relative",
  width: "100%",
  height: "0.375rem",
  background: "var(--background-muted)",
  borderRadius: "999px",
  cursor: "pointer",
  touchAction: "none",
});

export const slider__range = style({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  background: "var(--primary)",
  borderRadius: "999px",
  pointerEvents: "none",
});

export const slider__thumb = style({
  position: "absolute",
  top: "50%",
  width: "1rem",
  height: "1rem",
  marginLeft: "-0.5rem",
  transform: "translateY(-50%)",
  background: "var(--background)",
  border: "2px solid var(--primary)",
  borderRadius: "50%",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  cursor: "grab",
  transition: "transform 80ms",
  selectors: {
    "&:active": {
      cursor: "grabbing",
      transform: "translateY(-50%) scale(1.1)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
  "@media": {
    "(hover: none) and (pointer: coarse)": {
      width: "1.25rem",
      height: "1.25rem",
      marginLeft: "-0.625rem",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "slider": slider,
  "slider--disabled": sliderDisabled,
  "slider__track": slider__track,
  "slider__range": slider__range,
  "slider__thumb": slider__thumb,
};
