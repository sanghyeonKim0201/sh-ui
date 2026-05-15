"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";

export default function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 320 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="name">이름</Label>
        <Input id="name" placeholder="홍길동" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" placeholder="you@example.com" required />
      </div>
    </div>
  );
}
`;

export function LabelLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="label"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={360}
    />
  );
}
