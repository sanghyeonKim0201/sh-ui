import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="secondary">메뉴</Button>} />
    <DropdownMenuContent align="start" container={containerRef}>
      <DropdownMenuItem>프로필</DropdownMenuItem>
      <DropdownMenuItem>설정</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>로그아웃</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const showcase: ShowcaseManifest = {
  id: "dropdown-menu",
  label: "DropdownMenu",
  category: "overlay",
  Demo,
};

export default showcase;
