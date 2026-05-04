/**
 * 플레이그라운드(/create) 토큰 데이터 모델 + 디폴트.
 *
 * 색은 light/dark 한 쌍으로 모드 의존, 그 외 (spacing/typography/weight/motion/border/control/shadow)
 * 는 모드 무관 — 한 셋만 유지. tokens.css 의 디폴트와 정확히 같은 값을 박아 둔다 (사용자가
 * 아무것도 안 만지면 미리보기와 실제 스캐폴드가 동일).
 *
 * 스캐폴드 threading:
 *   v0.55.0 — base64 스키마에 success/warning/info × -foreground 옵셔널 키 6개 추가.
 *   playground 는 항상 디폴트로 emit 하므로 base64 에 포함되어 흐른다 (CLI 측은 옵셔널이라 누락도 허용).
 *   기타 카테고리 / gradient 는 카테고리별로 CLI 로 승격 (이미 진행).
 */

export type TokenKey =
  | "background"
  | "background-subtle"
  | "background-muted"
  | "background-inverse"
  | "foreground"
  | "foreground-muted"
  | "foreground-subtle"
  | "foreground-inverse"
  | "border"
  | "border-strong"
  | "primary"
  | "primary-foreground"
  | "primary-hover"
  | "danger"
  | "danger-foreground"
  | "success"
  | "success-foreground"
  | "warning"
  | "warning-foreground"
  | "info"
  | "info-foreground";

export type Mode = "light" | "dark";

export const lightDefaults: Record<TokenKey, string> = {
  background: "#FFFFFF",
  "background-subtle": "#FAFAFA",
  "background-muted": "#F5F5F5",
  "background-inverse": "#0A0A0A",
  foreground: "#0A0A0A",
  "foreground-muted": "#525252",
  "foreground-subtle": "#A3A3A3",
  "foreground-inverse": "#FFFFFF",
  border: "#E5E5E5",
  "border-strong": "#D4D4D4",
  primary: "#171717",
  "primary-foreground": "#FAFAFA",
  "primary-hover": "#262626",
  danger: "#DC2626",
  "danger-foreground": "#FFFFFF",
  // Badge 컴포넌트 fallback 값과 동일 — 디폴트 그대로 두면 시각적 변화 없음.
  success: "#16A34A",
  "success-foreground": "#FFFFFF",
  warning: "#D97706",
  "warning-foreground": "#FFFFFF",
  info: "#0EA5E9",
  "info-foreground": "#FFFFFF",
};

export const darkDefaults: Record<TokenKey, string> = {
  background: "#0A0A0A",
  "background-subtle": "#171717",
  "background-muted": "#262626",
  "background-inverse": "#FFFFFF",
  foreground: "#FAFAFA",
  "foreground-muted": "#A3A3A3",
  "foreground-subtle": "#737373",
  "foreground-inverse": "#0A0A0A",
  border: "#262626",
  "border-strong": "#404040",
  primary: "#FAFAFA",
  "primary-foreground": "#171717",
  "primary-hover": "#E5E5E5",
  danger: "#DC2626",
  "danger-foreground": "#FFFFFF",
  // 다크에서는 한 단계 밝은 채도 — 어두운 배경 위에서도 식별 보장.
  success: "#22C55E",
  "success-foreground": "#052E16",
  warning: "#F59E0B",
  "warning-foreground": "#1F1300",
  info: "#38BDF8",
  "info-foreground": "#082F49",
};

/** 쉬운/고급 모드 모두에서 보이는 색 그룹 (간단 모드는 primary 만 노출, 고급은 전부) */
export const TOKEN_GROUPS: { label: string; keys: TokenKey[] }[] = [
  { label: "Background", keys: ["background", "background-subtle", "background-muted", "background-inverse"] },
  { label: "Foreground", keys: ["foreground", "foreground-muted", "foreground-subtle", "foreground-inverse"] },
  { label: "Border", keys: ["border", "border-strong"] },
  { label: "Primary", keys: ["primary", "primary-foreground", "primary-hover"] },
  { label: "Danger", keys: ["danger", "danger-foreground"] },
  { label: "Success", keys: ["success", "success-foreground"] },
  { label: "Warning", keys: ["warning", "warning-foreground"] },
  { label: "Info", keys: ["info", "info-foreground"] },
];

export const DEFAULT_RADIUS = 0.5;

export const RADIUS_PRESETS: { label: string; value: number }[] = [
  { label: "none", value: 0 },
  { label: "sm", value: 0.25 },
  { label: "md", value: 0.5 },
  { label: "lg", value: 0.75 },
  { label: "xl", value: 1 },
];

