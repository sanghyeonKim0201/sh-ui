"use client";

import * as React from "react";
import { createFormStore, type CreateFormStoreOptions } from "./store";
import type { FormStore } from "./types";

/**
 * useShUiForm — sh-ui 자체 store 를 mount 시점에 한 번만 생성 (RHF 안 쓸 때).
 *
 * **중요**: `options` 는 **첫 마운트 시점에만 캡처** 된다. 매 렌더 다른
 * `schema` / `defaultValues` / `onSubmit` 을 넘겨도 무시. 동적으로 schema 가
 * 바뀌어야 하면:
 *  - i18n 메시지: schema 를 useMemo 로 메모 + locale 변경 시 Form 자체를
 *    `key` prop 으로 리마운트
 *  - 또는 `<Form schema={...}>` prop 으로 — Form 컴포넌트가 매 렌더 prop 으로
 *    읽음 (단 이 경로도 첫 schema 만 사용한다는 점 동일)
 *
 * RHF 와 함께 쓸 때는 본 hook 대신 `useReactHookFormAdapter(rhf)` 를
 * `form-rhf` 패키지에서 import.
 */
export function useShUiForm<T = unknown>(
  options?: CreateFormStoreOptions<T>
): FormStore<T> {
  const storeRef = React.useRef<FormStore<T> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createFormStore<T>(options);
  }
  return storeRef.current;
}
