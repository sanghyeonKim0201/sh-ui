"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Skeleton } from "./components/ui/skeleton";

export default function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 320 }}>
      <Skeleton style={{ height: "1.25rem", width: "70%" }} />
      <Skeleton style={{ height: "1rem" }} />
      <Skeleton style={{ height: "1rem", width: "85%" }} />
    </div>
  );
}
`;

export function SkeletonLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="skeleton"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={280}
    />
  );
}
