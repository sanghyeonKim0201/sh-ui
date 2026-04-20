"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function TooltipBasicDemo() {
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
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" aria-label="설정">⚙︎</Button>} />
          <TooltipContent side="bottom">설정</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
