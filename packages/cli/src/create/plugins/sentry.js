export const sentryPlugin = {
  name: 'sentry',
  label: 'Sentry (에러 모니터링)',
  description:
    '에러 모니터링. 클라/서버/엣지 init, 라우트 에러 페이지, observability 브릿지로 다른 플러그인의 5xx 자동 캡처.',
  priority: 1,

  dependencies: {
    '@sentry/nextjs': '^10.44.0',
  },

  // ─── next.config.ts 관련 ───

  imports: [
    `import { withSentryConfig } from '@sentry/nextjs';`,
  ],

  wrapExport(expr) {
    return `withSentryConfig(${expr}, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  tunnelRoute: '/monitoring',
  silent: !process.env.CI,
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
})`;
  },

  envVars: [
    '# Sentry',
    'SENTRY_ORG=',
    'SENTRY_PROJECT=',
    'SENTRY_AUTH_TOKEN=',
    'NEXT_PUBLIC_SENTRY_DSN=',
    'NEXT_PUBLIC_SENTRY_ENVIRONMENT=dev',
  ],

  turboEnvVars: [
    'NEXT_PUBLIC_SENTRY_DSN',
    'NEXT_PUBLIC_SENTRY_ENVIRONMENT',
    'NEXT_RUNTIME',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'SENTRY_AUTH_TOKEN',
  ],

  // ─── 공유 파일 조각 (providers 합성용) ───

  providerImports: [],
  providerWrappers: [],

  // ─── 독립 파일 ───
  //
  // Sentry 가 활성화될 때만 깔리는 파일.
  // HTTP/proxy 인프라(http.ts, apiTypes.ts, error.ts, app/api/proxy 등)는
  // 베이스 템플릿이 소유한다. Sentry 는 베이스의 observability.ts 를
  // Sentry-aware 버전으로 덮어써서 캡처/로그를 활성화한다.
  //
  // arch 의존: FallbackBoundary 는 arch.paths.ui 에, observability 는 arch.paths.api 에
  // 떨어진다. FallbackBoundary 안의 ApiError import 는 arch.aliases.api 로 fully-qualified —
  // 상대 경로 (`../../api/error`) 는 FSD 에서만 동작하므로 alias 로 통일.

  files: (arch) => ({
    'sentry.server.config.ts': `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'dev',
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  beforeSend: (event, hint) => {
    if (event.level === 'warning' || event.level === 'info' || event.level === 'debug' || event.level === 'log') {
      return null;
    }

    const error = hint?.originalException;

    if (error instanceof Error && error.name === 'ApiError') {
      const status = (error as { status?: number }).status;
      if (status === 401) return null;
    }

    if (event.exception?.values?.[0]?.value?.includes('An error occurred in the Server Components render')) {
      return null;
    }

    return event;
  },
});
`,

    'sentry.edge.config.ts': `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'dev',
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  beforeSend: (event) => {
    if (event.level === 'warning' || event.level === 'info' || event.level === 'debug' || event.level === 'log') {
      return null;
    }
    return event;
  },
});
`,

    'instrumentation.ts': `import * as Sentry from '@sentry/nextjs';

export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
};

export const onRequestError = (
  ...[error, request, context]: Parameters<typeof Sentry.captureRequestError>
) => {
  if (error instanceof Error && error.name === 'ApiError') {
    return;
  }

  Sentry.captureRequestError(error, request, context);
};
`,

    'instrumentation-client.ts': `import * as Sentry from '@sentry/nextjs';

const IGNORED_ERROR_PATTERNS = [
  'ResizeObserver loop',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
  'AbortError',
  'ChunkLoadError',
  'Loading chunk',
];

const BROWSER_NETWORK_ERROR_PATTERNS = [
  'Load failed',
  'Failed to fetch',
  'NetworkError',
];

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'dev',
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.5,
  ignoreErrors: IGNORED_ERROR_PATTERNS,
  denyUrls: [
    /extensions\\//i,
    /chrome-extension:/i,
    /safari-web-extension:/i,
  ],
  beforeSend: (event, hint) => {
    if (event.level === 'warning' || event.level === 'info' || event.level === 'debug' || event.level === 'log') {
      return null;
    }

    const error = hint?.originalException;

    if (error instanceof Error && error.name === 'ApiError') {
      return null;
    }

    if (
      error instanceof Error &&
      BROWSER_NETWORK_ERROR_PATTERNS.some((pattern) => error.message.includes(pattern))
    ) {
      return null;
    }

    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
`,

    'app/global-error.tsx': `'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold'>Something went wrong!</h1>
            <p className='mt-2 text-gray-600'>{error.message}</p>
          </div>
        </div>
      </body>
    </html>
  );
}
`,

    'app/error.tsx': `'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border p-6 shadow-lg'>
        <div className='mb-4 flex justify-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950'>
            <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
          </div>
        </div>

        <h2 className='mb-2 text-center text-2xl font-bold'>오류가 발생했습니다</h2>
        <p className='mb-6 text-center text-sm text-gray-500'>
          예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
        </p>

        <div className='rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950'>
          <p className='text-sm text-red-600 dark:text-red-400'>
            {error.message || '알 수 없는 오류'}
          </p>
        </div>

        <div className='mt-6 space-y-3'>
          <button
            onClick={reset}
            className='flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
          >
            <RefreshCw className='h-4 w-4' />
            다시 시도
          </button>

          <Link
            href='/'
            className='flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent'
          >
            <Home className='h-4 w-4' />
            홈으로 이동
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className='mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-900'>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              Error ID: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
`,

    [`${arch.paths.ui}/FallbackBoundary/index.tsx`]: `import React, {
  Component,
  ComponentType,
  ErrorInfo,
  ReactNode,
  Suspense,
} from 'react';
import * as Sentry from '@sentry/nextjs';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { ApiError } from '${arch.aliases.api}/error';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ElementType<ErrorFallbackProps>;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error instanceof ApiError) {
      return;
    }

    Sentry.withScope((scope) => {
      scope.setTag('boundary', 'ErrorBoundary');
      scope.setFingerprint(['ErrorBoundary', error.name, error.message]);

      if (errorInfo.componentStack) {
        scope.setContext('react', {
          componentStack: errorInfo.componentStack,
        });
      }
      Sentry.captureException(error);
    });
  }

  resetErrorBoundary() {
    this.props.onReset();
    this.setState({ hasError: false, error: null });
  }

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

interface FallbackBoundaryProps {
  children: ReactNode;
  errorFallback?: ComponentType<ErrorFallbackProps>;
  suspenseFallback?: ReactNode;
}

export function FallbackBoundary({
  children,
  errorFallback,
  suspenseFallback,
}: FallbackBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallback={errorFallback}>
          <Suspense fallback={suspenseFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
`,

    // ─── observability 브릿지 ───
    //
    // 베이스의 no-op observability 를 Sentry-aware 버전으로 덮어쓴다.
    // http.ts / serverFetch.ts / proxy/route.ts 가 이 모듈을 import 하므로,
    // Sentry 플러그인이 켜지면 자동으로 캡처가 활성화된다.

    [`${arch.paths.api}/observability.ts`]: `import * as Sentry from '@sentry/nextjs';

type ApiCaptureParams = {
  url: string;
  apiPath: string;
  method: string;
  status: number | undefined;
  responseBody?: unknown;
};

type ApiLogParams = {
  url: string;
  method: string;
  status: number | undefined;
  requestHeaders?: Record<string, string | undefined>;
  requestBody?: unknown;
  responseBody?: unknown;
};

export const captureApiError = (params: ApiCaptureParams): void => {
  const { url, apiPath, method, status, responseBody } = params;

  // 5xx 서버 에러만 Sentry 로 보고 (4xx 비즈니스 에러는 UI 에서 처리)
  if (!status || status < 500) return;

  Sentry.withScope((scope) => {
    scope.setTag('error.type', 'api');
    scope.setContext('API Request', { method, url });
    scope.setContext('API Response', {
      status,
      body: JSON.stringify(responseBody),
    });
    scope.setFingerprint([method, apiPath, String(status)]);

    Sentry.captureException(new Error(\`[API] \${method} \${apiPath} \${status}\`));
  });
};

export const logApiError = (prefix: string, params: ApiLogParams): void => {
  const { url, method, status, requestHeaders, requestBody, responseBody } = params;

  console.error(\`❌ [\${prefix} ERROR REPORT]\`);
  console.error(\`- URL: \${method} \${url}\`);
  console.error(\`- Status: \${status ?? 'N/A'}\`);

  if (requestHeaders) {
    const { Authorization: _, ...safeHeaders } = requestHeaders;
    console.error('- Request Headers:', safeHeaders);
  }
  if (requestBody) console.error('- Request Body:', requestBody);
  if (responseBody) console.error('- Response Body:', responseBody);
};
`,
  }),
};
