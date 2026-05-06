"use client";

import { useState } from "react";
import { Input, InputAdornment, InputGroup } from "@/components/ui/input";

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M3 3l14 14M8 5a8 8 0 0 1 2-.3c5 0 8 5.3 8 5.3a13 13 0 0 1-2.3 2.9M12 12a2.5 2.5 0 0 1-3.4-3.4m-2.3-2.5A13 13 0 0 0 2 10s3 5.5 8 5.5a8 8 0 0 0 3.3-.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PasswordToggleRightDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <InputGroup>
        <Input type={visible ? "text" : "password"} placeholder="비밀번호" />
        <InputAdornment interactive>
          <button
            type="button"
            className="sh-ui-input__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
            aria-pressed={visible}
            tabIndex={-1}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </InputAdornment>
      </InputGroup>
    </div>
  );
}

export function PasswordToggleLeftLockDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <InputGroup>
        <InputAdornment>
          <LockIcon />
        </InputAdornment>
        <Input type={visible ? "text" : "password"} placeholder="비밀번호" />
        <InputAdornment interactive>
          <button
            type="button"
            className="sh-ui-input__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
            aria-pressed={visible}
            tabIndex={-1}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </InputAdornment>
      </InputGroup>
    </div>
  );
}
