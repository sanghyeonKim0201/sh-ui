import { Spinner } from "@/components/ui/spinner";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <Spinner size="sm" />
    <Spinner size="md" />
    <Spinner size="lg" />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "spinner",
  label: "Spinner",
  category: "display",
  Demo,
};

export default showcase;
