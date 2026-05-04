"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

const initial = `# Hello, sh-ui

**MarkdownEditor** 는 [CodeEditor](/components/code-editor) 위에 \`react-markdown\` 미리보기를
얹은 합성 컴포넌트입니다.

## 지원 기능 (GFM)

- 체크리스트
  - [x] 헤딩 · 리스트 · 링크 · 강조
  - [x] 테이블
  - [ ] raw HTML 차단 (XSS 자동 방어)

| 기능 | 비고 |
| --- | --- |
| 코드 블록 | 펜스/인라인 모두 |
| 인용문 | \`>\` 로 시작 |
| 취소선 | ~~strikethrough~~ |

\`\`\`ts
const square = (n: number) => n * n;
\`\`\`

> 미리보기 좌·우 분할은 좁은 화면에서 자동으로 위·아래로 쌓입니다.
`;

export function BasicDemo() {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: "100%" }}>
      <MarkdownEditor value={value} onChange={setValue} minHeight="320px" />
    </div>
  );
}
