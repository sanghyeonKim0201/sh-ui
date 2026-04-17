export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { RadioBasicDemo, RadioHorizontalDemo, RadioDisabledDemo } from "./_demos/basic";

export default function RadioPage() {
  return (
    <main className="container">
      <h1>Radio</h1>
      <p className="muted">
        여러 옵션 중 하나만 선택하는 라디오 버튼. RadioGroup으로 그룹 상태를 관리한다.
      </p>

      <Preview>
        <Preview.Demo>
          <RadioBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `<RadioGroup defaultValue="banana">
  <Radio value="apple" id="apple" />
  <Label htmlFor="apple">Apple</Label>

  <Radio value="banana" id="banana" />
  <Label htmlFor="banana">Banana</Label>
</RadioGroup>`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `import { Radio, RadioGroup } from "@/components/ui/radio";
import { Label } from "@/components/ui/label";

export function FruitPicker() {
  return (
    <RadioGroup defaultValue="banana">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="apple" id="apple" />
        <Label htmlFor="apple">Apple</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="banana" id="banana" />
        <Label htmlFor="banana">Banana</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="cherry" id="cherry" />
        <Label htmlFor="cherry">Cherry</Label>
      </div>
    </RadioGroup>
  );
}`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add radio`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/radio/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { Radio, RadioGroup } from "@/components/ui/radio";

<RadioGroup defaultValue="option1" onValueChange={(v) => console.log(v)}>
  <Radio value="option1" />
  <Radio value="option2" />
</RadioGroup>`}
      />

      <h2>Examples</h2>

      <h3>Horizontal</h3>
      <Preview>
        <Preview.Demo>
          <RadioHorizontalDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<RadioGroup orientation="horizontal" defaultValue="md">
  <Radio value="sm" /> Small
  <Radio value="md" /> Medium
  <Radio value="lg" /> Large
</RadioGroup>`}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <RadioDisabledDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<RadioGroup disabled defaultValue="on">
  <Radio value="on" /> 선택됨
  <Radio value="off" /> 미선택
</RadioGroup>`}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>RadioGroup</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "unknown", description: "제어 모드. 현재 선택된 값." },
          { prop: "defaultValue", type: "unknown", description: "초기 선택값." },
          { prop: "onValueChange", type: "(value: unknown) => void", description: "선택 변경 콜백." },
          { prop: "orientation", type: `"horizontal" | "vertical"`, default: `"vertical"`, description: "레이아웃 방향." },
          { prop: "disabled", type: "boolean", default: "false" },
          { prop: "required", type: "boolean", default: "false" },
          { prop: "name", type: "string", description: "폼 제출 시 필드 이름." },
        ]}
      />

      <h3>Radio</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "any", description: "라디오 항목의 고유 값 (필수)." },
          { prop: "disabled", type: "boolean", default: "false" },
        ]}
      />
    </main>
  );
}
