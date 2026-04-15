"use client";

import { useState } from "react";

export function CodePanelCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API 사용 불가 환경은 무시
    }
  }

  return (
    <button
      type="button"
      className="sh-ui-code__copy"
      onClick={onClick}
      aria-label="코드 복사"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className="sh-ui-code__copy-label">{copied ? "복사됨" : "복사"}</span>
    </button>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <rect
        x="5" y="5" width="8" height="8" rx="1.5"
        stroke="currentColor" strokeWidth="1.5"
      />
      <path
        d="M10.5 5V3.5A1.5 1.5 0 0 0 9 2H4.5A1.5 1.5 0 0 0 3 3.5V8a1.5 1.5 0 0 0 1.5 1.5H5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
