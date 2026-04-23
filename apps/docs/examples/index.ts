import dynamic from "next/dynamic";
import type { ExampleEntry } from "./types";
import { meta as loginCard } from "./login-card/meta";

export const examples: ExampleEntry[] = [
  {
    ...loginCard,
    Component: dynamic(() =>
      import("./login-card/Example").then((m) => m.Example),
    ),
    sourceFiles: ["login-card/Example.tsx", "login-card/example.css"],
  },
];

export const findExample = (slug: string) =>
  examples.find((e) => e.slug === slug);
