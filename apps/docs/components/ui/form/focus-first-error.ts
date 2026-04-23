import type { FormStore } from "./types";

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function focusFirstError(
  store: FormStore,
  formEl: HTMLFormElement,
  scroll: boolean
) {
  const state = store.getState();
  const errorPaths = Object.keys(state.errors).filter((p) => state.errors[p]);
  if (errorPaths.length === 0) return;

  const allInputs = formEl.querySelectorAll<HTMLElement>("[name]");
  for (const el of Array.from(allInputs)) {
    const name = el.getAttribute("name");
    if (name && errorPaths.includes(name)) {
      // Check if field is in a step and that step is inactive
      for (const [stepId, fields] of state.fieldsByStep) {
        if (fields.has(name) && stepId !== state.activeStepId) {
          store.setActiveStep(stepId);
          requestAnimationFrame(() => {
            const retry = formEl.querySelector<HTMLElement>(`[name="${name}"]`);
            retry?.focus({ preventScroll: true });
            if (scroll && retry && typeof retry.scrollIntoView === "function") {
              const reduce = getPrefersReducedMotion();
              retry.scrollIntoView({
                block: "center",
                behavior: reduce ? "auto" : "smooth",
              });
            }
          });
          return;
        }
      }
      el.focus({ preventScroll: true });
      if (scroll && typeof el.scrollIntoView === "function") {
        const reduce = getPrefersReducedMotion();
        el.scrollIntoView({
          block: "center",
          behavior: reduce ? "auto" : "smooth",
        });
      }
      return;
    }
  }
}
