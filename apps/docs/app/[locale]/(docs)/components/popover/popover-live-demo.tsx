"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Button } from "./components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./components/ui/popover";

export default function App() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>
        팝오버 열기
      </PopoverTrigger>
      <PopoverContent showArrow>
        <PopoverTitle>알림 설정</PopoverTitle>
        <PopoverDescription>
          여기서 알림 수신 방법을 변경할 수 있습니다.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}
`;

export function PopoverLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="popover"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={460}
    />
  );
}
