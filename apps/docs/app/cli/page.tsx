export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/ui/code-tabs";
import { PropsTable } from "@/components/props-table";

export default function CliPage() {
  return (
    <main className="container">
      <h1>CLI 레퍼런스</h1>
      <p className="muted">
        sh-ui 는 단일 CLI <code>sh-ui-cli</code> 를 제공한다 — 프로젝트 스캐폴드(<code>create</code>) +
        컴포넌트 추가(<code>init/add/list/remove</code>) + IDE-내 AI 용 MCP 서버(<code>mcp</code>) 가 한 패키지.
      </p>
      <ul>
        <li><strong><a href="#create"><code>sh-ui-cli create</code></a></strong> — 새 프로젝트 스캐폴드. 인터랙티브로 테마까지 디자인하려면 <a href="/create">프로젝트 생성</a> 페이지의 UI 빌더 사용.</li>
        <li><strong><a href="#sh-ui"><code>sh-ui-cli init/add/list/remove</code></a></strong> — 기존 프로젝트에 토큰·컴포넌트를 복사·관리.</li>
      </ul>

      {/* ───────── sh-ui create ───────── */}

      <h2 id="create">sh-ui-cli create — 프로젝트 스캐폴드</h2>
      <p className="muted">
        sh-ui 가 미리 설정된 Next.js 또는 Flutter 프로젝트를 생성한다. FSD 폴더 구조, <code>sh-ui.config.json</code>,
        기본 토큰 파일, 자주 쓰는 플러그인(Sentry, next-intl)까지 한 번에.
      </p>

      <h3>빠른 시작</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli create`} />
      <p>대화형 프롬프트로 프로젝트 이름, 구조(단독/모노레포)를 선택하면 현재 디렉토리에 프로젝트가 생성된다.</p>
      <p className="muted">
        미리 디자인한 테마까지 한 번에 반영하고 싶다면 <a href="/create">프로젝트 생성</a> 페이지에서 색·radius 를 편집한 뒤 생성된 CLI 명령어를 복사하면 된다.
      </p>

      <h3>명령 개요</h3>
      <PropsTable
        rows={[
          { prop: "sh-ui-cli create [name]", type: "command", description: "새 프로젝트 생성 (단독 또는 모노레포)." },
          { prop: "sh-ui-cli create add-app", type: "command", description: "모노레포 루트에서 앱을 추가한다 (apps/{name} + packages/ui/ui-apps/ui-{name})." },
          { prop: "sh-ui-cli create add-component <name>", type: "command", description: "sh-ui 컴포넌트를 설치. 내부적으로 sh-ui add 를 위임 호출." },
          { prop: "sh-ui-cli create add-component <name> --app <app>", type: "command", description: "모노레포에서 특정 앱의 ui 패키지에만 추가." },
        ]}
      />

      <h3>비대화형 플래그</h3>
      <p>플래그로 값을 주면 해당 프롬프트는 스킵된다. TTY 없는 환경(에이전트/CI)에서는 누락된 필수 플래그가 있으면 prompt 대신 즉시 에러로 종료.</p>
      <PropsTable
        rows={[
          { prop: "--platform", type: `"next" | "flutter"` },
          { prop: "--structure", type: `"standalone" | "monorepo"`, description: "Next 전용." },
          { prop: "--plugins", type: "string", description: "콤마 분리. 예: sentry,next-intl. Next 전용. 미지정 시 빈 배열." },
          { prop: "--theme", type: "base64", description: "토큰 설정(base64). 플레이그라운드 UI 빌더가 생성." },
          { prop: "--yes", type: "boolean", description: "덮어쓰기 등 확인 프롬프트 스킵." },
        ]}
      />
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 완전 비대화형
pnpm dlx sh-ui-cli create my-app --platform next --structure standalone --plugins sentry --yes`}
      />

      <h3>프로젝트 구조 선택</h3>

      <h4>단독 (Next.js standalone)</h4>
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

      <h4>모노레포 (Turborepo + pnpm)</h4>
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

      <h3>컴포넌트 추가</h3>
      <p>생성된 프로젝트에서 sh-ui 컴포넌트를 추가할 때:</p>
      <CodeTabs
        items={[
          {
            value: "standalone",
            label: "단독",
            language: "bash",
            code: `cd my-app
npx sh-ui-cli create add-component button
# 또는 바로: npx sh-ui-cli add button`,
          },
          {
            value: "monorepo-all",
            label: "모노레포 (전체)",
            language: "bash",
            code: `cd my-project
# 대화형으로 대상 패키지 선택
npx sh-ui-cli create add-component button
# 선택지: "모든 ui 패키지" / 개별 패키지`,
          },
          {
            value: "monorepo-app",
            label: "모노레포 (특정 앱)",
            language: "bash",
            code: `cd my-project
# web 앱의 ui 패키지에만 추가
npx sh-ui-cli create add-component button --app web`,
          },
        ]}
      />
      <p className="muted">
        <code>add-component</code> 는 내부적으로 <code>npx sh-ui-cli add {"<name>"}</code> 를 위임 호출한다.
        직접 <code>sh-ui add</code> 를 써도 결과는 같다. 모노레포에서 대상 패키지 자동 감지가 필요할 때만 <code>add-component</code> 를 쓴다.
      </p>

      <h3>플러그인</h3>
      <p>프로젝트 생성 시 체크박스로 선택. 필요한 파일·의존성·<code>next.config.ts</code> 래핑이 자동 구성된다.</p>

      <h4>Sentry — 에러 모니터링</h4>
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

      <h4>next-intl — 다국어</h4>
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

      <h3>FSD (Feature-Sliced Design) 레이어</h3>
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

      <h3>기본 스택</h3>
      <p>모든 템플릿에 포함되는 라이브러리:</p>
      <PropsTable
        rows={[
          { prop: "Next.js 16 + React 19", type: "core", description: "App Router, React Compiler, standalone 출력." },
          { prop: "TypeScript 5.9", type: "core", description: "strict, ES2022." },
          { prop: "Tailwind CSS 4", type: "style", description: "@theme inline 으로 sh-ui 토큰 매핑 — bg-background 등 사용 가능." },
          { prop: "@base-ui/react", type: "peer", description: "sh-ui 가 의존하는 언스타일드 primitive." },
          { prop: "TanStack React Query + Axios", type: "data", description: "데이터 페칭." },
          { prop: "Zustand", type: "state", description: "상태 관리." },
          { prop: "next-themes + Sonner", type: "ui", description: "다크 모드 토글 + 토스트." },
          { prop: "Zod", type: "validation", description: "유효성 검증." },
          { prop: "Vitest + Testing Library", type: "test", description: "단위 테스트." },
          { prop: "ESLint 9 flat config", type: "lint", description: "FSD boundaries, import-x, tailwind 플러그인 포함." },
        ]}
      />

      {/* ───────── sh-ui ───────── */}

      <h2 id="sh-ui">sh-ui — 컴포넌트 설치·설정</h2>
      <p className="muted">
        설정 파일을 만들고 레지스트리에서 컴포넌트 소스를 프로젝트로 복사한다.
        복사된 코드는 <strong>사용자 프로젝트의 것</strong>이므로 자유롭게 수정할 수 있다.
      </p>

      <h3>설치 없이 바로 실행</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli <command> [args]`} />
      <p className="muted">
        설치형으로 쓰려면 <code>pnpm add -D sh-ui-cli</code> / <code>npm i -D sh-ui-cli</code>.
      </p>

      <h3>명령 개요</h3>
      <PropsTable
        rows={[
          { prop: "sh-ui init", type: "command", description: "프로젝트 루트에 sh-ui.config.json 생성." },
          { prop: "sh-ui add <name...>", type: "command", description: "레지스트리에서 컴포넌트 소스를 복사하고 필요한 외부 패키지를 자동 설치." },
          { prop: "sh-ui add tokens", type: "special", description: "설정 값을 치환해 토큰 파일 생성 (CSS 또는 Dart)." },
          { prop: "sh-ui list", type: "command", description: "현재 설치된 컴포넌트 목록 표시." },
          { prop: "sh-ui remove <name...>", type: "command", description: "설치된 컴포넌트 파일 삭제 (별칭 sh-ui rm)." },
        ]}
      />

      <h3>sh-ui init</h3>
      <p>대화형 프롬프트로 4개 축을 선택하면 <code>sh-ui.config.json</code>이 만들어진다.</p>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli init`} />

      <h4>플래그</h4>
      <PropsTable
        rows={[
          { prop: "--platform", type: `"react" | "flutter"`, default: `"react"` },
          { prop: "--base", type: `"neutral" | "zinc" | "slate"`, default: `"neutral"`, description: "기본 무채색 스케일." },
          { prop: "--radius", type: `"none" | "sm" | "md" | "lg" | "xl" | "full"`, default: `"md"` },
          { prop: "--mode", type: `"light" | "dark" | "light-dark"`, default: `"light-dark"` },
          { prop: "-y, --yes", type: "boolean", description: "프롬프트 없이 기본값/지정값으로 진행." },
          { prop: "--force", type: "boolean", description: "기존 sh-ui.config.json을 덮어쓴다." },
        ]}
      />

      <h4>비대화형 (CI용)</h4>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx sh-ui-cli init --yes --platform react --base neutral --radius md --mode light-dark`}
      />
      <p className="muted">
        비-TTY 환경(CI 등)에서는 <code>--yes</code> 없이 실행하면 에러. 모든 축을 플래그로 넘기거나 <code>--yes</code>로 기본값을 수용해야 한다.
      </p>

      <h3>sh-ui add</h3>
      <p>레지스트리에서 컴포넌트 소스 파일을 프로젝트의 <code>paths.components</code>로 복사한다. <code>registryDependencies</code>가 있으면 자동으로 함께 설치된다.</p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 단일 컴포넌트
npx sh-ui-cli add button

# 여러 개 동시에
npx sh-ui-cli add button card dialog

# 토큰 파일만 재생성 (sh-ui.config.json 값 기반)
npx sh-ui-cli add tokens`}
      />

      <h4>플래그</h4>
      <PropsTable
        rows={[
          { prop: "--skip-install", type: "boolean", description: "외부 npm 패키지 자동 설치 생략. 명령어만 출력해 수동 실행 가능." },
          { prop: "--diff", type: "boolean", description: "파일을 쓰지 않고 기존 파일과의 변경 내역(unified diff)만 출력. 업데이트 전 미리보기용." },
        ]}
      />

      <h4>업데이트 미리보기 (--diff)</h4>
      <p>
        이미 설치된 컴포넌트를 다시 <code>add</code>하기 전에 변경 범위를 확인하고 싶을 때 사용.
        파일은 실제로 쓰이지 않으며, 터미널에 신규/변경/동일로 분류된 요약과 변경 파일의 unified diff가 출력된다.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 버튼 컴포넌트에 어떤 변경이 생기는지만 확인
