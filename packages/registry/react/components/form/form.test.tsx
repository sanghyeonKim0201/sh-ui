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
});
