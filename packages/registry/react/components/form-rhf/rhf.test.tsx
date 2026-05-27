import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Form } from "../form";
import { Field } from "../form/field";
import { FormControl, FormError } from "../form/field";
import { adaptReactHookForm, useReactHookFormAdapter } from "./index";

function TestForm() {
  const rhf = useForm({ defaultValues: { email: "" }, mode: "onBlur" });
  const form = adaptReactHookForm(rhf);
  return (
    <Form form={form}>
      <Field name="email" validate={(v) => (String(v).includes("@") ? undefined : "bad")}>
        <FormControl><input data-testid="i" /></FormControl>
        <FormError />
      </Field>
      <button type="submit">go</button>
    </Form>
  );
}

describe("adaptReactHookForm", () => {
  it("value change via Form.Control updates RHF state", async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "a@b.com");
    expect(input.value).toBe("a@b.com");
  });

  it("validation error from sh-ui validate shows under field", async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "nope");
    input.blur();
    await screen.findByText("bad");
  });
});

// ─────────────────────────────────────────────
// useReactHookFormAdapter — v0.114+ (안정화 hook)
// ─────────────────────────────────────────────
describe("useReactHookFormAdapter", () => {
  it("returns same store instance across re-renders", () => {
    const stores: any[] = [];
    function Probe() {
      const rhf = useForm({ defaultValues: { x: "" } });
      const form = useReactHookFormAdapter(rhf);
      stores.push(form);
      const [, force] = React.useReducer((s: number) => s + 1, 0);
      return <button onClick={force as any} data-testid="rerender">rerender</button>;
    }
    const { getByTestId } = render(<Probe />);
    // 강제 re-render 3회
    for (let i = 0; i < 3; i++) {
      getByTestId("rerender").click();
    }
    // 최초 + re-render 들 모두 같은 인스턴스
    expect(stores.length).toBeGreaterThanOrEqual(2);
    for (const s of stores) {
      expect(s).toBe(stores[0]);
    }
  });

  it("works with render prop and propagates value through RHF", async () => {
    const user = userEvent.setup();
    function HookForm() {
      const rhf = useForm({ defaultValues: { email: "" }, mode: "onBlur" });
      const form = useReactHookFormAdapter(rhf);
      return (
        <Form form={form}>
          <Field name="email">
            {(field) => (
              <input
                data-testid="i"
                value={(field.value as string) ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </Field>
        </Form>
      );
    }
    render(<HookForm />);
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "kim@studio");
    expect(input.value).toBe("kim@studio");
  });
});
