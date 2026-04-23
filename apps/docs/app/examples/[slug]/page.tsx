import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { examples, findExample } from "@/examples";
import { ExampleTopBar } from "@/components/examples/example-topbar";

export const dynamicParams = false;

export async function generateStaticParams() {
  return examples.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findExample(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} — sh-ui 실전 예제`,
    description: entry.description,
  };
}

interface Source {
  path: string;
  code: string;
  language: string;
}

const EXAMPLES_ROOT = fileURLToPath(
  new URL("../../../examples/", import.meta.url),
);

const languageOf = (path: string): string => {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".css")) return "css";
  return "text";
};

export default async function ExampleShowcasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findExample(slug);
  if (!entry) notFound();

  const sources: Source[] = await Promise.all(
    entry.sourceFiles.map(async (rel) => ({
      path: rel,
      code: await readFile(join(EXAMPLES_ROOT, rel), "utf8"),
      language: languageOf(rel),
    })),
  );

  const { Component } = entry;

  return (
    <>
      <ExampleTopBar entry={entry} sources={sources} />
      <div className="sh-ui-showcase-stage">
        <Component />
      </div>
    </>
  );
}
