"use client";

import * as React from "react";
import { createFormStore, type CreateFormStoreOptions } from "./store";
import type { FormStore } from "./types";

export function useShUiForm<T = unknown>(
  options?: CreateFormStoreOptions<T>
): FormStore<T> {
  const storeRef = React.useRef<FormStore<T> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createFormStore<T>(options);
  }
  return storeRef.current;
}
