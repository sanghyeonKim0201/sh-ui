"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const initial = `<h2>Hello, sh-ui</h2>
<p><strong>RichTextEditor</strong> 는 Tiptap 위에 sh-ui 토큰 테마를 입힌 합성 컴포넌트입니다.</p>
<ul>
  <li>헤딩 · 리스트 · 인용 · 코드 블록 · 링크</li>
  <li>툴바는 본문 포커스를 잃지 않도록 mousedown 을 가로챕니다</li>
  <li>HTML 을 그대로 <code>onChange</code> 로 전달</li>
</ul>
<p>예시: <a href="https://github.com/sanghyeonKim0201/sh-ui">GitHub 리포지토리</a></p>
`;

export function BasicDemo() {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: "100%" }}>
      <RichTextEditor value={value} onChange={setValue} placeholder="여기에 작성..." />
    </div>
  );
}
