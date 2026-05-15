"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Input } from "./components/ui/input";

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <Input placeholder="이름을 입력하세요" />
    </div>
  );
}
`;

export function InputLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="input"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={260}
    />
  );
}
