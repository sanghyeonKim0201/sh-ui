import { Input } from "@/components/ui/input";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 360 }}>
    <Input placeholder="기본 입력" />
    <Input defaultValue="값이 있는 상태" />
    <Input placeholder="에러 상태" aria-invalid />
    <Input placeholder="비활성" disabled />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "input",
  label: "Input",
  category: "form",
  Demo,
};

export default showcase;
