import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { Form } from "./form";
import { Field } from "./field";
import { FormControl } from "./field";
import { Steps, Step, useFormSteps } from "./steps";

function Nav() {
  const { next, prev, activeStepId, isLastStep } = useFormSteps();
  return (
    <>
      <span data-testid="active">{activeStepId}</span>
      <button onClick={prev} type="button">prev</button>
      <button onClick={() => void next()} type="button">
        {isLastStep ? "done" : "next"}
      </button>
    </>
  );
}

describe("Form.Steps", () => {
  it("renders only active step", () => {
    render(
      <Form>
        <Steps defaultStep="a">
          <Step id="a"><div data-testid="a">A</div></Step>
          <Step id="b"><div data-testid="b">B</div></Step>
        </Steps>
      </Form>
    );
    expect(screen.queryByTestId("a")).toBeInTheDocument();
    expect(screen.queryByTestId("b")).not.toBeInTheDocument();
  });

  it("next() moves to next step when current is valid", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Steps defaultStep="a">
          <Step id="a"><div data-testid="a">A</div></Step>
          <Step id="b"><div data-testid="b">B</div></Step>
        </Steps>
        <Nav />
      </Form>
    );
    await user.click(screen.getByText("next"));
    expect(screen.getByTestId("active").textContent).toBe("b");
    expect(screen.queryByTestId("b")).toBeInTheDocument();
  });

  it("next() blocks when current step has invalid fields", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Steps defaultStep="a">
          <Step id="a">
            <Field name="email" validate={(v) => (v ? undefined : "required")}>
              <FormControl><input data-testid="i" /></FormControl>
            </Field>
          </Step>
          <Step id="b"><div data-testid="b">B</div></Step>
        </Steps>
        <Nav />
      </Form>
    );
    await user.click(screen.getByText("next"));
    expect(screen.getByTestId("active").textContent).toBe("a");
  });
});

describe("value persistence across step navigation", () => {
  it("keeps value when navigating away and back", async () => {
    const user = userEvent.setup();
    render(
      <Form defaultValues={{ email: "" }}>
        <Steps defaultStep="a">
          <Step id="a">
            <Field name="email">
              <FormControl><input data-testid="i" /></FormControl>
            </Field>
          </Step>
          <Step id="b"><div>B</div></Step>
        </Steps>
        <Nav />
      </Form>
    );
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "a@b.com");
    await user.click(screen.getByText("next"));
    await user.click(screen.getByText("prev"));
    expect((screen.getByTestId("i") as HTMLInputElement).value).toBe("a@b.com");
  });
});
