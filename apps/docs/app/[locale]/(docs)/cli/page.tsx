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
        기본 토큰 파일, 자주 쓰는 플러그인(next-intl)까지 한 번에.
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
          { prop: "--plugins", type: "string", description: "콤마 분리. 예: next-intl. Next 전용. 미지정 시 빈 배열." },
          { prop: "--theme", type: "base64", description: "토큰 설정(base64). 플레이그라운드 UI 빌더가 생성." },
          { prop: "--yes", type: "boolean", description: "덮어쓰기 등 확인 프롬프트 스킵." },
        ]}
      />
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 완전 비대화형
pnpm dlx sh-ui-cli create my-app --platform next --structure standalone --plugins next-intl --yes`}
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
      <p>
        프로젝트 생성 시 체크박스로 선택. 필요한 파일·의존성·
        <code>next.config.ts</code> 래핑이 자동 구성된다. 자세한 사용법과
        커스터마이징은 각 플러그인 페이지 (<a href="/plugins">/plugins</a>) 참고.
      </p>

      <h4><a href="/plugins/next-intl">next-intl</a> — 다국어</h4>
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
          { prop: "TanStack React Query", type: "data", description: "데이터 페칭. fetch 기반 isomorphic http() (RSC 직통 / 브라우저 /api/proxy 경유)." },
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
          { prop: "sh-ui doctor", type: "command", description: "프로젝트 정합성 점검. config / tokens.css / 설치된 컴포넌트의 토큰 의존성을 한 번에 검사." },
          { prop: "sh-ui upgrade-cli", type: "command", description: "sh-ui-cli 자체를 최신으로 업그레이드. npm latest 비교 + 변경 highlights + 자동 install (--apply)." },
          { prop: "sh-ui tokens diff", type: "command", description: "tokens.css 와 buildTokens 결과를 비교 — added/changed/removed 미리보기." },
          { prop: "sh-ui tokens upgrade", type: "command", description: "--apply (incremental, 사용자 편집 보존) 또는 --replace (통째 덮어쓰기)." },
          { prop: "sh-ui theme extract", type: "command", description: "현재 tokens.css 의 색·radius 를 base64 로 추출 (sh-ui create --theme 입력으로 재사용 가능)." },
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
          { prop: "--keep", type: "boolean", description: "충돌(이미 존재 + 내용 다름) 시 prompt 없이 모두 기존 파일 유지. 비대화형 환경(CI)에서 안전한 기본 동작." },
          { prop: "--force", type: "boolean", description: "충돌 시 prompt 없이 모두 registry 버전으로 덮어쓰기." },
        ]}
      />

      <h4>기존 파일 충돌 처리</h4>
      <p>
        registryDependency 로 끌려온 컴포넌트가 이미 프로젝트에 존재하고 사용자가 커스터마이즈해 둔 경우, CLI 가 자동으로 덮어쓰지 않는다.
        예: <code>add calendar</code> 가 <code>select</code> 를 의존하는데 사용자 select 가 이미 있으면 → 파일별로 어떻게 할지 묻는다.
      </p>
      <PropsTable
        rows={[
          { prop: "그대로 두기", type: "keep", description: "현재 파일을 유지. 사용자 변경 보존." },
          { prop: "덮어쓰기", type: "overwrite", description: "registry 버전으로 교체. 사용자 변경 사라짐." },
          { prop: "남은 충돌도 모두 그대로 두기", type: "keep-all", description: "이번 실행의 나머지 충돌도 prompt 없이 keep." },
          { prop: "남은 충돌도 모두 덮어쓰기", type: "overwrite-all", description: "이번 실행의 나머지 충돌도 prompt 없이 overwrite." },
        ]}
      />
      <p className="muted">
        TTY 환경(터미널 직접 실행)에서는 위 4지선다 prompt 가 뜨고, 비대화형(CI·파이프·MCP)에서는 자동으로 <code>keep</code> 으로 강등돼 사용자 파일이 보존된다.
        명시적으로 동작을 고정하려면 <code>--keep</code> / <code>--force</code> 사용.
      </p>

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
  "cssFramework": "plain",
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
  "cssFramework": "plain",
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
          { prop: "cssFramework", type: `"plain" | "tailwind"`, default: `"plain"`, description: <>CSS 프레임워크. plain(CSS custom properties + .css 파일) 또는 tailwind(cva 기반 utility-class 변종). 자세한 차이·전환·fallback 동작은 <a href="/css-framework">CSS 프레임워크</a> 페이지 참고.</> },
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

      <h3>sh-ui doctor</h3>
      <p>
        프로젝트의 토큰·컴포넌트 정합성을 한 번에 검사한다. v0.68.0+ 부터 제공.
      </p>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli doctor`} />
      <p>점검 항목:</p>
      <PropsTable
        rows={[
          { prop: "sh-ui.config.json", type: "check", description: "파일 존재 + platform/theme/paths 필수 필드." },
          { prop: "paths.tokens", type: "check", description: "tokens.css(또는 .dart) 파일이 실제로 있는지." },
          { prop: "paths.cssEntry", type: "check", description: "(설정 시) globals.css 가 tokens.css 를 import 하는지. 미설정이면 검사 스킵." },
          { prop: "설치된 컴포넌트", type: "check", description: "각 컴포넌트가 요구하는 CSS 변수가 tokens.css 에 정의돼 있는지. 누락은 fail (visual 회귀 사전 차단)." },
        ]}
      />
      <p className="muted">
        모든 검사 통과 시 exit 0, 하나라도 fail 이면 exit 1 — CI 통합 가능. 컴포넌트가 요구하는 토큰 메타는 <code>packages/registry/react/tokens-used.json</code> 에서 자동 추출 (script: <code>scripts/build-registry-tokens.mjs</code>).
      </p>

      <h3>sh-ui upgrade-cli (v0.74.0+)</h3>
      <p>
        sh-ui-cli 자체를 최신으로 업그레이드. npm registry 의 latest 와 사용자{" "}
        <code>node_modules</code> 의 설치본을 비교하고 사이의 변경 highlights 를 보여준다.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 미리보기 — 어떤 변경이 있는지만
