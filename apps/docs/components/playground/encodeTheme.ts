type TokenKey =
  | "background" | "background-subtle" | "background-muted"
  | "foreground" | "foreground-muted"
  | "border" | "border-strong"
  | "primary" | "primary-foreground" | "primary-hover"
  | "danger" | "danger-foreground";

type Mode = "light" | "dark";

export type ThemeConfig = {
  light: Record<TokenKey, string>;
  dark: Record<TokenKey, string>;
  radius: number;
};

export const encodeTheme = (cfg: ThemeConfig): string => {
  const json = JSON.stringify(cfg);
  // btoa 는 ASCII-only. hex + 숫자만 있으니 안전.
  return btoa(json);
};

export type { TokenKey, Mode };
