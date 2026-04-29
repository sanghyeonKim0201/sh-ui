import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <TooltipProvider delay={150}>
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary">호버</Button>} />
      <TooltipContent>토큰이 실시간으로 반영됩니다</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const showcase: ShowcaseManifest = {
  id: "tooltip",
  label: "Tooltip",
  category: "overlay",
  Demo,
};

export default showcase;
