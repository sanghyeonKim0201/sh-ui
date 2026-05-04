"use client";

import { Menubar } from "@/components/ui/menubar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export function MenubarBasicDemo() {
  return (
    <Menubar>
      <DropdownMenu>
        <DropdownMenuTrigger>파일</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>새로 만들기</DropdownMenuItem>
          <DropdownMenuItem>열기…</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>내보내기</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>PDF</DropdownMenuItem>
              <DropdownMenuItem>CSV</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>닫기</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger>편집</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>실행 취소</DropdownMenuItem>
          <DropdownMenuItem>다시 실행</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>복사</DropdownMenuItem>
          <DropdownMenuItem>붙여넣기</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger>보기</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>확대</DropdownMenuItem>
          <DropdownMenuItem>축소</DropdownMenuItem>
          <DropdownMenuItem>100%</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Menubar>
  );
}
