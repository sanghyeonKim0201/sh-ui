"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Button } from "./components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "./components/ui/dropdown-menu";

export default function App() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary">메뉴 열기</Button>} />
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>내 계정</DropdownMenuLabel>
          <DropdownMenuItem>프로필</DropdownMenuItem>
          <DropdownMenuItem>설정</DropdownMenuItem>
          <DropdownMenuItem>청구 내역</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>팀 (준비 중)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>로그아웃</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;

export function DropdownMenuLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="dropdown-menu"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={560}
    />
  );
}
