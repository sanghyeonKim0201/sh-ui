"use client";

import { useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";

export function ControlledColorPickerDemo() {
  const [color, setColor] = useState("#3B82F6");
  return (
    <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <ColorPicker value={color} onChange={setColor} />
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
        <div
          style={{
            width: "1.25rem",
            height: "1.25rem",
            borderRadius: "calc(var(--radius) - 2px)",
            border: "1px solid var(--border)",
            background: color,
          }}
        />
        <code>{color}</code>
      </div>
    </div>
  );
}
