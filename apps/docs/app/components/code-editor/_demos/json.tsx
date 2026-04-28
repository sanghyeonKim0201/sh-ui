"use client";

import { useState, useMemo } from "react";
import { CodeEditor } from "@/components/ui/code-editor";

const initial = `{
  "platform": "react",
  "theme": {
    "base": "neutral",
    "radius": "md"
  },
  "components": ["button", "input", "code-editor"]
}
`;

export function JsonDemo() {
  const [value, setValue] = useState(initial);

  const error = useMemo(() => {
    try {
      JSON.parse(value);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }, [value]);

  return (
    <div style={{ width: "100%" }}>
      <CodeEditor
        value={value}
        onChange={setValue}
        language="json"
        aria-label="JSON editor"
        aria-invalid={!!error || undefined}
      />
      <p
        style={{
          marginTop: "0.25rem",
          fontSize: "0.75rem",
          color: error ? "var(--danger)" : "var(--foreground-muted)",
        }}
      >
        {error ? `Invalid JSON — ${error}` : "Valid JSON"}
      </p>
    </div>
  );
}
