"use client";

import { Radio, RadioGroup } from "@/components/ui/radio";
import { Label } from "@/components/ui/label";

export function RadioBasicDemo() {
  return (
    <RadioGroup defaultValue="banana">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="apple" id="r-apple" />
        <Label htmlFor="r-apple">Apple</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="banana" id="r-banana" />
        <Label htmlFor="r-banana">Banana</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="cherry" id="r-cherry" />
        <Label htmlFor="r-cherry">Cherry</Label>
      </div>
    </RadioGroup>
  );
}

export function RadioHorizontalDemo() {
  return (
    <RadioGroup defaultValue="md" orientation="horizontal">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="sm" id="r-sm" />
        <Label htmlFor="r-sm">Small</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="md" id="r-md" />
        <Label htmlFor="r-md">Medium</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="lg" id="r-lg" />
        <Label htmlFor="r-lg">Large</Label>
      </div>
    </RadioGroup>
  );
}

export function RadioDisabledDemo() {
  return (
    <RadioGroup defaultValue="on" disabled>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="on" id="r-d-on" />
        <Label htmlFor="r-d-on">선택됨</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Radio value="off" id="r-d-off" />
        <Label htmlFor="r-d-off">미선택</Label>
      </div>
    </RadioGroup>
  );
}
