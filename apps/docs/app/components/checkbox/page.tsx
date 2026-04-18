export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import {
  CheckboxBasicDemo,
  CheckboxGroupDemo,
  CheckboxDisabledDemo,
  CheckboxIndeterminateDemo,
} from "./_demos/basic";

export default function CheckboxPage() {
  return (
    <main className="container">
      <h1>Checkbox</h1>
      <p className="muted">
        체크/해제/부분 선택 상태를 표현하는 컨트롤. CheckboxGroup으로 묶어 다중 선택을 관리한다.
      </p>

      <Preview>
        <Preview.Demo>
          <CheckboxBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `<Checkbox id="terms" />
<Label htmlFor="terms">이용약관에 동의합니다</Label>`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function TermsCheckbox() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="terms" />
      <Label htmlFor="terms">이용약관에 동의합니다</Label>
    </div>
  );
}`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add checkbox`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/checkbox/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

<Checkbox id="agree" onCheckedChange={(checked) => console.log(checked)} />
<Label htmlFor="agree">동의</Label>`}
      />

      <h2>Examples</h2>

      <h3>CheckboxGroup</h3>
      <p className="muted">
        여러 체크박스를 그룹으로 묶어 선택된 값을 배열로 관리한다.
      </p>
      <Preview>
        <Preview.Demo>
          <CheckboxGroupDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CheckboxGroup defaultValue={["apple"]}>
  <Checkbox value="apple" id="apple" />
  <Label htmlFor="apple">Apple</Label>

  <Checkbox value="banana" id="banana" />
  <Label htmlFor="banana">Banana</Label>
</CheckboxGroup>`}
        />
      </Preview>

      <h3>Indeterminate</h3>
      <p className="muted">
        부모 체크박스에서 자식 일부만 선택된 상태를 표현한다.
      </p>
      <Preview>
        <Preview.Demo>
          <CheckboxIndeterminateDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Checkbox indeterminate />`}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <CheckboxDisabledDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Checkbox disabled />
<Checkbox disabled defaultChecked />`}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>Checkbox</h3>
      <PropsTable
        rows={[
          { prop: "checked", type: "boolean", description: "제어 모드. 체크 상태." },
          { prop: "defaultChecked", type: "boolean", default: "false", description: "초기 체크 상태." },
          { prop: "onCheckedChange", type: "(checked: boolean) => void", description: "체크 상태 변경 콜백." },
          { prop: "indeterminate", type: "boolean", default: "false", description: "부분 선택 상태 (마이너스 아이콘)." },
          { prop: "disabled", type: "boolean", default: "false" },
          { prop: "required", type: "boolean", default: "false" },
          { prop: "name", type: "string", description: "폼 제출 시 필드 이름." },
          { prop: "value", type: "string", description: "CheckboxGroup 안에서의 고유 값." },
        ]}
      />

      <h3>CheckboxGroup</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string[]", description: "제어 모드. 선택된 값 배열." },
          { prop: "defaultValue", type: "string[]", description: "초기 선택값." },
          { prop: "onValueChange", type: "(value: string[]) => void", description: "선택 변경 콜백." },
          { prop: "orientation", type: `"horizontal" | "vertical"`, default: `"vertical"`, description: "레이아웃 방향." },
          { prop: "disabled", type: "boolean", default: "false" },
        ]}
      />
    </main>
  );
}
