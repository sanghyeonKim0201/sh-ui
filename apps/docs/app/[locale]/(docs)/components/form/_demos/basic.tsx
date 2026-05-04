"use client";

import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BasicFormDemo() {
  return (
    <Form
      defaultValues={{ email: "" }}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{ width: "100%", maxWidth: 400 }}
    >
      <Form.Field
        name="email"
        validate={(v) =>
          String(v).includes("@") ? undefined : "이메일 형식이 아닙니다"
        }
      >
        <Form.Label>이메일</Form.Label>
        <Form.Control>
          <Input type="email" required placeholder="you@example.com" />
        </Form.Control>
        <Form.Error />
      </Form.Field>
      <Button type="submit" style={{ alignSelf: "flex-start" }}>
        가입
      </Button>
    </Form>
  );
}
