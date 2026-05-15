export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import {
  ToggleBasicDemo,
  ToggleVariantDemo,
  ToggleGroupSingleDemo,
  ToggleGroupMultipleDemo,
} from "./_demos/basic";
import { VariantSource } from "@/components/variant-source";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { ToggleLiveDemo } from "./toggle-live-demo";

const sources = loadComponentSources("toggle");

export default function TogglePage() {
  return (
    <main className="container">
      <h1>Toggle</h1>
      <p className="muted">
        눌림/해제 두 상태를 전환하는 버튼. ToggleGroup으로 묶어 단일/다중 선택을 관리한다.
      </p>

      <ToggleLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add toggle` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add toggle` },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="toggle" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Toggle, ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle";

// 단일 토글
<Toggle pressed onPressedChange={(p) => console.log(p)}>Bold</Toggle>

// 토글 그룹
<ToggleGroup>
  <ToggleGroupItem value="bold">B</ToggleGroupItem>
  <ToggleGroupItem value="italic">I</ToggleGroupItem>
</ToggleGroup>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// 단일 토글
ShUiToggle(
  pressed: _pressed,
  onPressedChange: (p) => setState(() => _pressed = p),
  child: const Text('Bold'),
)

// 토글 그룹
ShUiToggleGroup<String>(
  value: _value,
  onValueChange: (v) => setState(() => _value = v),
  children: const [
    ShUiToggleGroupItem(value: 'bold', child: Text('B')),
    ShUiToggleGroupItem(value: 'italic', child: Text('I')),
  ],
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Variant</h3>
      <Preview>
        <Preview.Demo>
          <ToggleVariantDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Toggle variant="ghost">Ghost</Toggle>
<Toggle variant="outline">Outline</Toggle>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiToggle(
  variant: ShUiToggleVariant.ghost,
  onPressedChange: (_) {},
  child: const Text('Ghost'),
)
ShUiToggle(
  variant: ShUiToggleVariant.outline,
  onPressedChange: (_) {},
  child: const Text('Outline'),
)`,
            },
          ]}
        />
      </Preview>

      <h3>ToggleGroup (단일 선택)</h3>
      <p className="muted">
        기본 동작. 한 번에 하나의 토글만 눌린다.
      </p>
      <Preview>
        <Preview.Demo>
          <ToggleGroupSingleDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<ToggleGroup variant="outline">
  <ToggleGroupItem value="bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic"><ItalicIcon /></ToggleGroupItem>
  <ToggleGroupItem value="underline"><UnderlineIcon /></ToggleGroupItem>
</ToggleGroup>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// 단일 선택 (multiple: false, 기본값)
Set<String> _value = {};

ShUiToggleGroup<String>(
  variant: ShUiToggleVariant.outline,
  value: _value,
  onValueChange: (v) => setState(() => _value = v),
  children: const [
    ShUiToggleGroupItem(value: 'bold', child: Icon(Icons.format_bold)),
    ShUiToggleGroupItem(value: 'italic', child: Icon(Icons.format_italic)),
    ShUiToggleGroupItem(value: 'underline', child: Icon(Icons.format_underline)),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>ToggleGroup (다중 선택)</h3>
      <p className="muted">
        <code>multiple</code> prop으로 여러 항목을 동시에 누를 수 있다.
      </p>
      <Preview>
        <Preview.Demo>
          <ToggleGroupMultipleDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<ToggleGroup variant="outline" multiple defaultValue={["bold", "italic"]}>
  <ToggleGroupItem value="bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic"><ItalicIcon /></ToggleGroupItem>
  <ToggleGroupItem value="underline"><UnderlineIcon /></ToggleGroupItem>
</ToggleGroup>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `Set<String> _value = {'bold', 'italic'};

ShUiToggleGroup<String>(
  variant: ShUiToggleVariant.outline,
  multiple: true,
  value: _value,
  onValueChange: (v) => setState(() => _value = v),
  children: const [
    ShUiToggleGroupItem(value: 'bold', child: Icon(Icons.format_bold)),
    ShUiToggleGroupItem(value: 'italic', child: Icon(Icons.format_italic)),
    ShUiToggleGroupItem(value: 'underline', child: Icon(Icons.format_underline)),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>ToggleGroup (세로 방향)</h3>
      <p className="muted">
        <code>orientation=&quot;vertical&quot;</code>로 세로 배치. 사이드바 등 좁은 영역에 유용.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `<ToggleGroup orientation="vertical" variant="outline">
  <ToggleGroupItem value="left"><AlignLeftIcon /></ToggleGroupItem>
  <ToggleGroupItem value="center"><AlignCenterIcon /></ToggleGroupItem>
  <ToggleGroupItem value="right"><AlignRightIcon /></ToggleGroupItem>
</ToggleGroup>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `Set<String> _value = {'left'};

ShUiToggleGroup<String>(
  variant: ShUiToggleVariant.outline,
  orientation: ShUiToggleOrientation.vertical,
  value: _value,
  onValueChange: (v) => setState(() => _value = v),
  children: const [
    ShUiToggleGroupItem(value: 'left', child: Icon(Icons.format_align_left)),
    ShUiToggleGroupItem(value: 'center', child: Icon(Icons.format_align_center)),
    ShUiToggleGroupItem(value: 'right', child: Icon(Icons.format_align_right)),
  ],
)`,
          },
        ]}
      />

      <h2>API Reference</h2>

      <h3>Toggle</h3>
      <PropsTable
        rows={[
          { prop: "pressed", type: "boolean", description: "제어 모드. 눌림 상태." },
          { prop: "defaultPressed", type: "boolean", default: "false", description: "초기 눌림 상태." },
          { prop: "onPressedChange", type: "(pressed: boolean) => void", description: "눌림 상태 변경 콜백." },
          { prop: "variant", type: `"outline" | "ghost"`, default: `"ghost"`, description: "외형 변형." },
          { prop: "size", type: `"sm" | "md" | "lg"`, default: `"md"`, description: "크기." },
          { prop: "disabled", type: "boolean", default: "false" },
        ]}
      />

      <h3>ToggleGroup</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "any[]", description: "제어 모드. 눌린 항목의 값 배열." },
          { prop: "defaultValue", type: "any[]", description: "초기 눌린 항목." },
          { prop: "onValueChange", type: "(value: any[]) => void", description: "변경 콜백." },
          { prop: "multiple", type: "boolean", default: "false", description: "다중 선택 허용." },
          { prop: "variant", type: `"outline" | "ghost"`, default: `"ghost"`, description: "자식 ToggleGroupItem에 적용할 variant." },
          { prop: "size", type: `"sm" | "md" | "lg"`, default: `"md"`, description: "자식 ToggleGroupItem에 적용할 크기." },
          { prop: "orientation", type: `"horizontal" | "vertical"`, default: `"horizontal"` },
          { prop: "disabled", type: "boolean", default: "false" },
        ]}
      />

      <h3>ToggleGroupItem</h3>
      <p className="muted">
        ToggleGroup 안에서 사용하는 개별 토글 버튼. 그룹의 variant/size를 자동 상속한다.
      </p>
      <PropsTable
        rows={[
          { prop: "value", type: "string", description: "그룹 내 고유 식별자." },
          { prop: "disabled", type: "boolean", default: "false" },
        ]}
      />

      <h2>접근성</h2>
      <ul>
        <li><code>Enter</code> / <code>Space</code> — pressed 상태 토글</li>
        <li><code>Tab</code> / <code>Shift+Tab</code> — 포커스 이동</li>
        <li>Base UI가 <code>aria-pressed</code>를 자동 관리 (단독 Toggle)</li>
        <li>ToggleGroup(single)은 라디오 시맨틱(↑↓←→ 이동), multiple은 독립 토글</li>
      </ul>
    </main>
  );
}
