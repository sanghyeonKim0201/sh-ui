export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
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
              value: "react",
              label: "React",
              language: "tsx",
              code: `<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
  <Switch id="airplane" />
  <Label htmlFor="airplane">비행기 모드</Label>
</div>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// StatefulWidget 내부에서 사용
bool _checked = false;

Row(
  children: [
    ShUiSwitch(
      checked: _checked,
      onChanged: (v) => setState(() => _checked = v),
    ),
    const SizedBox(width: 8),
    const Text('비행기 모드'),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add switch` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add switch` },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        React: registry의 <code>components/ui/switch/</code> 파일을 복사. Flutter: <code>packages/registry/flutter/widgets/sh_ui_switch.dart</code>를 <code>lib/widgets/</code>로 복사.
      </p>
      <ul>
        <li><code>index.tsx</code> / <code>styles.css</code> (React)</li>
        <li><code>sh_ui_switch.dart</code> (Flutter)</li>
      </ul>

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Switch } from "@/components/ui/switch";

<Switch
  defaultChecked
  onCheckedChange={(checked) => console.log(checked)}
/>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import 'package:your_app/widgets/sh_ui_switch.dart';

ShUiSwitch(
  checked: _checked,
  onChanged: (v) => setState(() => _checked = v),
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Size</h3>
      <Preview>
        <Preview.Demo>
          <SwitchSizeDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Switch size="sm" />
<Switch size="md" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiSwitch(size: ShUiSwitchSize.sm, checked: true, onChanged: (_) {})
ShUiSwitch(size: ShUiSwitchSize.md, checked: true, onChanged: (_) {})`,
            },
          ]}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <SwitchDisabledDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Switch disabled />
<Switch disabled defaultChecked />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiSwitch(enabled: false, checked: false)
const ShUiSwitch(enabled: false, checked: true)`,
            },
          ]}
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

      <h2>접근성</h2>
      <ul>
        <li><code>Space</code> / <code>Enter</code> — on/off 토글</li>
        <li><code>Tab</code> / <code>Shift+Tab</code> — 포커스 이동</li>
        <li>Base UI가 <code>role=&quot;switch&quot;</code>, <code>aria-checked</code>를 자동 부여</li>
      </ul>
    </main>
  );
}
