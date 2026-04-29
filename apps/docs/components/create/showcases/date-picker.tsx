import { DatePicker } from "@/components/ui/date-picker";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <DatePicker container={containerRef} />
);

const showcase: ShowcaseManifest = {
  id: "date-picker",
  label: "DatePicker",
  category: "form",
  Demo,
};

export default showcase;
