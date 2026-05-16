export const dynamic = "force-static";

import Link from "next/link";
import { allPlugins } from "sh-ui-cli/api";

import { CodePanel } from "@/components/ui/code-panel";

const PLUGIN_NAMES = allPlugins.map((p) => p.name);
const SAMPLE_ONE = PLUGIN_NAMES[0] ?? "next-intl";

export default function PluginsHub() {
  return (
    <main className="container">
      <h1>플러그인</h1>
      <p className="muted">
        sh-ui CLI 가 제공하는 옵션. <code>--plugins</code> 인자로 선택해
        스캐폴드한다. 플러그인은 베이스 템플릿 위에 파일을 추가하거나
        덮어쓴다.
      </p>

      <h2>사용</h2>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`# 플러그인 없이
npx sh-ui-cli create my-app --platform next --structure standalone --yes

# 플러그인 지정
npx sh-ui-cli create my-app --platform next --structure standalone --plugins ${SAMPLE_ONE} --yes`}
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
