"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { FileUpload } from "./components/ui/file-upload";

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <FileUpload hint="PNG, JPG · 최대 5MB" />
    </div>
  );
}
`;

export function FileUploadLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="file-upload"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={300}
    />
  );
}
