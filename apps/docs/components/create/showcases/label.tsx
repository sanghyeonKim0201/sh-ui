import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", maxWidth: 360 }}>
    <Label htmlFor="pg-label-email" isRequired>
      이메일
    </Label>
    <Input id="pg-label-email" type="email" placeholder="you@example.com" required />
  </div>
);

const showcase: ShowcaseManifest = {
  id: "label",
  label: "Label",
  category: "form",
  Demo,
};

export default showcase;
