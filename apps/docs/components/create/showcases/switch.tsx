import { Switch } from "@/components/ui/switch";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <Switch defaultChecked aria-label="알림" />
    <Switch aria-label="다크 모드" />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "switch",
  label: "Switch",
  category: "choice",
  Demo,
};

export default showcase;
