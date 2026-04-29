import { Textarea } from "@/components/ui/textarea";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ maxWidth: 360 }}>
    <Textarea placeholder="여러 줄 입력" rows={3} />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "textarea",
  label: "Textarea",
  category: "form",
  Demo,
};

export default showcase;