npx sh-ui-cli add button --diff

# 적용하려면 --diff 없이 다시 실행
npx sh-ui-cli add button`}
      />
      <p className="muted">
        사용자가 직접 수정해둔 파일이 있으면 "변경"으로 분류되어 덮어쓰기 전 검토할 수 있다. CI에서도 회귀 감지용으로 활용 가능.
      </p>

      <h4>외부 패키지 자동 설치</h4>
      <p>
        Base UI를 쓰는 컴포넌트(Dialog, Popover, Select, DropdownMenu, Tooltip 등)는 <code>@base-ui/react</code>가 필요하다.
        CLI가 <code>package.json</code>에 없는 의존성만 감지해 자동 설치한다.
      </p>
      <p>패키지 매니저는 lockfile로 감지:</p>
      <PropsTable
        rows={[
          { prop: "pnpm-lock.yaml", type: "detect", description: "pnpm add ..." },
          { prop: "bun.lock / bun.lockb", type: "detect", description: "bun add ..." },
          { prop: "yarn.lock", type: "detect", description: "yarn add ..." },
          { prop: "없음", type: "fallback", description: "npm install ..." },
        ]}
      />

      <h3>sh-ui.config.json</h3>
      <p>CLI가 읽는 단일 설정 파일. 스키마 검증은 <code>$schema</code>로 IDE 지원.</p>
      <CodePanel
        language="json"
        filename="sh-ui.config.json (React)"
        code={`{
  "$schema": "https://your-ds.dev/sh-ui.schema.json",
  "platform": "react",
  "style": "default",
  "theme": {
    "base": "neutral",
    "radius": "md",
    "mode": "light-dark"
  },
  "paths": {
    "tokens": "src/styles/tokens.css",
    "components": "src/components/ui",
    "utils": "src/lib/utils.ts"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}`}
      />

      <CodePanel
        language="json"
        filename="sh-ui.config.json (Flutter)"
        code={`{
  "$schema": "https://your-ds.dev/sh-ui.schema.json",
  "platform": "flutter",
  "style": "default",
  "theme": {
    "base": "neutral",
    "radius": "md",
    "mode": "light-dark"
  },
  "paths": {
    "tokens": "lib/sh_ui/foundation/sh_ui_tokens.dart",
    "foundation": "lib/sh_ui/foundation",
    "widgets": "lib/sh_ui/widgets"
  }
}`}
      />

      <h4>필드</h4>
      <PropsTable
        rows={[
          { prop: "platform", type: `"react" | "flutter"`, description: "대상 플랫폼. 이 값에 따라 다른 registry를 사용." },
          { prop: "style", type: `"default"`, default: `"default"`, description: "스타일 프리셋. (현재 default만)" },
          { prop: "theme.base", type: "enum", description: "기본 무채색 스케일." },
          { prop: "theme.radius", type: "enum", description: "토큰 --radius 값." },
          { prop: "theme.mode", type: "enum", description: "light / dark / light-dark(둘 다 생성)." },
          { prop: "paths.tokens", type: "string", description: "토큰 파일 대상 경로." },
          { prop: "paths.components", type: "string", description: "컴포넌트 복사 대상 디렉터리 (React). {components} placeholder 치환에 사용." },
          { prop: "paths.foundation / paths.widgets", type: "string", description: "Flutter 토큰/위젯 대상 디렉터리." },
          { prop: "aliases", type: "object", description: "React 한정. import 경로 alias (현재 컴포넌트에는 미반영 — 향후 확장)." },
        ]}
      />

      <h3>sh-ui list</h3>
      <p>
        설정 파일을 읽어 <code>paths.components</code> 아래에서 현재 설치된 컴포넌트를 찾는다. 기본은 설치된 것만 표시.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 설치된 것만
npx sh-ui-cli list

# 설치되지 않은 컴포넌트까지 함께 보기
npx sh-ui-cli list --all`}
      />
      <PropsTable
        rows={[
          { prop: "--all", type: "boolean", description: "레지스트리의 모든 컴포넌트 중 아직 설치되지 않은 것도 함께 표시." },
        ]}
      />

      <h3>sh-ui remove</h3>
      <p>
        설치된 컴포넌트 파일을 삭제한다. 사용자가 수정한 파일은 기본적으로 삭제되지 않으며, <code>--force</code>가 있을 때만 제거된다.
        폴더가 비게 되면 자동 정리.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 여러 개 한 번에
