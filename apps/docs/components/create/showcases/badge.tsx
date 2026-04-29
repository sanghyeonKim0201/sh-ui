import { Badge } from "@/components/ui/badge";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
    <Badge>Primary</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="success">Success</Badge>
    <Badge variant="warning">Warning</Badge>
    <Badge variant="danger">Danger</Badge>
    <Badge variant="outline">Outline</Badge>
  </div>
);

const showcase: ShowcaseManifest = {
  id: "badge",
  label: "Badge",
  category: "display",
  Demo,
};

export default showcase;
