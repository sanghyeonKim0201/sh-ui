import type { ExampleEntry } from "./types";
import { meta as loginCard } from "./login-card/meta";
import { Example as LoginCardExample } from "./login-card/Example";

export const examples: ExampleEntry[] = [
  {
    ...loginCard,
    Component: LoginCardExample,
    sourceFiles: ["login-card/Example.tsx", "login-card/example.css"],
  },
];

export const findExample = (slug: string) =>
  examples.find((e) => e.slug === slug);
