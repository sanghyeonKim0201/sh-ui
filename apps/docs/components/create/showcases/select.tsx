import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <Select>
    <SelectTrigger style={{ width: "14rem" }}>
      <SelectValue placeholder="과일 선택" />
    </SelectTrigger>
    <SelectContent container={containerRef}>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="grapes">Grapes</SelectItem>
    </SelectContent>
  </Select>
);

const showcase: ShowcaseManifest = {
  id: "select",
  label: "Select",
  category: "form",
  Demo,
};

export default showcase;
