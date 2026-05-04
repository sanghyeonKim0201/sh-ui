"use client";

import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** 이미 가입된 이메일 시뮬레이션 */
const simulateSignup = async (email: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (email === "taken@example.com") {
    throw new Error("이미 가입된 이메일입니다");
  }
};

export function ServerErrorDemo() {
  return (
    <Form
      defaultValues={{ email: "", name: "" }}
      onSubmit={async (values, { setError }) => {
        try {
          await simulateSignup(String(values.email));
          alert("가입 완료! " + JSON.stringify(values));
        } catch (e) {
          setError("email", (e as Error).message);
        }
      }}
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
        <Form.Description>
          <code>taken@example.com</code>으로 서버 에러를 테스트하세요
        </Form.Description>
        <Form.Control>
          <Input type="email" placeholder="taken@example.com" />
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

      <Button type="submit">가입하기</Button>
    </Form>
  );
}
