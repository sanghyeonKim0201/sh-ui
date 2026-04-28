import type { ExampleEntry } from "./types";
import { meta as loginCard } from "./login-card/meta";
import { Example as LoginCardExample } from "./login-card/Example";
import { meta as pricingCard } from "./pricing-card/meta";
import { Example as PricingCardExample } from "./pricing-card/Example";
import { meta as saasDashboard } from "./saas-dashboard/meta";
import { Example as SaasDashboardExample } from "./saas-dashboard/Example";
import { meta as settingsPage } from "./settings-page/meta";
import { Example as SettingsPageExample } from "./settings-page/Example";
import { meta as checkoutFlow } from "./checkout-flow/meta";
import { Example as CheckoutFlowExample } from "./checkout-flow/Example";
import { meta as onboardingFlow } from "./onboarding-flow/meta";
import { Example as OnboardingFlowExample } from "./onboarding-flow/Example";
import { meta as themeDashboard } from "./theme-dashboard/meta";
import { Example as ThemeDashboardExample } from "./theme-dashboard/Example";
import { meta as themeLogin } from "./theme-login/meta";
import { Example as ThemeLoginExample } from "./theme-login/Example";

export const examples: ExampleEntry[] = [
  {
    ...loginCard,
    Component: LoginCardExample,
    sourceFiles: ["login-card/Example.tsx", "login-card/example.css"],
  },
  {
    ...pricingCard,
    Component: PricingCardExample,
    sourceFiles: ["pricing-card/Example.tsx", "pricing-card/example.css"],
  },
  {
    ...saasDashboard,
    Component: SaasDashboardExample,
    sourceFiles: ["saas-dashboard/Example.tsx", "saas-dashboard/example.css"],
  },
  {
    ...settingsPage,
    Component: SettingsPageExample,
    sourceFiles: ["settings-page/Example.tsx", "settings-page/example.css"],
  },
  {
    ...checkoutFlow,
    Component: CheckoutFlowExample,
    sourceFiles: ["checkout-flow/Example.tsx", "checkout-flow/example.css"],
  },
  {
    ...onboardingFlow,
    Component: OnboardingFlowExample,
    sourceFiles: ["onboarding-flow/Example.tsx", "onboarding-flow/example.css"],
  },
  {
    ...themeDashboard,
    Component: ThemeDashboardExample,
    sourceFiles: ["theme-dashboard/Example.tsx", "theme-dashboard/example.css"],
  },
  {
    ...themeLogin,
    Component: ThemeLoginExample,
    sourceFiles: ["theme-login/Example.tsx", "theme-login/example.css"],
  },
];

export const findExample = (slug: string) =>
  examples.find((e) => e.slug === slug);