npx sh-ui-cli remove button card

# 삭제 대상만 확인
npx sh-ui-cli remove button --dry-run

# 수정된 파일도 강제 삭제
npx sh-ui-cli remove button --force

# 별칭
npx sh-ui-cli rm button`}
      />
      <PropsTable
        rows={[
          { prop: "--dry-run", type: "boolean", description: "실제로 삭제하지 않고 대상 파일만 출력." },
          { prop: "--force", type: "boolean", description: "사용자가 수정한 파일도 삭제. 원본 복구 불가이므로 주의." },
        ]}
      />
      <p className="muted">
        <code>registryDependencies</code>(예: Menubar → DropdownMenu)는 공유될 수 있으므로 함께 제거되지 않는다. 필요하면 이름을 명시적으로 나열.
      </p>

      <h3>사용 예 — 전형적인 흐름</h3>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 1. 프로젝트 루트에서 초기화
npx sh-ui-cli init

# 2. 토큰 + base 스타일
npx sh-ui-cli add tokens base

# 3. 필요한 컴포넌트만
npx sh-ui-cli add button card dialog

# 이후에도 언제든 추가
npx sh-ui-cli add dropdown-menu tooltip`}
      />

      <h3>동작 원리</h3>
      <ul>
        <li>sh-ui는 npm 패키지가 아니라 <strong>레지스트리</strong>다. 코드가 사용자 프로젝트에 복사되고, sh-ui는 더 이상 의존성이 아니게 된다.</li>
        <li>업데이트가 필요하면 다시 <code>sh-ui add</code>하면 덮어쓴다 — 수정해둔 부분이 있으면 diff로 확인하고 병합한다.</li>
        <li>토큰은 <code>sh-ui.config.json</code>에서 선택한 값만큼만 생성 — 예: <code>mode: &quot;light&quot;</code>면 다크 모드 변수는 포함되지 않는다.</li>
      </ul>

      <h2>다음 단계</h2>
      <ul>
        <li><a href="/create">프로젝트 생성</a> — UI 빌더로 인터랙티브하게 프로젝트 생성 (테마까지 한 번에)</li>
        <li><a href="/getting-started">시작하기</a> — 기존 프로젝트에 sh-ui 수동 도입</li>
        <li><a href="/tokens">토큰</a> — 포함된 토큰 목록</li>
      </ul>
    </main>
  );
}
