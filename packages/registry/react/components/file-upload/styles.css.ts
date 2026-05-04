import { style } from "@vanilla-extract/css";

export const fileUpload = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
});

export const fileUploadDropzone = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-2)",
  padding: "var(--space-8) var(--space-6)",
  minHeight: "10rem",
  background: "var(--background-subtle)",
  color: "var(--foreground-muted)",
  border: "1.5px dashed var(--border)",
  borderRadius: "var(--radius)",
  cursor: "pointer",
  textAlign: "center",
  transition: "border-color var(--duration-fast), background-color var(--duration-fast), color var(--duration-fast)",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    "&:hover": {
      borderColor: "var(--border-strong)",
      color: "var(--foreground)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
      borderColor: "var(--foreground)",
    },
  },
});

export const fileUploadDropzoneDrag = style({
  borderColor: "var(--foreground)",
  background: "var(--background-muted)",
  color: "var(--foreground)",
});

export const fileUploadDropzoneDisabled = style({
  opacity: "var(--opacity-disabled)",
  cursor: "not-allowed",
  pointerEvents: "none",
});

export const fileUploadInput = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
});

export const fileUploadText = style({
  fontSize: "var(--text-sm)",
  color: "var(--foreground)",
  selectors: {
    "& strong": {
      fontWeight: "var(--weight-semibold)",
    },
  },
});

export const fileUploadHint = style({
  fontSize: "var(--text-xs)",
  color: "var(--foreground-muted)",
});

export const fileUploadTrigger = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-3)",
  fontSize: "var(--text-sm)",
  fontWeight: "var(--weight-medium)",
  color: "var(--foreground)",
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  transition: "background-color var(--duration-fast), border-color var(--duration-fast)",
  selectors: {
    "&:hover:not(:disabled)": {
      background: "var(--background-muted)",
      borderColor: "var(--border-strong)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
});

export const fileUploadList = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
});

export const fileUploadItem = style({
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "var(--space-2) var(--space-3)",
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "calc(var(--radius) - 2px)",
  fontSize: "var(--text-sm)",
  color: "var(--foreground)",
  selectors: {
    "& > svg": {
      color: "var(--foreground-muted)",
      flexShrink: 0,
    },
  },
});

export const fileUploadName = style({
  flex: "1 1 auto",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const fileUploadSize = style({
  fontSize: "var(--text-xs)",
  color: "var(--foreground-muted)",
  flexShrink: 0,
});

export const fileUploadRemove = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  padding: 0,
  background: "transparent",
  border: "none",
  borderRadius: "calc(var(--radius) - 4px)",
  color: "var(--foreground-muted)",
  cursor: "pointer",
  transition: "color var(--duration-fast), background-color var(--duration-fast)",
  flexShrink: 0,
  selectors: {
    "&:hover:not(:disabled)": {
      color: "var(--foreground)",
      background: "var(--background-muted)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "file-upload": fileUpload,
  "file-upload__dropzone": fileUploadDropzone,
  "file-upload__dropzone--drag": fileUploadDropzoneDrag,
  "file-upload__dropzone--disabled": fileUploadDropzoneDisabled,
  "file-upload__input": fileUploadInput,
  "file-upload__text": fileUploadText,
  "file-upload__hint": fileUploadHint,
  "file-upload__trigger": fileUploadTrigger,
  "file-upload__list": fileUploadList,
  "file-upload__item": fileUploadItem,
  "file-upload__name": fileUploadName,
  "file-upload__size": fileUploadSize,
  "file-upload__remove": fileUploadRemove,
};
