import {
  useMutation,
  type UseMutationOptions,
  type DefaultError,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiError } from '@/src/shared/api/error';
import { resolveErrorMessage } from '@/src/shared/api/errorMessages';

type AppMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  /** ApiError 가 아니거나 mapping 에 없을 때의 fallback 메시지. */
  errorMessage?: string;
  /** false 면 toast 띄우지 않음. */
  showErrorToast?: boolean;
};

/**
 * useMutation 래퍼 — 에러 발생 시 `resolveErrorMessage` 를 통해 안전한
 * 사용자 facing 메시지를 toast 로 띄운다. backend 가 보낸 raw 메시지를 그대로
 * 띄우지 않고 `errorMessages.ts` 의 mapping 을 우선 사용해 일관된 사용자
 * 경험과 i18n 친화성을 확보.
 *
 * showErrorToast: false 로 자동 toast 끌 수 있고, errorMessage 로 fallback 지정.
 */
export const useAppMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: AppMutationOptions<TData, TError, TVariables, TContext>,
) => {
  const { errorMessage, showErrorToast = true, onError, ...rest } = options;

  return useMutation({
    ...rest,
    onError: (...args) => {
      onError?.(...args);

      if (!showErrorToast) return;

      const [error] = args;
      const message = resolveErrorMessage(error, errorMessage);

      if (message) {
        toast.error(message);
      }
    },
  });
};

// re-export ApiError 타입을 쓰는 사용처 편의용 (선택).
export type { ApiError };