npx sh-ui-cli upgrade-cli

# 자동 install (현 패키지 매니저 감지) + 설치 후 next-step 안내
npx sh-ui-cli upgrade-cli --apply`}
      />
      <p className="muted">
        설치 후 이어 권장: <code>sh-ui doctor</code> → <code>sh-ui tokens diff</code> →{" "}
        <code>sh-ui tokens upgrade --apply</code>. 이 흐름이 신버전이 추가한 토큰을 사용자 편집 보존하며 incrementally 받아오는 정석.
      </p>

      <h3>sh-ui.config.json JSON Schema (v0.74.0+)</h3>
      <p>
        모든 템플릿이 <code>$schema</code> 필드로 GitHub raw URL 을 가리킨다.
        VS Code / Cursor 가 자동 fetch 해 키 자동완성 + enum 값 제안 + 오타 빨간 줄을 띄움.
      </p>
      <CodePanel
        language="json"
        showLineNumbers={false}
        code={`{
  "$schema": "https://raw.githubusercontent.com/sanghyeonKim0201/sh-ui/live/packages/cli/sh-ui.schema.json",
  "platform": "react",
  "cssFramework": "plain",
  ...
}`}
      />
      <p className="muted">
        조건부 require — <code>cssStrategy: "bundled"</code> 이면 <code>paths.cssBundle</code> 필수. schema if/then 이 자동으로 빨간 줄.
      </p>

      <h3>sh-ui tokens diff / upgrade</h3>
      <p>
        sh-ui 가 제공하는 토큰 (<code>buildTokens</code> 결과) 과 사용자 <code>tokens.css</code> 의 변수 정의를 비교해
        added / changed / removed 를 보여주고, 추가만 incremental 적용. v0.69.0+ 부터 제공.
      </p>
      <p>주 사용 시점:</p>
      <ul>
        <li>sh-ui 버전 업그레이드 후 신규 토큰이 들어왔는지 확인</li>
        <li>커스텀 색을 손댄 채로 새 토큰만 받고 싶을 때 (<code>--apply</code>)</li>
        <li>사용자 편집을 모두 버리고 표준값으로 리셋 (<code>--replace</code>)</li>
      </ul>

      <h4>sh-ui tokens diff — 미리보기</h4>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli tokens diff`} />
      <p>출력 분류:</p>
      <PropsTable
        rows={[
          { prop: "+ 추가", type: "added", description: "buildTokens 결과에만 존재 — 사용자 tokens.css 가 못 받은 신규 토큰." },
          { prop: "~ 변경", type: "changed", description: "양쪽 모두 정의되었지만 값이 다름 — 사용자가 손댔거나 sh-ui 가 새 권장값으로 갱신." },
          { prop: "- 제거", type: "removed", description: "사용자 tokens.css 에만 존재 — 의도적 custom 추가 또는 deprecated 토큰." },
        ]}
      />

      <h4>sh-ui tokens upgrade — 적용</h4>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 추가만 incremental (사용자 편집 보존)
