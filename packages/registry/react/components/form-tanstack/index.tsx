import type { ReactFormExtendedApi } from "@tanstack/react-form";
import type {
  FormStore,
  FormStoreState,
  FieldError,
  FieldConfig,
  StandardSchemaV1,
  FormConfig,
} from "../form/types";
import { flatten, getByPath } from "../form/utils";
import { runFieldValidate } from "../form/validation";

/**
 * TanStack Form 의 `useForm()` 반환 타입은 12 개의 제네릭을 받는다. 우리 어댑터는
 * `TFormData` 만 알면 충분하므로 나머지 11 개는 any 로 두어 사용자 측에서 캐스트
 * 없이 바로 넘길 수 있게 한다. `T` 추론은 유지된다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTanStackForm<T> = ReactFormExtendedApi<T, any, any, any, any, any, any, any, any, any, any, any>;

// TanStack Form v1 API (store.subscribe 는 { unsubscribe } 를 반환) — 어댑터가 실제로 사용하는 멤버만 기술
interface TanStackFieldMeta {
  isTouched?: boolean;
  isDirty?: boolean;
  errors?: string[];
  errorMap?: Record<string, string | undefined>;
}

interface TanStackStoreState<T = Record<string, unknown>> {
  values: T;
  fieldMeta: Record<string, TanStackFieldMeta | undefined>;
  isSubmitting?: boolean;
  submissionAttempts?: number;
}

interface TanStackStore<T = Record<string, unknown>> {
  subscribe(listener: () => void): { unsubscribe: () => void };
  state: TanStackStoreState<T>;
}

interface TanStackFormApi<T = Record<string, unknown>> {
  store: TanStackStore<T>;
  setFieldValue: (name: string, value: unknown, opts?: { notify?: boolean }) => void;
  setFieldMeta: (name: string, updater: (prev: TanStackFieldMeta) => TanStackFieldMeta) => void;
  validateField: (name: string, cause: string) => Promise<unknown[]>;
  handleSubmit: (opts?: unknown) => Promise<void>;
  reset: (values?: Partial<T>) => void;
}

interface AdapterMeta {
  fieldsByStep: Map<string, Set<string>>;
  fieldsBySection: Map<string, Set<string>>;
  fieldValidators: Map<string, FieldConfig>;
  sectionSchemas: Map<string, StandardSchemaV1>;
  activeStepId: string | null;
  revalidateOnChange: Set<string>;
  validatingFields: Set<string>;
  /** sh-ui 자체 검증 에러 — TanStack fieldMeta 와 별도 관리 */
  localErrors: Map<string, FieldError | undefined>;
  /** sh-ui touched — TanStack fieldMeta.isTouched 와 별도 관리 */
  localTouched: Map<string, boolean>;
}

/** 마지막으로 계산된 스냅샷 캐시. React useSyncExternalStore 가 Object.is 비교를 사용하므로 동일 상태면 같은 레퍼런스를 반환해야 한다. */
interface SnapshotCache {
  snapshot: FormStoreState | null;
  version: number;
  snapshotVersion: number;
}

export interface AdapterConfig<T> {
  onSubmit?: (
    values: T,
    helpers: { reset: () => void; setError: (path: string, message: string) => void }
  ) => void | Promise<void>;
}

/**
 * TanStack Form 인스턴스를 sh-ui FormStore 인터페이스로 감쌉니다.
 *
 * - TanStack Form 이 values 와 submit 상태의 state owner
 * - sh-ui 검증 에러(localErrors)와 메타데이터는 어댑터 내부에서 독립 관리
 * - TanStack fieldMeta 에도 errorMap 으로 동기화 (TanStack 자체 UI 와 호환)
 * - notify() 가 React useSyncExternalStore 리스너를 직접 호출해 re-render 유발
 */
