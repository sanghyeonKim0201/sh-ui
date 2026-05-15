"use client";

import type { ReactNode } from "react";
import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

interface Props {
  source: string;
  styles: string;
  tokens: string;
  flutterPanel: ReactNode;
}

const APP_TSX = `import { Button } from "./components/ui/button";

export default function App() {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Button>저장</Button>
      <Button variant="secondary">취소</Button>
      <Button variant="ghost">더보기</Button>
      <Button variant="danger">삭제</Button>
    </div>
  );
}
`;

export function ButtonLiveDemo({ source, styles, tokens, flutterPanel }: Props) {
  return (
    <ComponentSandbox
      componentName="button"
      source={source}
      styles={styles}
      tokens={tokens}
      demoCode={APP_TSX}
      flutterPanel={flutterPanel}
    />
  );
}
