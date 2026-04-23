// Standard Schema v1 최소 타입 — https://standardschema.dev 스펙과 동일
export interface StandardSchemaPathSegment {
  readonly key: PropertyKey;
}
export type StandardSchemaPath = ReadonlyArray<PropertyKey | StandardSchemaPathSegment>;
export interface StandardSchemaIssue {
  readonly message: string;
  readonly path?: StandardSchemaPath;
}
export interface StandardSchemaV1<TInput = unknown, TOutput = TInput> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown
    ) =>
      | { value: TOutput }
      | { issues: ReadonlyArray<StandardSchemaIssue> }
      | Promise<{ value: TOutput } | { issues: ReadonlyArray<StandardSchemaIssue> }>;
  };
}

export type ErrorSource = "html5" | "validate" | "schema";

export interface FieldError {
  message: string;
  type?: string;
  source: ErrorSource;
}

export interface FieldState {
  value: unknown;
  error: FieldError | undefined;
  errors: FieldError[];
  touched: boolean;
  isValidating: boolean;
  hasError: boolean;
}

export type ValidateOn = "submit" | "blur" | "change";

export type FieldValidate =
  | ((value: unknown, values: unknown) => string | undefined | Promise<string | undefined>)
  | {
      fn: (value: unknown, values: unknown) => string | undefined | Promise<string | undefined>;
      debounce?: number;
    };

export interface FieldConfig {
  validate?: FieldValidate;
  validateOn?: ValidateOn;
  stepId?: string;
  sectionPath?: string;
  required?: boolean;
}

export interface SubmitHelpers<T> {
  reset: (defaults?: Partial<T>) => void;
  setError: (path: string, message: string) => void;
}

export interface FormStoreState {
  values: Record<string, unknown>;
  errors: Record<string, FieldError | undefined>;
  touched: Record<string, boolean>;
  submitting: boolean;
  submitCount: number;
  activeStepId: string | null;
  fieldsByStep: Map<string, Set<string>>;
  fieldsBySection: Map<string, Set<string>>;
  fieldValidators: Map<string, FieldConfig>;
  sectionSchemas: Map<string, StandardSchemaV1>;
  validatingFields: Set<string>;
  revalidateOnChange: Set<string>;
}

export interface FormConfig<T> {
  schema?: StandardSchemaV1<T>;
  validateOn: ValidateOn;
  onSubmit?: (values: T, helpers: SubmitHelpers<T>) => void | Promise<void>;
  onInvalid?: (errors: Record<string, FieldError>) => void;
  scrollToFirstError: boolean;
  focusFirstError: boolean;
}

export interface FormStore<T = unknown> {
  subscribe(listener: () => void): () => void;
  getState(): FormStoreState;
  getFieldState(path: string): FieldState;
  setFieldValue(path: string, value: unknown): void;
  setFieldTouched(path: string, touched: boolean): void;
  registerField(path: string, config: FieldConfig): () => void;
  registerStep(stepId: string, onActivate?: (active: boolean) => void): () => void;
  setActiveStep(stepId: string | null): void;
  registerSectionSchema(sectionPath: string, schema: StandardSchemaV1): () => void;
  validateField(path: string): Promise<boolean>;
  validateStep(stepId: string): Promise<boolean>;
  validateAll(): Promise<boolean>;
  getValues<S = T>(scope?: string): S;
  submit(): Promise<void>;
  reset(defaults?: Partial<T>): void;
  setError(path: string, message: string): void;
  _config: FormConfig<T>;
}
