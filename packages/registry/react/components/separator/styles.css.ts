import { style } from "@vanilla-extract/css";

export const separator = style({
  background: "var(--border)",
  flexShrink: 0,
});

export const separatorHorizontal = style({
  width: "100%",
  height: "1px",
});

export const separatorVertical = style({
  width: "1px",
  height: "100%",
  alignSelf: "stretch",
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "separator": separator,
  "separator--horizontal": separatorHorizontal,
  "separator--vertical": separatorVertical,
};
