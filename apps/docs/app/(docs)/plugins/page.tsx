export const dynamic = "force-static";

import Link from "next/link";
import { allPlugins } from "sh-ui-cli/api";

import { CodePanel } from "@/components/ui/code-panel";

const PLUGIN_NAMES = allPlugins.map((p) => p.name);
const SAMPLE_COMBO = PLUGIN_NAMES.join(",");
const SAMPLE_ONE = PLUGIN_NAMES[0] ?? "auth-jwt";

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
npx sh-ui-cli create my-app --platform next --structure standalone --plugins ${SAMPLE_ONE} --yes

# 조합 (콤마 구분, 공백 X)
npx sh-ui-cli create my-app --platform next --structure standalone --plugins ${SAMPLE_COMBO} --yes`}
      />

      <h2>현재 플러그인</h2>
      <ul>
        {allPlugins.map((p) => (
          <li key={p.name}>
            <Link href={`/plugins/${p.name}`}>
              <strong>{p.name}</strong>
            </Link>
            {p.description ? ` — ${p.description}` : ` — ${p.label}`}
          </li>
        ))}
      </ul>

      <h2>조합 매트릭스</h2>
      <p>
        모든 플러그인은 서로 독립이다. 베이스의 공유 인터페이스
        (<code>observability.ts</code>, <code>refreshSession.ts</code> 등) 가
        있어 같이 켜도 충돌하지 않는다.
      </p>
      <ul>
        <li>
          <strong>sentry + auth-jwt</strong> — Sentry 가 베이스의{" "}
          <code>observability.ts</code> 를 덮어써 BFF 의 refresh 재시도 + 5xx
          를 자동 캡처. ApiError(401) 은 비즈니스 에러로 분류돼 캡처에서 빠짐.
        </li>
        <li>
          <strong>sentry + next-intl</strong> — <code>next.config.ts</code>{" "}
          래핑이 자동 합쳐짐: <code>withSentryConfig(withNextIntl(...))</code>.
        </li>
        <li>
          <strong>auth-jwt + next-intl</strong> — generator 가{" "}
          <code>proxy.ts</code> 를 자동 합성 (intl 미들웨어 + locale prefix
          벗긴 경로 기반 인증 가드).
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
