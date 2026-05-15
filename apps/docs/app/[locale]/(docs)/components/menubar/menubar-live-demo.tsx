"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Menubar } from "./components/ui/menubar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./components/ui/dropdown-menu";

export default function App() {
  return (
    <Menubar>
      <DropdownMenu>
        <DropdownMenuTrigger>파일</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>새로 만들기</DropdownMenuItem>
          <DropdownMenuItem>열기…</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>닫기</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger>편집</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>실행 취소</DropdownMenuItem>
          <DropdownMenuItem>다시 실행</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger>보기</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>확대</DropdownMenuItem>
          <DropdownMenuItem>축소</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Menubar>
  );
}
`;

export function MenubarLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="menubar"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={620}
    />
  );
}
