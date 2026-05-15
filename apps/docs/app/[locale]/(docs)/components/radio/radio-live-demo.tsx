"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Radio, RadioGroup } from "./components/ui/radio";
import { Label } from "./components/ui/label";

export default function App() {
  return (
    <RadioGroup defaultValue="banana">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="apple" id="apple" />
        <Label htmlFor="apple">Apple</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
        <Radio value="banana" id="banana" />
        <Label htmlFor="banana">Banana</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
        <Radio value="cherry" id="cherry" />
        <Label htmlFor="cherry">Cherry</Label>
      </div>
    </RadioGroup>
  );
}
`;

export function RadioLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="radio"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={420}
    />
  );
}
