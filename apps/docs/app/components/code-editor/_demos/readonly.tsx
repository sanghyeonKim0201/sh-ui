"use client";

import { CodeEditor } from "@/components/ui/code-editor";

const sample = `// CodeEditor 는 readOnly 모드에서도 선택·복사가 가능하다.
// 키 입력만 차단된다.

export function add(a: number, b: number) {
  return a + b;
}
`;

export function ReadOnlyDemo() {
  return (
    <div style={{ width: "100%" }}>
      <CodeEditor
        value={sample}
        language="typescript"
        readOnly
        aria-label="Read-only TypeScript snippet"
      />
    </div>
  );
}
