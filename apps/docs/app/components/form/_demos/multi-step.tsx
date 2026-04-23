"use client";

import { Form, useFormSteps, useFormContext } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function StepNavButtons() {
  const { isFirstStep, isLastStep, next, prev, activeStepId } = useFormSteps();

  return (
    <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
      {!isFirstStep && (
        <Button type="button" variant="secondary" onClick={prev}>
          이전
        </Button>
      )}
      <Button
        type="button"
        onClick={() => {
          void next();
        }}
      >
        {isLastStep ? "완료" : "다음"}
      </Button>
    </div>
  );
}

function ReviewStep() {
  const store = useFormContext<{ email: string; name: string; bio: string }>();
  const values = store.getValues();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <p style={{ margin: 0 }}>
        <strong>이메일:</strong> {values.email || "—"}
      </p>
      <p style={{ margin: 0 }}>
        <strong>이름:</strong> {values.name || "—"}
      </p>
      <p style={{ margin: 0 }}>
        <strong>소개:</strong> {values.bio || "—"}
      </p>
    </div>
  );
}

export function MultiStepFormDemo() {
  return (
    <Form
      defaultValues={{ email: "", name: "", bio: "" }}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{ width: "100%", maxWidth: 400 }}
    >
      <Form.Steps style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <Form.Step id="account">
          <p style={{ margin: "0 0 var(--space-2)", fontWeight: 600 }}>1단계 — 계정 정보</p>
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
          <StepNavButtons />
        </Form.Step>

        <Form.Step id="profile">
          <p style={{ margin: "0 0 var(--space-2)", fontWeight: 600 }}>2단계 — 프로필</p>
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
          <Form.Field name="bio">
            <Form.Label>소개 (선택)</Form.Label>
            <Form.Control>
              <Input placeholder="한 줄 소개" />
            </Form.Control>
            <Form.Error />
          </Form.Field>
          <StepNavButtons />
        </Form.Step>

        <Form.Step id="review">
          <p style={{ margin: "0 0 var(--space-2)", fontWeight: 600 }}>3단계 — 확인</p>
          <ReviewStep />
          <StepNavButtons />
        </Form.Step>
      </Form.Steps>
    </Form>
  );
}
