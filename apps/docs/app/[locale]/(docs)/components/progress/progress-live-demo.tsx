"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Progress } from "./components/ui/progress";

export default function App() {
  return (
    <div style={{ width: "100%" }}>
      <Progress value={60} aria-label="다운로드" />
    </div>
  );
}
`;

export function ProgressLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="progress"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={260}
    />
  );
}
