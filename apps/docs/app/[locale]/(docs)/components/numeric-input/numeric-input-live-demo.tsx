"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { useState } from "react";
import { NumericInput } from "./components/ui/numeric-input";
import { Slider } from "./components/ui/slider";

export default function App() {
  const [angle, setAngle] = useState(135);
  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "20rem" }}>
      <Slider value={angle} onValueChange={setAngle} min={0} max={360} step={1} aria-label="각도" />
      <NumericInput
        value={angle}
        onValueChange={setAngle}
        min={0}
        max={360}
        unit="°"
        aria-label="각도"
      />
    </div>
  );
}
`;

export function NumericInputLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="numeric-input"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={420}
    />
  );
}
