export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SwitchBasicDemo, SwitchSizeDemo, SwitchDisabledDemo } from "./_demos/basic";

export default function SwitchPage() {
  return (
    <main className="container">
      <h1>Switch</h1>
      <p className="muted">
        켜기/끄기를 토글하는 스위치 컨트롤. 설정 항목 등에 사용한다.
      </p>

      <Preview>
        <Preview.Demo>
          <SwitchBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `<Switch id="airplane" />
<Label htmlFor="airplane">비행기 모드</Label>`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function AirplaneMode() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Switch id="airplane" />
      <Label htmlFor="airplane">비행기 모드</Label>
    </div>
  );
}`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add switch`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/switch/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { Switch } from "@/components/ui/switch";

<Switch
  defaultChecked
  onCheckedChange={(checked) => console.log(checked)}
/>`}
      />

      <h2>Examples</h2>

      <h3>Size</h3>
      <Preview>
        <Preview.Demo>
          <SwitchSizeDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Switch size="sm" />
<Switch size="md" />`}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <SwitchDisabledDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Switch disabled />
<Switch disabled defaultChecked />`}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>Switch</h3>
      <PropsTable
        rows={[
          { prop: "checked", type: "boolean", description: "제어 모드. 켜짐 상태." },
          { prop: "defaultChecked", type: "boolean", default: "false", description: "초기 켜짐 상태." },
          { prop: "onCheckedChange", type: "(checked: boolean) => void", description: "상태 변경 콜백." },
          { prop: "size", type: `"sm" | "md"`, default: `"md"`, description: "스위치 크기." },
          { prop: "disabled", type: "boolean", default: "false" },
          { prop: "name", type: "string", description: "폼 제출 시 필드 이름." },
        ]}
      />
    </main>
  );
}
