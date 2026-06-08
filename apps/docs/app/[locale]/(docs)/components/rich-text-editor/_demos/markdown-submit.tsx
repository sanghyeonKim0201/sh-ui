"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function MarkdownSubmitDemo() {
  const [md, setMd] = useState("**굵게** 또는 `코드` — Enter 로 전송, Shift+Enter 로 줄바꿈.");
  const [sent, setSent] = useState<string[]>([]);

  const send = () => {
    const text = md.trim();
    if (!text) return;
    setSent((prev) => [...prev, text]);
    setMd("");
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-3)", width: "100%" }}>
      <RichTextEditor
        format="markdown"
        value={md}
        onChange={setMd}
        submitOnEnter
        onSubmit={send}
        placeholder="메시지를 입력하세요…"
        compact
        toolbarMode="focus"
        aria-label="채팅 입력"
      />
      <pre
        aria-label="markdown output"
        style={{
          margin: 0,
          padding: "var(--space-3) var(--space-4)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--background-subtle)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: "0.8125rem",
          lineHeight: 1.6,
          color: "var(--foreground)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "auto",
        }}
      >
        {`markdown: ${md || "(빈 값)"}\n\n전송됨:\n${sent.length ? sent.map((s, i) => `${i + 1}. ${s}`).join("\n") : "(없음)"}`}
      </pre>
    </div>
  );
}
