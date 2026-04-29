export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function SentryPlugin() {
  return (
    <main className="container">
      <h1>sentry</h1>
      <p className="muted">
        에러 모니터링 플러그인. 클라/서버/엣지 init, 라우트 에러 페이지, 그리고
        observability 브릿지를 통해 베이스 + 다른 플러그인의 5xx 를 자동
        캡처한다.
      </p>

      <h2>1. 개요</h2>
      <ul>
        <li>
          <strong>Init 자동화:</strong>{" "}
          <code>sentry.{`{server,edge}`}.config.ts</code>,{" "}
          <code>instrumentation.ts</code>, <code>instrumentation-client.ts</code>{" "}
          가 한 번에 깔린다. <code>next.config.ts</code> 가{" "}
          <code>withSentryConfig</code> 로 감싸지고 tunnelRoute 까지 설정.
        </li>
        <li>
          <strong>Observability 브릿지:</strong> 베이스의{" "}
          <code>src/shared/api/observability.ts</code> 를 Sentry-aware 버전으로
          덮어써 BFF / serverFetch 의 5xx 를 자동 캡처한다 — auth-jwt 같은 다른
          플러그인이 같이 켜져도 별도 작업 없이 동작.
        </li>
        <li>
          <strong>노이즈 제외:</strong> ApiError(401), AbortError, ChunkLoadError,
          확장프로그램 도메인, 4xx 비즈니스 에러는 자동으로 빠진다.
        </li>
        <li>
          <strong>에러 페이지:</strong> <code>app/error.tsx</code>,{" "}
          <code>app/global-error.tsx</code>, FallbackBoundary 가 같이 깔려서 에러
          UI + 캡처가 일관되게 동작.
        </li>
      </ul>

      <h2>2. 설치</h2>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npm create sh-ui my-app -- --platform next --structure standalone --plugins sentry --yes`}
      />

      <h2>3. 폴더 구조</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`my-app/
├── sentry.server.config.ts                 ← NEW   서버 init (4xx/info 제외)
├── sentry.edge.config.ts                   ← NEW   엣지 init
├── instrumentation.ts                      ← NEW   register + onRequestError
├── instrumentation-client.ts               ← NEW   브라우저 init + replay
├── next.config.ts                          ← MODIFY  withSentryConfig 로 감싸짐
├── src/
│   └── shared/
│       ├── api/
│       │   └── observability.ts            ← OVERWRITE  Sentry-aware 캡처/로그
│       └── ui/
│           └── FallbackBoundary/
│               └── index.tsx               ← NEW   ErrorBoundary + Sentry 캡처
└── app/
    ├── error.tsx                           ← NEW   라우트 에러 페이지
    └── global-error.tsx                    ← NEW   루트 에러 페이지`}
      />
      <h3>각 파일이 하는 일</h3>
      <ul>
        <li>
          <code>sentry.server.config.ts / edge.config.ts</code> — 서버/엣지
          런타임에서 Sentry SDK 초기화. <code>NEXT_PUBLIC_SENTRY_DSN</code> 없으면
          비활성. ApiError(401), warning/info 레벨, 서버 컴포넌트 렌더 에러는
          자동 제외.
        </li>
        <li>
          <code>instrumentation.ts</code> — Next 16 의 OTEL 훅. 런타임에 따라
          알맞은 config 를 dynamic import + <code>onRequestError</code> 에서
          ApiError 를 제외.
        </li>
        <li>
          <code>instrumentation-client.ts</code> — 브라우저 init. Replay
          50% (에러 시), ResizeObserver/AbortError/ChunkLoadError 노이즈 제외,
          확장프로그램 도메인 deny.
        </li>
        <li>
          <code>src/shared/api/observability.ts</code> — 베이스의 no-op 을
          Sentry-aware 로 덮어씀.{" "}
          <strong>5xx 만 보고</strong> (4xx 는 UI 처리), fingerprint 는{" "}
          <code>[method, apiPath, status]</code> 로 묶어 알림 파편화 방지.
        </li>
        <li>
          <code>FallbackBoundary</code> — Suspense + ErrorBoundary 묶음.
          ErrorBoundary 안에서 ApiError 는 캡처에서 빼고 일반 에러만 Sentry 로.
        </li>
        <li>
          <code>app/error.tsx, global-error.tsx</code> — 라우트별 / 루트 에러
          UI. 마운트 시 Sentry 캡처.
        </li>
      </ul>

      <h2>4. 아키텍처 — Observability 브릿지</h2>
      <CodePanel
        language="text"
        filename="브릿지 동작"
        showLineNumbers={false}
        code={`베이스 템플릿
  src/shared/api/observability.ts  →  no-op (캡처 X, 로그 X)

Sentry 플러그인 활성화
  src/shared/api/observability.ts  →  Sentry-aware (덮어씌워짐)

베이스의 BFF / serverFetch / clientFetch 가 import 하는 파일은 동일
  → Sentry 가 켜지면 자동 활성화, 꺼지면 자동 비활성화
  → try/catch import 트릭 불필요`}
      />
      <p>
        이 패턴 덕에 <strong>auth-jwt 의 BFF</strong> 가 refresh 후에도 5xx 를
        받으면 자동으로 Sentry 에 캡처된다 — 두 플러그인 사이에 의존성 코드 없이.
      </p>

      <h2>5. 사용 패턴</h2>

      <h3>FallbackBoundary 로 에러/Suspense 묶기</h3>
      <CodePanel
        language="tsx"
        filename="src/widgets/order/OrderListBoundary.tsx"
        code={`import { FallbackBoundary } from '@/src/shared/ui/FallbackBoundary';
import { OrderList } from './OrderList';
import { OrderListSkeleton } from './OrderListSkeleton';
import { OrderListError } from './OrderListError';

export function OrderListBoundary() {
  return (
    <FallbackBoundary
      suspenseFallback={<OrderListSkeleton />}
      errorFallback={OrderListError}
    >
      <OrderList />
    </FallbackBoundary>
  );
}`}
      />

      <h3>수동 캡처 (필요할 때만)</h3>
      <CodePanel
        language="ts"
        code={`import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'checkout' },
    extra: { orderId },
  });
  throw error;
}`}
      />
      <p className="muted">
        대부분 BFF + ErrorBoundary 가 자동으로 잡으므로 수동 캡처는 도메인
        문맥(tags, extra) 을 강제로 추가해야 할 때만.
      </p>

      <h2>6. 환경 변수</h2>
      <CodePanel
        language="bash"
        filename=".env"
        code={`SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=dev`}
      />
      <p>
        DSN 이 비어 있으면 Sentry 가 자동으로 비활성화된다 (init 에서{" "}
        <code>enabled: !!DSN</code>). 로컬 개발에서 DSN 안 채워도 아무 문제 없음.
      </p>

      <h2>7. 커스터마이징</h2>

      <h3>5xx 외 다른 status 도 캡처하고 싶다면</h3>
      <p>
        <code>src/shared/api/observability.ts</code> 의{" "}
        <code>captureApiError</code> 안 가드를 수정.
      </p>
      <CodePanel
        language="ts"
        code={`// 기본
