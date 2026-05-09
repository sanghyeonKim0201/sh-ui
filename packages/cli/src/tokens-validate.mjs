// 컴포넌트가 요구하는 CSS 변수와 사용자 tokens.css 가 정의한 변수를 비교한다.
//
// 호출:
//   - sh-ui add <component> 진입 시 (silent breakage 방지)
//   - sh-ui doctor 가 설치된 컴포넌트 전체에 대해 (정합성 점검)
//
// 정책:
//   - tokens.css 가 아예 없으면 누락 검사를 건너뛴다 (사용자가 곧 add tokens 할 거라
//     가정 — add 시점 안내는 별도 메시지로 처리).
//   - 컴포넌트 또는 framework 가 tokens-used.json 에 없으면 검사 스킵 (없는 게 정상).
//   - Flutter platform 은 검사 대상 아님 — CSS var() 와 다른 추출 방식이라 별도 도구.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getTokensUsedPath } from "./paths.mjs";

let tokensUsedCache = null;

/** tokens-used.json 캐시 로드. 없거나 깨지면 null. */
async function loadTokensUsed(platform) {
  if (tokensUsedCache) return tokensUsedCache;
  const path = getTokensUsedPath(platform);
  if (!existsSync(path)) return null;
  try {
    const data = JSON.parse(await readFile(path, "utf8"));
    tokensUsedCache = data;
    return data;
  } catch {
    return null;
  }
}

/** tokens.css 텍스트에서 정의된 --변수명 집합 추출 (선언만 — 참조는 무시). */
export function extractDefinedVars(cssText) {
  const out = new Set();
  // `--name:` 선언만 잡고, var(--name) 참조는 무시한다.
  // 음수 lookbehind 가 var( 인 경우를 제외.
  const re = /(?<!var\(\s*)(--[a-zA-Z0-9_-]+)\s*:/g;
  let m;
  while ((m = re.exec(cssText))) out.add(m[1]);
  return out;
}

/**
 * 컴포넌트의 framework 별 토큰 요구사항 조회.
 * 못 찾으면 null — 호출부는 검사를 스킵한다.
 */
export async function getRequiredTokens(platform, name, framework) {
  if (platform === "flutter") return null;
  const data = await loadTokensUsed(platform);
  if (!data) return null;
  const entry = data.components?.[name];
  if (!entry) return null;
  return entry[framework] ?? null;
}

/**
 * 사용자 tokens.css 를 읽어 정의된 변수 집합을 반환.
 * 파일이 없으면 null — 호출부는 "tokens.css 미생성" 메시지를 따로 처리.
 */
export async function loadDefinedVarsFromConfig(config, cwd) {
  const tokensRel = config.paths?.tokens;
  if (!tokensRel) return null;
  const tokensPath = resolve(cwd, tokensRel);
  if (!existsSync(tokensPath)) return null;
  const text = await readFile(tokensPath, "utf8");
  return extractDefinedVars(text);
}

/**
 * 한 컴포넌트의 누락 토큰 목록 계산.
 * @returns {Promise<string[]|null>} 누락 토큰 정렬 배열, 또는 null (검사 불가/스킵)
 */
export async function findMissingTokens({
  platform,
  name,
  framework,
  defined,
}) {
  const required = await getRequiredTokens(platform, name, framework);
  if (!required || required.length === 0) return null;
  if (!defined) return null;
  const missing = required.filter((v) => !defined.has(v));
  return missing.sort();
}
