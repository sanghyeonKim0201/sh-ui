import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
    <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
    <Avatar size="md"><AvatarFallback>MD</AvatarFallback></Avatar>
    <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
    <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
  </div>
);

const showcase: ShowcaseManifest = {
  id: "avatar",
  label: "Avatar",
  category: "display",
  Demo,
};

export default showcase;