if (!status || status < 500) return;

// 4xx 도 보고하고 싶으면 (단, 노이즈 폭발 주의)
if (!status || status < 400) return;

// 특정 path 만
if (!status || status < 500) return;
if (!apiPath.startsWith('v1/payment/')) return;`}
      />

      <h3>fingerprint 변경</h3>
      <p>
        같은 path + status 라도 다른 이슈로 묶고 싶으면 fingerprint 에 식별자를
        추가.
      </p>
      <CodePanel
        language="ts"
        code={`scope.setFingerprint([
  method,
  apiPath,
  String(status),
  errorBody?.code ?? 'unknown',  // 에러 코드별로 분리
]);`}
      />

      <h3>Replay 비율 조정</h3>
      <p>
        <code>instrumentation-client.ts</code> 의{" "}
        <code>replaysOnErrorSampleRate</code> (기본 0.5) 를 조절.
        <code>replaysSessionSampleRate</code> 는 0 이 디폴트 — 정상 세션
        리플레이는 안 찍는다.
      </p>

      <h2 id="combinations">8. 다른 플러그인과 조합</h2>
      <ul>
        <li>
          <strong>+ auth-jwt</strong> — observability 브릿지가 BFF 의 5xx 를 자동
          캡처. ApiError(401) 은 Sentry 의 beforeSend 에서 자동 제외.
        </li>
        <li>
          <strong>+ next-intl</strong> — 미들웨어 합성과 무관. Sentry 는 init /
          캡처 레이어라 i18n 과 충돌 없음.
        </li>
      </ul>
    </main>
  );
}
