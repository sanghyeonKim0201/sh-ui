"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import type { FormStore, FieldState } from "./types";

export const FormContext = React.createContext<FormStore<unknown> | null>(null);

export const SectionContext = React.createContext<{ path: string }>({ path: "" });

export const StepContext = React.createContext<{ id: string | null }>({ id: null });

export const FieldContext = React.createContext<{
  path: string;
  id: string;
  descId: string;
  errorId: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
} | null>(null);

export const DisabledContext = React.createContext<boolean>(false);

export function useFormContext<T = unknown>(): FormStore<T> {
  const ctx = React.useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used inside <Form>");
  return ctx as FormStore<T>;
}

export function useFormState() {
  const store = useFormContext();
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState(),
    () => store.getState()
  );
}

export function useFormField(name?: string): FieldState & { path: string } {
  const store = useFormContext();
  const fieldCtx = React.useContext(FieldContext);
  const path = name ?? fieldCtx?.path;
  if (!path) throw new Error("useFormField: name is required outside <Form.Field>");

  useSyncExternalStore(
    store.subscribe,
    () => {
      const s = store.getState();
      return JSON.stringify([
        s.values[path],
        s.errors[path],
        s.touched[path],
        s.validatingFields.has(path),
      ]);
    },
    () => ""
  );
  const snapshot = store.getFieldState(path);
  return { ...snapshot, path };
}

export function useFormSection(name?: string): {
  hasError: boolean;
  errors: Record<string, { message: string }>;
  isValid: boolean;
  isDirty: boolean;
} {
  const store = useFormContext();
  const sectionCtx = React.useContext(SectionContext);
  const path = name ?? sectionCtx.path;

  useSyncExternalStore(
    store.subscribe,
    () => JSON.stringify([store.getState().errors, store.getState().touched]),
    () => ""
  );

  const state = store.getState();
  const matching = Object.entries(state.errors).filter(
    ([p, e]) => e && (p === path || p.startsWith(path + "."))
  ) as Array<[string, { message: string }]>;
  const touchedAny = Object.entries(state.touched).some(
    ([p, t]) => t && (p === path || p.startsWith(path + "."))
  );
  return {
    hasError: matching.length > 0,
    errors: Object.fromEntries(matching),
    isValid: matching.length === 0,
    isDirty: touchedAny,
  };
}
