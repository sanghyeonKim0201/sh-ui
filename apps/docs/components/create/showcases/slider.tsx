import { Slider } from "@/components/ui/slider";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ maxWidth: 360 }}>
    <Slider defaultValue={60} min={0} max={100} step={1} aria-label="볼륨" />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "slider",
  label: "Slider",
  category: "choice",
  Demo,
};

export default showcase;
