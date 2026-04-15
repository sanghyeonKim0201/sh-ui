"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

export function ControlledSliderDemo() {
  const [v, setV] = useState(40);
  return (
    <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Slider value={v} onValueChange={setV} aria-label="볼륨" />
      <div style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
        현재 값: <code>{v}</code>
      </div>
    </div>
  );
}
