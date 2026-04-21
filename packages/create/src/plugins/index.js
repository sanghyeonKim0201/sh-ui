import { sentryPlugin } from './sentry.js';
import { nextIntlPlugin } from './nextIntl.js';

export const allPlugins = [sentryPlugin, nextIntlPlugin];

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
