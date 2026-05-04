"use client";

import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxBasicDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="terms" />
      <Label htmlFor="terms">이용약관에 동의합니다</Label>
    </div>
  );
}

export function CheckboxGroupDemo() {
  return (
    <CheckboxGroup defaultValue={["apple"]}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox value="apple" id="apple" />
        <Label htmlFor="apple">Apple</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox value="banana" id="banana" />
        <Label htmlFor="banana">Banana</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox value="cherry" id="cherry" />
        <Label htmlFor="cherry">Cherry</Label>
      </div>
    </CheckboxGroup>
  );
}

export function CheckboxDisabledDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="disabled-off" disabled />
        <Label htmlFor="disabled-off">비활성 (해제)</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="disabled-on" disabled defaultChecked />
        <Label htmlFor="disabled-on">비활성 (체크됨)</Label>
      </div>
    </div>
  );
}

export function CheckboxIndeterminateDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="indeterminate" indeterminate />
      <Label htmlFor="indeterminate">부분 선택 (indeterminate)</Label>
    </div>
  );
}