npx sh-ui-cli tokens upgrade --apply

# buildTokens 결과로 통째 덮어쓰기 (모든 사용자 편집 손실)
npx sh-ui-cli tokens upgrade --replace`}
      />
      <PropsTable
        rows={[
          { prop: "--apply", type: "mode", description: "added 변수만 매칭 selector 블록 끝에 삽입. changed/removed 는 건드리지 않음." },
          { prop: "--replace", type: "mode", description: "buildTokens 결과로 tokens.css 통째 교체. `add tokens --force` 와 동일하지만 명령 의미가 명시적." },
        ]}
      />
      <p className="muted">
        제약: <code>theme.base</code> 가 buildable preset (neutral / zinc / slate) 일 때만 동작.
        custom (base64) / rich preset (rose / emerald / violet) 은 buildTokens 가 throw — 안내 메시지로 일찍 종료.
        Flutter (v0.73+) — diff 와 <code>--replace</code> 만 지원, <code>--apply</code> 는 Dart 클래스 구조상 위험해서 미지원.
      </p>

      <h3>cssStrategy: bundled — 단일 CSS 번들 모드 (v0.71.0+)</h3>
      <p>
        기본은 컴포넌트별 <code>styles.css</code> 가 컴포넌트 폴더에 함께 떨어진다 (per-component).
        <code>sh-ui.config.json</code> 의 <code>cssStrategy: "bundled"</code> 옵션을 켜면 모든 컴포넌트 CSS 가 단일 번들 파일에
        마커 기반 섹션으로 누적된다.
      </p>
      <CodePanel
        language="json"
        showLineNumbers={false}
        code={`{
  "platform": "react",
  "cssFramework": "plain",
  "cssStrategy": "bundled",
  "theme": { ... },
  "paths": {
    "tokens": "src/styles/tokens.css",
    "cssBundle": "src/styles/sh-ui-components.css",
    "components": "src/components/ui",
    "utils": "src/lib/utils.ts"
  }
}`}
      />
      <p>섹션 포맷:</p>
      <CodePanel
        language="css"
        showLineNumbers={false}
        code={`/* sh-ui:component:button-start */
.sh-ui-button { ... }
/* sh-ui:component:button-end */

