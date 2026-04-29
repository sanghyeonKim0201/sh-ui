"use client";

import { useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import type { ShowcaseManifest } from "./types";

const Demo = () => {
  const [value, setValue] = useState("#3B82F6");
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ width: 240 }}>
        <ColorPicker value={value} onChange={setValue} />
      </div>
      <div
        style={{
          width: "5rem",
          height: "5rem",
          background: value,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
        }}
      />
    </div>
  );
};

const showcase: ShowcaseManifest = {
  id: "color-picker",
  label: "ColorPicker",
  category: "form",
  Demo,
};

export default showcase;
