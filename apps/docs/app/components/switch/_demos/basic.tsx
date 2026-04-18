"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SwitchBasicDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Switch id="airplane" />
      <Label htmlFor="airplane">비행기 모드</Label>
    </div>
  );
}

export function SwitchSizeDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Switch id="sw-sm" size="sm" />
        <Label htmlFor="sw-sm">Small</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Switch id="sw-md" size="md" />
        <Label htmlFor="sw-md">Medium</Label>
      </div>
    </div>
  );
}

export function SwitchDisabledDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Switch id="sw-d-off" disabled />
        <Label htmlFor="sw-d-off">비활성 (해제)</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Switch id="sw-d-on" disabled defaultChecked />
        <Label htmlFor="sw-d-on">비활성 (켜짐)</Label>
      </div>
    </div>
  );
}
