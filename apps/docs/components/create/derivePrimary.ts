/**
 * 쉬운 모드 — primary 컬러 한 개를 받아 primary-foreground / primary-hover 를 자동 파생.
 *
 * primary-foreground: WCAG 상대 휘도로 흑/백 분기 (대비 보장).
 * primary-hover: 모드별로 8% 어둡게/밝게 (light 모드는 darken, dark 모드는 lighten).
 */

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

const parseHex = (hex: string): [number, number, number] => {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m || m.length !== 3) throw new Error(`invalid hex: ${hex}`);
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
};

const toHex = (r: number, g: number, b: number): string => {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const h = (n: number) => clamp(n).toString(16).padStart(2, "0").toUpperCase();
  return `#${h(r)}${h(g)}${h(b)}`;
};

/** WCAG 상대 휘도 (0~1). */
const relativeLuminance = (hex: string): number => {
  const [r, g, b] = parseHex(hex).map((v) => v / 255);
  const linearize = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
};

/**
 * 0.5 를 기준으로 흑/백 분기. 대비 충돌이 가장 적은 단순 휴리스틱.
 * 더 정밀한 매칭이 필요하면 사용자가 고급 모드로 전환해 직접 잡는다.
 */
export const derivePrimaryForeground = (primaryHex: string): string => {
  if (!HEX_REGEX.test(primaryHex)) return "#FFFFFF";
  return relativeLuminance(primaryHex) > 0.5 ? "#0A0A0A" : "#FFFFFF";
};

/**
 * light 모드: 8% 어둡게(곱하기 0.92), dark 모드: 8% 밝게(255 쪽으로 8% 보간).
 * 셰이드 폭이 너무 크면 어색하고, 너무 작으면 호버 차이가 안 보여서 8% 로 잡음.
 */
export const derivePrimaryHover = (primaryHex: string, mode: "light" | "dark"): string => {
  if (!HEX_REGEX.test(primaryHex)) return primaryHex;
  const [r, g, b] = parseHex(primaryHex);
  if (mode === "light") {
    return toHex(r * 0.92, g * 0.92, b * 0.92);
  }
  return toHex(r + (255 - r) * 0.08, g + (255 - g) * 0.08, b + (255 - b) * 0.08);
};
