"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/ui/code-editor";

const initial = `# sh-ui CodeEditor

CodeMirror 6 위에 sh-ui 토큰을 입힌 인라인 코드 에디터.

## 특징

- Controlled — \`value\`/\`onChange\` 로 부모가 상태 소유
- 토큰 추종 — \`.dark\` 스코프에서 자동 다크 테마
- 언어 전환은 Compartment 로 hot-swap

\`\`\`ts
const square = (n: number) => n * n;
\`\`\`
`;

export function MarkdownDemo() {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: "100%" }}>
      <CodeEditor
        value={value}
        onChange={setValue}
        language="markdown"
        minHeight="240px"
        aria-label="Markdown editor"
      />
    </div>
  );
}
