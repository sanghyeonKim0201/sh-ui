"use client";

import { useState } from "react";
import { NumericInput } from "@/components/ui/numeric-input";
import { Slider } from "@/components/ui/slider";

export function BasicDemo() {
  const [angle, setAngle] = useState(135);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", maxWidth: 360 }}>
      <code style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)", minWidth: "2.5rem" }}>
        각도
      </code>
      <div style={{ flex: 1 }}>
        <Slider value={angle} onValueChange={setAngle} min={0} max={360} step={1} aria-label="각도" />
      </div>
      <NumericInput value={angle} onValueChange={setAngle} min={0} max={360} unit="°" aria-label="각도" />
    </div>
  );
}

export function UnitsDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
      <NumericInput defaultValue={40} min={0} max={200} unit="px" aria-label="width" />
      <NumericInput defaultValue={120} min={0} max={1000} unit="ms" aria-label="duration" />
      <NumericInput defaultValue={80} min={0} max={100} unit="%" aria-label="opacity" />
    </div>
  );
}

export function SliderCompanionDemo() {
  const [opacity, setOpacity] = useState(80);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", maxWidth: 360 }}>
      <code style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)", minWidth: "3.5rem" }}>
        opacity
      </code>
      <div style={{ flex: 1 }}>
        <Slider value={opacity} onValueChange={setOpacity} min={0} max={100} step={1} aria-label="opacity" />
      </div>
      <NumericInput value={opacity} onValueChange={setOpacity} min={0} max={100} unit="%" aria-label="opacity" />
    </div>
  );
}

export function DisabledDemo() {
  return <NumericInput defaultValue={42} min={0} max={100} unit="px" disabled aria-label="disabled" />;
}
