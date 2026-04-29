import { sentryPlugin } from './sentry.js';
import { nextIntlPlugin } from './nextIntl.js';
import { authJwtPlugin } from './authJwt.js';

export const allPlugins = [sentryPlugin, nextIntlPlugin, authJwtPlugin];

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
