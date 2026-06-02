"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const initial = `<p>이 에디터는 <strong>compact</strong> 툴바에 <u>밑줄</u>·<span style="color: var(--sh-ui-rte-c-red)">컬러</span>·링크만 노출합니다.</p>
<p>본문을 클릭하면 툴바가 나타나고, 벗어나면 사라집니다 — 메일 작성 같은 인라인 느낌.</p>
`;

export function InlineDemo() {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: "100%" }}>
      <RichTextEditor
        value={value}
        onChange={setValue}
        compact
        toolbarMode="focus"
        placeholder="클릭해서 작성..."
        minHeight="6rem"
      />
    </div>
  );
}
