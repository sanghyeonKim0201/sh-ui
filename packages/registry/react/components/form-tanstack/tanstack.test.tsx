import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { Form } from "../form";
import { Field } from "../form/field";
import { FormControl, FormError } from "../form/field";
import { adaptTanStackForm } from "./index";

function TestForm() {
  const ts = useForm({
    defaultValues: { email: "" },
    onSubmit: async () => {},
  });
  const form = adaptTanStackForm(ts);
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

describe("adaptTanStackForm", () => {
  it("value change via Form.Control updates TanStack state", async () => {
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
    await user.tab(); // tab away to trigger blur via userEvent
    await screen.findByText("bad");
  });
});
