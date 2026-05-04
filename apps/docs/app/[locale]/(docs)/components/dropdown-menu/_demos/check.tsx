"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export function DropdownMenuCheckRadioDemo() {
  const [notifications, setNotifications] = useState(true);
  const [beta, setBeta] = useState(false);
  const [layout, setLayout] = useState("comfortable");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary">환경설정</Button>} />
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>옵션</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={notifications} onCheckedChange={setNotifications}>
          알림 받기
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={beta} onCheckedChange={setBeta}>
          베타 기능 사용
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>레이아웃</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={layout} onValueChange={setLayout}>
          <DropdownMenuRadioItem value="comfortable">넓게</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="compact">좁게</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
