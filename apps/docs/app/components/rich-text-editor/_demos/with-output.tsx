"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { CodePanel } from "@/components/ui/code-panel";

export function WithOutputDemo() {
  const [value, setValue] = useState("<p>편집해보세요. 아래에 HTML 출력이 실시간으로 표시됩니다.</p>");
  return (
    <div style={{ display: "grid", gap: "var(--space-3)", width: "100%" }}>
      <RichTextEditor value={value} onChange={setValue} minHeight="160px" />
      <CodePanel code={value} language="html" filename="onChange output" />
    </div>
  );
}