/* sh-ui:component:card-start */
.sh-ui-card { ... }
/* sh-ui:component:card-end */`}
      />
      <p>동작 차이:</p>
      <PropsTable
        rows={[
          { prop: "add <name>", type: "behavior", description: "컴포넌트의 styles.css 를 쓰지 않고 cssBundle 에 섹션 upsert. 기존 섹션은 안 내용만 교체, 마커 밖 사용자 custom CSS 보존." },
          { prop: "add <name> .tsx", type: "behavior", description: "컴포넌트 .tsx 에서 `import \"./styles.css\";` 라인을 자동 제거 (번들이 한 번 import 되므로 불필요)." },
          { prop: "remove <name>", type: "behavior", description: ".tsx 삭제 + cssBundle 에서 해당 섹션 제거. 마커 밖 사용자 CSS 는 보존." },
          { prop: "doctor", type: "behavior", description: "paths.cssBundle 존재 검증." },
        ]}
      />
      <p className="muted">
        제약: <code>cssFramework: "plain"</code> 에서만 동작. tailwind / css-modules / vanilla-extract 변종은 자체 스코프 메커니즘이 있어 단일 파일 합산이 부적절 — bundled 옵션이 무시되고 per-component 동작.
        사용자가 <code>cssBundle</code> 파일을 한 번 import (예: <code>app/globals.css</code> 의 <code>@import './sh-ui-components.css';</code>) 해야 스타일 적용.
      </p>

      <h4>기존 프로젝트 마이그레이션 — sh-ui migrate bundled (v0.72.0+)</h4>
      <p>
        per-component 으로 운영하던 프로젝트를 bundled 로 전환할 때:
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# dry-run — 변경 매트릭스 미리보기
npx sh-ui-cli migrate bundled

# 실제 적용
npx sh-ui-cli migrate bundled --apply

# bundle 위치 명시 (기본은 paths.styles 또는 tokens 디렉토리)
npx sh-ui-cli migrate bundled --apply --bundle src/styles/sh-ui.css`}
      />
      <p>적용 시 동작:</p>
      <ul>
        <li><code>paths.components</code> 아래 모든 컴포넌트의 <code>styles.css / styles.module.css</code> 를 <code>cssBundle</code> 의 마커 섹션으로 누적 후 원본 파일 삭제.</li>
        <li>각 컴포넌트 <code>.tsx</code> 의 <code>import "./styles.css";</code> 라인 제거.</li>
        <li><code>sh-ui.config.json</code> 에 <code>cssStrategy: "bundled"</code> + <code>paths.cssBundle</code> 추가.</li>
        <li>완료 후 사용자가 <code>globals.css</code> 에 <code>@import './sh-ui-components.css';</code> 한 번 추가 — 안내 메시지 출력.</li>
      </ul>
      <p className="muted">
        제약: <code>cssFramework: "plain"</code>, React 만. 이미 bundled 면 noop.
      </p>

      <h3>sh-ui theme extract</h3>
      <p>
        현재 <code>tokens.css</code> 의 색과 <code>--radius</code> 값을 sh-ui base64 테마 문자열로 추출.
        v0.70.0+ 부터 제공.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# stdout 으로 base64 출력 (stderr 로 추출 정보)
npx sh-ui-cli theme extract

# 파일에 저장
npx sh-ui-cli theme extract --out theme.txt`}
      />
      <p>주 사용 시점:</p>
      <ul>
        <li>
          custom 테마를 손본 후 새 프로젝트에 동일한 색을 박을 때 — 추출 결과를{" "}
          <code>sh-ui create --theme &lt;base64&gt;</code> 또는 <code>sh_ui_create_project</code> MCP 의{" "}
          <code>theme</code> 인자에 전달.
        </li>
        <li>팀/디자인 시스템 문서에 brand 토큰 스냅샷을 보존 (텍스트로 share 가능).</li>
        <li>
          색만 살짝 바꾼 후 <code>extract</code>로 새 base64 받아 동일 brand 의 새 앱을 동일 색으로 스캐폴드.
        </li>
      </ul>
      <p className="muted">
        제약 (React): <code>tokens.css</code> 의 모든 필수 색 토큰이 <code>#RRGGBB</code> 형식이어야 한다.
        <code>color-mix() / var() / rgba()</code> 가 섞여 있으면 친절 에러로 종료 —{" "}
        <code>sh-ui tokens upgrade --replace</code> 로 표준값을 적용해 hex 화한 뒤 다시 시도.
      </p>
      <p className="muted">
        Flutter (v0.73+) — <code>sh_ui_tokens.dart</code> 의 <code>static const light/dark</code> 블록의 <code>Color(0xFFRRGGBB)</code> 를 추출.
        alpha 채널은 무시 (#RRGGBB 만 인코딩). <code>defaultRadius</code> 픽셀값을 16 으로 나눠 rem 으로 변환.
      </p>

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
