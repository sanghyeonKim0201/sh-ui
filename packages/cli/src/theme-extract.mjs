// `sh-ui theme extract` — 사용자 tokens.css 의 색·radius 를 추출해 sh-ui base64
// 테마 문자열로 인코딩한다. 산출물을 `sh-ui create --theme <base64>` 에 그대로
// 넘기거나, 팀/디자인 시스템 문서에 보존 가능.
//
// 동작:
//   1) sh-ui.config.json 의 paths.tokens 를 읽음.
//   2) parseBlocks 로 :root (light) / .dark (dark) 블록 추출.
//   3) TOKEN_KEYS + 옵셔널 색을 #RRGGBB 형식으로 검증, --radius 값을 rem 으로 파싱.
//   4) encodeTheme() 으로 base64 생성 (round-trip 검증 포함).
//
// 제약: tokens.css 의 모든 색이 #RRGGBB 형식이어야 한다. color-mix() / var() /
// rgba() 가 섞여 있으면 안내 에러로 종료 (사용자에게 --replace 또는 직접 hex 화 권장).

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { parseBlocks } from "./tokens-diff.mjs";
import { encodeTheme } from "./create/theme/encode.js";

/**
 * Dart 의 ShUiColorTokens 필드명 ↔ TOKEN_KEYS (hyphen) 매핑.
 * inject.js 의 DART_FIELD_SOURCES 와 같은 매핑을 reverse 로 사용.
 */
const DART_FIELD_TO_KEY = {
  background: "background",
  backgroundSubtle: "background-subtle",
  backgroundMuted: "background-muted",
  backgroundInverse: "background-inverse",
  foreground: "foreground",
  foregroundMuted: "foreground-muted",
  foregroundSubtle: "foreground-subtle",
  foregroundInverse: "foreground-inverse",
  border: "border",
  borderStrong: "border-strong",
  primary: "primary",
  primaryForeground: "primary-foreground",
  primaryHover: "primary-hover",
  danger: "danger",
  dangerForeground: "danger-foreground",
  dangerHover: "danger-hover",
  ring: "ring",
};

const TOKEN_KEYS_REQUIRED = [
  "background", "background-subtle", "background-muted", "background-inverse",
  "foreground", "foreground-muted", "foreground-subtle", "foreground-inverse",
  "border", "border-strong",
  "primary", "primary-foreground", "primary-hover",
  "danger", "danger-foreground",
];

const TOKEN_KEYS_OPTIONAL = [
  "success", "success-foreground",
  "warning", "warning-foreground",
  "info", "info-foreground",
  "danger-hover",
  "ring",
  "accent", "accent-foreground", "accent-hover",
];

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const REM_RE = /^(-?\d*\.?\d+)rem$/;

/**
 * 같은 selector 키가 여러 번 등장하면 vars 를 cascade 순으로 병합 (뒤가 앞을 덮음).
 * tokens-diff 의 mergeBlocks 와 같은 정책이지만 여기서는 평탄 vars map 만 필요해 단순 병합.
 */
function mergeVarsForSelector(blocks, selector) {
  const merged = {};
  for (const b of blocks) {
    if (b.key === selector) Object.assign(merged, b.vars);
  }
  return merged;
}

function pickHexOrThrow(vars, name, mode) {
  const value = vars["--" + name];
  if (value === undefined) {
    throw new Error(
      `theme extract 실패: ${mode}.${name} 가 tokens.css 에 없습니다.\n` +
        `  → \`sh-ui tokens upgrade --replace\` 로 buildTokens 결과를 적용해 모든 토큰을 hex 로 채운 뒤 다시 시도하세요.`,
    );
  }
  if (!HEX_RE.test(value)) {
    throw new Error(
      `theme extract 실패: ${mode}.${name} 가 hex (#RRGGBB) 가 아닙니다 (현재: ${value}).\n` +
        `  → tokens.css 의 해당 변수를 #RRGGBB 형식으로 바꾸거나, ` +
        `\`sh-ui tokens upgrade --replace\` 로 표준값으로 리셋한 후 색을 다시 편집하세요.\n` +
        `  (color-mix() / var() / rgba() 등은 추출 대상이 아님 — 색 추출은 정적 hex 만)`,
    );
  }
  return value.toUpperCase();
}

