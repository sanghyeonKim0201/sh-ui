"use client";

import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "이름을 입력하세요"),
  email: z.string().email("이메일 형식이 아닙니다"),
  age: z
    .string()
    .regex(/^\d+$/, "숫자만 입력하세요")
    .refine((v) => Number(v) >= 18, "만 18세 이상이어야 합니다"),
});

export function ZodSchemaDemo() {
  return (
    <Form
      schema={schema}
      defaultValues={{ name: "", email: "", age: "" }}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <Form.Field name="name">
        <Form.Label>이름</Form.Label>
        <Form.Control>
          <Input placeholder="홍길동" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Form.Field name="email">
        <Form.Label>이메일</Form.Label>
        <Form.Control>
          <Input type="email" placeholder="you@example.com" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Form.Field name="age">
        <Form.Label>나이</Form.Label>
        <Form.Control>
          <Input type="number" placeholder="18" inputMode="numeric" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Button type="submit">확인</Button>
    </Form>
  );
}
