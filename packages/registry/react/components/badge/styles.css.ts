import { style } from "@vanilla-extract/css";

export const badge = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0 0.5rem",
  border: "1px solid transparent",
  borderRadius: "999px",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  userSelect: "none",
});

export const badgeSm = style({
  height: "1.25rem",
  fontSize: "0.6875rem",
  padding: "0 0.375rem",
});

export const badgeMd = style({
  height: "1.5rem",
  fontSize: "var(--text-xs)",
});

export const badgePrimary = style({
  background: "var(--primary)",
  color: "var(--primary-foreground)",
});

export const badgeSecondary = style({
  background: "var(--background-muted)",
  color: "var(--foreground)",
  borderColor: "var(--border)",
});

export const badgeSuccess = style({
  background: "var(--success, #16a34a)",
  color: "#fff",
});

export const badgeWarning = style({
  background: "var(--warning, #d97706)",
  color: "#fff",
});

export const badgeDanger = style({
  background: "var(--danger)",
  color: "var(--danger-foreground, #fff)",
});

export const badgeOutline = style({
  background: "transparent",
  color: "var(--foreground)",
  borderColor: "var(--border-strong)",
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "badge": badge,
  "badge--sm": badgeSm,
  "badge--md": badgeMd,
  "badge--primary": badgePrimary,
  "badge--secondary": badgeSecondary,
  "badge--success": badgeSuccess,
  "badge--warning": badgeWarning,
  "badge--danger": badgeDanger,
  "badge--outline": badgeOutline,
};
