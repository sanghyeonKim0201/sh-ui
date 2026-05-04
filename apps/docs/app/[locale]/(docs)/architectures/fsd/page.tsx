export const dynamic = "force-static";

import { getArchByName } from "sh-ui-cli/api";

import { CodePanel } from "@/components/ui/code-panel";

const fsd = getArchByName("fsd");

export default function FsdArchPage() {
  return (
    <main className="container">
      <h1>FSD — Feature-Sliced Design</h1>
      <p className="muted">{fsd.description}</p>

      <h2>슬라이스 구조</h2>
      <CodePanel
        language="text"
        filename="src/"
        code={`src/
├── app/                ← 라우트 진입에 가까운 것 (RootLayout, providers 합성)
│   ├── layouts/
│   └── providers/
├── views/              ← 페이지 단위 컴포지션 (route 컴포넌트)
├── widgets/            ← 여러 features/entities 를 합친 큰 UI 블록
├── features/           ← 한 사용자 시나리오를 처리하는 단위 (예: AddToCart)
├── entities/           ← 도메인 모델 + 그 모델만 다루는 UI/API
└── shared/             ← 도메인 무관한 재사용 자원
    ├── api/            ← HTTP, BFF, observability
    ├── config/         ← i18n, 환경 의존 상수
    ├── hooks/
    ├── lib/            ← 순수 유틸 (포맷팅, 변환)
    ├── ui/             ← 공용 부품 (FallbackBoundary, PrefetchBoundary)
    └── test/`}
      />

      <h2>의존 방향</h2>
      <p>
        FSD 의 핵심 규칙: <strong>위 레이어가 아래 레이어를 import 한다.</strong>
      </p>
      <p>
        <code>app → views → widgets → features → entities → shared</code>
      </p>
      <p>
        같은 레이어 내 슬라이스끼리는 import 하지 않는다 — 예를 들어{" "}
        <code>features/addToCart</code> 가 <code>features/checkout</code> 을
        import 하면 안 됨. 공통 로직이 필요하면 한 레이어 아래로 추출.
      </p>

      <h2>sh-ui 의 FSD 해석 — 차이점</h2>
      <ul>
        <li>
          공식 FSD 의 <code>processes</code> 레이어는 deprecated 라 sh-ui
          템플릿에 없음.
        </li>
        <li>
          <code>app/layouts</code> 는 공식 FSD 의 <code>app/</code> 레이어 안에
          있는 자유로운 슬라이스 — Next 의 라우트 layout 을 받는 자리로 명시화.
        </li>
        <li>
          <code>app/providers</code> 의 <code>GlobalProvider</code> 가 모든
          context wrapper 의 합성점. 플러그인이 wrapper 를 추가하면 여기 얹힘.
        </li>
        <li>
          빈 슬라이스 폴더 (<code>entities/</code>, <code>features/</code> 등) 는{" "}
          <code>.gitkeep</code> 로 생성 — 사용자가 어느 레이어에 무엇이 들어가는지
          즉시 인지하도록.
        </li>
      </ul>

      <h2>import alias</h2>
      <p>
        tsconfig <code>paths</code> 는 catch-all <code>@/*</code> → <code>./*</code>{" "}
        한 줄. 모든 import 가 동일한 prefix 로 시작:
      </p>
      <CodePanel
        language="ts"
        filename="example"
        code={`import { GlobalProvider } from '${fsd.aliases.providers}';
import { ApiError } from '${fsd.aliases.api}/error';
import { useAppMutation } from '${fsd.aliases.hooks}/useAppMutation';
import { formatDate } from '${fsd.aliases.utils}/formatDate';`}
      />

      <h2>플러그인 산출물 위치</h2>
      <ul>
        <li>
          <strong>next-intl</strong> — i18n 설정이{" "}
          <code>{fsd.paths.config}/i18n/</code> 에 떨어짐 (routing.ts,
          request.ts, navigation.ts, messages/*.json)
        </li>
        <li>
          <strong>auth-jwt</strong> — refreshSession.ts / withAuthRetry.ts 가{" "}
          <code>{fsd.paths.api}/</code> 에 떨어짐
        </li>
        <li>
          <strong>sentry</strong> — observability.ts 가{" "}
          <code>{fsd.paths.api}/</code> 에 깔리고 (베이스 no-op 을 덮어씀),
          FallbackBoundary 가 <code>{fsd.paths.ui}/</code> 에 추가됨
        </li>
      </ul>

      <h2>언제 적합한가</h2>
      <ul>
        <li>도메인 모델이 5개 이상이고 늘어날 가능성이 높을 때</li>
        <li>여러 사람이 동시에 손대는 팀 프로젝트 — 책임 경계가 폴더로 보임</li>
        <li>한국 시장 React 채용 — FSD 인지도가 높아 인수인계 수월</li>
      </ul>
      <p>
        반대로 토이 프로젝트나 1인 단발성 도구라면{" "}
        <a href="/architectures/flat">flat</a> 이 더 가벼움.
      </p>
    </main>
  );
}
