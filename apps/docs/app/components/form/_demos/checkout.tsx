"use client";

import { Form, useFormSection } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SectionHeader({ sectionName, title }: { sectionName: string; title: string }) {
  const { hasError } = useFormSection(sectionName);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
      <h3 style={{ margin: 0, fontSize: "1rem" }}>{title}</h3>
      {hasError && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "var(--color-danger)",
            display: "inline-block",
          }}
          aria-label="입력 오류 있음"
        />
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-4)",
  marginBottom: "var(--space-3)",
};

const fieldGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
};

export function CheckoutFormDemo() {
  return (
    <Form
      defaultValues={{
        shipping: { name: "", address: "" },
        billing: { name: "", address: "" },
        payment: { cardNumber: "", expiry: "" },
      }}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{ width: "100%", maxWidth: 460 }}
    >
      {/* 배송 정보 */}
      <Form.Section name="shipping" style={cardStyle}>
        <SectionHeader sectionName="shipping" title="배송 정보" />
        <div style={fieldGroupStyle}>
          <Form.Field
            name="shipping.name"
            validate={(v) => (v ? undefined : "수령인 이름을 입력하세요")}
          >
            <Form.Label>수령인</Form.Label>
            <Form.Control>
              <Input placeholder="홍길동" />
            </Form.Control>
            <Form.Error />
          </Form.Field>
          <Form.Field
            name="shipping.address"
            validate={(v) => (v ? undefined : "배송 주소를 입력하세요")}
          >
            <Form.Label>주소</Form.Label>
            <Form.Control>
              <Input placeholder="서울시 강남구 …" />
            </Form.Control>
            <Form.Error />
          </Form.Field>
        </div>
      </Form.Section>

      {/* 청구 정보 */}
      <Form.Section name="billing" style={cardStyle}>
        <SectionHeader sectionName="billing" title="청구 정보" />
        <div style={fieldGroupStyle}>
          <Form.Field
            name="billing.name"
            validate={(v) => (v ? undefined : "청구인 이름을 입력하세요")}
          >
            <Form.Label>청구인</Form.Label>
            <Form.Control>
              <Input placeholder="홍길동" />
            </Form.Control>
            <Form.Error />
          </Form.Field>
          <Form.Field
            name="billing.address"
            validate={(v) => (v ? undefined : "청구 주소를 입력하세요")}
          >
            <Form.Label>주소</Form.Label>
            <Form.Control>
              <Input placeholder="서울시 강남구 …" />
            </Form.Control>
            <Form.Error />
          </Form.Field>
        </div>
      </Form.Section>

      {/* 결제 정보 */}
      <Form.Section name="payment" style={cardStyle}>
        <SectionHeader sectionName="payment" title="결제 정보" />
        <div style={fieldGroupStyle}>
          <Form.Field
            name="payment.cardNumber"
            validate={(v) =>
              String(v).replace(/\s/g, "").length === 16
                ? undefined
                : "카드 번호 16자리를 입력하세요"
            }
          >
            <Form.Label>카드 번호</Form.Label>
            <Form.Control>
              <Input placeholder="0000 0000 0000 0000" />
            </Form.Control>
            <Form.Error />
          </Form.Field>
          <Form.Field
            name="payment.expiry"
            validate={(v) =>
              /^\d{2}\/\d{2}$/.test(String(v)) ? undefined : "MM/YY 형식으로 입력하세요"
            }
          >
            <Form.Label>유효기간</Form.Label>
            <Form.Control>
              <Input placeholder="MM/YY" />
            </Form.Control>
            <Form.Error />
          </Form.Field>
        </div>
      </Form.Section>

      <Button type="submit" style={{ width: "100%" }}>
        결제하기
      </Button>
    </Form>
  );
}
