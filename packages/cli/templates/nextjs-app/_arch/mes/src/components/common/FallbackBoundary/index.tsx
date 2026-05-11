'use client';

import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
  Suspense,
} from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

export type ErrorFallbackProps = {
  error: Error | null;
  resetErrorBoundary: () => void;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ComponentType<ErrorFallbackProps>;
  onReset: () => void;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  resetErrorBoundary = () => {
    this.props.onReset();
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && Fallback) {
      return (
        <Fallback error={error} resetErrorBoundary={this.resetErrorBoundary} />
      );
    }

    return children;
  }
}

type FallbackBoundaryProps = {
  children: ReactNode;
  errorFallback?: ComponentType<ErrorFallbackProps>;
  suspenseFallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

/**
 * Suspense + ErrorBoundary 합성. React Query 의 reset 신호에 맞춰
 * `errorFallback` 의 `resetErrorBoundary` 가 쿼리까지 함께 리셋한다.
 */
export function FallbackBoundary({
  children,
  errorFallback,
  suspenseFallback,
  onError,
}: FallbackBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={errorFallback}
          onError={onError}
        >
          <Suspense fallback={suspenseFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
