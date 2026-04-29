"use client";

import { Form, useFormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const COLORS = [
  { value: "red", label: "빨강", bg: "#ef4444" },
  { value: "blue", label: "파랑", bg: "#3b82f6" },
  { value: "green", label: "초록", bg: "#22c55e" },
];

interface ColorSwatchGroupProps {
  value: unknown;
  onChange: (v: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

function ColorSwatchGroup({ value, onChange, id, "aria-describedby": ariaDescribedby }: ColorSwatchGroupProps) {
  return (
    <div
      role="radiogroup"
      id={id}
      aria-describedby={ariaDescribedby}
      style={{ display: "flex", gap: "var(--space-2)" }}
    >
      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          aria-label={c.label}
          onClick={() => {
            const syntheticEvent = {
              target: { value: c.value },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: c.bg,
            border: value === c.value ? "3px solid var(--color-foreground)" : "2px solid transparent",
            outline: value === c.value ? "2px solid var(--color-ring)" : "none",
            outlineOffset: 2,
            cursor: "pointer",
            transition: "outline 150ms, border 150ms",
          }}
        />
      ))}
    </div>
  );
}

function CharCountField() {
  const { value } = useFormField("bio");
  const text = String(value ?? "");
  const MAX = 100;
  return (
    <span
      style={{
        fontSize: "0.75rem",
        color: text.length > MAX ? "var(--color-danger)" : "var(--color-muted-foreground)",
        alignSelf: "flex-end",
      }}
    >
      {text.length} / {MAX}
    </span>
  );
}

export function CustomControlDemo() {
  return (
    <Form
      defaultValues={{ favoriteColor: "", bio: "" }}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      {/* render prop: 완전 커스텀 컨트롤 */}
      <Form.Field
        name="favoriteColor"
        validate={(v) => (v ? undefined : "색상을 선택하세요")}
      >
        <Form.Label>좋아하는 색상</Form.Label>
        <Form.Control
          render={(ctrl) => (
            <ColorSwatchGroup
              id={ctrl.id}
              value={ctrl.value}
              onChange={(e) => ctrl.onChange(e)}
              aria-describedby={ctrl["aria-describedby"]}
              aria-invalid={ctrl["aria-invalid"]}
            />
          )}
        />
        <Form.Error />
      </Form.Field>

      {/* useFormField로 외부에서 상태 읽기 */}
      <Form.Field
        name="bio"
        validate={(v) =>
          String(v ?? "").length > 100 ? "100자 이내로 입력하세요" : undefined
        }
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Form.Label>자기소개</Form.Label>
          <CharCountField />
        </div>
        <Form.Control>
          <textarea
            rows={3}
            placeholder="100자 이내로 소개를 작성하세요"
            style={{
              width: "100%",
              resize: "vertical",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              padding: "var(--space-2) var(--space-3)",
              fontSize: "0.875rem",
              fontFamily: "inherit",
              background: "var(--color-background)",
              color: "var(--color-foreground)",
              boxSizing: "border-box",
            }}
          />
        </Form.Control>
        <Form.Error />
      </Form.Field>

      <Button type="submit">저장</Button>
    </Form>
  );
}
