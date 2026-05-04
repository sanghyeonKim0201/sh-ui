"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function AnimatedProgressDemo() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 5));
    }, 400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Progress value={value} aria-label="다운로드 진행도" />
      <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
        현재: <code>{value}%</code>
      </div>
    </div>
  );
}
