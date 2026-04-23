"use client";

import { useState } from "react";
import { Form } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function CheckboxSwitchDemo() {
  const [result, setResult] = useState<string | null>(null);

  return (
    <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <Form
        defaultValues={{ agree: false, marketing: false }}
        onSubmit={(values) => {
          setResult(JSON.stringify(values, null, 2));
        }}
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
      >
        <Form.Field name="agree" required>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Form.Control valueAs="checked">
              <Checkbox />
            </Form.Control>
            <Form.Label style={{ marginBottom: 0, cursor: "pointer" }}>
              이용 약관에 동의합니다 <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </Form.Label>
          </div>
          <Form.Error />
        </Form.Field>

        <Form.Field name="marketing">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Form.Label style={{ marginBottom: 0 }}>이메일 마케팅 수신 동의</Form.Label>
            <Form.Control valueAs="checked">
              <Switch />
            </Form.Control>
          </div>
        </Form.Field>

        <Button type="submit">다음</Button>
      </Form>

      {result && (
        <pre
          style={{
            margin: 0,
            padding: "var(--space-3)",
            background: "var(--color-muted)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.8125rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}
