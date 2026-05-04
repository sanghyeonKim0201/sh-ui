import { style } from "@vanilla-extract/css";

export const datePickerTrigger = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: "var(--control-md)",
  padding: "0 var(--space-3)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
  lineHeight: 1,
  cursor: "pointer",
  transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:hover:not(:disabled)": {
      borderColor: "var(--border-strong)",
    },
    "&:focus-visible": {
      outline: "none",
      borderColor: "var(--foreground)",
      boxShadow: "0 0 0 1px var(--foreground)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
      background: "var(--background-subtle)",
    },
    "&[aria-invalid="true"]": {
      borderColor: "var(--danger)",
    },
    "&[aria-invalid="true"]:focus-visible": {
      boxShadow: "0 0 0 1px var(--danger)",
    },
  },
  "@media": {
    "(hover: none) and (pointer: coarse)": {
      height: "2.75rem",
      fontSize: "var(--text-base)",
    },
  },
});

export const datePickerValue = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const datePickerPlaceholder = style({
  color: "var(--foreground-subtle)",
});

export const datePickerIcon = style({
  flexShrink: 0,
  display: "inline-flex",
  color: "var(--foreground-muted)",
  marginLeft: "var(--space-2)",
});

export const datePickerPositioner = style({
  zIndex: "var(--z-popover)",
  outline: "none",
});

export const datePickerPopup = style({
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  outline: "none",
  padding: "var(--space-3)",
  transformOrigin: "var(--transform-origin)",
  transition: "opacity 140ms ease, transform 140ms ease",
  selectors: {
    "&[data-starting-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
    "&[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
  },
});

export const datePickerFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "var(--space-2)",
  marginTop: "var(--space-2)",
  paddingTop: "var(--space-2)",
  borderTop: "1px solid var(--border)",
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "date-picker__trigger": datePickerTrigger,
  "date-picker__value": datePickerValue,
  "date-picker__placeholder": datePickerPlaceholder,
  "date-picker__icon": datePickerIcon,
  "date-picker__positioner": datePickerPositioner,
  "date-picker__popup": datePickerPopup,
  "date-picker__footer": datePickerFooter,
};
