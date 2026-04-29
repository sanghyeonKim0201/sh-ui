import { Separator } from "@/components/ui/separator";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
      <span>좌측</span>
      <Separator orientation="vertical" style={{ height: "1rem" }} />
      <span>중앙</span>
      <Separator orientation="vertical" style={{ height: "1rem" }} />
      <span>우측</span>
    </div>
    <Separator style={{ margin: "0.75rem 0" }} />
    <p style={{ fontSize: "0.8125rem", margin: 0, color: "var(--foreground-muted)" }}>
      수평 구분선
    </p>
  </div>
);

const showcase: ShowcaseManifest = {
  id: "separator",
  label: "Separator",
  category: "display",
  Demo,
};

export default showcase;
