type TokenKey =
  | "background" | "background-subtle" | "background-muted" | "background-inverse"
  | "foreground" | "foreground-muted" | "foreground-subtle" | "foreground-inverse"
  | "border" | "border-strong"
  | "primary" | "primary-foreground" | "primary-hover"
  | "danger" | "danger-foreground"
  | "success" | "success-foreground"
  | "warning" | "warning-foreground"
  | "info" | "info-foreground";

type Mode = "light" | "dark";

/**
 * v0.37.0 — 옵셔널 카테고리. 사용자가 디폴트에서 손댄 카테고리만 payload 에 포함해
 * base64 크기를 절약. CLI decode.js 의 SCALAR_CATEGORIES 와 키/타입 동기.
 */
export interface OptionalScalarCategories {
  spacing?: Record<string, number>;     // 0,1,2,3,4,5,6,8,10,12,16
  typography?: Record<string, number>;  // xs,sm,base,lg,xl,2xl,3xl,4xl
  weights?: Record<string, number>;     // regular,medium,semibold,bold
  controls?: Record<string, number>;    // sm,md,lg
  borders?: Record<string, number>;     // width,widthStrong
  durations?: Record<string, number>;   // fast,base,slow
}

/** Phase 3 — string 카테고리. CSS 그대로 흐르고 Dart 측 inject 시 변환기 거침. */
export interface OptionalStringCategories {
  shadows?: Record<string, string>;    // sm/md/lg/xl — CSS box-shadow 문자열
  eases?: Record<string, string>;      // standard/emphasized — cubic-bezier(...) 또는 named
  gradients?: Record<string, string>;  // primary/surface/overlay — linear-gradient(...) 문자열
}

export type ThemeConfig = {
  light: Record<TokenKey, string>;
  dark: Record<TokenKey, string>;
  radius: number;
} & OptionalScalarCategories & OptionalStringCategories;

export const encodeTheme = (cfg: ThemeConfig): string => {
  const json = JSON.stringify(cfg);
  // btoa 는 Latin1-only — shadow/ease/gradient 사용자 입력에 한글·유니코드가
  // 섞이면 InvalidCharacterError. UTF-8 바이트로 먼저 인코딩한 뒤 base64.
  // 디코드(CLI) 는 Buffer.from(b64, 'base64').toString('utf-8') 라 그대로 호환.
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

export type { TokenKey, Mode };
