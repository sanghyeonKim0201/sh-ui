"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

const initial = `## 위·아래 분할

소스 입력이 넓고 길어야 할 때 유용합니다 — 모바일 폼 등.

- 첫째 줄
- 둘째 줄
`;

export function BottomDemo() {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: "100%" }}>
      <MarkdownEditor
        value={value}
        onChange={setValue}
        previewPosition="bottom"
        minHeight="180px"
      />
    </div>
  );
}
