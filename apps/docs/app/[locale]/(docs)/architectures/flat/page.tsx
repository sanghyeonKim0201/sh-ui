export const dynamic = "force-static";

import { getArchByName } from "sh-ui-cli/api";

import { CodePanel } from "@/components/ui/code-panel";

const flat = getArchByName("flat");

export default function FlatArchPage() {
  return (
    <main className="container">
      <h1>Flat</h1>
      <p className="muted">{flat.description}</p>

      <h2>폴더 구조</h2>
      <CodePanel
        language="text"
        filename="project root"
        code={`app/                 ← Next.js 라우터 (arch-neutral)
├── layout.tsx
├── page.tsx
└── api/

components/          ← 모든 React 컴포넌트
├── layouts/         ← RootLayout 등 라우트 레이아웃 본체
├── providers/       ← GlobalProvider + 그 안에 합성되는 wrapper 들
└── common/          ← 공용 부품 (FallbackBoundary, PrefetchBoundary)

lib/                 ← 모든 비-컴포넌트 코드
├── api/             ← HTTP, BFF, observability
├── config/          ← i18n 등 환경 의존 설정
├── hooks/
├── utils/           ← 순수 유틸 (포맷팅 등)
└── test/`}
      />

      <h2>FSD 와 무엇이 다른가</h2>
      <ul>
        <li>
          <strong>슬라이스 (entities/features/widgets/views) 가 없음.</strong>{" "}
          도메인 분리는 사용자가 필요할 때 직접 폴더로 만든다 (예:{" "}
          <code>components/cart/</code>, <code>lib/auth/</code>). 처음부터 강제
          안 함.
        </li>
        <li>
          <strong>레이어 의존 규칙이 없음.</strong> FSD 의 단방향 의존 그래프
          대신, vanilla Next 처럼 자유롭게 import. 그 대신 코드가 늘면 폴더가
          발산할 위험.
        </li>
        <li>
          <strong>공유 자원이 두 개로만 나뉨.</strong> <code>components/</code>{" "}
          (UI) 와 <code>lib/</code> (그 외). FSD 의 <code>shared/</code> 안 7개
          서브폴더 대비 단순.
        </li>
      </ul>

      <h2>import alias — scoped</h2>
      <p>
        FSD 의 catch-all <code>@/*</code> 와 다르게 flat 은 카테고리별 scoped
        alias 를 쓴다:
      </p>
      <CodePanel
        language="json"
        filename="tsconfig.json (compilerOptions.paths)"
        code={JSON.stringify(flat.tsconfigPaths, null, 2)}
      />
      <p>이유:</p>
      <ul>
        <li>
          import 한 줄만 봐도 카테고리가 즉시 보임 (<code>@/lib/api/x</code> ↔{" "}
          <code>@/components/cart/x</code>)
        </li>
        <li>
          짧고 명료 — flat 의 강점인 "가독성" 과 정합
        </li>
        <li>
          새 카테고리가 필요하면 alias 한 줄만 추가 — 다른 레이어 영향 없음
        </li>
      </ul>
      <CodePanel
        language="ts"
        filename="example"
        code={`import { GlobalProvider } from '${flat.aliases.providers}';
import { ApiError } from '${flat.aliases.api}/error';
import { useAppMutation } from '${flat.aliases.hooks}/useAppMutation';
import { formatDate } from '${flat.aliases.utils}/formatDate';`}
      />

      <h2>플러그인 산출물 위치</h2>
      <ul>
        <li>
          <strong>next-intl</strong> — <code>{flat.paths.config}/i18n/</code>
        </li>
        <li>
          <strong>auth-jwt</strong> — <code>{flat.paths.api}/</code>
        </li>
        <li>
          <strong>sentry</strong> — observability 가 <code>{flat.paths.api}/</code>
          , FallbackBoundary 가 <code>{flat.paths.ui}/</code>
        </li>
      </ul>

      <h2>언제 적합한가</h2>
      <ul>
        <li>토이 프로젝트, 데모, 일회성 도구</li>
        <li>1~2명이 짧게 (몇 주 내) 만드는 앱</li>
        <li>vanilla Next.js 관용에 익숙한 팀 — 학습 곡선 0</li>
        <li>도메인이 작고 앞으로도 작게 유지될 예정인 경우</li>
      </ul>
      <p>
        반대로 도메인이 5개+ 이거나 여러 사람이 동시에 손대는 프로젝트라면{" "}
        <a href="/architectures/fsd">FSD</a> 가 폴더 발산을 막아준다.
      </p>

      <h2>FSD 로 마이그레이션</h2>
      <p>flat 으로 시작했다가 커지면서 옮기고 싶다면:</p>
      <ol>
        <li>
          <code>lib/api/</code> → <code>src/shared/api/</code>
        </li>
        <li>
          <code>lib/utils/</code> → <code>src/shared/lib/</code>
        </li>
        <li>
          <code>components/layouts/</code> → <code>src/app/layouts/</code>
        </li>
        <li>
          <code>components/providers/</code> → <code>src/app/providers/</code>
        </li>
        <li>
          <code>components/common/</code> → <code>src/shared/ui/</code>
        </li>
        <li>
          tsconfig <code>paths</code> 를 <code>{`{ "@/*": ["./*"] }`}</code> 로
          교체 + 모든 <code>@/lib/*</code>, <code>@/components/*</code> import
          를 <code>@/src/...</code> 로 sed
        </li>
        <li>
          앱이 커진 만큼 도메인 슬라이스 (<code>src/entities/</code>,{" "}
          <code>src/features/</code>) 를 추가하기 시작
        </li>
      </ol>
      <p>
        sh-ui CLI 가 자동 마이그레이션을 제공하지는 않지만 (현재) 위 변환은 한
        시간 정도면 끝나는 작업이다.
      </p>
    </main>
  );
}
