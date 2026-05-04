import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [common, sidebar, search, chrome, landing, gettingStarted] = await Promise.all([
    import(`../messages/${locale}/common.json`).then((m) => m.default),
    import(`../messages/${locale}/sidebar.json`).then((m) => m.default),
    import(`../messages/${locale}/search.json`).then((m) => m.default),
    import(`../messages/${locale}/chrome.json`).then((m) => m.default),
    import(`../messages/${locale}/landing.json`).then((m) => m.default),
    import(`../messages/${locale}/getting-started.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      common,
      sidebar,
      search,
      chrome,
      landing,
      gettingStarted,
    },
  };
});
