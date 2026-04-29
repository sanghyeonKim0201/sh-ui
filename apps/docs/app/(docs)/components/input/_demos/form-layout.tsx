"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <Label htmlFor="form-name" isRequired>이름</Label>
        <Input id="form-name" placeholder="홍길동" required />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <Label htmlFor="form-email" isRequired>이메일</Label>
        <Input id="form-email" type="email" placeholder="you@example.com" required />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <Button type="submit">저장</Button>
        <Button type="button" variant="secondary">취소</Button>
      </div>
    </form>
  );
}