/* ─────── 모드 무관 스칼라 토큰 ─────── */

export interface SpacingScale {
  "0": number; "1": number; "2": number; "3": number;
  "4": number; "5": number; "6": number; "8": number;
  "10": number; "12": number; "16": number;
}

export const SPACING_KEYS = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16"] as const;

export const spacingDefaults: SpacingScale = {
  "0": 0, "1": 4, "2": 8, "3": 12,
  "4": 16, "5": 20, "6": 24, "8": 32,
  "10": 40, "12": 48, "16": 64,
};

export interface TypographyScale {
  xs: number; sm: number; base: number; lg: number;
  xl: number; "2xl": number; "3xl": number; "4xl": number;
}

export const TYPOGRAPHY_KEYS = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"] as const;

export const typographyDefaults: TypographyScale = {
  xs: 12, sm: 14, base: 16, lg: 18,
  xl: 20, "2xl": 24, "3xl": 30, "4xl": 36,
};

export interface WeightScale {
  regular: number; medium: number; semibold: number; bold: number;
}

export const WEIGHT_KEYS = ["regular", "medium", "semibold", "bold"] as const;

export const weightDefaults: WeightScale = {
  regular: 400, medium: 500, semibold: 600, bold: 700,
};

export interface MotionTokens {
  durationFast: number; // ms
  durationBase: number;
  durationSlow: number;
  easeStandard: string; // cubic-bezier(...)
  easeEmphasized: string;
}

export const motionDefaults: MotionTokens = {
  durationFast: 120,
  durationBase: 160,
  durationSlow: 200,
  easeStandard: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeEmphasized: "cubic-bezier(0.2, 0, 0, 1)",
};

export interface BorderTokens {
  width: number; // px
  widthStrong: number;
}

export const borderDefaults: BorderTokens = { width: 1, widthStrong: 2 };

export interface ControlTokens {
  sm: number; // px
  md: number;
  lg: number;
}

export const controlDefaults: ControlTokens = { sm: 32, md: 40, lg: 48 };

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export const SHADOW_KEYS = ["sm", "md", "lg", "xl"] as const;

export const shadowDefaults: ShadowTokens = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.08)",
  md: "0 4px 12px rgba(0, 0, 0, 0.12)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.15)",
  xl: "0 16px 48px rgba(0, 0, 0, 0.18)",
};

/* ───────── Dart 토큰 내보내기 ─────────
 * ShUiColorTokens 필드 매핑:
 * - self     — 현재 모드에서 playground가 편집하는 값 (이제 inverse·subtle 도 직접 노출)
 *
 * 과거(<=0.35.0)에는 backgroundInverse/foregroundInverse 가 반대 모드에서 자동 파생됐고
 * foregroundSubtle 은 하드 디폴트였다. 0.36.0 부터 사용자가 직접 잡는다.
 */
type DartFieldSource = { kind: "self"; key: TokenKey };

const DART_FIELD_ORDER: { field: string; source: DartFieldSource }[] = [
  { field: "background", source: { kind: "self", key: "background" } },
  { field: "backgroundSubtle", source: { kind: "self", key: "background-subtle" } },
  { field: "backgroundMuted", source: { kind: "self", key: "background-muted" } },
  { field: "backgroundInverse", source: { kind: "self", key: "background-inverse" } },
  { field: "foreground", source: { kind: "self", key: "foreground" } },
  { field: "foregroundMuted", source: { kind: "self", key: "foreground-muted" } },
  { field: "foregroundSubtle", source: { kind: "self", key: "foreground-subtle" } },
  { field: "foregroundInverse", source: { kind: "self", key: "foreground-inverse" } },
  { field: "border", source: { kind: "self", key: "border" } },
  { field: "borderStrong", source: { kind: "self", key: "border-strong" } },
  { field: "primary", source: { kind: "self", key: "primary" } },
  { field: "primaryForeground", source: { kind: "self", key: "primary-foreground" } },
  { field: "primaryHover", source: { kind: "self", key: "primary-hover" } },
  { field: "danger", source: { kind: "self", key: "danger" } },
  { field: "dangerForeground", source: { kind: "self", key: "danger-foreground" } },
];

const toDartColor = (hex: string) =>
  `Color(0xFF${hex.replace("#", "").toUpperCase()})`;

export function buildDartColorTokens(
  mode: Mode,
  self: Record<TokenKey, string>,
  _opposite: Record<TokenKey, string>,
): string {
  const lines = DART_FIELD_ORDER.map(({ field, source }) =>
    `  ${field}: ${toDartColor(self[source.key])},`,
  ).join("\n");
  return `static const ${mode} = ShUiColorTokens(\n${lines}\n);`;
}