function pickHexIfPresent(vars, name) {
  const value = vars["--" + name];
  if (value === undefined) return null;
  if (!HEX_RE.test(value)) return null;
  return value.toUpperCase();
}

function pickRadiusOrThrow(rootVars) {
  const value = rootVars["--radius"];
  if (value === undefined) {
    throw new Error("theme extract 실패: --radius 가 tokens.css 에 없습니다.");
  }
  const m = REM_RE.exec(value);
  if (!m) {
    throw new Error(
      `theme extract 실패: --radius 가 rem 단위가 아닙니다 (현재: ${value}). 예: '0.5rem'.`,
    );
  }
  const num = parseFloat(m[1]);
  if (!Number.isFinite(num) || num < 0 || num > 1.5) {
    throw new Error(
      `theme extract 실패: --radius 값이 0~1.5 범위 밖입니다 (현재: ${num}).`,
    );
  }
  return num;
}

/**
 * tokens.css 텍스트에서 base64 theme 산출.
 * @returns {{ base64: string, theme: object, summary: object }}
 */
export function extractThemeFromCss(cssText) {
  const blocks = parseBlocks(cssText);
  const lightVars = mergeVarsForSelector(blocks, ":root");
  const darkVars = mergeVarsForSelector(blocks, ".dark");

  if (Object.keys(lightVars).length === 0) {
    throw new Error("theme extract 실패: :root 블록이 tokens.css 에 없습니다.");
  }
  if (Object.keys(darkVars).length === 0) {
    throw new Error(
      "theme extract 실패: .dark 블록이 tokens.css 에 없습니다 (light-only 모드는 미지원).",
    );
  }

  const light = {};
  const dark = {};

  for (const name of TOKEN_KEYS_REQUIRED) {
    light[name] = pickHexOrThrow(lightVars, name, "light");
    dark[name] = pickHexOrThrow(darkVars, name, "dark");
  }

  // 옵셔널 — 양쪽 모두 hex 로 정의돼야 emit. 한쪽만 있으면 둘 다 skip
  // (디자인이 어긋날 위험 — 보수적으로).
  const optionalEmitted = [];
  for (const name of TOKEN_KEYS_OPTIONAL) {
    const lv = pickHexIfPresent(lightVars, name);
    const dv = pickHexIfPresent(darkVars, name);
    if (lv && dv) {
      light[name] = lv;
      dark[name] = dv;
      optionalEmitted.push(name);
    }
  }

  const radius = pickRadiusOrThrow(lightVars);

  const theme = { light, dark, radius };
  const base64 = encodeTheme(theme);

  return {
    base64,
    theme,
    summary: {
      requiredKeys: TOKEN_KEYS_REQUIRED.length,
      optionalKeys: optionalEmitted.length,
      optionalEmitted,
      radius,
    },
  };
}

/**
 * Dart sh_ui_tokens.dart 텍스트에서 light/dark + radius 추출 → base64.
 *
 * 파싱 전략:
 *   - `static const light = ShUiColorTokens(...)` 블록 찾기 (dark 도 동일)
 *   - 본문에서 `field: Color(0xAARRGGBB)` 추출, alpha 무시 (#RRGGBB 만 인코딩)
 *   - `static const tokens = ShUiRadiusTokens(...)` 에서 `defaultRadius: X.X,` 추출,
 *     X.X / 16 를 rem 으로 사용 (buildTokensDart 가 rem×16 으로 픽셀화한 값)
 */
