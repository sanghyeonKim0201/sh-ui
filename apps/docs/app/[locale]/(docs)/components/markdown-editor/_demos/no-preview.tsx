"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

export function NoPreviewDemo() {
  const [value, setValue] = useState("# 미리보기를 끈 단순 마크다운 입력기\n\n- 폼 필드 등에 어울립니다.\n");
  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <MarkdownEditor
        value={value}
        onChange={setValue}
        preview={false}
        placeholder="마크다운으로 작성..."
        minHeight="160px"
      />
    </div>
  );
}
