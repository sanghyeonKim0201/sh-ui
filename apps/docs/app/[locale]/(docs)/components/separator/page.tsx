export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { Separator } from "@/components/ui/separator";
import { VariantSource } from "@/components/variant-source";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { SeparatorLiveDemo } from "./separator-live-demo";

const sources = loadComponentSources("separator");

export default function SeparatorPage() {
  return (
    <main className="container">
      <h1>Separator</h1>
      <p className="muted">
        시각적 구분선. 가로(높이 1px) / 세로(너비 1px). 기본은 <code>decorative</code>라
        보조 기술에 노출되지 않음. 섹션 경계로서 의미가 있으면 <code>decorative={"{false}"}</code>.
      </p>

      <SeparatorLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <h2>Installation</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add separator`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add separator`,
          },
        ]}
      />
      <h3>Manual</h3>
      <VariantSource name="separator" />


      <h2>Examples</h2>

      <h3>Vertical</h3>
      <p className="muted">
        부모가 높이를 가져야 동작. 인라인 툴바 같은 곳에 주로 사용.
      </p>
      <Preview>
        <Preview.Demo>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              height: "1.5rem",
              fontSize: "var(--text-sm)",
              color: "var(--foreground-muted)",
            }}
          >
            <span>문서</span>
            <Separator orientation="vertical" />
            <span>편집</span>
            <Separator orientation="vertical" />
            <span>공유</span>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            { value: "react", label: "React", language: "tsx", code: `<Separator orientation="vertical" />` },
            { value: "flutter", label: "Flutter", language: "dart", code: `const ShUiSeparator(orientation: ShUiSeparatorOrientation.vertical)` },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>
      <PropsTable
        rows={[
          { prop: "orientation", type: `"horizontal" | "vertical"`, default: `"horizontal"` },
          { prop: "decorative", type: "boolean", default: "true", description: "false면 role=\"separator\" + aria-orientation 설정." },
        ]}
      />
    </main>
  );
}
