"use client";

import { Form, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** 페이크 서버 체크 — "taken"이 포함된 이메일은 이미 사용 중으로 처리 */
const checkEmailAvailable = (email: string): Promise<boolean> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(!email.toLowerCase().includes("taken")), 800);
  });

function EmailStatusIndicator() {
  const { isValidating, hasError, touched } = useFormField("email");
  if (isValidating) {
    return (
      <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
        확인 중…
      </span>
    );
  }
  if (touched && !hasError) {
    return (
      <span style={{ fontSize: "0.75rem", color: "var(--color-success, green)" }}>
        사용 가능한 이메일입니다
      </span>
    );
  }
  return null;
}

export function AsyncValidateDemo() {
  return (
    <Form
      defaultValues={{ email: "", name: "" }}
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
        name="email"
        validate={{
          fn: async (v) => {
            const val = String(v).trim();
            if (!val.includes("@")) return "이메일 형식이 아닙니다";
            const available = await checkEmailAvailable(val);
            return available ? undefined : "이미 사용 중인 이메일입니다";
          },
          debounce: 500,
        }}
      >
        <Form.Label>이메일</Form.Label>
        <Form.Control>
          <Input type="email" placeholder="taken@example.com 으로 테스트" />
        </Form.Control>
        <EmailStatusIndicator />
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

      <Button type="submit">가입</Button>
    </Form>
  );
}
