"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Toggle } from "./components/ui/toggle";

export default function App() {
  return (
    <Toggle aria-label="Bold">
      <strong>B</strong>
    </Toggle>
  );
}
`;

export function ToggleLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="toggle"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={260}
    />
  );
}
