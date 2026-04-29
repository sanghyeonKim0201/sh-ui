"use client";

import * as yup from "yup";
import { Form } from "@/components/ui/form";
import { yupSchema } from "@/components/ui/form-yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = yupSchema(
  yup.object({
    username: yup.string().required("사용자명을 입력하세요").min(2, "2자 이상 입력하세요"),
    email: yup.string().required("이메일을 입력하세요").email("이메일 형식이 아닙니다"),
    website: yup.string().url("올바른 URL을 입력하세요").optional(),
  })
);

export function YupSchemaDemo() {
  return (
    <Form
      schema={schema}
      defaultValues={{ username: "", email: "", website: "" }}
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

      <Form.Field name="website">
        <Form.Label>웹사이트 (선택)</Form.Label>
        <Form.Control>
          <Input type="url" placeholder="https://example.com" />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Button type="submit">저장</Button>
    </Form>
  );
}
