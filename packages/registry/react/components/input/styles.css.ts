import { globalStyle, style } from "@vanilla-extract/css";

export const input = style({
  display: "block",
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
  transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
  WebkitTapHighlightColor: "transparent",

  selectors: {
    "&::placeholder": {
      color: "var(--foreground-subtle)",
    },
    "&:hover:not(:disabled):not(:focus)": {
      borderColor: "var(--border-strong)",
    },
    "&:focus": {
      outline: "none",
      borderColor: "var(--foreground)",
      boxShadow: "0 0 0 1px var(--primary)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
      background: "var(--background-subtle)",
    },
    "&:read-only": {
      background: "var(--background-subtle)",
    },
    '&[type="number"]::-webkit-outer-spin-button': {
      WebkitAppearance: "none",
      margin: 0,
    },
    '&[type="number"]::-webkit-inner-spin-button': {
      WebkitAppearance: "none",
      margin: 0,
    },
    '&[type="number"]': {
      MozAppearance: "textfield",
    },
    '&[aria-invalid="true"]': {
      borderColor: "var(--danger)",
    },
    '&[aria-invalid="true"]:focus': {
      boxShadow: "0 0 0 1px var(--danger)",
    },
    "&[data-in-group]": {
      flex: "1 1 auto",
      minWidth: 0,
      height: "auto",
      padding: 0,
      background: "transparent",
      border: "none",
      borderRadius: 0,
      boxShadow: "none",
    },
    "&[data-in-group]:focus, &[data-in-group]:hover": {
      border: "none",
      boxShadow: "none",
      outline: "none",
    },
    "&[data-in-group]:disabled": {
      background: "transparent",
    },
  },

  "@media": {
    "(hover: none) and (pointer: coarse)": {
      height: "2.75rem",
      fontSize: "var(--text-base)",
    },
  },
});

export const inputWrap = style({
  position: "relative",
  width: "100%",
  display: "block",

  selectors: {
    "&[data-in-group]": {
      flex: "1 1 auto",
      minWidth: 0,
    },
  },
});

export const withPrefix = style({ paddingLeft: "var(--space-10)" });
export const withSuffix = style({ paddingRight: "var(--space-10)" });

export const affix = style({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--foreground-muted)",
  pointerEvents: "none",
});

// vanilla-extract 의 selectors 키는 universal/element descendant (& > *) 도 허용 안 함.
// 자식 요소에 룰 적용하려면 globalStyle 로 빼야 함.
globalStyle(`${affix} > *`, {
  pointerEvents: "auto",
});

export const affixPrefix = style({ left: "var(--space-3)" });
export const affixSuffix = style({ right: "var(--space-1)" });

export const toggle = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  padding: 0,
  background: "transparent",
  border: "none",
  borderRadius: "calc(var(--radius) - 2px)",
  color: "var(--foreground-muted)",
  cursor: "pointer",
  transition: "color var(--duration-fast), background-color var(--duration-fast)",
  WebkitTapHighlightColor: "transparent",

  selectors: {
    "&:hover": {
      color: "var(--foreground)",
      background: "var(--background-muted)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--ring)",
      outlineOffset: "2px",
    },
  },
});

export const group = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  minHeight: "var(--control-md)",
  padding: "0 var(--space-2)",
  gap: "var(--space-2)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
  cursor: "text",
  WebkitTapHighlightColor: "transparent",

  selectors: {
    "&:hover:not([data-disabled]):not(:focus-within)": {
      borderColor: "var(--border-strong)",
    },
    "&:focus-within": {
      borderColor: "var(--foreground)",
      boxShadow: "0 0 0 1px var(--primary)",
    },
    '&[aria-invalid="true"]': {
      borderColor: "var(--danger)",
    },
    '&[aria-invalid="true"]:focus-within': {
      boxShadow: "0 0 0 1px var(--danger)",
    },
    "&[data-disabled]": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
      background: "var(--background-subtle)",
    },
  },

  "@media": {
    "(hover: none) and (pointer: coarse)": {
      minHeight: "2.75rem",
    },
  },
});

export const adornment = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  color: "var(--foreground-muted)",
  padding: "0 var(--space-1)",

  selectors: {
    "&[data-interactive]": {
      padding: 0,
    },
  },
});
