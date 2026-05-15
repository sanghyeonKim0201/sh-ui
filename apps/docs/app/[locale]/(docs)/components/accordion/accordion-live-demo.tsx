"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/ui/accordion";

export default function App() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Accordion defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>설치 방법이 궁금합니다</AccordionTrigger>
          <AccordionContent>
            CLI 를 사용하면 npx sh-ui-cli add accordion 으로 컴포넌트가 복사됩니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>테마는 어떻게 바꾸나요?</AccordionTrigger>
          <AccordionContent>
            tokens.css 의 CSS 변수를 덮어쓰면 전체 컴포넌트에 일괄 적용됩니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>접근성은 어떻게 챙겼나요?</AccordionTrigger>
          <AccordionContent>
            Base UI 가 키보드 네비게이션과 ARIA 속성을 자동으로 적용합니다.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
`;

export function AccordionLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="accordion"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={440}
    />
  );
}
