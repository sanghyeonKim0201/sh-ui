"use client";

import * as React from "react";
import { FormContext, FieldContext, SectionContext, StepContext, DisabledContext, useFormField } from "./context";
import type { FieldValidate, ValidateOn } from "./types";
import { scopedPath } from "./utils";

const fieldClass = "flex flex-col gap-[var(--space-1,0.25rem)] data-[disabled]:opacity-60 data-[disabled]:pointer-events-none";
const errorClass = "text-[var(--color-danger,#dc2626)] text-[length:var(--text-sm,0.875rem)] m-0 animate-[sh-ui-form-error-in_150ms_var(--easing-out,cubic-bezier(0.16,1,0.3,1))] motion-reduce:[animation-duration:0.01ms]";

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  name: string;
  validate?: FieldValidate;
  validateOn?: ValidateOn;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  children?: React.ReactNode;
}

export function Field({ name, validate, validateOn, required, disabled, readOnly, className, children, ...rest }: FieldProps) {
  const store = React.useContext(FormContext);
  if (!store) throw new Error("<Form.Field> must be inside <Form>");

  const section = React.useContext(SectionContext);
  const step = React.useContext(StepContext);
  const formDisabled = React.useContext(DisabledContext);
  const path = scopedPath(section.path, name);

  const id = React.useId();
  const descId = `${id}-desc`;
  const errorId = `${id}-error`;

  React.useEffect(() => {
    return store.registerField(path, {
      validate, validateOn, stepId: step.id ?? undefined,
      sectionPath: section.path || undefined, required,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, path]);

  const effectiveDisabled = disabled || formDisabled;

  return (
    <FieldContext.Provider value={{ path, id, descId, errorId, disabled: effectiveDisabled, readOnly, required }}>
      <div
        className={`${fieldClass}${className ? ` ${className}` : ""}`}
        data-disabled={effectiveDisabled || undefined}
        data-readonly={readOnly || undefined}
        {...rest}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(FieldContext);
    if (!ctx) throw new Error("<Form.Label> must be inside <Form.Field>");
    return <label ref={ref} htmlFor={ctx.id} className={className} {...props} />;
  },
);
FormLabel.displayName = "Form.Label";

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(FieldContext);
    if (!ctx) throw new Error("<Form.Description> must be inside <Form.Field>");
    return <p ref={ref} id={ctx.descId} className={className} {...props} />;
  },
);
FormDescription.displayName = "Form.Description";

export interface FormErrorProps extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "children"> {
  children?: React.ReactNode | ((err: { message: string; type?: string }) => React.ReactNode);
  matches?: string;
}

export function FormError({ children, matches, className, ...rest }: FormErrorProps) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Error> must be inside <Form.Field>");
  const field = useFormField(ctx.path);

  const err = field.error;
  if (!err) return null;
  if (matches && err.type !== matches) return null;

  const content = typeof children === "function"
    ? (children as (e: { message: string; type?: string }) => React.ReactNode)(err)
    : children ?? err.message;

  return (
    <p
      id={ctx.errorId}
      className={`${errorClass}${className ? ` ${className}` : ""}`}
      role="alert"
      aria-live="polite"
      {...rest}
    >
      {content}
    </p>
  );
}

export interface ControlProps {
  id: string; name: string;
  value?: unknown; checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: () => void;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-required"?: true;
  disabled?: boolean; readOnly?: boolean; required?: boolean;
}

export interface FormControlProps {
  children?: React.ReactElement;
  valueAs?: "value" | "checked";
  render?: (ctrl: ControlProps) => React.ReactElement;
}

export function FormControl({ children, valueAs = "value", render }: FormControlProps) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Control> must be inside <Form.Field>");
  const store = React.useContext(FormContext)!;
  const field = useFormField(ctx.path);

  const describedBy = [ctx.descId, field.hasError ? ctx.errorId : null].filter(Boolean).join(" ") || undefined;

  const ctrl: ControlProps = {
    id: ctx.id, name: ctx.path,
    onChange: (e) => {
      const target = e.target as HTMLInputElement;
      const next = valueAs === "checked" ? target.checked : target.value;
      store.setFieldValue(ctx.path, next);
      if (store.getState().revalidateOnChange.has(ctx.path)) void store.validateField(ctx.path);
    },
    onBlur: () => {
      store.setFieldTouched(ctx.path, true);
      void store.validateField(ctx.path);
    },
    "aria-describedby": describedBy,
    disabled: ctx.disabled, readOnly: ctx.readOnly, required: ctx.required,
  };

  if (field.hasError) ctrl["aria-invalid"] = true;
  if (ctx.required) ctrl["aria-required"] = true;

  if (valueAs === "checked") ctrl.checked = Boolean(field.value);
  else ctrl.value = field.value ?? "";

  if (render) return render(ctrl);
  if (!children) return null;
  const child = React.Children.only(children);
  return React.cloneElement(child, ctrl as unknown as Record<string, unknown>);
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-form]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-form", "");
  style.textContent = `@keyframes sh-ui-form-error-in { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }`;
  document.head.appendChild(style);
}
