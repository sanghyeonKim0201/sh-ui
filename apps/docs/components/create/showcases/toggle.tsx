import {
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
    <Toggle variant="outline" aria-label="굵게">B</Toggle>
    <Toggle variant="ghost" aria-label="기울임">I</Toggle>
    <ToggleGroup variant="outline" defaultValue={["left"]}>
      <ToggleGroupItem value="left">L</ToggleGroupItem>
      <ToggleGroupItem value="center">C</ToggleGroupItem>
      <ToggleGroupItem value="right">R</ToggleGroupItem>
    </ToggleGroup>
  </div>
);

const showcase: ShowcaseManifest = {
  id: "toggle",
  label: "Toggle",
  category: "choice",
  Demo,
};

export default showcase;
