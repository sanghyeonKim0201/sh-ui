import { style } from "@vanilla-extract/css";

export const dialog__backdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: "var(--z-overlay)",
  background: "rgba(0, 0, 0, 0.25)",
  backdropFilter: "blur(8px)",
  transition: "opacity var(--duration-slow) ease",
  selectors: {
    "&[data-starting-style]": {
      opacity: 0,
    },
    "&[data-ending-style]": {
      opacity: 0,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const dialog__content = style({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: "var(--z-modal)",
  display: "flex",
  flexDirection: "column",
  width: "calc(100% - 2rem)",
  maxWidth: "28rem",
  maxHeight: "calc(100dvh - 4rem)",
  padding: "var(--space-6)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "var(--shadow-xl)",
  outline: "none",
  overflowY: "auto",
  transition: "opacity var(--duration-slow) ease,\n    transform var(--duration-slow) ease",
  selectors: {
    "&[data-starting-style]": {
      opacity: 0,
      transform: "translate(-50%, calc(-50% + 0.5rem)) scale(0.97)",
    },
    "&[data-ending-style]": {
      opacity: 0,
      transform: "translate(-50%, calc(-50% + 0.25rem)) scale(0.98)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
      selectors: {
        "&[data-starting-style]": {
          transform: "translate(-50%, -50%)",
        },
        "&[data-ending-style]": {
          transform: "translate(-50%, -50%)",
        },
      },
    },
  },
});

export const dialog__title = style({
  margin: "0 0 var(--space-1)",
  fontWeight: "var(--weight-semibold)",
  fontSize: "var(--text-lg)",
  lineHeight: 1.4,
});

export const dialog__description = style({
  margin: "0 0 var(--space-5)",
  color: "var(--foreground-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: 1.5,
});

export const dialog__footer = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "var(--space-2)",
  paddingTop: "var(--space-4)",
  borderTop: "1px solid var(--border)",
  marginTop: "auto",
});

export const dialog__close = style({
  position: "absolute",
  top: "var(--space-3)",
  right: "var(--space-3)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  border: 0,
  borderRadius: "calc(var(--radius) - 2px)",
  background: "transparent",
  color: "var(--foreground-muted)",
  fontSize: "var(--text-lg)",
  lineHeight: 1,
  cursor: "pointer",
  transition: "background-color var(--duration-fast), color var(--duration-fast)",
  selectors: {
    "&:hover": {
      background: "var(--background-muted)",
      color: "var(--foreground)",
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
  "dialog__backdrop": dialog__backdrop,
  "dialog__content": dialog__content,
  "dialog__title": dialog__title,
  "dialog__description": dialog__description,
  "dialog__footer": dialog__footer,
  "dialog__close": dialog__close,
};
