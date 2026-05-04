"use client";

import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CrossFieldDemo() {
  return (
    <Form
      defaultValues={{ password: "", confirmPassword: "" }}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <Form.Field
        name="password"
        validate={(v) =>
          String(v).length >= 8 ? undefined : "8자 이상 입력하세요"
        }
      >
        <Form.Label>비밀번호</Form.Label>
        <Form.Control>
          <Input type="password" placeholder="8자 이상" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Form.Field
        name="confirmPassword"
        validate={(v, allValues) => {
          const values = allValues as { password?: string };
          return v === values.password ? undefined : "비밀번호가 일치하지 않습니다";
        }}
      >
        <Form.Label>비밀번호 확인</Form.Label>
        <Form.Control>
          <Input type="password" placeholder="다시 입력" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Button type="submit">변경</Button>
    </Form>
  );
}
