"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function AccordionSingleDemo() {
  return (
    <Accordion multiple={false}>
      <AccordionItem value="a">
        <AccordionTrigger>섹션 A</AccordionTrigger>
        <AccordionContent>한 번에 하나만 열립니다.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>섹션 B</AccordionTrigger>
        <AccordionContent>
          다른 섹션을 열면 이전 섹션이 닫힙니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>섹션 C</AccordionTrigger>
        <AccordionContent>세 번째 섹션.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
