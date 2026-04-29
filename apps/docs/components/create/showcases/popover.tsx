import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <Popover>
    <PopoverTrigger render={<Button variant="secondary">Popover</Button>} />
    <PopoverContent container={containerRef}>
      <PopoverTitle>토큰 미리보기</PopoverTitle>
      <PopoverDescription>
        편집한 색과 radius 가 여기에도 그대로 적용됩니다.
      </PopoverDescription>
    </PopoverContent>
  </Popover>
);

const showcase: ShowcaseManifest = {
  id: "popover",
  label: "Popover",
  category: "overlay",
  Demo,
};

export default showcase;
