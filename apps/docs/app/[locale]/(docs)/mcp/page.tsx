export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/ui/code-tabs";
import { PropsTable } from "@/components/props-table";

export default function McpPage() {
  return (
    <main className="container">
      <h1>MCP — AI 에게 sh-ui 를 알려주기</h1>
      <p className="muted">
        한 번 등록하면 IDE-내 AI(Claude Code, Cursor 등) 가 sh-ui 컴포넌트를 자동으로 검색·설치한다. 빈 폴더에서도 <em>&quot;다크 모던 sh-ui 로 세팅하고 button 추가해줘&quot;</em> 만 말하면 끝. (v0.21.0+)
      </p>

      <h2>왜 MCP 인가</h2>
      <p>
        AI 도구는 sh-ui 라는 이름을 모른다 — 학습된 모델은 이 디자인 시스템의 존재나 컴포넌트 목록·CLI 사용법을 알 수 없다. 그렇다고 사용자가 매번 컨텍스트를 붙여넣을 수도 없다.
      </p>
      <p>
        <strong>MCP(Model Context Protocol)</strong> 는 이 문제를 푸는 표준 프로토콜이다. 한 번 등록하면 AI 가 세션을 시작할 때마다 sh-ui 의 툴 목록·인자 스키마·설명을 자동으로 advertise 받는다. AI 는 sh-ui 를 &quot;알&quot; 필요 없이, 도구가 자기를 설명한다.
      </p>

      <h2>등록 방법</h2>

      <h3>자동 등록 (권장, v0.22.0+)</h3>
      <p>
        IDE 별로 적절한 설정 파일을 자동으로 찾아 sh-ui 엔트리를 추가한다. 기존 다른 MCP 서버 설정은 보존. 빈 폴더에서도 바로 — <code>sh-ui-cli</code> 설치 불필요.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx -y sh-ui-cli mcp init --client claude-code      # → .mcp.json
npx -y sh-ui-cli mcp init --client cursor           # → .cursor/mcp.json
npx -y sh-ui-cli mcp init --client claude-desktop   # → 사용자 전역
npx -y sh-ui-cli mcp init --client codex            # → ~/.codex/config.toml (user 만)

# 사용자 전역 설정에 등록하려면
npx -y sh-ui-cli mcp init --client claude-code --scope user`}
      />

      <h3>수동 등록</h3>
      <p className="muted">
        IDE 별로 설정 파일 위치가 다르다. JSON 한 블록을 추가하면 끝.
      </p>

      <CodeTabs
        items={[
          {
            value: "claude-code",
            label: "Claude Code",
            language: "json",
            code: `// ~/.claude/mcp.json (사용자 전역)
//   또는 프로젝트 루트 .mcp.json
{
  "mcpServers": {
    "sh-ui": {
      "command": "npx",
      "args": ["-y", "sh-ui-cli", "mcp"]
    }
  }
}`,
          },
          {
            value: "cursor",
            label: "Cursor",
            language: "json",
            code: `// ~/.cursor/mcp.json (전역)
//   또는 .cursor/mcp.json (프로젝트)
{
  "mcpServers": {
    "sh-ui": {
      "command": "npx",
      "args": ["-y", "sh-ui-cli", "mcp"]
    }
  }
}`,
          },
          {
            value: "claude-desktop",
            label: "Claude Desktop",
            language: "json",
            code: `// macOS:
//   ~/Library/Application Support/Claude/claude_desktop_config.json
// Windows:
//   %APPDATA%\\Claude\\claude_desktop_config.json
{
  "mcpServers": {
    "sh-ui": {
      "command": "npx",
      "args": ["-y", "sh-ui-cli", "mcp"]
    }
  }
}`,
          },
          {
            value: "codex",
            label: "Codex",
            language: "toml",
            code: `# ~/.codex/config.toml (user 전역만 지원)
[mcp_servers.sh-ui]
command = "npx"
args = ["-y", "sh-ui-cli", "mcp"]`,
          },
        ]}
      />

      <p className="muted">
        등록 후 IDE 를 재시작하면 AI 가 sh-ui 툴을 인식한다. <code>npx -y</code> 가 처음 호출 시 <code>sh-ui-cli</code> 를 자동으로 받아오므로 별도 설치 불필요. 이후에도 매 세션마다 npm 레지스트리에서 최신 버전을 확인하므로 <strong>업데이트도 자동</strong> — 새 sh-ui 버전이 publish 되면 사용자가 손댈 것 없이 다음 세션부터 적용된다.
      </p>

      <h2>동작 흐름</h2>
      <p>
        사용자가 _&quot;빈 폴더에서 다크 모던 sh-ui 로 세팅해줘&quot;_ 라고 말하면 AI 가 다음 순서로 호출한다:
      </p>
      <ol>
        <li><code>sh_ui_describe_init</code> — 자연어 &quot;다크 모던&quot; → <code>base=zinc</code>, <code>mode=dark</code> 매핑</li>
        <li><code>sh_ui_init</code> — <code>sh-ui.config.json</code> 생성 (비대화형)</li>
        <li><code>sh_ui_list_components</code> — 어떤 컴포넌트가 있는지 파악</li>
        <li><code>sh_ui_add_component</code> — 사용자 의도에 맞는 컴포넌트 설치 (외부 npm 패키지도 자동 설치)</li>
      </ol>
      <p>
        모두 사용자 확인 없이 진행되며, 결과 파일이 프로젝트에 그대로 떨어진다. AI 가 잘못 골랐으면 일반 채팅으로 수정 요청.
      </p>

      <h2>노출 툴</h2>

      <PropsTable
        rows={[
          {
            prop: "sh_ui_describe_init",
            type: "() ⇒ object",
            description: "platform/base/radius/mode enum + 한글 설명 반환. 자연어 의도를 enum 으로 매핑할 때 첫 호출.",
          },
          {
            prop: "sh_ui_create_project",
            type: "(name, platform, structure?, plugins?, theme?, cssFramework?, cwd?, force?)",
            description: "빈 폴더에 Next.js/Flutter 프로젝트 스캐폴드 — FSD 폴더 구조 + 토큰 + sh-ui.config.json 일괄 생성. 빈 폴더에서 시작할 땐 sh_ui_init 보다 이게 우선.",
          },
          {
            prop: "sh_ui_init",
            type: "(platform?, base?, radius?, mode?, cwd?, force?)",
            description: "이미 있는 프로젝트에 sh-ui 만 얹을 때 — sh-ui.config.json 생성. 누락 값은 기본값 사용.",
          },
          {
            prop: "sh_ui_list_components",
            type: "(platform?)",
            description: "플랫폼별 전체 컴포넌트 + 한 줄 요약 + 외부/내부 의존성 목록.",
          },
          {
            prop: "sh_ui_get_component",
            type: "(name, platform?, includeSource?)",
            description: "단일 컴포넌트의 메타·소스파일 내용·deps. 코드 작성 전 props/사용법 확인용.",
          },
          {
            prop: "sh_ui_add_component",
            type: "(names[], cwd?, skipInstall?, overwrite?)",
            description: "컴포넌트 설치. 외부 npm 패키지 deps 도 자동 설치(pnpm/npm/yarn/bun 자동 감지). 특수값 'tokens' 는 토큰 파일 생성.",
          },
          {
            prop: "sh_ui_remove_component",
            type: "(names[], cwd?, force?, dryRun?)",
            description: "설치된 컴포넌트 파일 삭제. 사용자가 수정한 파일은 기본 보호 (force 로 덮어쓰기).",
          },
          {
            prop: "sh_ui_encode_theme",
            type: "(light, dark, radius)",
            description: "사용자가 손본 토큰 객체 → base64. 산출물을 sh_ui_create_project 의 theme 인자에 넣으면 다음 스캐폴드까지 톤이 보존된다. 옵셔널 색 토큰(success/warning/info × -foreground) 도 같이 넣을 수 있음. (v0.55.0+)",
          },
          {
            prop: "sh_ui_decode_theme",
            type: "(theme)",
            description: "base64 테마 코드 → 토큰 객체. 기존 테마의 일부만 수정해 다시 인코딩하고 싶을 때(decode → 수정 → encode) 사용. (v0.55.0+)",
          },
          {
            prop: "sh_ui_rename_app",
            type: "(oldName, newName, cwd?, dryRun?, skipInstall?)",
            description: "monorepo 의 앱 이름 일괄 변경 — 두 디렉토리(apps/<old>/, packages/ui/ui-apps/ui-<old>/) 이동 + import/path 패턴 치환 + lockfile 재생성. dryRun 으로 변경 매트릭스 미리보기. false-positive 방지를 위해 컨텍스트 묶인 패턴만 매치 (bare 단어 X). (v0.57.0+)",
          },
          {
            prop: "sh_ui_get_changelog",
            type: "(limit?)",
            description: "sh-ui 변경 내역 반환. 최신이 맨 앞.",
          },
        ]}
      />

      <h3>모노레포 앱 이름 변경</h3>
      <p>
        스캐폴드 시 default <code>apps/web</code> 으로 만들어졌는데 나중에 <code>apps/dashboard</code> 같이 바꾸고 싶을 때, 손으로 6~10 군데 (디렉토리, package.json name, tsconfig paths, Dockerfile WORKDIR, next.config transpilePackages, sh-ui.config aliases, README, .github/workflows, 루트 package.json scripts) 갈아엎지 않도록 <code>sh_ui_rename_app</code> 한 번에 처리. AI 에게 <em>&quot;apps/web 을 dashboard 로 바꿔줘&quot;</em> 같이 말하면 된다. <code>dryRun: true</code> 로 변경 매트릭스 미리보기 후 사용자 확인 권장.
      </p>
      <p>
        false-positive 방지를 위해 bare 단어 (<code>web</code>) 는 절대 치환하지 않고, 컨텍스트(<code>/</code>, <code>&quot;</code>, <code>&apos;</code>, 백틱, 공백, 개행) 로 묶인 패턴만 매치. <code>core-web-vitals</code> (ESLint plugin) 나 <code>safari-web-extension</code> (Sentry 필터) 같은 생태계 상수는 보존된다.
      </p>

      <h3>테마 round-trip — 사용자가 손본 톤 영구 보관</h3>
      <p>
        스캐폴드 결과 톤이 마음에 안 든다면 <code>tokens.css</code> 의 <code>:root</code> / <code>.dark</code> 블록 색만 직접 손본 뒤, AI 에게 <em>&quot;이 톤 base64 로 저장해줘&quot;</em> 라고 말하면 된다. AI 가 <code>sh_ui_encode_theme</code> 으로 인코딩한 결과를 다음 <code>sh_ui_create_project</code> 호출의 <code>theme</code> 인자에 넘겨 영구 보관 — 같은 프로젝트를 재생성해도 톤이 그대로 살아난다.
      </p>
      <p>
        프리셋(<code>neutral</code>/<code>slate</code>/...) 이름과 base64 둘 다 <code>theme</code> 인자에 넣을 수 있고, 길이로 자동 판별. 옵셔널 색 토큰(<code>success</code>/<code>warning</code>/<code>info</code> + <code>-foreground</code>)도 같이 인코딩되며, light/dark 둘 다 정의된 경우에만 CSS 로 emit (한쪽만 있으면 컴포넌트가 fallback 으로 깨질 수 있어 안전 가드).
      </p>

      <h2>예시 — 빈 폴더에서 시작</h2>

      <h3>1. 폴더 생성</h3>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`mkdir my-app && cd my-app
npm init -y`}
      />

      <h3>2. AI 에게 자연어로 요청</h3>
      <p className="muted">
        IDE 채팅에서 그대로 말하면 된다. (MCP 등록은 1회만)
      </p>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`다크 모던 테마로 sh-ui 세팅하고
button 과 dialog 컴포넌트 추가해줘`}
      />

      <h3>3. AI 가 알아서 처리</h3>
      <p>다음과 같이 툴을 호출한다:</p>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`→ sh_ui_describe_init()
   "다크 모던" → base=zinc, mode=dark 로 해석

→ sh_ui_init({ platform: "react", base: "zinc",
              radius: "md", mode: "dark" })
   ✓ sh-ui.config.json 생성

→ sh_ui_add_component({
     names: ["tokens", "button", "dialog"]
   })
   ✓ tokens → src/styles/tokens.css
   ✓ button → src/components/ui/button/...
   ✓ dialog → src/components/ui/dialog/...
   외부 패키지 설치: npm install @base-ui/react@^1.4.1
   ✓ 12 packages added`}
      />

      <h2>FAQ</h2>

      <h3>새 버전이 나오면 어떻게 업데이트하나?</h3>
      <p>
        <code>npx -y sh-ui-cli</code> 로 등록했다면 <strong>아무것도 안 해도 된다</strong>. 매 세션마다 npm 레지스트리에서 최신 버전을 받아 실행하므로, sh-ui 가 새 버전을 publish 하면 다음 IDE 세션부터 자동 반영. 글로벌 설치(<code>npm i -g sh-ui-cli</code>) 로 등록한 경우만 <code>npm update -g sh-ui-cli</code> 를 사용자가 직접 돌려야 한다.
      </p>

      <h3>MCP 등록 안 하고 일반 CLI 만 써도 되나?</h3>
      <p>
        네. <a href="/cli"><code>sh-ui</code> CLI</a> 는 그대로 모든 명령을 지원한다. MCP 는 AI 가 자동으로 호출하기 위한 채널일 뿐, 사람이 직접 쓸 때는 불필요.
      </p>

      <h3>인터넷 없는 환경에서도 동작하나?</h3>
      <p>
        <code>sh-ui-cli</code> 가 한 번 npm 캐시에 받아진 뒤로는 오프라인에서도 MCP 가 시작된다. 다만 <code>sh_ui_add_component</code> 가 설치하는 외부 패키지(@base-ui/react 등) 는 npm 접근이 필요.
      </p>

      <h3>회사 환경 / 프록시 / 사내망에서 막힌다면?</h3>
      <p>
        <code>npx -y</code> 가 npm 레지스트리에 접근 못 하면 시작도 못 한다. 사내 npm 미러를 쓰거나, <code>npm i -g sh-ui-cli</code> 로 사전 설치해 두고 <code>command: &quot;sh-ui&quot;, args: [&quot;mcp&quot;]</code> 로 등록.
      </p>

      <h2>다음 단계</h2>
      <ul>
        <li><a href="/cli">CLI 레퍼런스</a> — 사람이 직접 쓰는 모든 명령어</li>
        <li><a href="/getting-started">시작하기</a> — sh-ui 도입 전체 흐름</li>
        <li><a href="/tokens">토큰</a> — 포함된 토큰 목록</li>
      </ul>
    </main>
  );
}
