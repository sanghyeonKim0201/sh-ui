"use client";

import * as React from "react";
import { createFormStore, type CreateFormStoreOptions } from "./store";
import { FormContext, SectionContext, DisabledContext, useFormState } from "./context";
import type { FormStore, StandardSchemaV1 } from "./types";
import { scopedPath } from "./utils";
import { focusFirstError } from "./focus-first-error";

export interface FormProps<T = unknown>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onInvalid"> {
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

const formClass = "flex flex-col gap-[var(--space-4,1rem)]";

function FormInner<T>({
  form: externalForm, defaultValues, schema, validateOn, onSubmit, onInvalid,
  scrollToFirstError, focusFirstError: focusFirstErrorProp, disabled, children, ...rest
}: FormProps<T>) {
  const parent = React.useContext(FormContext);
  if (process.env.NODE_ENV !== "production" && parent) {
    throw new Error("<Form> cannot be nested. For reusable field groups, use <Form.Section>-based components without a Form root.");
  }

  const internalStoreRef = React.useRef<FormStore<T> | null>(null);
  if (!externalForm && !internalStoreRef.current) {
    internalStoreRef.current = createFormStore<T>({
      defaultValues, schema, validateOn, onSubmit, onInvalid,
      scrollToFirstError, focusFirstError: focusFirstErrorProp,
    });
  }
  const store = (externalForm ?? internalStoreRef.current) as FormStore<T>;
  const formElRef = React.useRef<HTMLFormElement | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    void (async () => {
      await store.submit();
      const s = store.getState();
      const hasErrors = Object.values(s.errors).some(Boolean);
      if (hasErrors && store._config.focusFirstError && formElRef.current) {
        focusFirstError(store as unknown as FormStore<unknown>, formElRef.current, store._config.scrollToFirstError);
      }
    })();
  };

  return (
    <FormContext.Provider value={store as unknown as FormStore<unknown>}>
      <DisabledContext.Provider value={disabled ?? false}>
        <FormElement formElRef={formElRef} onSubmit={handleSubmit} noValidate {...rest}>
          {children}
        </FormElement>
      </DisabledContext.Provider>
    </FormContext.Provider>
  );
}

function FormElement({ formElRef, children, onSubmit, className, ...rest }: {
  formElRef: React.RefObject<HTMLFormElement | null>;
  children?: React.ReactNode;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit">) {
  const state = useFormState();
  return (
    <form
      ref={formElRef}
      aria-busy={state.submitting || undefined}
      onSubmit={onSubmit}
      className={`${formClass}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </form>
  );
}

export interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  name?: string;
  schema?: StandardSchemaV1;
  as?: "div" | "fieldset";
}

const sectionClass = "flex flex-col gap-[var(--space-4,1rem)]";

function Section({ name, schema, as = "div", className, children, ...rest }: FormSectionProps) {
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
      <Tag role={role} className={`${sectionClass}${className ? ` ${className}` : ""}`} {...rest}>
        {children}
      </Tag>
    </SectionContext.Provider>
  );
}

function SectionTitle({ children, ...rest }: React.HTMLAttributes<HTMLElement>) {
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
