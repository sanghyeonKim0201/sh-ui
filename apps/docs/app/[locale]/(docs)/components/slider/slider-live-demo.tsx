"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Slider } from "./components/ui/slider";

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <Slider defaultValue={50} aria-label="기본" />
    </div>
  );
}
`;

export function SliderLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="slider"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={280}
    />
  );
}
