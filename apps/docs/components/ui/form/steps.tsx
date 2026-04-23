"use client";

import * as React from "react";
import { FormContext, StepContext, useFormState } from "./context";

export interface StepsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  defaultStep?: string;
  activeStep?: string;
  onStepChange?: (id: string) => void;
  children: React.ReactNode;
}

// ─── Internal store backdoor types ────────────────────────────────────────────

interface StepsNav {
  activeStepId: string | null;
  order: string[];
  setActive: (id: string) => void;
}

type StoreWithSteps = {
  __stepsNav?: StepsNav;
  __stepConfig?: Record<string, { skipValidationOnNext?: boolean }>;
};

// ─── StepsContext — only used within the Steps subtree ────────────────────────

interface StepsContextValue {
  activeStepId: string | null;
  setActive: (id: string) => void;
  order: string[];
  registerStepId: (id: string) => () => void;
}

const StepsContext = React.createContext<StepsContextValue | null>(null);

// ─── Steps ────────────────────────────────────────────────────────────────────

export function Steps({
  defaultStep,
  activeStep,
  onStepChange,
  children,
  ...rest
}: StepsProps) {
  const store = React.useContext(FormContext);
  if (!store) throw new Error("<Form.Steps> must be inside <Form>");

  const [internal, setInternal] = React.useState<string | null>(
    defaultStep ?? null
  );
  const [order, setOrder] = React.useState<string[]>([]);

  const active = activeStep ?? internal;

  const setActive = React.useCallback(
    (id: string) => {
      if (activeStep === undefined) setInternal(id);
      onStepChange?.(id);
    },
    [activeStep, onStepChange]
  );

  const registerStepId = React.useCallback((id: string) => {
    setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => {
      setOrder((prev) => prev.filter((x) => x !== id));
    };
  }, []);

  // Activate first step when order becomes available and no step is active
  React.useEffect(() => {
    if (!active && order.length > 0) setInternal(order[0]);
  }, [active, order]);

  // Sync active step to form store
  React.useEffect(() => {
    store.setActiveStep(active);
  }, [store, active]);

  // Publish nav API onto store backdoor so useFormSteps can access it
  // from anywhere in the Form tree (not just inside Steps subtree)
  React.useEffect(() => {
    (store as unknown as StoreWithSteps).__stepsNav = {
      activeStepId: active,
      order,
      setActive,
    };
  });

  const ctxValue = React.useMemo(
    () => ({ activeStepId: active, setActive, order, registerStepId }),
    [active, setActive, order, registerStepId]
  );

  return (
    <StepsContext.Provider value={ctxValue}>
      <div {...rest}>{children}</div>
    </StepsContext.Provider>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────

export interface StepProps {
  id: string;
  skipValidationOnNext?: boolean;
  children?: React.ReactNode;
}

export function Step({ id, skipValidationOnNext, children }: StepProps) {
  const ctx = React.useContext(StepsContext);
  const store = React.useContext(FormContext);
  if (!ctx || !store) throw new Error("<Form.Step> must be inside <Form.Steps>");

  const { registerStepId } = ctx;
  React.useEffect(() => registerStepId(id), [registerStepId, id]);

  React.useEffect(() => {
    const s = store as unknown as StoreWithSteps;
    const current = s.__stepConfig ?? {};
    s.__stepConfig = { ...current, [id]: { skipValidationOnNext } };
  }, [store, id, skipValidationOnNext]);

  if (ctx.activeStepId !== id) return null;

  return (
    <StepContext.Provider value={{ id }}>{children}</StepContext.Provider>
  );
}

// ─── useFormSteps ─────────────────────────────────────────────────────────────

export function useFormSteps() {
  const store = React.useContext(FormContext);
  if (!store) throw new Error("useFormSteps must be used inside <Form>");

  // Subscribe to store so we re-render on step changes
  useFormState();

  // Read nav from backdoor — set synchronously by Steps on every render
  const nav = (store as unknown as StoreWithSteps).__stepsNav;

  const activeStepId = nav?.activeStepId ?? store.getState().activeStepId;
  const order = nav?.order ?? [];
  const setActive = nav?.setActive ?? (() => {});

  const idx = activeStepId ? order.indexOf(activeStepId) : -1;
  const isLastStep = order.length > 0 ? idx === order.length - 1 : false;
  const isFirstStep = idx === 0;

  return {
    activeStepId,
    isLastStep,
    isFirstStep,
    next: async () => {
      // Read nav fresh at call time so stale closures don't bite us
      const currentNav = (store as unknown as StoreWithSteps).__stepsNav;
      const currentActiveStepId = currentNav?.activeStepId ?? store.getState().activeStepId;
      if (!currentActiveStepId) return false;
      const stepConfig = (store as unknown as StoreWithSteps).__stepConfig;
      const cfg = stepConfig?.[currentActiveStepId];
      const ok = cfg?.skipValidationOnNext
        ? true
        : await store.validateStep(currentActiveStepId);
      if (!ok) return false;
      // Re-read nav after async operation in case it changed
      const latestNav = (store as unknown as StoreWithSteps).__stepsNav;
      const latestOrder = latestNav?.order ?? [];
      const latestSetActive = latestNav?.setActive ?? (() => {});
      const latestIdx = latestOrder.indexOf(currentActiveStepId);
      const latestIsLast = latestIdx === latestOrder.length - 1;
      if (latestIsLast) {
        await store.submit();
        return true;
      }
      latestSetActive(latestOrder[latestIdx + 1]);
      return true;
    },
    prev: () => {
      if (isFirstStep) return;
      setActive(order[idx - 1]);
    },
    goTo: (id: string) => {
      if (order.includes(id)) setActive(id);
    },
    isStepValid: (id: string) => {
      const storeState = store.getState();
      const fields = storeState.fieldsByStep.get(id) ?? new Set();
      return !Array.from(fields).some((f) => storeState.errors[f]);
    },
  };
}
