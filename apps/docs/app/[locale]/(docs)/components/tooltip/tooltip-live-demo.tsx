"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Button } from "./components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/ui/tooltip";

export default function App() {
  return (
    <TooltipProvider delay={200}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Tooltip>
          <TooltipTrigger render={<Button variant="secondary">저장</Button>} />
          <TooltipContent>변경 사항을 저장합니다 (⌘S)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button variant="secondary">공유</Button>} />
          <TooltipContent side="right" showArrow>
            팀원과 공유하기
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
`;

export function TooltipLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="tooltip"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={420}
    />
  );
}
