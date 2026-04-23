import type { ExampleEntry } from "./types";

export const examples: ExampleEntry[] = [];

export const findExample = (slug: string) =>
  examples.find((e) => e.slug === slug);
