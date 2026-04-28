export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function SentryRecipe() {
  return (
    <main className="container">
      <h1>Sentry 통합</h1>
      <p className="muted">
        라우트 핸들러와 <code>http.ts</code>에서 백엔드 에러를 캡처한다.
        4xx 비즈니스 에러와 로그인 실패는 제외해 노이즈를 줄인다.
      </p>

      <h2>설치</h2>
      <p>
        Next.js 통합 wizard 가 sentry 초기화 파일들과 next config 변경을 자동으로
        처리한다.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx @sentry/wizard@latest -i nextjs`}
      />
      <p>
        wizard 가 만드는 파일: <code>sentry.client.config.ts</code>,{" "}
        <code>sentry.server.config.ts</code>, <code>sentry.edge.config.ts</code>,{" "}
        <code>instrumentation.ts</code>. 환경변수에{" "}
        <code>SENTRY_DSN</code>(또는 <code>NEXT_PUBLIC_SENTRY_DSN</code>) 추가.
      </p>

      <h2>캡처 위치 — 두 곳</h2>
      <ul>
        <li>
          <strong>라우트 핸들러 (BFF)</strong> — 백엔드 응답 자체의 에러를 캡처.
          모든 클라이언트 요청이 BFF 를 거치므로 이 레이어에서 잡으면
          중복 없이 충분.
        </li>
        <li>
          <strong><code>http.ts</code> 서버 컨텍스트</strong> — 서버
          컴포넌트에서 호출 시 BFF 를 거치지만, 그 BFF 가 자기 응답 인터셉터에서
          throw 한 ApiError 는 BFF 에서 이미 캡처된 상태. 추가 캡처가 필요한 건{" "}
          <strong>BFF 자체가 죽은 경우</strong>(네트워크 에러 등). 일반적으론
          BFF 캡처만으로 충분하다.
        </li>
      </ul>

      <h2>공유 캡처 헬퍼</h2>
      <CodePanel
        language="ts"
        filename="src/shared/api/sentryCapture.ts"
        code={`import * as Sentry from '@sentry/nextjs';

const AUTH_LOGIN_PATH = 'v1/auth/login';

type ApiSentryCapture = {
  url: string;
  apiPath: string;
  method: string;
  status: number | undefined;
  responseBody?: unknown;
};

export const captureApiError = (params: ApiSentryCapture): void => {
  const { url, apiPath, method, status, responseBody } = params;

  // 5xx 서버 에러만 보고. 4xx 비즈니스 에러는 UI 에서 처리.
  if (!status || status < 500) return;

  // 로그인 실패는 자주 발생하고 비즈니스 에러에 가깝다 — 제외.
  if (apiPath === AUTH_LOGIN_PATH) return;

  Sentry.withScope((scope) => {
    scope.setTag('error.type', 'api');
    scope.setContext('API Request', { method, url });
    scope.setContext('API Response', {
      status,
      body: JSON.stringify(responseBody),
    });
    scope.setFingerprint([method, apiPath, String(status)]);

    Sentry.captureException(
      new Error(\`[API] \${method} \${apiPath} \${status}\`),
    );
  });
};`}
      />
      <p>
        <strong>fingerprint</strong>: <code>[method, apiPath, status]</code>로
        고정해 같은 엔드포인트의 같은 상태 코드는 한 이슈로 묶인다 — 알림이
        파편화되지 않음.
      </p>

      <h2>라우트 핸들러에 끼우기</h2>
      <CodePanel
        language="ts"
        filename="app/api/proxy/[...path]/route.ts (응답 처리 후)"
        code={`import { captureApiError } from '@/shared/api/sentryCapture';

// proxyRequest 안 — 백엔드 응답을 받은 직후
if (!response.ok) {
  captureApiError({
    url: url.toString(),
    apiPath,
    method,
    status: response.status,
    responseBody: data,
  });
}`}
      />

      <h2>구조화된 로그 (개발 환경)</h2>
      <p>
        프로덕션엔 Sentry, 개발엔 콘솔에 보기 좋은 로그를 남긴다.
        Authorization 헤더는 자동으로 마스킹.
      </p>
      <CodePanel
        language="ts"
        filename="src/shared/api/apiLog.ts"
        code={`type ApiErrorLogParams = {
  url: string;
  method: string;
  status: number | undefined;
  requestHeaders?: Record<string, string | undefined>;
  requestBody?: unknown;
  responseBody?: unknown;
};

export const logApiError = (prefix: string, params: ApiErrorLogParams) => {
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
};`}
      />
      <p>
        라우트 핸들러에서 <code>captureApiError</code>와 함께 호출:
      </p>
      <CodePanel
        language="ts"
        code={`if (!response.ok) {
  if (process.env.NODE_ENV === 'development') {
    logApiError('PROXY', { url: url.toString(), method, status: response.status, requestHeaders: headers, responseBody: data });
  }
  captureApiError({ url: url.toString(), apiPath, method, status: response.status, responseBody: data });
}`}
      />

      <h2>네트워크 에러도 캡처</h2>
      <p>
        라우트 핸들러의 try-catch 분기 (백엔드에 연결 자체가 실패) 도 보고한다.
      </p>
      <CodePanel
        language="ts"
        code={`} catch (error) {
  Sentry.captureException(error, {
    level: 'error',
    tags: { action: 'proxy_network_error' },
    extra: { url: url.toString(), method },
  });
  return NextResponse.json(
    { result: 'ERROR', data: null, error: { code: 'NETWORK_ERROR', message: '서버에 연결할 수 없습니다.' } },
    { status: 502 },
  );
}`}
      />

      <h2>제외 정책</h2>
      <ul>
        <li>
          <strong>4xx 비즈니스 에러</strong> — 검증 실패·중복·권한 등은 UI 에서
          처리하고 알림에는 포함하지 않는다.
        </li>
        <li>
          <strong>401 / AUTH_EXPIRED</strong> — 정상적인 토큰 만료. 캡처하면
          노이즈만 늘어남.
        </li>
        <li>
          <strong>로그인 실패</strong> — 사용자 입력 오류. 비즈니스 에러로 간주.
        </li>
      </ul>
    </main>
  );
}
