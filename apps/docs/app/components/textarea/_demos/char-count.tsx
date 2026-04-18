"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 200;

export function CharCountDemo() {
  const [value, setValue] = useState("");
  const isOver = value.length > MAX_LENGTH;

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="최대 200자까지 입력 가능합니다"
        aria-invalid={isOver || undefined}
      />
      <p
        style={{
          marginTop: "0.25rem",
          fontSize: "0.75rem",
          color: isOver ? "var(--danger)" : "var(--foreground-muted)",
          textAlign: "right",
        }}
      >
        {value.length} / {MAX_LENGTH}
      </p>
    </div>
  );
}
