import { style } from "@vanilla-extract/css";

export const calendar = style({
  display: "inline-flex",
  gap: "var(--space-4)",
  userSelect: "none",
});

export const calendarMulti = style({
  flexWrap: "wrap",
});

export const calendar__month = style({
  width: "17.5rem",
});

export const calendar__header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-1)",
  marginBottom: "var(--space-2)",
});

export const calendar__title = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  flex: "1 1 auto",
  justifyContent: "center",
});

export const calendar__nav = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.75rem",
  height: "1.75rem",
  padding: 0,
  border: "none",
  borderRadius: "calc(var(--radius) - 2px)",
  background: "transparent",
  color: "var(--foreground-muted)",
  cursor: "pointer",
  flexShrink: 0,
  transition: "background-color var(--duration-fast), color var(--duration-fast)",
  selectors: {
    "&:hover:not(:disabled)": {
      background: "var(--background-muted)",
      color: "var(--foreground)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
});

export const calendarNavPlaceholder = style({
  visibility: "hidden",
  pointerEvents: "none",
});

export const calendarSelectTrigger = style({
  selectors: {
    "&.select__trigger": {
      minWidth: 0,
      height: "1.75rem",
      gap: "var(--space-1)",
      padding: "0 var(--space-2)",
      background: "transparent",
      borderColor: "transparent",
      fontWeight: "var(--weight-semibold)",
      fontSize: "var(--text-sm)",
      color: "var(--foreground)",
    },
    "&.select__trigger:hover:not(:disabled)": {
      background: "var(--background-muted)",
      borderColor: "transparent",
    },
    "&.select__trigger[data-popup-open]": {
      background: "var(--background-muted)",
      borderColor: "transparent",
    },
  },
});

export const select__positioner = style({
  selectors: {
    [`&:has(${calendarSelectPopup})`]: {
      zIndex: "var(--z-popover)",
    },
  },
});

export const calendar__weekdays = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  marginBottom: "var(--space-1)",
});

export const calendar__weekday = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "2rem",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-medium)",
  color: "var(--foreground-muted)",
});

export const calendar__grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
      borderRadius: "calc(var(--radius) - 2px)",
    },
  },
});

export const calendar__cell = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "2.375rem",
  minWidth: 0,
});

export const calendarCellInRange = style({
  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
});

export const calendarCellRangeStart = style({
  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
  selectors: {
    [`&:not(${calendarCellRangeEnd})`]: {
      borderRadius: "calc(var(--radius) - 2px) 0 0 calc(var(--radius) - 2px)",
    },
    [`&${calendarCellRangeEnd}`]: {
      borderRadius: "calc(var(--radius) - 2px)",
    },
  },
});

export const calendarCellRangeEnd = style({
  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
  selectors: {
    [`&:not(${calendarCellRangeStart})`]: {
      borderRadius: "0 calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0",
    },
  },
});

export const calendar__day = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.25rem",
  height: "2.25rem",
  padding: 0,
  border: "none",
  borderRadius: "calc(var(--radius) - 2px)",
  background: "transparent",
  color: "var(--foreground)",
  fontSize: "0.8125rem",
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "background-color var(--duration-fast), color var(--duration-fast)",
  selectors: {
    "&:hover:not(:disabled)": {
      background: "var(--background-muted)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&:disabled": {
      opacity: 0.3,
      cursor: "not-allowed",
    },
  },
});

export const calendarDayOutside = style({
  color: "var(--foreground-subtle, var(--foreground-muted))",
  opacity: 0.4,
});

export const calendarDayToday = style({
  fontWeight: "var(--weight-bold)",
  textDecoration: "underline",
  textUnderlineOffset: "0.125rem",
});

export const calendarDaySelected = style({
  background: "var(--primary)",
  color: "var(--primary-foreground)",
  fontWeight: "var(--weight-semibold)",
  selectors: {
    "&:hover:not(:disabled)": {
      background: "var(--primary-hover)",
      color: "var(--primary-foreground)",
    },
  },
});

export const calendarSelectValue = style({
});

export const calendarSelectPopup = style({
});

export const calendarGridWrap = style({
});

export const calendarCellHidden = style({
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "calendar": calendar,
  "calendar--multi": calendarMulti,
  "calendar__month": calendar__month,
  "calendar__header": calendar__header,
  "calendar__title": calendar__title,
  "calendar__nav": calendar__nav,
  "calendar__nav--placeholder": calendarNavPlaceholder,
  "calendar__select-trigger": calendarSelectTrigger,
  "select__positioner": select__positioner,
  "calendar__weekdays": calendar__weekdays,
  "calendar__weekday": calendar__weekday,
  "calendar__grid": calendar__grid,
  "calendar__cell": calendar__cell,
  "calendar__cell--in-range": calendarCellInRange,
  "calendar__cell--range-start": calendarCellRangeStart,
  "calendar__cell--range-end": calendarCellRangeEnd,
  "calendar__day": calendar__day,
  "calendar__day--outside": calendarDayOutside,
  "calendar__day--today": calendarDayToday,
  "calendar__day--selected": calendarDaySelected,
  "calendar__select-value": calendarSelectValue,
  "calendar__select-popup": calendarSelectPopup,
  "calendar__grid-wrap": calendarGridWrap,
  "calendar__cell--hidden": calendarCellHidden,
};
