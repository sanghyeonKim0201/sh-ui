"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { NumericInput } from "@/components/ui/numeric-input";

export function ControlledSliderDemo() {
  const [v, setV] = useState(40);
  return (
    <div style={{ width: "100%", maxWidth: 320, display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ flex: 1 }}>
        <Slider value={v} onValueChange={setV} aria-label="볼륨" />
      </div>
      <NumericInput value={v} onValueChange={setV} min={0} max={100} aria-label="볼륨" />
    </div>
  );
}
