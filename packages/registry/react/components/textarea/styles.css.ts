import { style } from "@vanilla-extract/css";

export const textarea = style({
  display: "block",
  width: "100%",
  minHeight: "5rem",
  padding: "var(--space-2) var(--space-3)",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
  lineHeight: 1.5,
  resize: "vertical",
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
      boxShadow: "0 0 0 1px var(--foreground)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
      background: "var(--background-subtle)",
    },
    "&:read-only": {
      background: "var(--background-subtle)",
    },
    "&[aria-invalid="true"]": {
      borderColor: "var(--danger)",
    },
    "&[aria-invalid="true"]:focus": {
      boxShadow: "0 0 0 1px var(--danger)",
    },
  },
  "@media": {
    "(hover: none) and (pointer: coarse)": {
      fontSize: "var(--text-base)",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "textarea": textarea,
};
