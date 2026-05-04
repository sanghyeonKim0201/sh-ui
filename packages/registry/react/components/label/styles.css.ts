import { style } from "@vanilla-extract/css";

export const label = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
  fontSize: "var(--text-sm)",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1.4,
  color: "var(--foreground)",
  cursor: "pointer",
  userSelect: "none",
  selectors: {
    [`&:not(:has(${label__title}`]: {
      display: "block",
    },
    [`&[data-required] > ${label__title}::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&:has(+ .input:required) > ${label__title}::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&:has(+ .input-wrap .input:required) > ${label__title}::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&:has(+ .textarea:required) > ${label__title}::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&:has(+ .combobox__input:required) > ${label__title}::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&[data-required]:not(:has(${label__title}))::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&:not(:has(${label__title})):has(+ .input:required)::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&:not(:has(${label__title})):has(+ .input-wrap .input:required)::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&:not(:has(${label__title})):has(+ .textarea:required)::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    [`&:not(:has(${label__title})):has(+ .combobox__input:required)::after`]: {
      content: "\" *\"",
      color: "var(--danger)",
      fontWeight: "var(--weight-semibold)",
    },
    "&:has(+ .input:disabled)": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
    "&:has(+ .input-wrap .input:disabled)": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
    "&:has(+ .textarea:disabled)": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
    "&:has(+ .select__trigger:disabled)": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
    "&:has(+ .combobox__input:disabled)": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
    "&:has(+ .date-picker__trigger:disabled)": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
    "&:has(+ .file-upload .file-upload__dropzone--disabled)": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
});

export const label__subtitle = style({
  display: "block",
  fontWeight: "var(--weight-regular)",
  fontSize: "0.8125rem",
  color: "var(--foreground)",
});

export const label__description = style({
  display: "block",
  margin: 0,
  fontWeight: "var(--weight-regular)",
  fontSize: "0.8125rem",
  lineHeight: 1.4,
  color: "var(--foreground-muted)",
});

export const label__caption = style({
  margin: 0,
  fontWeight: "var(--weight-regular)",
  fontSize: "var(--text-xs)",
  lineHeight: 1.3,
  color: "var(--foreground-subtle, var(--foreground-muted))",
  opacity: 0.75,
  selectors: {
    "&))": {
      display: "block",
    },
  },
});

export const label__title = style({
  fontWeight: "var(--weight-semibold)",
  fontSize: "var(--text-sm)",
  color: "var(--foreground)",
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "label": label,
  "label__subtitle": label__subtitle,
  "label__description": label__description,
  "label__caption": label__caption,
  "label__title": label__title,
};
