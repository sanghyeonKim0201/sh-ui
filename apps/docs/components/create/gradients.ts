/**
 * 그라데이션 슬롯 — 0.36.0 시점 플레이그라운드 미리보기 전용.
 *
 * 형식:
 *   linear-gradient(<angle>deg, <color> <pos>%, <color> <pos>%)
 *
 * Phase 1 단순화:
 * - linear-gradient 만 (radial 없음)
 * - 정확히 2 컬러스톱 (add/remove 없음, Phase 3 에서 N-stop 확장 가능)
 * - 색은 hex 6 자리 (alpha 없음)
 *
 * 슬롯 3개 — primary / surface / overlay. 각 슬롯이 정해진 의미가 있는 게 아니라 디자이너가
 * 자기 컨벤션으로 매핑하면 됨. CSS 변수 이름만 정해진 것 — `--gradient-primary` 등.
 */

export interface GradientStop {
  /** hex 6자리, 예: '#E11D48'. */
  color: string;
  /** 0~100. */
  position: number;
}

export interface GradientSlot {
  /** 0~360 (deg). */
  angle: number;
  stops: [GradientStop, GradientStop];
}

export type GradientSlotName = "primary" | "surface" | "overlay";

export interface GradientTokens {
  primary: GradientSlot;
  surface: GradientSlot;
  overlay: GradientSlot;
}

export const GRADIENT_SLOT_NAMES: GradientSlotName[] = ["primary", "surface", "overlay"];

/** 슬롯별 라벨 — CSS 변수 이름만 강제고 의미는 디자이너 컨벤션. */
export const GRADIENT_SLOT_LABELS: Record<GradientSlotName, string> = {
  primary: "Primary (강조)",
  surface: "Surface (표면)",
  overlay: "Overlay (덮개)",
};

export const gradientDefaults: GradientTokens = {
  primary: {
    angle: 135,
    stops: [
      { color: "#171717", position: 0 },
      { color: "#525252", position: 100 },
    ],
  },
  surface: {
    angle: 180,
    stops: [
      { color: "#FFFFFF", position: 0 },
      { color: "#F5F5F5", position: 100 },
    ],
  },
  overlay: {
    angle: 180,
    stops: [
      { color: "#000000", position: 0 },
      { color: "#1F1F1F", position: 100 },
    ],
  },
};

export const serializeGradient = (slot: GradientSlot): string => {
  const stops = slot.stops
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");
  return `linear-gradient(${slot.angle}deg, ${stops})`;
};
