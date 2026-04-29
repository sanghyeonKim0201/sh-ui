import {
  useMutation,
  type UseMutationOptions,
  type DefaultError,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiError } from '../api/error';

type AppMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  errorMessage?: string;
  showErrorToast?: boolean;
};

/**
 * useMutation 래퍼 — 에러 발생 시 ApiError.message 를 toast 로 띄운다.
 * showErrorToast: false 로 끌 수 있고, errorMessage 로 fallback 메시지 지정.
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
      const message =
        error instanceof ApiError
          ? (error.data?.message ?? errorMessage)
          : errorMessage;

      if (message) {
        toast.error(message);
      }
    },
  });
};
