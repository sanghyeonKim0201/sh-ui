"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PopoverBasicDemo() {
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
