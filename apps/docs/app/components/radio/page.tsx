export const dynamic = "force-static";

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
              value: "react",
              label: "React",
              language: "tsx",
              code: `<RadioGroup defaultValue="banana">
  <Radio value="apple" id="apple" />
  <Label htmlFor="apple">Apple</Label>

  <Radio value="banana" id="banana" />
  <Label htmlFor="banana">Banana</Label>
</RadioGroup>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// StatefulWidget 안에서
String? _value = 'banana';

ShUiRadioGroup(
  children: [
    Row(mainAxisSize: MainAxisSize.min, children: [
      ShUiRadio<String>(
        value: 'apple',
        groupValue: _value,
        onChanged: (v) => setState(() => _value = v),
      ),
      const SizedBox(width: 8),
      const Text('Apple'),
    ]),
    Row(mainAxisSize: MainAxisSize.min, children: [
      ShUiRadio<String>(
        value: 'banana',
        groupValue: _value,
        onChanged: (v) => setState(() => _value = v),
      ),
      const SizedBox(width: 8),
      const Text('Banana'),
    ]),
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
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add radio`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add radio

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_radio.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/radio/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Radio, RadioGroup } from "@/components/ui/radio";

<RadioGroup defaultValue="option1" onValueChange={(v) => console.log(v)}>
  <Radio value="option1" />
  <Radio value="option2" />
</RadioGroup>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_radio.dart';

String? _value = 'option1';

ShUiRadioGroup(
  children: [
    ShUiRadio<String>(
      value: 'option1',
      groupValue: _value,
      onChanged: (v) => setState(() => _value = v),
    ),
    ShUiRadio<String>(
      value: 'option2',
      groupValue: _value,
      onChanged: (v) => setState(() => _value = v),
    ),
  ],
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Horizontal</h3>
      <Preview>
        <Preview.Demo>
          <RadioHorizontalDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<RadioGroup orientation="horizontal" defaultValue="md">
  <Radio value="sm" /> Small
  <Radio value="md" /> Medium
  <Radio value="lg" /> Large
</RadioGroup>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiRadioGroup(
  orientation: ShUiRadioGroupOrientation.horizontal,
  gap: 24,
  children: [
    for (final size in ['sm', 'md', 'lg'])
      Row(mainAxisSize: MainAxisSize.min, children: [
        ShUiRadio<String>(
          value: size,
          groupValue: _value,
          onChanged: (v) => setState(() => _value = v),
        ),
        const SizedBox(width: 8),
        Text(size.toUpperCase()),
      ]),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <RadioDisabledDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<RadioGroup disabled defaultValue="on">
  <Radio value="on" /> 선택됨
  <Radio value="off" /> 미선택
</RadioGroup>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// enabled: false 로 비활성화 (onChanged: null 도 동일 효과)
const ShUiRadio<String>(
  value: 'on',
  groupValue: 'on',
  enabled: false,
)
const ShUiRadio<String>(
  value: 'off',
  groupValue: 'on',
  enabled: false,
)`,
            },
          ]}
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

      <h2>접근성</h2>
      <ul>
        <li><code>Tab</code> — 그룹 안으로 포커스 진입(선택된 항목 또는 첫 항목)</li>
        <li><code>↑</code> / <code>↓</code> / <code>←</code> / <code>→</code> — 그룹 내 항목 이동 + 즉시 선택</li>
        <li><code>Space</code> — 현재 포커스 항목 선택</li>
        <li>Base UI가 <code>aria-checked</code>·<code>aria-disabled</code>를 자동 관리</li>
      </ul>
    </main>
  );
}
