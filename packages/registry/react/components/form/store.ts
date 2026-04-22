import type {
  FormStore,
  FormStoreState,
  FormConfig,
  FieldState,
  FieldError,
  FieldConfig,
  StandardSchemaV1,
} from "./types";
import { flatten, unflatten, getByPath } from "./utils";
import { runFieldValidate, runSchema } from "./validation";

export interface CreateFormStoreOptions<T = unknown> {
  defaultValues?: Partial<T>;
  schema?: StandardSchemaV1<T>;
  validateOn?: "submit" | "blur" | "change";
  onSubmit?: FormConfig<T>["onSubmit"];
  onInvalid?: FormConfig<T>["onInvalid"];
  scrollToFirstError?: boolean;
  focusFirstError?: boolean;
}

export function createFormStore<T = unknown>(
  options: CreateFormStoreOptions<T> = {}
): FormStore<T> {
  const config: FormConfig<T> = {
    schema: options.schema,
    validateOn: options.validateOn ?? "blur",
    onSubmit: options.onSubmit,
    onInvalid: options.onInvalid,
    scrollToFirstError: options.scrollToFirstError ?? true,
    focusFirstError: options.focusFirstError ?? true,
  };

  const initialValues = options.defaultValues
    ? flatten(options.defaultValues as Record<string, unknown>)
    : {};

  let state: FormStoreState = {
    values: { ...initialValues },
    errors: {},
    touched: {},
    submitting: false,
    submitCount: 0,
    activeStepId: null,
    fieldsByStep: new Map(),
    fieldsBySection: new Map(),
    fieldValidators: new Map(),
    sectionSchemas: new Map(),
    validatingFields: new Set(),
    revalidateOnChange: new Set(),
  };

  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  const store: FormStore<T> = {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getState: () => state,

    getFieldState(path): FieldState {
      const err = state.errors[path];
      return {
        value: state.values[path],
        error: err,
        errors: err ? [err] : [],
        touched: !!state.touched[path],
        isValidating: state.validatingFields.has(path),
        hasError: !!err,
      };
    },

    setFieldValue(path, value) {
      const nextErrors = { ...state.errors };
      delete nextErrors[path];
      state = {
        ...state,
        values: { ...state.values, [path]: value },
        errors: nextErrors,
      };
      notify();
    },

    setFieldTouched(path, touched) {
      if (state.touched[path] === touched) return;
      state = { ...state, touched: { ...state.touched, [path]: touched } };
      notify();
    },

    registerField(path, cfg) {
      state.fieldValidators.set(path, cfg);
      if (cfg.stepId) {
        const set = state.fieldsByStep.get(cfg.stepId) ?? new Set<string>();
        set.add(path);
        state.fieldsByStep.set(cfg.stepId, set);
      }
      if (cfg.sectionPath) {
        const set = state.fieldsBySection.get(cfg.sectionPath) ?? new Set<string>();
        set.add(path);
        state.fieldsBySection.set(cfg.sectionPath, set);
      }
      notify();
      return () => {
        state.fieldValidators.delete(path);
        if (cfg.stepId) state.fieldsByStep.get(cfg.stepId)?.delete(path);
        if (cfg.sectionPath) state.fieldsBySection.get(cfg.sectionPath)?.delete(path);
        notify();
      };
    },

    registerStep(stepId) {
      if (!state.fieldsByStep.has(stepId)) {
        state.fieldsByStep.set(stepId, new Set());
        notify();
      }
      return () => {};
    },

    setActiveStep(stepId) {
      if (state.activeStepId === stepId) return;
      state = { ...state, activeStepId: stepId };
      notify();
    },

    registerSectionSchema(sectionPath, schema) {
      state.sectionSchemas.set(sectionPath, schema);
      notify();
      return () => {
        state.sectionSchemas.delete(sectionPath);
        notify();
      };
    },

    async validateField(path) {
      const cfg = state.fieldValidators.get(path);
      const valueAtStart = state.values[path];
      const values = store.getValues() as Record<string, unknown>;

      // Mark as validating
      state = {
        ...state,
        validatingFields: new Set(state.validatingFields).add(path),
      };
      notify();

      try {
        // 1. field validate (highest priority)
        const fieldErr = await runFieldValidate(cfg?.validate, valueAtStart, values);
        // Stale check — if value changed while awaiting, bail
        if (state.values[path] !== valueAtStart) return !state.errors[path];
        if (fieldErr) {
          state = { ...state, errors: { ...state.errors, [path]: fieldErr } };
          notify();
          return false;
        }

        // 2. section schema — path starts with sectionPath prefix
        for (const [sectionPath, schema] of state.sectionSchemas) {
          if (path === sectionPath || path.startsWith(sectionPath + ".")) {
            const scopedValues = (getByPath(values, sectionPath) ?? {}) as Record<string, unknown>;
            const errors = await runSchema(schema, scopedValues);
            // Stale check
            if (state.values[path] !== valueAtStart) return !state.errors[path];
            const relativePath = path.slice(sectionPath.length + 1);
            const err = errors[relativePath];
            const nextErrors = { ...state.errors };
            if (err) nextErrors[path] = err;
            else delete nextErrors[path];
            state = { ...state, errors: nextErrors };
            notify();
            return !err;
          }
        }

        // 3. root schema (lowest priority)
        if (store._config.schema) {
          const errors = await runSchema(store._config.schema, values);
          // Stale check
          if (state.values[path] !== valueAtStart) return !state.errors[path];
          const err = errors[path];
          const nextErrors = { ...state.errors };
          if (err) nextErrors[path] = err;
          else delete nextErrors[path];
          state = { ...state, errors: nextErrors };
          notify();
          return !err;
        }

        // 4. No validation — clear any existing error
        const nextErrors = { ...state.errors };
        delete nextErrors[path];
        state = { ...state, errors: nextErrors };
        notify();
        return true;
      } finally {
        const nextSet = new Set(state.validatingFields);
        nextSet.delete(path);
        state = { ...state, validatingFields: nextSet };
        notify();
      }
    },

    async validateStep(stepId) {
      const fields = Array.from(state.fieldsByStep.get(stepId) ?? []);
      if (fields.length === 0) return true;
      const results = await Promise.all(fields.map((f) => store.validateField(f)));
      if (results.some((r) => !r)) {
        const nextTouched = { ...state.touched };
        for (const f of fields) nextTouched[f] = true;
        state = { ...state, touched: nextTouched };
        notify();
      }
      return results.every(Boolean);
    },

    async validateAll() {
      const paths = Array.from(state.fieldValidators.keys());
      const results = await Promise.all(paths.map((p) => store.validateField(p)));
      if (store._config.schema) {
        const values = store.getValues() as Record<string, unknown>;
        const errors = await runSchema(store._config.schema, values);
        const nextErrors = { ...state.errors };
        for (const [path, err] of Object.entries(errors)) {
          if (!nextErrors[path]) nextErrors[path] = err;
        }
        state = { ...state, errors: nextErrors };
        notify();
      }
      return results.every(Boolean) && Object.values(state.errors).every((e) => !e);
    },

    getValues<S = T>(scope?: string): S {
      const nested = unflatten(state.values);
      return (scope ? getByPath(nested, scope) : nested) as S;
    },

    async submit() {
      state = { ...state, submitting: true, submitCount: state.submitCount + 1 };
      notify();

      // Touch all registered fields
      const allFields = Array.from(state.fieldValidators.keys());
      const nextTouched = { ...state.touched };
      for (const f of allFields) nextTouched[f] = true;
      state = { ...state, touched: nextTouched };

      const valid = await store.validateAll();
      if (!valid) {
        state = { ...state, submitting: false };
        notify();
        store._config.onInvalid?.(state.errors as Record<string, FieldError>);
        return;
      }

      const values = store.getValues();
      try {
        await store._config.onSubmit?.(values as T, {
          reset: (d) => store.reset(d),
          setError: (p, m) => store.setError(p, m),
        });
      } finally {
        state = { ...state, submitting: false };
        notify();
      }
    },

    reset(defaults) {
      const src = defaults ?? options.defaultValues;
      const flat = src ? flatten(src as Record<string, unknown>) : {};
      state = {
        ...state,
        values: flat,
        errors: {},
        touched: {},
        submitCount: 0,
        submitting: false,
        revalidateOnChange: new Set(),
      };
      notify();
    },

    setError(path, message) {
      state = {
        ...state,
        errors: { ...state.errors, [path]: { message, source: "validate" } },
      };
      notify();
    },

    _config: config,
  };

  return store;
}
