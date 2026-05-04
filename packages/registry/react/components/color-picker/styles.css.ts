import { style } from "@vanilla-extract/css";

export const colorPicker = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.625rem",
  width: "100%",
  userSelect: "none",
  WebkitUserSelect: "none",
});

export const colorPickerSv = style({
  position: "relative",
  width: "100%",
  aspectRatio: "4 / 3",
  borderRadius: "var(--radius)",
  cursor: "crosshair",
  overflow: "hidden",
  touchAction: "none",
});

export const colorPickerSvSaturation = style({
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to right, #fff, transparent)",
});

export const colorPickerSvValue = style({
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top, #000, transparent)",
});

export const colorPickerSvThumb = style({
  position: "absolute",
  width: "0.875rem",
  height: "0.875rem",
  marginLeft: "-0.4375rem",
  marginTop: "-0.4375rem",
  border: "2px solid #fff",
  borderRadius: "50%",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.4)",
  pointerEvents: "none",
});

export const colorPickerHue = style({
  position: "relative",
  width: "100%",
  height: "0.875rem",
  borderRadius: "999px",
  cursor: "pointer",
  touchAction: "none",
  background: "linear-gradient(\n    to right,\n    #f00 0%,\n    #ff0 16.66%,\n    #0f0 33.33%,\n    #0ff 50%,\n    #00f 66.66%,\n    #f0f 83.33%,\n    #f00 100%\n  )",
});

export const colorPickerHueThumb = style({
  position: "absolute",
  top: "50%",
  width: "0.875rem",
  height: "0.875rem",
  marginLeft: "-0.4375rem",
  transform: "translateY(-50%)",
  background: "#fff",
  borderRadius: "50%",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.4)",
  pointerEvents: "none",
});

export const colorPickerAlpha = style({
  position: "relative",
  width: "100%",
  height: "0.875rem",
  borderRadius: "999px",
  cursor: "pointer",
  touchAction: "none",
  backgroundColor: "#fff",
  backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%),\n    linear-gradient(-45deg, #ccc 25%, transparent 25%),\n    linear-gradient(45deg, transparent 75%, #ccc 75%),\n    linear-gradient(-45deg, transparent 75%, #ccc 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
  overflow: "hidden",
});

export const colorPickerAlphaTrack = style({
  position: "absolute",
  inset: 0,
  borderRadius: "inherit",
  pointerEvents: "none",
});

export const colorPickerRow = style({
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
});

export const colorPickerSwatch = style({
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "calc(var(--radius) - 2px)",
  border: "1px solid var(--border)",
  flexShrink: 0,
});

export const colorPickerHex = style({
  flex: 1,
  minWidth: 0,
  height: "1.75rem",
  padding: "0 var(--space-2)",
  border: "1px solid var(--border)",
  borderRadius: "calc(var(--radius) - 2px)",
  background: "var(--background)",
  color: "var(--foreground)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "0.8125rem",
  textTransform: "uppercase",
  selectors: {
    "&:focus": {
      outline: "none",
      borderColor: "var(--foreground)",
      boxShadow: "0 0 0 1px var(--foreground)",
    },
  },
});

export const colorPickerSwatches = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.375rem",
});

export const colorPickerSwatchBtn = style({
  width: "1.25rem",
  height: "1.25rem",
  padding: 0,
  border: "1px solid var(--border)",
  borderRadius: "calc(var(--radius) - 4px)",
  cursor: "pointer",
  transition: "transform var(--duration-fast), box-shadow var(--duration-fast)",
  selectors: {
    "&:hover": {
      transform: "scale(1.08)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    "&[data-selected]": {
      boxShadow: "0 0 0 2px var(--background), 0 0 0 3.5px var(--foreground)",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "color-picker": colorPicker,
  "color-picker__sv": colorPickerSv,
  "color-picker__sv-saturation": colorPickerSvSaturation,
  "color-picker__sv-value": colorPickerSvValue,
  "color-picker__sv-thumb": colorPickerSvThumb,
  "color-picker__hue": colorPickerHue,
  "color-picker__hue-thumb": colorPickerHueThumb,
  "color-picker__alpha": colorPickerAlpha,
  "color-picker__alpha-track": colorPickerAlphaTrack,
  "color-picker__row": colorPickerRow,
  "color-picker__swatch": colorPickerSwatch,
  "color-picker__hex": colorPickerHex,
  "color-picker__swatches": colorPickerSwatches,
  "color-picker__swatch-btn": colorPickerSwatchBtn,
};
