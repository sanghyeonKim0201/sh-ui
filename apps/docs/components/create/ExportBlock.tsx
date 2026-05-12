"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  code: string;
  filename?: string;
};

export function ExportBlock({ code, filename = "tokens.css" }: Props) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--background-subtle)",
        margin: "1rem 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 0.75rem 0.5rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--background-muted)",
          fontSize: "0.75rem",
          color: "var(--foreground-muted)",
        }}
      >
        <code style={{ color: "var(--foreground)" }}>{filename}</code>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopy}
          style={{
            height: "auto",
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
            fontWeight: 400,
            color: "var(--foreground-muted)",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "0.75rem 1rem",
          fontSize: "0.8125rem",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          overflowX: "auto",
        }}
      >
        {code}
      </pre>
    </div>
  );
}
