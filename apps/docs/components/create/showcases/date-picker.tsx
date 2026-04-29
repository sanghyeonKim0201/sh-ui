import { DatePicker } from "@/components/ui/date-picker";
import type { ShowcaseManifest } from "./types";

const Demo = () => <DatePicker />;

const showcase: ShowcaseManifest = {
  id: "date-picker",
  label: "DatePicker",
  category: "form",
  Demo,
};

export default showcase;
