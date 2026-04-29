import { Skeleton } from "@/components/ui/skeleton";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 360 }}>
    <Skeleton style={{ height: "1rem", width: "60%" }} />
    <Skeleton style={{ height: "1rem", width: "85%" }} />
    <Skeleton style={{ height: "1rem", width: "40%" }} />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "skeleton",
  label: "Skeleton",
  category: "display",
  Demo,
};

export default showcase;
