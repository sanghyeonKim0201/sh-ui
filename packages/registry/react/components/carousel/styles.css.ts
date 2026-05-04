import { style } from "@vanilla-extract/css";

export const carousel = style({
  position: "relative",
  width: "100%",
});

export const carousel__content = style({
  display: "flex",
  gap: "var(--space-4)",
  overflowX: "auto",
  overflowY: "hidden",
  scrollSnapType: "x mandatory",
  scrollBehavior: "smooth",
  scrollbarWidth: "none",
  MsOverflowStyle: "none",
  WebkitOverflowScrolling: "touch",
  overscrollBehaviorInline: "contain",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "&[data-orientation="vertical"]": {
      flexDirection: "column",
      overflowX: "hidden",
      overflowY: "auto",
      scrollSnapType: "y mandatory",
      height: "20rem",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      scrollBehavior: "auto",
    },
  },
});

export const carousel__item = style({
  flex: "0 0 100%",
  minWidth: 0,
  scrollSnapAlign: "start",
  scrollSnapStop: "always",
  selectors: {
    "&[data-orientation="vertical"]": {
      flexBasis: "auto",
    },
  },
});

export const carousel__nav = style({
  position: "absolute",
  top: "50%",
  width: "2rem",
  height: "2rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "999px",
  cursor: "pointer",
  transform: "translateY(-50%)",
  zIndex: 1,
  transition: "opacity var(--duration-fast) ease,\n    background var(--duration-fast) ease",
  selectors: {
    "&:hover:not(:disabled)": {
      background: "var(--background-muted)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed",
    },
    "&[data-orientation="vertical"]": {
      top: "auto",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const carouselNavPrev = style({
  left: "-1rem",
  selectors: {
    "&[data-orientation="vertical"]": {
      top: "-1rem",
      left: "50%",
    },
  },
});

export const carouselNavNext = style({
  right: "-1rem",
  selectors: {
    "&[data-orientation="vertical"]": {
      bottom: "-1rem",
      top: "auto",
      left: "50%",
    },
  },
});

export const carousel__indicators = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "var(--space-2)",
  marginTop: "var(--space-3)",
  selectors: {
    "&[data-orientation="vertical"]": {
      position: "absolute",
      top: "50%",
      right: "0.5rem",
      marginTop: 0,
      flexDirection: "column",
      transform: "translateY(-50%)",
    },
  },
});

export const carousel__indicator = style({
  width: "0.5rem",
  height: "0.5rem",
  padding: 0,
  background: "var(--border)",
  border: "none",
  borderRadius: "999px",
  cursor: "pointer",
  transition: "background var(--duration-fast) ease,\n    transform var(--duration-fast) ease",
  selectors: {
    "&:hover": {
      background: "var(--border-strong)",
    },
    "&[data-active]": {
      background: "var(--foreground)",
      transform: "scale(1.2)",
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

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "carousel": carousel,
  "carousel__content": carousel__content,
  "carousel__item": carousel__item,
  "carousel__nav": carousel__nav,
  "carousel__nav--prev": carouselNavPrev,
  "carousel__nav--next": carouselNavNext,
  "carousel__indicators": carousel__indicators,
  "carousel__indicator": carousel__indicator,
};
