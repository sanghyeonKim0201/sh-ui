import { sentryPlugin } from './sentry.js';
import { nextIntlPlugin } from './nextIntl.js';
import { authJwtPlugin } from './authJwt.js';
import { validatePlugins } from './pluginSchema.js';

export const allPlugins = [sentryPlugin, nextIntlPlugin, authJwtPlugin];

// 모듈 로드 시점에 모든 플러그인 manifest 검증 — 잘못된 형태가 있으면 즉시 실패.
// 예: src/proxy.ts 같은 잘못된 경로, name 이 kebab-case 가 아닌 경우 등.
validatePlugins(allPlugins);

export function getPluginChoices() {
  return allPlugins.map((p) => ({
    name: p.label,
    value: p.name,
  }));
}

export function getPluginsByNames(names) {
  return allPlugins
    .filter((p) => names.includes(p.name))
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}