export function extractThemeFromDart(dartText) {
  const light = extractDartColorBlock(dartText, "light");
  const dark = extractDartColorBlock(dartText, "dark");

  const radiusMatch = /ShUiRadiusTokens\s*\([^)]*defaultRadius:\s*(\d+(?:\.\d+)?)/s.exec(
    dartText,
  );
  if (!radiusMatch) {
    throw new Error(
      "theme extract 실패: ShUiRadiusTokens.defaultRadius 를 찾지 못했습니다.",
    );
  }
  const radiusPx = parseFloat(radiusMatch[1]);
  const radius = Number((radiusPx / 16).toFixed(4));

  const theme = { light, dark, radius };
  const base64 = encodeTheme(theme);
  return {
    base64,
    theme,
    summary: {
      requiredKeys: Object.keys(light).length,
      optionalKeys: 0,
      optionalEmitted: [],
      radius,
    },
  };
}

/**
 * `static const light = ShUiColorTokens(...)` 의 본문에서 field: hex 맵 빌드.
 * Dart `Color(0xFFRRGGBB)` 또는 `Color(0xAARRGGBB)` (alpha 비-FF 는 의미 손실되지만
 * sh-ui base64 는 #RRGGBB 만 지원해 alpha 잘라냄).
 */
function extractDartColorBlock(dartText, mode) {
  const blockRe = new RegExp(
    `static\\s+const\\s+${mode}\\s*=\\s*ShUiColorTokens\\s*\\(([\\s\\S]*?)\\);`,
    "m",
  );
  const m = blockRe.exec(dartText);
  if (!m) {
    throw new Error(
      `theme extract 실패: \`static const ${mode} = ShUiColorTokens(...)\` 블록을 찾지 못했습니다.`,
    );
  }
  const body = m[1];
  const fieldRe = /([a-zA-Z_]\w*):\s*Color\(0x([0-9a-fA-F]{8})\)/g;
  const out = {};
  let fm;
  while ((fm = fieldRe.exec(body))) {
    const field = fm[1];
    const hexFull = fm[2].toUpperCase();
    const key = DART_FIELD_TO_KEY[field];
    if (!key) continue; // 알 수 없는 필드는 무시 (사용자가 ShUiColorTokens 확장한 경우)
    out[key] = `#${hexFull.slice(2)}`;
  }
  if (Object.keys(out).length === 0) {
    throw new Error(
      `theme extract 실패: ${mode} 블록에서 Color 필드를 추출하지 못했습니다.`,
    );
  }
  return out;
}

async function loadConfig(cwd) {
  const configPath = resolve(cwd, "sh-ui.config.json");
  if (!existsSync(configPath)) {
    throw new Error(
      "sh-ui.config.json 을 찾을 수 없습니다. 먼저 `sh-ui init` 또는 `sh-ui create`.",
    );
  }
  return JSON.parse(await readFile(configPath, "utf8"));
}

export async function runThemeExtract({ cwd, output }) {
  const config = await loadConfig(cwd);
  const tokensRel = config.paths?.tokens;
  if (!tokensRel) throw new Error("paths.tokens 가 sh-ui.config.json 에 없습니다.");
  const tokensPath = resolve(cwd, tokensRel);
  if (!existsSync(tokensPath)) {
    throw new Error(
      `토큰 파일이 없습니다 (${tokensRel}). \`sh-ui add tokens\` 로 먼저 생성하세요.`,
    );
  }

  const tokensText = await readFile(tokensPath, "utf8");
  const result =
    config.platform === "flutter"
      ? extractThemeFromDart(tokensText)
      : extractThemeFromCss(tokensText);
  const { base64, summary } = result;

  if (output) {
    await writeFile(resolve(cwd, output), base64 + "\n", "utf8");
    console.log(`✓ ${output} 에 base64 저장 (${base64.length} 바이트).`);
  } else {
    console.log(base64);
  }

  console.error(
    `\n추출 정보 (stderr — base64 와 분리):\n` +
      `  필수 토큰: ${summary.requiredKeys}\n` +
      `  옵셔널 토큰: ${summary.optionalKeys} (${summary.optionalEmitted.join(", ") || "—"})\n` +
      `  radius: ${summary.radius}rem\n\n` +
      `사용:\n` +
      `  sh-ui create my-app --theme '${base64.slice(0, 24)}…'\n` +
      `  (또는 'sh_ui_create_project' MCP 툴의 theme 인자에 그대로 전달)`,
  );
}
