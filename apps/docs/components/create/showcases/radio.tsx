import { Radio, RadioGroup } from "@/components/ui/radio";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <RadioGroup defaultValue="public" orientation="horizontal" style={{ display: "flex", gap: "1rem" }}>
    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
      <Radio value="public" /> 공개
    </label>
    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
      <Radio value="private" /> 비공개
    </label>
    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
      <Radio value="team" /> 팀
    </label>
  </RadioGroup>
);

const showcase: ShowcaseManifest = {
  id: "radio",
  label: "Radio",
  category: "choice",
  Demo,
};

export default showcase;
