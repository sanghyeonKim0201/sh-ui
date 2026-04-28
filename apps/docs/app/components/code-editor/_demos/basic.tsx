"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/ui/code-editor";

const initial = `function greet(name: string) {
  return \`Hello, \${name}\`;
}

console.log(greet("sh-ui"));
`;

export function BasicDemo() {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: "100%" }}>
      <CodeEditor
        value={value}
        onChange={setValue}
        language="typescript"
        aria-label="TypeScript editor"
      />
    </div>
  );
}
