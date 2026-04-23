import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { Form } from "./form";
import { useFormContext, FormContext } from "./context";

function Probe({ onReady }: { onReady: (store: any) => void }) {
  const store = useFormContext();
  React.useEffect(() => {
    onReady(store);
  }, []);
  return null;
}

describe("Form root", () => {
  it("renders a <form> element", () => {
    const { container } = render(
      <Form>
        <button type="submit">go</button>
      </Form>
    );
    expect(container.querySelector("form")).toBeTruthy();
  });

  it("provides FormStore via context", () => {
    const onReady = vi.fn();
    render(
      <Form>
        <Probe onReady={onReady} />
      </Form>
    );
    expect(onReady).toHaveBeenCalled();
    expect(typeof onReady.mock.calls[0][0].subscribe).toBe("function");
  });

  it("accepts external form prop", async () => {
    const { useShUiForm } = await import("./use-sh-ui-form");
    let captured: any = null;
    const probe = (s: any) => {
      captured = s;
    };
    function Wrapper() {
      const store = useShUiForm({ defaultValues: { a: 1 } });
      return (
        <Form form={store}>
          <Probe onReady={probe} />
        </Form>
      );
    }
    render(<Wrapper />);
    expect(captured).not.toBeNull();
    expect(captured.getFieldState("a").value).toBe(1);
  });

  it("throws in dev mode when nested", () => {
    const originalError = console.error;
    console.error = vi.fn();
    expect(() => {
      render(
        <Form>
          <Form>
            <div />
          </Form>
        </Form>
      );
    }).toThrow(/cannot be nested/i);
    console.error = originalError;
  });

  it("focuses first errored field after submit", async () => {
    const { screen } = await import("@testing-library/react");
    const userEvent = (await import("@testing-library/user-event")).default;
    const { Field } = await import("./field");
    const { FormControl } = await import("./field");

    const user = userEvent.setup();
    render(
      <Form>
        <Field name="a" validate={(v) => (v ? undefined : "req")}>
          <FormControl>
            <input data-testid="a" />
          </FormControl>
        </Field>
        <Field name="b" validate={(v) => (v ? undefined : "req")}>
          <FormControl>
            <input data-testid="b" />
          </FormControl>
        </Field>
        <button type="submit">go</button>
      </Form>
    );
    await user.click(screen.getByText("go"));
    await new Promise((r) => setTimeout(r, 50));
    expect(document.activeElement).toBe(screen.getByTestId("a"));
  });
});

describe("Form-level states", () => {
  it("sets aria-busy while submitting", async () => {
    const { screen } = await import("@testing-library/react");
    const userEvent = (await import("@testing-library/user-event")).default;
    const { Field } = await import("./field");
    const { FormControl } = await import("./field");

    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const blocker = new Promise<void>((r) => (resolveSubmit = r));

    render(
      <Form
        onSubmit={async () => {
          await blocker;
        }}
      >
        <Field name="x" validate={() => undefined}>
          <FormControl>
            <input />
          </FormControl>
        </Field>
        <button type="submit">go</button>
      </Form>
    );
    const form = document.querySelector("form")!;
    await user.click(screen.getByText("go"));
    await new Promise((r) => setTimeout(r, 30));
    expect(form.getAttribute("aria-busy")).toBe("true");
    resolveSubmit!();
  });

  it("Form disabled disables all controls", async () => {
    const { screen } = await import("@testing-library/react");
    const { Field } = await import("./field");
    const { FormControl } = await import("./field");

    render(
      <Form disabled>
        <Field name="x">
          <FormControl>
            <input data-testid="i" />
          </FormControl>
        </Field>
      </Form>
    );
    expect((screen.getByTestId("i") as HTMLInputElement).disabled).toBe(true);
  });
});
