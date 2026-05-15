"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { DatePicker } from "./components/ui/date-picker";

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: "16rem" }}>
      <DatePicker placeholder="날짜를 선택하세요" />
    </div>
  );
}
`;

export function DatePickerLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="date-picker"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={320}
    />
  );
}
