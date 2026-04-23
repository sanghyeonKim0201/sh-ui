"use client";

import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** 재사용 주소 블록 — Form 루트 없이 Section + Field 만 사용. */
function AddressFields({ namePrefix, legend }: { namePrefix: string; legend: string }) {
  return (
    <Form.Section name={namePrefix}>
      <Form.SectionTitle style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "var(--space-2)" }}>
        {legend}
      </Form.SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <Form.Field
          name={`${namePrefix}.name`}
          validate={(v) => (v ? undefined : "이름을 입력하세요")}
        >
          <Form.Label>이름</Form.Label>
          <Form.Control>
            <Input placeholder="홍길동" />
          </Form.Control>
          <Form.Error />
        </Form.Field>
        <Form.Field
          name={`${namePrefix}.city`}
          validate={(v) => (v ? undefined : "도시를 입력하세요")}
        >
          <Form.Label>도시</Form.Label>
          <Form.Control>
            <Input placeholder="서울" />
          </Form.Control>
          <Form.Error />
        </Form.Field>
        <Form.Field
          name={`${namePrefix}.zip`}
          validate={(v) =>
            /^\d{5}$/.test(String(v)) ? undefined : "우편번호 5자리를 입력하세요"
          }
        >
          <Form.Label>우편번호</Form.Label>
          <Form.Control>
            <Input placeholder="12345" inputMode="numeric" />
          </Form.Control>
          <Form.Error />
        </Form.Field>
      </div>
    </Form.Section>
  );
}

export function ReusableFieldsDemo() {
  return (
    <Form
      defaultValues={{
        shipping: { name: "", city: "", zip: "" },
        billing: { name: "", city: "", zip: "" },
      }}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      <AddressFields namePrefix="shipping" legend="배송지 주소" />
      <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: 0 }} />
      <AddressFields namePrefix="billing" legend="청구지 주소" />
      <Button type="submit">저장</Button>
    </Form>
  );
}
