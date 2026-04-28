export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { Spinner } from "@/components/ui/spinner";

export default function SpinnerPage() {
  return (
    <main className="container">
      <h1>Spinner</h1>
      <p className="muted">
        짧은 비동기 작업의 로딩 표시. 버튼·입력 안에 인라인으로 쓰거나
        카드 중앙에 단독으로 배치.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiSpinner(size: ShUiSpinnerSize.sm)
ShUiSpinner(size: ShUiSpinnerSize.md)
ShUiSpinner(size: ShUiSpinnerSize.lg)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add spinner`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add spinner`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>버튼 안</h3>
      <Preview>
        <Preview.Demo>
          <button
            type="button"
            disabled
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              height: "var(--control-md)",
              padding: "0 var(--space-4)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--background-muted)",
              color: "var(--foreground-muted)",
              fontSize: "var(--text-sm)",
              cursor: "not-allowed",
            }}
          >
            <Spinner size="sm" aria-label="저장 중" />
            저장 중…
          </button>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Button disabled>
  <Spinner size="sm" aria-label="저장 중" />
  저장 중…
</Button>`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>
      <PropsTable
        rows={[
          { prop: "size", type: `"sm" | "md" | "lg"`, default: `"md"` },
          { prop: "aria-label", type: "string", default: `"로딩 중"`, description: "role=status의 라벨." },
        ]}
      />
    </main>
  );
}
