import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <ContextMenu>
    <ContextMenuTrigger
      style={{
        display: "grid",
        placeItems: "center",
        height: "5rem",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius)",
        color: "var(--foreground-muted)",
        fontSize: "0.8125rem",
      }}
    >
      이 영역에서 우클릭
    </ContextMenuTrigger>
    <ContextMenuContent container={containerRef}>
      <ContextMenuItem>복사</ContextMenuItem>
      <ContextMenuItem>잘라내기</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>삭제</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
);

const showcase: ShowcaseManifest = {
  id: "context-menu",
  label: "ContextMenu",
  category: "overlay",
  Demo,
};

export default showcase;
