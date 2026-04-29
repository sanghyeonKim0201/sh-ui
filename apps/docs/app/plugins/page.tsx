export const dynamic = "force-static";

import Link from "next/link";

import { CodePanel } from "@/components/ui/code-panel";

export default function PluginsHub() {
  return (
    <main className="container">
      <h1>플러그인</h1>
      <p className="muted">
        sh-ui CLI 가 제공하는 옵션. <code>--plugins</code> 인자로 한 개 이상
        조합해 스캐폴드한다. 플러그인은 베이스 템플릿 위에 파일을 추가하거나
        덮어쓴다.
      </p>

      <h2>사용</h2>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`# 플러그인 없이
npx sh-ui-cli create my-app --platform next --structure standalone --yes

# 한 개
npx sh-ui-cli create my-app --platform next --structure standalone --plugins auth-jwt --yes

# 조합 (콤마 구분, 공백 X)
npx sh-ui-cli create my-app --platform next --structure standalone --plugins sentry,auth-jwt,next-intl --yes`}
      />

      <h2>현재 플러그인</h2>
      <ul>
        <li>
          <Link href="/plugins/auth-jwt">
            <strong>auth-jwt</strong>
          </Link>{" "}
          — 쿠키 기반 JWT 인증. Next 16 <code>proxy.ts</code> 미들웨어,
          refresh-aware BFF, <code>withAuthRetry</code> 헬퍼. refresh 본문은
          placeholder — 백엔드 명세 확정 후 한 파일 채우면 자동 활성화.
        </li>
        <li>
          <Link href="/plugins/sentry">
            <strong>sentry</strong>
          </Link>{" "}
          — 에러 모니터링. 클라/서버/엣지 init, 라우트 에러 페이지, observability
          브릿지로 다른 플러그인의 5xx 자동 캡처.
        </li>
        <li>
          <Link href="/plugins/next-intl">
            <strong>next-intl</strong>
          </Link>{" "}
          — 다국어. 라우트 기반 로케일, <code>NEXT_LOCALE</code> 쿠키, BFF
          가 백엔드로 <code>Accept-Language</code> 자동 전달.
        </li>
      </ul>

      <h2>조합 매트릭스</h2>
      <p>
        모든 플러그인은 서로 독립이다. 베이스의 공유 인터페이스
        (<code>observability.ts</code>, <code>refreshSession.ts</code> 등) 가
        있어 같이 켜도 충돌하지 않는다.
      </p>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`               sentry      auth-jwt    next-intl
sentry         —           5xx 자동 캡처   5xx 자동 캡처
auth-jwt       (←)         —              로케일 헤더 전달
next-intl      (←)         (←)            —`}
      />
      <ul>
        <li>
          <strong>sentry + auth-jwt</strong> — Sentry 가 베이스의{" "}
          <code>observability.ts</code> 를 덮어써 BFF 의 refresh 재시도 + 5xx
          를 자동 캡처. ApiError(401) 은 비즈니스 에러로 분류돼 캡처에서 빠짐.
        </li>
        <li>
          <strong>sentry + next-intl</strong> — 미들웨어 합성. next-intl 의{" "}
          <code>createIntlMiddleware</code> 가 proxy.ts 위에서 작동.
        </li>
        <li>
          <strong>auth-jwt + next-intl</strong> — proxy.ts 가 i18n 미들웨어와
          함께 합성된다. 인증 라우트 가드는 그대로, locale prefix 가 인증 경로
          매칭에서 제외돼야 함 (auth-jwt 페이지 참고).
        </li>
        <li>
          <strong>셋 다</strong> — 위 3 케이스가 그대로 적용된다.
        </li>
      </ul>

      <h2>플러그인 vs 레시피</h2>
      <p>
        <Link href="/recipes">레시피</Link> 는{" "}
        <strong>플러그인이 없어도 베이스에 적용 가능한 일반 패턴</strong> 이다.
        예: API 레이어 transport 설계, RSC prefetch + hydration, 파일 업로드,
        테스트 셋업 등. 플러그인은 CLI 가 깔아주는 코드 묶음이고, 레시피는
        직접 작성하는 패턴이다.
      </p>
    </main>
  );
}
