"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function WithOutputDemo() {
  const [value, setValue] = useState("<p>편집해보세요. 아래에 HTML 출력이 실시간으로 표시됩니다.</p>");
  return (
    <div style={{ display: "grid", gap: "var(--space-3)", width: "100%" }}>
      <RichTextEditor value={value} onChange={setValue} minHeight="160px" />
      <pre
        aria-label="onChange output"
        style={{
          margin: 0,
          padding: "var(--space-3) var(--space-4)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--background-subtle)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: "0.8125rem",
          lineHeight: 1.6,
          color: "var(--foreground)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "auto",
        }}
      >
        {value}
      </pre>
    </div>
  );
}
