export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import {
  CheckboxBasicDemo,
  CheckboxGroupDemo,
  CheckboxDisabledDemo,
  CheckboxIndeterminateDemo,
} from "./_demos/basic";
import { VariantSource } from "@/components/variant-source";
import {
  loadComponentSources,
  loadExtraComponent,
} from "@/components/sandbox-code/load-component-sources";
import { CheckboxLiveDemo } from "./checkbox-live-demo";

const sources = loadComponentSources("checkbox");
const extras = [loadExtraComponent("label")];

export default function CheckboxPage() {
  return (
    <main className="container">
      <h1>Checkbox</h1>
      <p className="muted">
        체크/해제/부분 선택 상태를 표현하는 컨트롤. CheckboxGroup으로 묶어 다중 선택을 관리한다.
      </p>

      <CheckboxLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
        extraComponents={extras}
      />

      {false && (
      <Preview>
        <Preview.Demo>
          <CheckboxBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
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
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter는 제어 모드가 기본 — 부모 StatefulWidget에서 상태를 들고 있는다.
class TermsCheckbox extends StatefulWidget {
  const TermsCheckbox({super.key});

  @override
  State<TermsCheckbox> createState() => _TermsCheckboxState();
}

class _TermsCheckboxState extends State<TermsCheckbox> {
  bool _agreed = false;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ShUiCheckbox(
          checked: _agreed,
          onChanged: (v) => setState(() => _agreed = v),
        ),
        const SizedBox(width: 8),
        const Text('이용약관에 동의합니다'),
      ],
    );
  }
}`,
            },
          ]}
        />
      </Preview>
      )}

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add checkbox`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add checkbox

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_checkbox.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="checkbox" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

<Checkbox id="agree" onCheckedChange={(checked) => console.log(checked)} />
<Label htmlFor="agree">동의</Label>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_checkbox.dart';

ShUiCheckbox(
  checked: agreed,
  onChanged: (v) => setState(() => agreed = v),
)`,
          },
        ]}
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<CheckboxGroup defaultValue={["apple"]}>
  <Checkbox value="apple" id="apple" />
  <Label htmlFor="apple">Apple</Label>

  <Checkbox value="banana" id="banana" />
  <Label htmlFor="banana">Banana</Label>
</CheckboxGroup>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter 쪽은 선택값 배열을 직접 state로 관리한다.
final values = [true, false]; // [apple, banana]

ShUiCheckboxGroup(
  orientation: ShUiCheckboxGroupOrientation.vertical,
  gap: 12,
  children: [
    Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ShUiCheckbox(
          checked: values[0],
          onChanged: (v) => setState(() => values[0] = v),
        ),
        const SizedBox(width: 8),
        const Text('Apple'),
      ],
    ),
    Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ShUiCheckbox(
          checked: values[1],
          onChanged: (v) => setState(() => values[1] = v),
        ),
        const SizedBox(width: 8),
        const Text('Banana'),
      ],
    ),
  ],
)`,
            },
          ]}
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Checkbox indeterminate />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiCheckbox(
  indeterminate: true,
  onChanged: (v) {},
)`,
            },
          ]}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <CheckboxDisabledDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Checkbox disabled />
<Checkbox disabled defaultChecked />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiCheckbox(enabled: false)
const ShUiCheckbox(checked: true, enabled: false)`,
            },
          ]}
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

      <h2>접근성</h2>
      <ul>
        <li><code>Space</code> — 체크 상태 토글</li>
        <li><code>Tab</code> / <code>Shift+Tab</code> — 포커스 이동</li>
        <li>Base UI가 <code>aria-checked</code>(<code>true</code> / <code>false</code> / <code>mixed</code>)를 자동 관리</li>
      </ul>
    </main>
  );
}
