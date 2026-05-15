"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";

export default function App() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Switch id="airplane" />
      <Label htmlFor="airplane">비행기 모드</Label>
    </div>
  );
}
`;

export function SwitchLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="switch"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={280}
    />
  );
}
