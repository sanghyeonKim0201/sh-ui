// resolveTheme — ui-core/sh-ui.config.json 의 공유 theme 과 ui-app/sh-ui.config.json 의
// app theme 을 머지해 effective theme 반환. v0.111.0+ 의 shared-theme 메커니즘.
//
// 머지 규칙:
//   - 스칼라 (base/radius/mode): app 값 우선 (undefined 면 core)
//   - extraTokens.{root,light,dark}: 키 단위 deep-merge — app 키가 core 키 override, 누락 키는 core 상속
//   - extraTokens 카테고리 자체가 한쪽만 있으면 그쪽 그대로
//
// 모노레포 ui-core 의 theme 이 없으면 (or coreConfig 미제공) app theme 그대로 반환 — backward-compat.

import path from 'node:path';
import { promises as fsp } from 'node:fs';

/** ui-app config 경로에서 sibling ui-core/sh-ui.config.json 을 찾는다. 모노레포 컨벤션 가정:
 *   .../packages/ui/ui-apps/ui-{name}/sh-ui.config.json
 *   .../packages/ui/ui-core/sh-ui.config.json
 * 못 찾으면 null. */
export async function findUiCoreConfigPath(uiAppConfigPath) {
  // ui-apps/ui-{name}/ -> ../../ui-core/
  const appDir = path.dirname(path.resolve(uiAppConfigPath));
  const candidate = path.resolve(appDir, '..', '..', 'ui-core', 'sh-ui.config.json');
  try {
    await fsp.access(candidate);
    return candidate;
  } catch {
    return null;
  }
}

/** sh-ui.config.json 을 읽어 객체 반환. 파일 없거나 파싱 실패 시 null. */
export async function readShUiConfig(configPath) {
  if (!configPath) return null;
  try {
    const text = await fsp.readFile(configPath, 'utf-8');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** extraTokens 한 카테고리(root/light/dark) deep-merge. app 키 우선. 둘 다 없으면 undefined. */
function mergeTokenMap(coreMap, appMap) {
  if (!coreMap && !appMap) return undefined;
  return { ...(coreMap ?? {}), ...(appMap ?? {}) };
}

/** extraTokens 블록 deep-merge. */
function mergeExtraTokens(coreExtra, appExtra) {
  if (!coreExtra && !appExtra) return undefined;
  const result = {};
  for (const cat of ['root', 'light', 'dark']) {
    const merged = mergeTokenMap(coreExtra?.[cat], appExtra?.[cat]);
    if (merged && Object.keys(merged).length > 0) result[cat] = merged;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * theme block 두 개를 머지해 effective theme 반환.
 * 둘 다 null/undefined 면 null. 한쪽만 있으면 그쪽 그대로.
 */
export function resolveTheme(coreTheme, appTheme) {
  if (!coreTheme && !appTheme) return null;
  if (!coreTheme) return appTheme;
  if (!appTheme) return coreTheme;

  const merged = {
    ...coreTheme,
    ...appTheme,  // app 의 스칼라(base/radius/mode) 가 core 를 override
  };

  const extra = mergeExtraTokens(coreTheme.extraTokens, appTheme.extraTokens);
  if (extra) merged.extraTokens = extra;
  else delete merged.extraTokens;

  return merged;
}

/**
 * ui-app config 객체 + (선택) ui-core config 객체로부터 effective theme 계산.
 * config 자체에 theme 필드가 없으면 null 자리에서 시작.
 */
export function resolveThemeFromConfigs(coreConfig, appConfig) {
  return resolveTheme(coreConfig?.theme ?? null, appConfig?.theme ?? null);
}

/**
 * ui-app config 경로에서 sibling ui-core 를 찾아 머지된 theme 을 반환.
 * 모노레포가 아니거나 sibling 없으면 app theme 그대로.
 */
export async function loadResolvedTheme(uiAppConfigPath, appConfig) {
  const corePath = await findUiCoreConfigPath(uiAppConfigPath);
  const coreConfig = corePath ? await readShUiConfig(corePath) : null;
  return resolveThemeFromConfigs(coreConfig, appConfig);
}
