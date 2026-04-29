import { Checkbox } from "@/components/ui/checkbox";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <Checkbox defaultChecked aria-label="동의" />
    <Checkbox aria-label="필수 아님" />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "checkbox",
  label: "Checkbox",
  category: "choice",
  Demo,
};

export default showcase;
