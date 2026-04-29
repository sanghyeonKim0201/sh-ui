export type TokenKey =
  | "background"
  | "background-subtle"
  | "background-muted"
  | "foreground"
  | "foreground-muted"
  | "border"
  | "border-strong"
  | "primary"
  | "primary-foreground"
  | "primary-hover"
  | "danger"
  | "danger-foreground";

export type Mode = "light" | "dark";

export const lightDefaults: Record<TokenKey, string> = {
  background: "#FFFFFF",
  "background-subtle": "#FAFAFA",
  "background-muted": "#F5F5F5",
  foreground: "#0A0A0A",
  "foreground-muted": "#525252",
  border: "#E5E5E5",
  "border-strong": "#D4D4D4",
  primary: "#171717",
  "primary-foreground": "#FAFAFA",
  "primary-hover": "#262626",
  danger: "#DC2626",
  "danger-foreground": "#FFFFFF",
};

export const darkDefaults: Record<TokenKey, string> = {
  background: "#0A0A0A",
  "background-subtle": "#171717",
  "background-muted": "#262626",
  foreground: "#FAFAFA",
  "foreground-muted": "#A3A3A3",
  border: "#262626",
  "border-strong": "#404040",
  primary: "#FAFAFA",
  "primary-foreground": "#171717",
  "primary-hover": "#E5E5E5",
  danger: "#DC2626",
  "danger-foreground": "#FFFFFF",
};

export const TOKEN_GROUPS: { label: string; keys: TokenKey[] }[] = [
  { label: "Background", keys: ["background", "background-subtle", "background-muted"] },
  { label: "Foreground", keys: ["foreground", "foreground-muted"] },
  { label: "Border", keys: ["border", "border-strong"] },
  { label: "Primary", keys: ["primary", "primary-foreground", "primary-hover"] },
  { label: "Danger", keys: ["danger", "danger-foreground"] },
];

export const DEFAULT_RADIUS = 0.5;

export const RADIUS_PRESETS: { label: string; value: number }[] = [
  { label: "none", value: 0 },
  { label: "sm", value: 0.25 },
  { label: "md", value: 0.5 },
  { label: "lg", value: 0.75 },
  { label: "xl", value: 1 },
];

/* ───────── Dart 토큰 내보내기 ─────────
 * ShUiColorTokens 필드 매핑:
 * - self    — 현재 모드에서 playground가 편집하는 값
 * - inverse — 반대 모드의 편집값
 * - default — playground가 노출하지 않음. 기본값 유지
 */
type DartFieldSource =
  | { kind: "self"; key: TokenKey }
  | { kind: "inverse"; key: TokenKey }
  | { kind: "default" };

const DART_FIELD_ORDER: { field: string; source: DartFieldSource }[] = [
  { field: "background", source: { kind: "self", key: "background" } },
  { field: "backgroundSubtle", source: { kind: "self", key: "background-subtle" } },
  { field: "backgroundMuted", source: { kind: "self", key: "background-muted" } },
  { field: "backgroundInverse", source: { kind: "inverse", key: "background" } },
  { field: "foreground", source: { kind: "self", key: "foreground" } },
  { field: "foregroundMuted", source: { kind: "self", key: "foreground-muted" } },
  { field: "foregroundSubtle", source: { kind: "default" } },
  { field: "foregroundInverse", source: { kind: "inverse", key: "foreground" } },
  { field: "border", source: { kind: "self", key: "border" } },
  { field: "borderStrong", source: { kind: "self", key: "border-strong" } },
  { field: "primary", source: { kind: "self", key: "primary" } },
  { field: "primaryForeground", source: { kind: "self", key: "primary-foreground" } },
  { field: "primaryHover", source: { kind: "self", key: "primary-hover" } },
  { field: "danger", source: { kind: "self", key: "danger" } },
  { field: "dangerForeground", source: { kind: "self", key: "danger-foreground" } },
];

const DART_DEFAULTS: Record<Mode, Record<string, string>> = {
  light: { foregroundSubtle: "0xFFA3A3A3" },
  dark: { foregroundSubtle: "0xFF737373" },
};

const toDartColor = (hex: string) =>
  `Color(0xFF${hex.replace("#", "").toUpperCase()})`;

export function buildDartColorTokens(
  mode: Mode,
  self: Record<TokenKey, string>,
  opposite: Record<TokenKey, string>,
): string {
  const defaults = DART_DEFAULTS[mode];
  const lines = DART_FIELD_ORDER.map(({ field, source }) => {
    switch (source.kind) {
      case "self":
        return `  ${field}: ${toDartColor(self[source.key])},`;
      case "inverse":
        return `  ${field}: ${toDartColor(opposite[source.key])},`;
      case "default":
        return `  ${field}: Color(${defaults[field]}),`;
    }
  }).join("\n");
  return `static const ${mode} = ShUiColorTokens(\n${lines}\n);`;
}
