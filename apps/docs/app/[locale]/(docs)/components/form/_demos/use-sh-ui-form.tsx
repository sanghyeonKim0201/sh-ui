"use client";

import { z } from "zod";
import { Form, useShUiForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  username: z.string().min(2, "2자 이상 입력하세요"),
  email: z.string().email("이메일 형식이 아닙니다"),
  password: z.string().min(8, "8자 이상 입력하세요"),
});

type FormValues = z.infer<typeof schema>;

export function UseShUiFormDemo() {
  const form = useShUiForm<FormValues>({
    defaultValues: { username: "", email: "", password: "" },
    schema,
    validateOn: "blur",
  });

  return (
    <Form
      form={form}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <Form.Field name="username">
        <Form.Label>사용자명</Form.Label>
        <Form.Control>
          <Input placeholder="hong_gildong" />
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

      <Form.Field name="password">
        <Form.Label>비밀번호</Form.Label>
        <Form.Control>
          <Input type="password" placeholder="8자 이상" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Button type="submit">가입하기</Button>
    </Form>
  );
}
