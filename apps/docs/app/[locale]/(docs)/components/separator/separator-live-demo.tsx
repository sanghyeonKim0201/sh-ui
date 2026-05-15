"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Separator } from "./components/ui/separator";

export default function App() {
  return (
    <div style={{ width: "20rem" }}>
      <div style={{ fontSize: "0.875rem" }}>라디오 옵션</div>
      <Separator />
      <div style={{ fontSize: "0.875rem", color: "var(--foreground-muted)", marginTop: "0.5rem" }}>
        설정 섹션 설명
      </div>
    </div>
  );
}
`;

export function SeparatorLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="separator"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={300}
    />
  );
}
