import { style } from "@vanilla-extract/css";

export const avatar = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  verticalAlign: "middle",
  overflow: "hidden",
  borderRadius: "999px",
  background: "var(--background-muted)",
  color: "var(--foreground-muted)",
  fontWeight: "var(--weight-medium)",
  userSelect: "none",
});

export const avatarSm = style({
  width: "1.75rem",
  height: "1.75rem",
  fontSize: "var(--text-xs)",
});

export const avatarMd = style({
  width: "2.5rem",
  height: "2.5rem",
  fontSize: "0.8125rem",
});

export const avatarLg = style({
  width: "3rem",
  height: "3rem",
  fontSize: "var(--text-sm)",
});

export const avatarXl = style({
  width: "4rem",
  height: "4rem",
  fontSize: "var(--text-base)",
});

export const avatar__image = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

export const avatar__fallback = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "avatar": avatar,
  "avatar--sm": avatarSm,
  "avatar--md": avatarMd,
  "avatar--lg": avatarLg,
  "avatar--xl": avatarXl,
  "avatar__image": avatar__image,
  "avatar__fallback": avatar__fallback,
};
