"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function EmailValidationDemo() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");

  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <Input
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={invalid || undefined}
      />
      {invalid && (
        <p style={{ color: "var(--danger)", fontSize: "0.75rem", margin: "0.375rem 0 0" }}>
          유효한 이메일 주소를 입력하세요.
        </p>
      )}
    </div>
  );
}
