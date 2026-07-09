"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { TimePicker } from "./components/ui/time-picker";

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: "16rem" }}>
      <TimePicker placeholder="시간을 선택하세요" />
    </div>
  );
}
`;

export function TimePickerLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="time-picker"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={320}
    />
  );
}
