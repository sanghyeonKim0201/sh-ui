"use client";

import "./styles.css";
import { Form as FormRoot, Section, SectionTitle } from "./form";
import {
  Field,
  FormLabel,
  FormDescription,
  FormError,
  FormControl,
} from "./field";
import { Steps, Step } from "./steps";

type FormType = typeof FormRoot & {
  Section: typeof Section;
  SectionTitle: typeof SectionTitle;
  Field: typeof Field;
  Label: typeof FormLabel;
  Description: typeof FormDescription;
  Error: typeof FormError;
  Control: typeof FormControl;
  Steps: typeof Steps;
  Step: typeof Step;
};

const Form = FormRoot as FormType;
Form.Section = Section;
Form.SectionTitle = SectionTitle;
Form.Field = Field;
Form.Label = FormLabel;
Form.Description = FormDescription;
Form.Error = FormError;
Form.Control = FormControl;
Form.Steps = Steps;
Form.Step = Step;

export { Form };
export { useShUiForm } from "./use-sh-ui-form";
export {
  useFormContext,
  useFormField,
  useFormSection,
  useFormState,
} from "./context";
export { useFormSteps } from "./steps";
export { createFormStore } from "./store";
export type {
  FormStore,
  FormStoreState,
  FieldState,
  FieldError,
  FieldConfig,
  FieldValidate,
  ValidateOn,
  StandardSchemaV1,
} from "./types";
