import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <Accordion style={{ maxWidth: 480 }}>
    <AccordionItem value="a">
      <AccordionTrigger>무엇을 제공하나요?</AccordionTrigger>
      <AccordionContent>
        React/Flutter 공용 디자인 시스템 컴포넌트를 제공합니다.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="b">
      <AccordionTrigger>토큰은 어떻게 바꾸나요?</AccordionTrigger>
      <AccordionContent>
        좌측 편집 패널에서 색과 radius 를 조정하면 캔버스에 즉시 반영됩니다.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

const showcase: ShowcaseManifest = {
  id: "accordion",
  label: "Accordion",
  category: "navigation",
  Demo,
};

export default showcase;
