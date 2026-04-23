import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { Form } from "./form";
import {
  Field,
  FormLabel,
  FormDescription,
  FormError,
  FormControl,
} from "./field";
import { FieldContext, FormContext } from "./context";

// ─────────────────────────────────────────────
// Form.Field
// ─────────────────────────────────────────────
describe("Form.Field", () => {
  it("registers and unregisters field by name", () => {
    let capturedStore: any = null;
    function StoreProbe() {
      const ctx = React.useContext(FormContext);
      React.useEffect(() => {
        capturedStore = ctx;
      }, [ctx]);
      return null;
    }
    const { rerender } = render(
      <Form>
        <StoreProbe />
        <Field name="email" />
      </Form>
    );
    expect(capturedStore.getState().fieldValidators.has("email")).toBe(true);
    rerender(
      <Form>
        <StoreProbe />
      </Form>
    );
    expect(capturedStore.getState().fieldValidators.has("email")).toBe(false);
  });

  it("applies section namespace to path", () => {
    let pathSeen = "";
    function Probe() {
      const ctx = React.useContext(FieldContext);
      pathSeen = ctx?.path ?? "";
      return null;
    }
    render(
      <Form>
        <Form.Section name="profile">
          <Field name="name">
            <Probe />
          </Field>
        </Form.Section>
      </Form>
    );
    expect(pathSeen).toBe("profile.name");
  });
});

// ─────────────────────────────────────────────
// Form.Label
// ─────────────────────────────────────────────
describe("Form.Label", () => {
  it("wires htmlFor to Field id", () => {
    render(
      <Form>
        <Field name="email">
          <FormLabel>Email</FormLabel>
          <input data-testid="x" />
        </Field>
      </Form>
    );
    const label = screen.getByText("Email") as HTMLLabelElement;
    expect(label.tagName).toBe("LABEL");
    expect(label.htmlFor).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// Form.Description
// ─────────────────────────────────────────────
describe("Form.Description", () => {
  it("renders with correct descId", () => {
    render(
      <Form>
        <Field name="x">
          <FormDescription>help</FormDescription>
        </Field>
      </Form>
    );
    const desc = screen.getByText("help");
    expect(desc.id).toMatch(/-desc$/);
  });
});

// ─────────────────────────────────────────────
// Form.Error
// ─────────────────────────────────────────────
describe("Form.Error", () => {
  it("does not render when no error", () => {
    render(
      <Form>
        <Field name="x">
          <FormError />
        </Field>
      </Form>
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Form.Control — value binding
// ─────────────────────────────────────────────
describe("Form.Control — value binding", () => {
  it("injects id/value/onChange and updates store on change", async () => {
    const user = userEvent.setup();
    render(
      <Form defaultValues={{ email: "" }}>
        <Field name="email">
          <FormLabel>Email</FormLabel>
          <FormControl>
            <input data-testid="i" />
          </FormControl>
        </Field>
      </Form>
    );
    const input = screen.getByTestId("i") as HTMLInputElement;
    expect(input.id).toBeTruthy();
    expect(screen.getByText("Email")).toHaveAttribute("for", input.id);
    await user.type(input, "abc");
    expect(input.value).toBe("abc");
  });

  it("includes descId in aria-describedby", () => {
    render(
      <Form>
        <Field name="x">
          <FormDescription>help</FormDescription>
          <FormControl>
            <input data-testid="i" />
          </FormControl>
        </Field>
      </Form>
    );
    const input = screen.getByTestId("i") as HTMLInputElement;
    expect(input.getAttribute("aria-describedby")).toMatch(/-desc/);
  });
});

// ─────────────────────────────────────────────
// Form.Control — checked binding
// ─────────────────────────────────────────────
describe("Form.Control — checked binding", () => {
  it("valueAs=checked with checkbox", async () => {
    const user = userEvent.setup();
    render(
      <Form defaultValues={{ agree: false }}>
        <Field name="agree">
          <FormControl valueAs="checked">
            <input type="checkbox" data-testid="cb" />
          </FormControl>
        </Field>
      </Form>
    );
    const cb = screen.getByTestId("cb") as HTMLInputElement;
    expect(cb.checked).toBe(false);
    await user.click(cb);
    expect(cb.checked).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Form.Control — render prop
// ─────────────────────────────────────────────
describe("Form.Control — render prop", () => {
  it("passes ControlProps to render callback", () => {
    render(
      <Form>
        <Field name="color">
          <FormControl
            render={(ctrl) => (
              <div
                data-testid="wrap"
                data-id={ctrl.id}
                data-name={ctrl.name}
              />
            )}
          />
        </Field>
      </Form>
    );
    const wrap = screen.getByTestId("wrap");
    expect(wrap.getAttribute("data-name")).toBe("color");
    expect(wrap.getAttribute("data-id")).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// validateOn blur → change on error
// ─────────────────────────────────────────────
describe("validateOn blur → change on error", () => {
  it("once a field errors, subsequent onChange revalidates", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Field
          name="email"
          validate={(v) =>
            String(v).includes("@") ? undefined : "bad"
          }
        >
          <FormControl>
            <input data-testid="i" />
          </FormControl>
          <FormError />
        </Field>
      </Form>
    );
    const input = screen.getByTestId("i") as HTMLInputElement;
    await user.type(input, "abc");
    input.blur();
    await screen.findByText("bad");
    await user.type(input, "@x.com");
    expect(screen.queryByText("bad")).not.toBeInTheDocument();
  });
});
