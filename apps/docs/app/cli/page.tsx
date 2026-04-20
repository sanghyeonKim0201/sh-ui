export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { PropsTable } from "@/components/props-table";

export default function CliPage() {
  return (
    <main className="container">
      <h1>CLI</h1>
      <p className="muted">
        <code>sh-ui</code> CLI — 설정 파일을 만들고 레지스트리에서 컴포넌트 소스를 프로젝트로 복사한다.
        복사된 코드는 <strong>사용자 프로젝트의 것</strong>이므로 자유롭게 수정할 수 있다.
      </p>

      <h2>설치 없이 바로 실행</h2>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui <command> [args]`} />
      <p className="muted">
        설치형으로 쓰려면 <code>pnpm add -D sh-ui</code> / <code>npm i -D sh-ui</code>.
      </p>

      <h2>명령 개요</h2>
      <PropsTable
        rows={[
          { prop: "sh-ui init", type: "command", description: "프로젝트 루트에 sh-ui.config.json 생성." },
          { prop: "sh-ui add <name...>", type: "command", description: "레지스트리에서 컴포넌트 소스를 복사하고 필요한 외부 패키지를 자동 설치." },
          { prop: "sh-ui add tokens", type: "special", description: "설정 값을 치환해 토큰 파일 생성 (CSS 또는 Dart)." },
        ]}
      />

      <h2>sh-ui init</h2>
      <p>대화형 프롬프트로 4개 축을 선택하면 <code>sh-ui.config.json</code>이 만들어진다.</p>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui init`} />

      <h3>플래그</h3>
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

      <h3>비대화형 (CI용)</h3>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx sh-ui init --yes --platform react --base neutral --radius md --mode light-dark`}
      />
      <p className="muted">
        비-TTY 환경(CI 등)에서는 <code>--yes</code> 없이 실행하면 에러. 모든 축을 플래그로 넘기거나 <code>--yes</code>로 기본값을 수용해야 한다.
      </p>

      <h2>sh-ui add</h2>
      <p>레지스트리에서 컴포넌트 소스 파일을 프로젝트의 <code>paths.components</code>로 복사한다. <code>registryDependencies</code>가 있으면 자동으로 함께 설치된다.</p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 단일 컴포넌트
npx sh-ui add button

# 여러 개 동시에
npx sh-ui add button card dialog

# 토큰 파일만 재생성 (sh-ui.config.json 값 기반)
npx sh-ui add tokens`}
      />

      <h3>플래그</h3>
      <PropsTable
        rows={[
          { prop: "--skip-install", type: "boolean", description: "외부 npm 패키지 자동 설치 생략. 명령어만 출력해 수동 실행 가능." },
          { prop: "--diff", type: "boolean", description: "파일을 쓰지 않고 기존 파일과의 변경 내역(unified diff)만 출력. 업데이트 전 미리보기용." },
        ]}
      />

      <h3>업데이트 미리보기 (--diff)</h3>
      <p>
        이미 설치된 컴포넌트를 다시 <code>add</code>하기 전에 변경 범위를 확인하고 싶을 때 사용.
        파일은 실제로 쓰이지 않으며, 터미널에 신규/변경/동일로 분류된 요약과 변경 파일의 unified diff가 출력된다.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 버튼 컴포넌트에 어떤 변경이 생기는지만 확인
npx sh-ui add button --diff

# 적용하려면 --diff 없이 다시 실행
npx sh-ui add button`}
      />
      <p className="muted">
        사용자가 직접 수정해둔 파일이 있으면 "변경"으로 분류되어 덮어쓰기 전 검토할 수 있다. CI에서도 회귀 감지용으로 활용 가능.
      </p>

      <h3>외부 패키지 자동 설치</h3>
      <p>
        Base UI를 쓰는 컴포넌트(Dialog, Popover, Select, DropdownMenu, Tooltip 등)는 <code>@base-ui-components/react</code>가 필요하다.
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

      <h2>sh-ui.config.json</h2>
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

      <h3>필드</h3>
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

      <h2>사용 예 — 전형적인 흐름</h2>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 1. 프로젝트 루트에서 초기화
npx sh-ui init

# 2. 토큰 + base 스타일
npx sh-ui add tokens base

# 3. 필요한 컴포넌트만
npx sh-ui add button card dialog

# 이후에도 언제든 추가
npx sh-ui add dropdown-menu tooltip`}
      />

      <h2>동작 원리</h2>
      <ul>
        <li>sh-ui는 npm 패키지가 아니라 <strong>레지스트리</strong>다. 코드가 사용자 프로젝트에 복사되고, sh-ui는 더 이상 의존성이 아니게 된다.</li>
        <li>업데이트가 필요하면 다시 <code>sh-ui add</code>하면 덮어쓴다 — 수정해둔 부분이 있으면 diff로 확인하고 병합한다.</li>
        <li>토큰은 <code>sh-ui.config.json</code>에서 선택한 값만큼만 생성 — 예: <code>mode: &quot;light&quot;</code>면 다크 모드 변수는 포함되지 않는다.</li>
      </ul>
    </main>
  );
}
