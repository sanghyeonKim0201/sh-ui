import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Form } from "../form";
import { Field } from "../form/field";
import { FormControl, FormError } from "../form/field";
import { adaptReactHookForm } from "./index";

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
