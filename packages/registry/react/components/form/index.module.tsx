"use client";

import styles from "./styles.module.css";
import { Form as FormRoot, Section, SectionTitle } from "./form";
import {
  Field,
  FormLabel,
  FormDescription,
  FormError,
  FormControl,
} from "./field";
import { Steps, Step } from "./steps";

/**
 * sh-ui Form의 compound 진입점. `Form.Field`, `Form.Label`, `Form.Description`,
 * `Form.Error`, `Form.Control`, `Form.Section`, `Form.SectionTitle`, `Form.Steps`, `Form.Step` 으로
 * 구조를 조립한다. 검증은 Standard Schema(yup/zod 등) 또는 inline 함수로 부착한다.
 */
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
