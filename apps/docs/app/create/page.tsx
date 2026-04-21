export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { PropsTable } from "@/components/props-table";

export default function CreatePage() {
  return (
    <main className="container">
      <h1>프로젝트 생성</h1>
      <p className="muted">
        <code>sh-ui-create</code> — sh-ui 가 미리 설정된 Next.js 프로젝트를 스캐폴드한다. FSD 폴더 구조, <code>sh-ui.config.json</code>,
        기본 토큰 파일, 자주 쓰는 플러그인(Sentry, next-intl)까지 한 번에.
      </p>

      <h2>빠른 시작</h2>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-create`} />
      <p>대화형 프롬프트로 프로젝트 이름, 구조(단독/모노레포), 플러그인을 선택하면 현재 디렉토리에 프로젝트가 생성된다.</p>

      <h2>명령 개요</h2>
      <PropsTable
        rows={[
          { prop: "sh-ui-create", type: "command", description: "새 프로젝트 생성 (단독 또는 모노레포)." },
          { prop: "sh-ui-create add-app", type: "command", description: "모노레포 루트에서 앱을 추가한다 (apps/{name} + packages/ui/ui-apps/ui-{name})." },
          { prop: "sh-ui-create add-component <name>", type: "command", description: "sh-ui 컴포넌트를 설치. 내부적으로 sh-ui add 를 위임 호출." },
          { prop: "sh-ui-create add-component <name> --app <app>", type: "command", description: "모노레포에서 특정 앱의 ui 패키지에만 추가." },
        ]}
      />

      <h2>프로젝트 구조 선택</h2>

      <h3>단독 (Next.js standalone)</h3>
      <p>독립 실행 가능한 단일 Next.js 앱. 혼자 쓰거나 작은 프로젝트용.</p>
      <CodePanel
        language="txt"
        code={`my-app/
├── app/                      # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css           # sh-ui tokens.css import + Tailwind
├── src/                      # FSD 구조
│   ├── app/
│   │   └── providers/        # QueryClient, Theme, Toaster
│   ├── shared/
│   │   ├── ui/               # ← sh-ui 컴포넌트가 여기로 복사됨
│   │   ├── lib/utils.ts      # cn()
│   │   ├── styles/tokens.css # sh-ui 디자인 토큰
│   │   └── ...
│   ├── entities/
│   ├── features/
│   ├── views/
│   └── widgets/
├── sh-ui.config.json         # platform=react, paths=FSD
└── next.config.ts`}
      />

      <h3>모노레포 (Turborepo + pnpm)</h3>
      <p>여러 앱이 한 리포에 공존. 각 앱은 자체 <code>ui-{"{app}"}</code> 패키지를 가져 <strong>앱별 독립 테마</strong>를 유지한다.</p>
      <CodePanel
        language="txt"
        code={`my-project/
├── apps/
│   └── web/                      # 첫 번째 Next.js 앱
├── packages/
│   ├── ui/
│   │   ├── ui-core/              # cn 등 로직 공유
│   │   └── ui-apps/
│   │       └── ui-web/           # web 전용 sh-ui (독립 sh-ui.config.json)
│   │           ├── sh-ui.config.json
│   │           └── src/
│   │               ├── components/    # sh-ui 컴포넌트
│   │               └── styles/
│   │                   ├── globals.css
│   │                   └── tokens.css
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json
└── pnpm-workspace.yaml`}
      />
      <p className="muted">
        <strong>ui-core</strong> 는 기능/유틸을 한 곳에서 관리 (모든 앱에 반영).
        <strong>ui-{"{app}"}</strong> 은 스타일/테마를 앱별로 독립 관리 (각자 다른 <code>sh-ui.config.json</code>).
      </p>

      <h2>컴포넌트 추가</h2>
      <p>생성된 프로젝트에서 sh-ui 컴포넌트를 추가할 때:</p>
      <CodeTabs
        items={[
          {
            value: "standalone",
            label: "단독",
            language: "bash",
            code: `cd my-app
npx sh-ui-create add-component button
# 또는 바로: npx sh-ui add button`,
          },
          {
            value: "monorepo-all",
            label: "모노레포 (전체)",
            language: "bash",
            code: `cd my-project
# 대화형으로 대상 패키지 선택
npx sh-ui-create add-component button
# 선택지: "모든 ui 패키지" / 개별 패키지`,
          },
          {
            value: "monorepo-app",
            label: "모노레포 (특정 앱)",
            language: "bash",
            code: `cd my-project
# web 앱의 ui 패키지에만 추가
npx sh-ui-create add-component button --app web`,
          },
        ]}
      />
      <p className="muted">
        <code>add-component</code> 는 내부적으로 <code>npx sh-ui add {"<name>"}</code> 를 위임 호출한다.
        직접 <code>sh-ui add</code> 를 써도 결과는 같다. 모노레포에서 대상 패키지 자동 감지가 필요할 때만 <code>add-component</code> 를 쓴다.
      </p>

      <h2>플러그인</h2>
      <p>프로젝트 생성 시 체크박스로 선택. 필요한 파일·의존성·<code>next.config.ts</code> 래핑이 자동 구성된다.</p>

      <h3>Sentry — 에러 모니터링</h3>
      <PropsTable
        rows={[
          { prop: "sentry.server.config.ts / edge.config.ts", type: "file", description: "서버/Edge 런타임 초기화 + beforeSend 필터링." },
          { prop: "instrumentation.ts / -client.ts", type: "file", description: "런타임별 로드 + 요청/브라우저 에러 캡처." },
          { prop: "app/error.tsx / global-error.tsx", type: "file", description: "라우트/글로벌 에러 바운더리." },
          { prop: "src/shared/ui/FallbackBoundary/", type: "file", description: "컴포넌트 레벨 에러 바운더리 (React Query 통합)." },
          { prop: "src/shared/api/", type: "file", description: "ApiError, Axios 인터셉터, captureApiError()." },
          { prop: "app/api/proxy/[...path]/route.ts", type: "file", description: "API 프록시 (5xx만 Sentry 보고)." },
        ]}
      />
      <p className="muted">
        에러 수집 흐름: 클라 API → proxy route에서 <code>captureApiError()</code> (5xx) / 서버 API → http.ts 인터셉터에서 캡처 /
        UI 에러 → error.tsx, FallbackBoundary에서 <code>Sentry.captureException()</code>. 중복 방지는 <code>beforeSend</code> 필터 + instrumentation 에서 차단.
      </p>

      <h3>next-intl — 다국어</h3>
      <PropsTable
        rows={[
          { prop: "app/[locale]/layout.tsx", type: "file", description: "로케일별 레이아웃." },
          { prop: "app/[locale]/page.tsx", type: "file", description: "기존 page.tsx 가 이 경로로 자동 이동." },
          { prop: "proxy.ts", type: "file", description: "로케일 라우팅 미들웨어." },
          { prop: "src/shared/config/i18n/routing.ts", type: "file", description: "로케일 정의 (ko, en)." },
          { prop: "src/shared/config/i18n/navigation.ts", type: "file", description: "로케일 인식 Link, useRouter 등." },
          { prop: "src/shared/config/i18n/messages/", type: "dir", description: "ko.json, en.json 기본 메시지." },
          { prop: "GlobalProvider", type: "patch", description: "NextIntlClientProvider 자동 래핑." },
        ]}
      />
      <p>Sentry + next-intl 을 모두 선택하면 <code>next.config.ts</code> 래핑이 자동으로 합쳐진다:</p>
      <CodePanel
        language="ts"
        code={`export default withSentryConfig(withNextIntl(nextConfig), { ... });`}
      />

      <h2>FSD (Feature-Sliced Design) 레이어</h2>
      <p>모든 템플릿은 FSD 구조를 따른다. ESLint <code>boundaries</code> 플러그인으로 레이어 규칙이 강제된다.</p>
      <CodePanel
        language="txt"
        code={`app → view → widget → feature → entity → shared
(상위 레이어는 하위 레이어만 import 가능)`}
      />
      <PropsTable
        rows={[
          { prop: "app", type: "layer", description: "앱 레벨 (providers, layouts, guards)." },
          { prop: "views", type: "layer", description: "페이지 단위 뷰." },
          { prop: "widgets", type: "layer", description: "조합형 UI 블록." },
          { prop: "features", type: "layer", description: "기능 단위." },
          { prop: "entities", type: "layer", description: "비즈니스 엔티티." },
          { prop: "shared", type: "layer", description: "공유 (api, lib, hooks, ui, config, model). sh-ui 컴포넌트는 여기 ui/ 로 복사됨." },
        ]}
      />

      <h2>기본 스택</h2>
      <p>모든 템플릿에 포함되는 라이브러리:</p>
      <PropsTable
        rows={[
          { prop: "Next.js 16 + React 19", type: "core", description: "App Router, React Compiler, standalone 출력." },
          { prop: "TypeScript 5.9", type: "core", description: "strict, ES2022." },
          { prop: "Tailwind CSS 4", type: "style", description: "@theme inline 으로 sh-ui 토큰 매핑 — bg-background 등 사용 가능." },
          { prop: "@base-ui-components/react", type: "peer", description: "sh-ui 가 의존하는 언스타일드 primitive." },
          { prop: "TanStack React Query + Axios", type: "data", description: "데이터 페칭." },
          { prop: "Zustand", type: "state", description: "상태 관리." },
          { prop: "next-themes + Sonner", type: "ui", description: "다크 모드 토글 + 토스트." },
          { prop: "Zod", type: "validation", description: "유효성 검증." },
          { prop: "Vitest + Testing Library", type: "test", description: "단위 테스트." },
          { prop: "ESLint 9 flat config", type: "lint", description: "FSD boundaries, import-x, tailwind 플러그인 포함." },
        ]}
      />

      <h2>다음 단계</h2>
      <ul>
        <li><a href="/getting-started">시작하기</a> — 기존 프로젝트에 sh-ui 수동 도입</li>
        <li><a href="/cli">CLI</a> — <code>sh-ui add/remove/list</code> 전체 레퍼런스</li>
        <li><a href="/tokens">토큰</a> — 템플릿에 포함된 토큰 목록</li>
      </ul>
    </main>
  );
}
