export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import {
  ToggleBasicDemo,
  ToggleVariantDemo,
  ToggleGroupSingleDemo,
  ToggleGroupMultipleDemo,
} from "./_demos/basic";

export default function TogglePage() {
  return (
    <main className="container">
      <h1>Toggle</h1>
      <p className="muted">
        눌림/해제 두 상태를 전환하는 버튼. ToggleGroup으로 묶어 단일/다중 선택을 관리한다.
      </p>

      <Preview>
        <Preview.Demo>
          <ToggleBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `<Toggle aria-label="Bold">
  <BoldIcon />
</Toggle>`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `import { Toggle } from "@/components/ui/toggle";

export function BoldToggle() {
  return (
    <Toggle aria-label="Bold" onPressedChange={(pressed) => console.log(pressed)}>
      <BoldIcon />
    </Toggle>
  );
}`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add toggle`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/toggle/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { Toggle, ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle";

// 단일 토글
<Toggle pressed onPressedChange={(p) => console.log(p)}>Bold</Toggle>

// 토글 그룹
<ToggleGroup>
  <ToggleGroupItem value="bold">B</ToggleGroupItem>
  <ToggleGroupItem value="italic">I</ToggleGroupItem>
</ToggleGroup>`}
      />

      <h2>Examples</h2>

      <h3>Variant</h3>
      <Preview>
        <Preview.Demo>
          <ToggleVariantDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Toggle variant="ghost">Ghost</Toggle>
<Toggle variant="outline">Outline</Toggle>`}
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
        <CodePanel
          language="tsx"
          code={`<ToggleGroup variant="outline">
  <ToggleGroupItem value="bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic"><ItalicIcon /></ToggleGroupItem>
  <ToggleGroupItem value="underline"><UnderlineIcon /></ToggleGroupItem>
</ToggleGroup>`}
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
        <CodePanel
          language="tsx"
          code={`<ToggleGroup variant="outline" multiple defaultValue={["bold", "italic"]}>
  <ToggleGroupItem value="bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic"><ItalicIcon /></ToggleGroupItem>
  <ToggleGroupItem value="underline"><UnderlineIcon /></ToggleGroupItem>
</ToggleGroup>`}
        />
      </Preview>

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
    </main>
  );
}
