"use client";

import * as React from "react";
import { createFormStore, type CreateFormStoreOptions } from "./store";
import {
  FormContext,
  SectionContext,
  DisabledContext,
} from "./context";
import type { FormStore, StandardSchemaV1 } from "./types";
import { scopedPath } from "./utils";

export interface FormProps<T = unknown>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  form?: FormStore<T>;
  defaultValues?: CreateFormStoreOptions<T>["defaultValues"];
  schema?: CreateFormStoreOptions<T>["schema"];
  validateOn?: CreateFormStoreOptions<T>["validateOn"];
  onSubmit?: CreateFormStoreOptions<T>["onSubmit"];
  onInvalid?: CreateFormStoreOptions<T>["onInvalid"];
  scrollToFirstError?: boolean;
  focusFirstError?: boolean;
  disabled?: boolean;
}

function FormInner<T>({
  form: externalForm,
  defaultValues,
  schema,
  validateOn,
  onSubmit,
  onInvalid,
  scrollToFirstError,
  focusFirstError,
  disabled,
  children,
  ...rest
}: FormProps<T>) {
  const parent = React.useContext(FormContext);
  if (process.env.NODE_ENV !== "production" && parent) {
    throw new Error(
      "<Form> cannot be nested. For reusable field groups, use <Form.Section>-based components without a Form root."
    );
  }

  const internalStoreRef = React.useRef<FormStore<T> | null>(null);
  if (!externalForm && !internalStoreRef.current) {
    internalStoreRef.current = createFormStore<T>({
      defaultValues,
      schema,
      validateOn,
      onSubmit,
      onInvalid,
      scrollToFirstError,
      focusFirstError,
    });
  }
  const store = (externalForm ?? internalStoreRef.current) as FormStore<T>;

  return (
    <FormContext.Provider value={store as FormStore<unknown>}>
      <DisabledContext.Provider value={disabled ?? false}>
        <form
          noValidate
          {...rest}
          onSubmit={(e) => {
            e.preventDefault();
            void store.submit();
          }}
        >
          {children}
        </form>
      </DisabledContext.Provider>
    </FormContext.Provider>
  );
}

export interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  name?: string;
  schema?: StandardSchemaV1;
  as?: "div" | "fieldset";
}

function Section({
  name,
  schema,
  as = "div",
  children,
  ...rest
}: FormSectionProps) {
  const parent = React.useContext(SectionContext);
  const store = React.useContext(FormContext);
  const path = scopedPath(parent.path, name);

  React.useEffect(() => {
    if (!schema || !store || !path) return;
    return store.registerSectionSchema(path, schema);
  }, [schema, store, path]);

  const Tag = as as any;
  const role = as === "div" ? "group" : undefined;

  return (
    <SectionContext.Provider value={{ path }}>
      <Tag role={role} {...rest}>
        {children}
      </Tag>
    </SectionContext.Provider>
  );
}

function SectionTitle({
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return <legend {...rest}>{children}</legend>;
}

type FormType = typeof FormInner & {
  Section: typeof Section;
  SectionTitle: typeof SectionTitle;
};

export const Form = FormInner as unknown as FormType;
Form.Section = Section;
Form.SectionTitle = SectionTitle;

export { Section, SectionTitle };
