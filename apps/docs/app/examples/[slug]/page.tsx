import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { examples, findExample } from "@/examples";
import {
  ExampleTopBar,
  type ExampleSource,
} from "@/components/examples/example-topbar";
import { CodePanel } from "@/components/ui/code-panel";

export const dynamic = "force-static";
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

// 빌드 cwd가 apps/docs 일 때만 안정적. `pnpm --filter @sh-ui/docs build` 경로 전제.
const EXAMPLES_ROOT = join(process.cwd(), "examples");

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

  const sources: ExampleSource[] = await Promise.all(
    entry.sourceFiles.map(async (rel) => {
      const code = await readFile(join(EXAMPLES_ROOT, rel), "utf8");
      const language = languageOf(rel);
      return {
        path: rel,
        node: (
          <CodePanel code={code} language={language} filename={rel} />
        ),
      };
    }),
  );

  const { Component } = entry;

  return (
    <>
      <ExampleTopBar
        category={entry.category}
        title={entry.title}
        sources={sources}
      />
      <div className="sh-ui-showcase-stage">
        <Component />
      </div>
    </>
  );
}