export function adaptTanStackForm<T extends Record<string, unknown>>(
  tsForm: AnyTanStackForm<T>,
  config: AdapterConfig<T> = {}
): FormStore<T> {
  // 내부에선 좁은 interface 로 취급 — 실제 호출하는 멤버만 쓰므로 안전
  const ts = tsForm as unknown as TanStackFormApi<T>;
  const meta: AdapterMeta = {
    fieldsByStep: new Map(),
    fieldsBySection: new Map(),
    fieldValidators: new Map(),
    sectionSchemas: new Map(),
    activeStepId: null,
    revalidateOnChange: new Set(),
    validatingFields: new Set(),
    localErrors: new Map(),
    localTouched: new Map(),
  };

  const cache: SnapshotCache = { snapshot: null, version: 0, snapshotVersion: -1 };

  const listeners = new Set<() => void>();
  const notify = () => {
    cache.version++;
    listeners.forEach((l) => l());
  };

  // TanStack store.subscribe 는 { unsubscribe } 를 반환
  let tsSub: { unsubscribe: () => void } | undefined;
  let tsSubscribed = false;

  const startTsSubscription = () => {
    tsSub = ts.store.subscribe(() => notify());
  };

  const store: FormStore<T> = {
    subscribe(listener) {
      listeners.add(listener);
      if (!tsSubscribed) {
        tsSubscribed = true;
        startTsSubscription();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          tsSubscribed = false;
          try {
            tsSub?.unsubscribe();
          } catch {}
          tsSub = undefined;
        }
      };
    },

    getState(): FormStoreState {
      // 동일 version 이면 캐시 반환 — useSyncExternalStore Object.is 비교 통과
      if (cache.snapshot !== null && cache.snapshotVersion === cache.version) {
        return cache.snapshot;
      }

      const s = ts.store.state;
      const rawValues = s.values ?? ({} as T);
      const values = flatten(rawValues as Record<string, unknown>);

      // 에러와 touched 는 localErrors/localTouched 에서 읽는다
      // (TanStack 자체 fieldMeta 는 참고용이고 sh-ui re-render 트리거가 아님)
      const errors: Record<string, FieldError | undefined> = {};
      const touched: Record<string, boolean> = {};

      for (const [path, err] of meta.localErrors) {
        if (err) errors[path] = err;
      }
      for (const [path, t] of meta.localTouched) {
        touched[path] = t;
      }

      const snapshot: FormStoreState = {
        values,
        errors,
        touched,
        submitting: Boolean(s.isSubmitting),
        submitCount: Number(s.submissionAttempts ?? 0),
        activeStepId: meta.activeStepId,
        fieldsByStep: meta.fieldsByStep,
        fieldsBySection: meta.fieldsBySection,
        fieldValidators: meta.fieldValidators,
        sectionSchemas: meta.sectionSchemas,
        validatingFields: meta.validatingFields,
        revalidateOnChange: meta.revalidateOnChange,
      };

      cache.snapshot = snapshot;
      cache.snapshotVersion = cache.version;
      return snapshot;
    },

    getFieldState(path) {
      const state = store.getState();
      const err = state.errors[path];
      return {
        value: state.values[path],
        error: err,
        errors: err ? [err] : [],
        touched: !!state.touched[path],
        isValidating: meta.validatingFields.has(path),
        hasError: !!err,
      };
    },

    setFieldValue(path, value) {
      ts.setFieldValue(path as keyof T extends string ? keyof T : string, value);
    },

    setFieldTouched(path, isTouched) {
      meta.localTouched.set(path, isTouched);
      // TanStack 에도 동기화
      try {
        ts.setFieldMeta(path, (m) => ({ ...(m ?? {}), isTouched }));
      } catch {}
      notify();
    },

    registerField(path, cfg) {
      meta.fieldValidators.set(path, cfg);
      if (cfg.stepId) {
        const s = meta.fieldsByStep.get(cfg.stepId) ?? new Set<string>();
        s.add(path);
        meta.fieldsByStep.set(cfg.stepId, s);
      }
      if (cfg.sectionPath) {
        const s = meta.fieldsBySection.get(cfg.sectionPath) ?? new Set<string>();
        s.add(path);
        meta.fieldsBySection.set(cfg.sectionPath, s);
      }
      notify();
      return () => {
        meta.fieldValidators.delete(path);
        meta.localErrors.delete(path);
        meta.localTouched.delete(path);
        if (cfg.stepId) meta.fieldsByStep.get(cfg.stepId)?.delete(path);
        if (cfg.sectionPath) meta.fieldsBySection.get(cfg.sectionPath)?.delete(path);
        notify();
      };
    },

    registerStep(stepId) {
      if (!meta.fieldsByStep.has(stepId)) {
        meta.fieldsByStep.set(stepId, new Set());
      }
      notify();
      return () => {};
    },

    setActiveStep(stepId) {
      meta.activeStepId = stepId;
      notify();
    },

    registerSectionSchema(sectionPath, schema) {
      meta.sectionSchemas.set(sectionPath, schema);
      notify();
      return () => {
        meta.sectionSchemas.delete(sectionPath);
        notify();
      };
    },

    async validateField(path) {
      const cfg = meta.fieldValidators.get(path);
      const rawValues = ts.store.state.values as Record<string, unknown>;
      const value = getByPath(rawValues, path);
      const err = await runFieldValidate(cfg?.validate, value, rawValues);

      if (err) {
        meta.localErrors.set(path, err);
        // TanStack 에도 동기화 (errorMap 을 통해야 errors[] 에 반영됨)
        try {
          ts.setFieldMeta(path, (m) => ({
            ...(m ?? {}),
            errorMap: { ...(m?.errorMap ?? {}), onBlur: err.message },
          }));
        } catch {}
        meta.revalidateOnChange.add(path);
        notify();
        return false;
      }

      meta.localErrors.delete(path);
      try {
        ts.setFieldMeta(path, (m) => ({
          ...(m ?? {}),
          errorMap: { ...(m?.errorMap ?? {}), onBlur: undefined },
        }));
      } catch {}
      meta.revalidateOnChange.delete(path);
      notify();
      return true;
    },

    async validateStep(stepId) {
      const fields = Array.from(meta.fieldsByStep.get(stepId) ?? []);
      if (fields.length === 0) return true;
      const results = await Promise.all(fields.map((f) => store.validateField(f)));
      return results.every(Boolean);
    },

    async validateAll() {
      const paths = Array.from(meta.fieldValidators.keys());
      const results = await Promise.all(paths.map((p) => store.validateField(p)));
      return results.every(Boolean);
    },

    getValues<S = T>(scope?: string): S {
      const v = ts.store.state.values as unknown;
      return (scope ? getByPath(v, scope) : v) as S;
    },

    async submit() {
      await ts.handleSubmit();
      if (config?.onSubmit) {
        await config.onSubmit(ts.store.state.values as T, {
          reset: () => {
            ts.reset();
            meta.localErrors.clear();
            meta.localTouched.clear();
          },
          setError: (p, m) => {
            meta.localErrors.set(p, { message: m, source: "validate" });
            try {
              ts.setFieldMeta(p, (fm) => ({
                ...(fm ?? {}),
                errorMap: { ...(fm?.errorMap ?? {}), onSubmit: m },
              }));
            } catch {}
            notify();
          },
        });
      }
    },

    reset(defaults) {
      ts.reset(defaults);
      meta.localErrors.clear();
      meta.localTouched.clear();
      meta.revalidateOnChange.clear();
      notify();
    },

    setError(path, message) {
      meta.localErrors.set(path, { message, source: "validate" });
      try {
        ts.setFieldMeta(path, (m) => ({
          ...(m ?? {}),
          errorMap: { ...(m?.errorMap ?? {}), onSubmit: message },
        }));
      } catch {}
      notify();
    },

    _config: {
      validateOn: "blur",
      scrollToFirstError: true,
      focusFirstError: true,
    } as FormConfig<T>,
  };

  return store;
}
