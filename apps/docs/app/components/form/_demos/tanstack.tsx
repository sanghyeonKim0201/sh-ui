"use client";

import { useForm } from "@tanstack/react-form";
import { Form } from "@/components/ui/form";
import { adaptTanStackForm } from "@/components/ui/form-tanstack";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TanStackFormDemo() {
  const ts = useForm({
    defaultValues: { email: "", name: "" },
    onSubmit: async () => {},
  });

  const form = adaptTanStackForm(ts, {
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <Form
      form={form}
      style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <Form.Field
        name="email"
        validate={(v) =>
          String(v).includes("@") ? undefined : "이메일 형식이 아닙니다"
        }
      >
        <Form.Label>이메일</Form.Label>
        <Form.Control>
          <Input type="email" placeholder="you@example.com" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Form.Field
        name="name"
        validate={(v) => (v ? undefined : "이름을 입력하세요")}
      >
        <Form.Label>이름</Form.Label>
        <Form.Control>
          <Input placeholder="홍길동" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Button type="submit">제출</Button>
    </Form>
  );
}
