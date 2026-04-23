import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Form } from "./form";
import { FormContext } from "./context";

describe("Form.Section", () => {
  it("renders as role=group by default", () => {
    render(
      <Form>
        <Form.Section name="profile" aria-labelledby="p-title">
          <h2 id="p-title">Profile</h2>
        </Form.Section>
      </Form>
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("renders as fieldset when as=fieldset", () => {
    const { container } = render(
      <Form>
        <Form.Section name="x" as="fieldset">
          <Form.SectionTitle>Title</Form.SectionTitle>
        </Form.Section>
      </Form>
    );
    expect(container.querySelector("fieldset")).toBeTruthy();
    expect(container.querySelector("legend")?.textContent).toBe("Title");
  });

  it("registers section schema when provided", async () => {
    const schema = {
      "~standard": {
        version: 1 as const,
        vendor: "test",
        validate: (_v: unknown) => ({ issues: [{ path: ["x"], message: "bad" }] }),
      },
    };

    let captured: any = null;
    function Probe() {
      const store = React.useContext(FormContext);
      captured = store;
      return null;
    }

    render(
      <Form>
        <Form.Section name="profile" schema={schema}>
          <Probe />
        </Form.Section>
      </Form>
    );

    // schema should be registered under "profile"
    expect(captured.getState().sectionSchemas.has("profile")).toBe(true);
  });
});
