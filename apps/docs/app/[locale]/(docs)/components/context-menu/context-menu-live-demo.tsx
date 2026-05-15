"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "./components/ui/context-menu";

export default function App() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "20rem",
            height: "8rem",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--background-subtle)",
            color: "var(--foreground-muted)",
            fontSize: "var(--text-sm)",
            userSelect: "none",
          }}
        >
          이 영역에서 우클릭
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>편집</ContextMenuLabel>
        <ContextMenuItem>잘라내기</ContextMenuItem>
        <ContextMenuItem>복사</ContextMenuItem>
        <ContextMenuItem>붙여넣기</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>삭제</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
`;

export function ContextMenuLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="context-menu"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={620}
    />
  );
}
