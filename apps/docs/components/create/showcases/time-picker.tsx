import { TimePicker } from "@/components/ui/time-picker";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <TimePicker container={containerRef} placeholder="시간 선택" />
);

const showcase: ShowcaseManifest = {
  id: "time-picker",
  label: "TimePicker",
  category: "form",
  Demo,
};

export default showcase;
