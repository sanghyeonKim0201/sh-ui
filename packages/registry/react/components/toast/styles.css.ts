import { style, keyframes } from "@vanilla-extract/css";

export const shUiToastEnterRight = keyframes({
  "from": {
    opacity: 0,
    transform: "translateX(100%)",
  },
  "to": {
    opacity: 1,
    transform: "translateX(0)",
  },
});

export const shUiToastExitRight = keyframes({
  "from": {
    opacity: 1,
    transform: "translateX(0)",
  },
  "to": {
    opacity: 0,
    transform: "translateX(100%)",
  },
});

export const shUiToastEnterLeft = keyframes({
  "from": {
    opacity: 0,
    transform: "translateX(-100%)",
  },
  "to": {
    opacity: 1,
    transform: "translateX(0)",
  },
});

export const shUiToastExitLeft = keyframes({
  "from": {
    opacity: 1,
    transform: "translateX(0)",
  },
  "to": {
    opacity: 0,
    transform: "translateX(-100%)",
  },
});

export const shUiToastEnterBottom = keyframes({
  "from": {
    opacity: 0,
    transform: "translateY(100%)",
  },
  "to": {
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const shUiToastExitBottom = keyframes({
  "from": {
    opacity: 1,
    transform: "translateY(0)",
  },
  "to": {
    opacity: 0,
    transform: "translateY(100%)",
  },
});

export const shUiToastEnterTop = keyframes({
  "from": {
    opacity: 0,
    transform: "translateY(-100%)",
  },
  "to": {
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const shUiToastExitTop = keyframes({
  "from": {
    opacity: 1,
    transform: "translateY(0)",
  },
  "to": {
    opacity: 0,
    transform: "translateY(-100%)",
  },
});

export const toastViewport = style({
  position: "fixed",
  zIndex: "var(--z-toast)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  maxWidth: "24rem",
  width: "100%",
  pointerEvents: "none",
  selectors: {
    "&[data-position="bottom-right"]": {
      bottom: "var(--space-4)",
      right: "var(--space-4)",
      flexDirection: "column-reverse",
    },
    "&[data-position="bottom-left"]": {
      bottom: "var(--space-4)",
      left: "var(--space-4)",
      flexDirection: "column-reverse",
    },
    "&[data-position="bottom-center"]": {
      bottom: "var(--space-4)",
      left: "50%",
      transform: "translateX(-50%)",
      flexDirection: "column-reverse",
    },
    "&[data-position="top-right"]": {
      top: "var(--space-4)",
      right: "var(--space-4)",
    },
    "&[data-position="top-left"]": {
      top: "var(--space-4)",
      left: "var(--space-4)",
    },
    "&[data-position="top-center"]": {
      top: "var(--space-4)",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
  "@media": {
    "(max-width: 40rem)": {
      maxWidth: "100%",
      padding: "var(--space-4)",
      selectors: {
        "&[data-position="bottom-right"]": {
          right: 0,
          left: 0,
          bottom: 0,
          transform: "none",
        },
        "&[data-position="bottom-left"]": {
          right: 0,
          left: 0,
          bottom: 0,
          transform: "none",
        },
        "&[data-position="bottom-center"]": {
          right: 0,
          left: 0,
          bottom: 0,
          transform: "none",
        },
        "&[data-position="top-right"]": {
          right: 0,
          left: 0,
          top: 0,
          transform: "none",
        },
        "&[data-position="top-left"]": {
          right: 0,
          left: 0,
          top: 0,
          transform: "none",
        },
        "&[data-position="top-center"]": {
          right: 0,
          left: 0,
          top: 0,
          transform: "none",
        },
      },
    },
  },
});

export const toast = style({
  position: "relative",
  display: "flex",
  alignItems: "flex-start",
  gap: "0.625rem",
  width: "100%",
  padding: "var(--space-3) 2.25rem var(--space-3) var(--space-3)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
  pointerEvents: "auto",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none !important",
    },
  },
});

export const toast__icon = style({
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  marginTop: "0.125rem",
});

export const toastSuccess = style({
  selectors: {
    [`& ${toast__icon}`]: {
      color: "var(--success, #16a34a)",
    },
  },
});

export const toastDanger = style({
  selectors: {
    [`& ${toast__icon}`]: {
      color: "var(--danger)",
    },
  },
});

export const toastWarning = style({
  selectors: {
    [`& ${toast__icon}`]: {
      color: "var(--warning, #d97706)",
    },
  },
});

export const toast__body = style({
  flex: 1,
  minWidth: 0,
});

export const toast__title = style({
  margin: 0,
  fontSize: "var(--text-sm)",
  fontWeight: "var(--weight-semibold)",
  lineHeight: 1.4,
  selectors: {
    [`& + ${toast__description}`]: {
      marginTop: "0.125rem",
    },
  },
});

export const toast__description = style({
  margin: 0,
  fontSize: "0.8125rem",
  lineHeight: 1.4,
  color: "var(--foreground-muted)",
});

export const toast__action = style({
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  marginLeft: "auto",
});

export const toast__close = style({
  position: "absolute",
  top: "0.375rem",
  right: "0.375rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  padding: 0,
  border: "none",
  borderRadius: "calc(var(--radius) - 2px)",
  background: "transparent",
  color: "var(--foreground-muted)",
  fontSize: "var(--text-sm)",
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
  "toast-viewport": toastViewport,
  "toast": toast,
  "toast__icon": toast__icon,
  "toast--success": toastSuccess,
  "toast--danger": toastDanger,
  "toast--warning": toastWarning,
  "toast__body": toast__body,
  "toast__title": toast__title,
  "toast__description": toast__description,
  "toast__action": toast__action,
  "toast__close": toast__close,
};
