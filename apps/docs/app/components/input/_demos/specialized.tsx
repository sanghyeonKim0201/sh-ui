"use client";

import { useState } from "react";
import {
  BusinessNumberInput,
  NumberInput,
  PhoneInput,
} from "@/components/ui/input";

export function NumberInputDemo() {
  const [v, setV] = useState<number | undefined>(1234567);
  return (
    <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <NumberInput value={v} onValueChange={setV} placeholder="금액" />
      <code style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
        value: {v === undefined ? "undefined" : v}
      </code>
    </div>
  );
}

export function PhoneInputDemo() {
  const [v, setV] = useState("01012345678");
  return (
    <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <PhoneInput value={v} onValueChange={setV} placeholder="전화번호" />
      <code style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
        digits: {v}
      </code>
    </div>
  );
}

export function BusinessNumberInputDemo() {
  const [v, setV] = useState("1234567890");
  return (
    <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <BusinessNumberInput
        value={v}
        onValueChange={setV}
        validateChecksum
        placeholder="사업자등록번호"
      />
      <code style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
        digits: {v}
      </code>
    </div>
  );
}
