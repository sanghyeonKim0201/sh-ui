"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { adaptReactHookForm } from "@/components/ui/form-rhf";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = { email: string; name: string };

export function RhfFormDemo() {
  const rhf = useForm<FormValues>({
    defaultValues: { email: "", name: "" },
    mode: "onBlur",
  });
  const form = adaptReactHookForm(rhf);

  return (
    <Form
      form={form}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
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
      <div>
        <Button type="submit">제출</Button>
      </div>
    </Form>
  );
}
