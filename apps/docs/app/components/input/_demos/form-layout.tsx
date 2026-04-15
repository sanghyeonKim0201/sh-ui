"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FormLayoutDemo() {
  return (
    <form
      style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
      onSubmit={(e) => e.preventDefault()}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>이름</span>
        <Input placeholder="홍길동" />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>이메일</span>
        <Input type="email" placeholder="you@example.com" />
      </label>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <Button type="submit">저장</Button>
        <Button type="button" variant="secondary">취소</Button>
      </div>
    </form>
  );
}
