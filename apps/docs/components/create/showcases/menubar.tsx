import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menubar } from "@/components/ui/menubar";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <Menubar>
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm">파일</Button>} />
      <DropdownMenuContent align="start" container={containerRef}>
        <DropdownMenuItem>새로 만들기</DropdownMenuItem>
        <DropdownMenuItem>열기</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>저장</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm">편집</Button>} />
      <DropdownMenuContent align="start" container={containerRef}>
        <DropdownMenuItem>실행 취소</DropdownMenuItem>
        <DropdownMenuItem>다시 실행</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm">보기</Button>} />
      <DropdownMenuContent align="start" container={containerRef}>
        <DropdownMenuItem>확대</DropdownMenuItem>
        <DropdownMenuItem>축소</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </Menubar>
);

const showcase: ShowcaseManifest = {
  id: "menubar",
  label: "Menubar",
  category: "overlay",
  Demo,
};

export default showcase;
