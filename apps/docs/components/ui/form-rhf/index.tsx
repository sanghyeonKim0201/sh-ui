"use client";

import * as React from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";
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

interface AdapterMeta {
  fieldsByStep: Map<string, Set<string>>;
  fieldsBySection: Map<string, Set<string>>;
  fieldValidators: Map<string, FieldConfig>;
  sectionSchemas: Map<string, StandardSchemaV1>;
  activeStepId: string | null;
  revalidateOnChange: Set<string>;
  validatingFields: Set<string>;
}

/** 마지막으로 계산된 스냅샷 캐시. React useSyncExternalStore 가 Object.is 비교를 사용하므로 동일 상태면 같은 레퍼런스를 반환해야 한다. */
interface SnapshotCache {
  snapshot: FormStoreState | null;
  /** 캐시 무효화를 위한 간단한 version 카운터 */
  version: number;
  /** 마지막으로 스냅샷을 생성한 version */
  snapshotVersion: number;
}

export interface AdapterConfig<T> {
  onSubmit?: (
    values: T,
    helpers: { reset: () => void; setError: (path: string, message: string) => void }
  ) => void | Promise<void>;
}

/**
 * React Hook Form 인스턴스를 sh-ui FormStore 인터페이스로 감쌉니다.
 *
 * - RHF 가 state owner(values, errors, touched, isSubmitting)로 동작
 * - sh-ui 메타데이터(fieldsByStep, sectionSchemas 등)는 어댑터 내부에서 관리
 * - validateField: sh-ui runFieldValidate → rhf.setError / rhf.trigger 순으로 실행
 */
export function adaptReactHookForm<T extends FieldValues>(
  rhf: UseFormReturn<T>,
  config: AdapterConfig<T> = {}
): FormStore<T> {
  const meta: AdapterMeta = {
    fieldsByStep: new Map(),
    fieldsBySection: new Map(),
    fieldValidators: new Map(),
    sectionSchemas: new Map(),
    activeStepId: null,
    revalidateOnChange: new Set(),
    validatingFields: new Set(),
  };

  const cache: SnapshotCache = { snapshot: null, version: 0, snapshotVersion: -1 };

  const listeners = new Set<() => void>();
  const notify = () => {
    cache.version++;
    listeners.forEach((l) => l());
  };

  // RHF 7.50+ subscribe API
  let unsubRhf: (() => void) | undefined;

  const startRhfSubscription = () => {
    if (typeof (rhf as any).subscribe === "function") {
      try {
        unsubRhf = (rhf as any).subscribe({
          formState: { values: true, errors: true, isSubmitting: true, touchedFields: true },
          callback: () => notify(),
        });
      } catch {
        // 구버전 RHF: subscribe 미지원 — 무시
      }
    }
  };

  // 첫 subscriber 등록 시 RHF 구독 시작
  let rhfSubscribed = false;

  const store: FormStore<T> = {
    subscribe(listener) {
      listeners.add(listener);
      if (!rhfSubscribed) {
        rhfSubscribed = true;
        startRhfSubscription();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          rhfSubscribed = false;
          try {
            unsubRhf?.();
          } catch {}
          unsubRhf = undefined;
        }
      };
    },

    getState(): FormStoreState {
      // 동일 version이면 캐시 반환 — useSyncExternalStore Object.is 비교 통과
      if (cache.snapshot !== null && cache.snapshotVersion === cache.version) {
        return cache.snapshot;
      }

      const fs = rhf.formState;
      const rawValues = rhf.getValues();
      const values = flatten(rawValues as Record<string, unknown>);

      const errors: Record<string, FieldError | undefined> = {};
      const collectErrors = (errs: Record<string, any>, prefix = "") => {
        for (const [key, e] of Object.entries(errs)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (e && typeof e === "object") {
            if (typeof e.message === "string") {
              errors[path] = { message: e.message, source: "validate" };
            } else {
              // nested errors
              collectErrors(e, path);
            }
          }
        }
      };
      collectErrors(fs.errors as Record<string, any>);

      const snapshot: FormStoreState = {
        values,
        errors,
        touched: { ...(fs.touchedFields as any) },
        submitting: fs.isSubmitting,
        submitCount: fs.submitCount,
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
        isValidating: rhf.formState.isValidating,
        hasError: !!err,
      };
    },

    setFieldValue(path, value) {
      rhf.setValue(path as any, value as any, { shouldDirty: true });
    },

    setFieldTouched(path, touched) {
      if (touched) {
        void rhf.trigger(path as any);
      }
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
      rhf.register(path as any);
      notify();
      return () => {
        meta.fieldValidators.delete(path);
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
      const rawValues = rhf.getValues() as Record<string, unknown>;
      const value = getByPath(rawValues, path);
      const err = await runFieldValidate(cfg?.validate, value, rawValues);
      if (err) {
        rhf.setError(path as any, { type: "custom", message: err.message });
        meta.revalidateOnChange.add(path);
        notify();
        return false;
      }
      rhf.clearErrors(path as any);
      meta.revalidateOnChange.delete(path);
      // RHF 자체 검증(resolver 등)도 함께 실행
      const ok = await rhf.trigger(path as any);
      notify();
      return ok;
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
      const rhfValid = await rhf.trigger();
      return results.every(Boolean) && rhfValid;
    },

    getValues<S = T>(scope?: string): S {
      const v = rhf.getValues() as unknown;
      return (scope ? getByPath(v, scope) : v) as S;
    },

    async submit() {
      let triggered = false;
      await rhf.handleSubmit(async (values) => {
        triggered = true;
        await config?.onSubmit?.(values as T, {
          reset: () => rhf.reset(),
          setError: (p, m) => rhf.setError(p as any, { type: "server", message: m }),
        });
      })();
      if (!triggered) {
        notify();
      }
    },

    reset(defaults) {
      rhf.reset(defaults as any);
      meta.revalidateOnChange.clear();
    },

    setError(path, message) {
      rhf.setError(path as any, { type: "custom", message });
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

/**
 * useReactHookFormAdapter — `adaptReactHookForm` 의 hook 변종.
 *
 * 어댑터는 호출마다 새 `FormStore` 인스턴스 (listeners Set, snapshot cache 등)
 * 를 만들기 때문에, 컴포넌트 body 에서 직접 호출하면 매 렌더 새 store →
 * `<Form form={...}>` 의 context value 가 매 렌더 바뀜 → 자식
 * `<Form.Field>` 가 매번 register/unregister → perf hit + 잠재 race.
 *
 * 본 hook 은 `useRef` 로 첫 마운트에 한 번만 어댑터를 생성해 안정화한다.
 * RHF 인스턴스 (`rhf`) 자체가 `useForm` 결과라 mount 후 안정 → ref 도 안전.
 *
 *   const rhf = useForm<FormValues>({ resolver: zodResolver(schema) });
 *   const form = useReactHookFormAdapter<FormValues>(rhf);
 *
 *   return <Form form={form}>...</Form>;
 *
 * `config` 의 onSubmit 은 초기 캡처 — 매 렌더 다른 함수 넘기면 무시. 동적
 * 콜백이 필요하면 `<Form onSubmit={...}>` prop 으로 (Form 컴포넌트가 매
 * 렌더 capture).
 */
export function useReactHookFormAdapter<T extends FieldValues>(
  rhf: UseFormReturn<T>,
  config: AdapterConfig<T> = {}
): FormStore<T> {
  const ref = React.useRef<FormStore<T> | null>(null);
  if (!ref.current) {
    ref.current = adaptReactHookForm<T>(rhf, config);
  }
  return ref.current;
}
