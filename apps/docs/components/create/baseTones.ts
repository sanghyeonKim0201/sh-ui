/**
 * 쉬운 모드 토큰 편집기의 "베이스 톤" 칩.
 *
 * 7개의 무채색/주변색 토큰 (background·background-subtle·background-muted·
 * foreground·foreground-muted·border·border-strong) 을 한 번에 잡는다.
 * primary / danger 는 별도 — 베이스 톤은 색감 결정만 한다.
 *
 * 톤 구분 (Tailwind 팔레트 참조):
 * - neutral — 순수 무채색 (no hue)
 * - slate   — 푸른 끼 도는 cool gray
 * - warm    — 살짝 누런 끼 도는 stone
 * - cool    — 살짝 보라 끼 도는 zinc (neutral 보다 미세하게 차가움)
 */

export type BaseTokenKey =
  | "background"
  | "background-subtle"
  | "background-muted"
  | "foreground"
  | "foreground-muted"
  | "border"
  | "border-strong";

export type BaseToneName = "neutral" | "slate" | "warm" | "cool";

export interface BaseTone {
  label: string;
  /** 칩에 표시할 대표 swatch (--background-muted 의 light 값 — 톤 차이가 가장 잘 보임). */
  swatch: string;
  light: Record<BaseTokenKey, string>;
  dark: Record<BaseTokenKey, string>;
}

export const BASE_TONES: Record<BaseToneName, BaseTone> = {
  neutral: {
    label: "뉴트럴",
    swatch: "#F5F5F5",
    light: {
      background: "#FFFFFF",
      "background-subtle": "#FAFAFA",
      "background-muted": "#F5F5F5",
      foreground: "#0A0A0A",
      "foreground-muted": "#525252",
      border: "#E5E5E5",
      "border-strong": "#D4D4D4",
    },
    dark: {
      background: "#0A0A0A",
      "background-subtle": "#171717",
      "background-muted": "#262626",
      foreground: "#FAFAFA",
      "foreground-muted": "#A3A3A3",
      border: "#262626",
      "border-strong": "#404040",
    },
  },
  slate: {
    label: "슬레이트",
    swatch: "#F1F5F9",
    light: {
      background: "#FFFFFF",
      "background-subtle": "#F8FAFC",
      "background-muted": "#F1F5F9",
      foreground: "#0F172A",
      "foreground-muted": "#475569",
      border: "#E2E8F0",
      "border-strong": "#CBD5E1",
    },
    dark: {
      background: "#0F172A",
      "background-subtle": "#1E293B",
      "background-muted": "#334155",
      foreground: "#F1F5F9",
      "foreground-muted": "#94A3B8",
      border: "#334155",
      "border-strong": "#475569",
    },
  },
  warm: {
    label: "웜",
    swatch: "#F5F5F4",
    light: {
      background: "#FFFFFF",
      "background-subtle": "#FAFAF9",
      "background-muted": "#F5F5F4",
      foreground: "#0C0A09",
      "foreground-muted": "#57534E",
      border: "#E7E5E4",
      "border-strong": "#D6D3D1",
    },
    dark: {
      background: "#0C0A09",
      "background-subtle": "#1C1917",
      "background-muted": "#292524",
      foreground: "#FAFAF9",
      "foreground-muted": "#A8A29E",
      border: "#292524",
      "border-strong": "#44403C",
    },
  },
  cool: {
    label: "쿨",
    swatch: "#F4F4F5",
    light: {
      background: "#FFFFFF",
      "background-subtle": "#FAFAFA",
      "background-muted": "#F4F4F5",
      foreground: "#09090B",
      "foreground-muted": "#52525B",
      border: "#E4E4E7",
      "border-strong": "#D4D4D8",
    },
    dark: {
      background: "#09090B",
      "background-subtle": "#18181B",
      "background-muted": "#27272A",
      foreground: "#FAFAFA",
      "foreground-muted": "#A1A1AA",
      border: "#27272A",
      "border-strong": "#3F3F46",
    },
  },
};

export const BASE_TONE_NAMES = Object.keys(BASE_TONES) as BaseToneName[];

/**
 * 현재 light/dark 토큰 셋이 어떤 베이스 톤과 정확히 일치하는지 찾는다.
 * 7×2 = 14 개 키 모두 일치해야 매칭. 사용자가 한 군데라도 손대면 null.
 */
export const detectActiveBaseTone = (
  light: Record<string, string>,
  dark: Record<string, string>,
): BaseToneName | null => {
  for (const [name, tone] of Object.entries(BASE_TONES) as [BaseToneName, BaseTone][]) {
    const allLightMatch = (Object.keys(tone.light) as BaseTokenKey[]).every(
      (k) => light[k] === tone.light[k],
    );
    const allDarkMatch = (Object.keys(tone.dark) as BaseTokenKey[]).every(
      (k) => dark[k] === tone.dark[k],
    );
    if (allLightMatch && allDarkMatch) return name;
  }
  return null;
};
