import { Progress } from "@/components/ui/progress";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 360 }}>
    <Progress value={40} aria-label="determinate 40%" />
    <Progress aria-label="indeterminate" />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "progress",
  label: "Progress",
  category: "display",
  Demo,
};

export default showcase;
