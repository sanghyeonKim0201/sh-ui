import { Button } from "@/components/ui/button";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
      <Button disabled>Disabled</Button>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
    </div>
  </div>
);

const showcase: ShowcaseManifest = {
  id: "button",
  label: "Button",
  category: "action",
  Demo,
};

export default showcase;
