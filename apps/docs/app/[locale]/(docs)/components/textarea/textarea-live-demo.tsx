"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Textarea } from "./components/ui/textarea";

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Textarea placeholder="내용을 입력하세요" />
    </div>
  );
}
`;

export function TextareaLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="textarea"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={260}
    />
  );
}
