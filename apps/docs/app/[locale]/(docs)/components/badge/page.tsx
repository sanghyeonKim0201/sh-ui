export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { Badge } from "@/components/ui/badge";
import { VariantSource } from "@/components/variant-source";

export default function BadgePage() {
  return (
    <main className="container">
      <h1>Badge</h1>
      <p className="muted">
        상태·카테고리·수량을 짧게 표기하는 인라인 라벨. 색만으로 의미 전달하지 말고 텍스트·아이콘과 함께 사용.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Badge>Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Badge>Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="outline">Outline</Badge>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiBadge.text('Primary')
ShUiBadge.text('Secondary', variant: ShUiBadgeVariant.secondary)
ShUiBadge.text('Success', variant: ShUiBadgeVariant.success)
ShUiBadge.text('Warning', variant: ShUiBadgeVariant.warning)
ShUiBadge.text('Danger', variant: ShUiBadgeVariant.danger)
ShUiBadge.text('Outline', variant: ShUiBadgeVariant.outline)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add badge`,
          },
        ]}
      />
      <h3>Manual</h3>
      <VariantSource name="badge" />


      <h2>Examples</h2>

      <h3>크기</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>Badge</h3>
      <PropsTable
        rows={[
          {
            prop: "variant",
            type: `"primary" | "secondary" | "success" | "warning" | "danger" | "outline"`,
            default: `"primary"`,
          },
          { prop: "size", type: `"sm" | "md"`, default: `"md"` },
        ]}
      />
    </main>
  );
}
