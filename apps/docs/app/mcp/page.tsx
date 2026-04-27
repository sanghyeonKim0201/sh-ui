export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
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
        IDE 별로 적절한 설정 파일을 자동으로 찾아 sh-ui 엔트리를 추가한다. 기존 다른 MCP 서버 설정은 보존.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 프로젝트 루트에서
npx sh-ui mcp init --client claude-code      # → .mcp.json
npx sh-ui mcp init --client cursor           # → .cursor/mcp.json
npx sh-ui mcp init --client claude-desktop   # → 사용자 전역

# 사용자 전역 설정에 등록하려면
npx sh-ui mcp init --client claude-code --scope user`}
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
        ]}
      />

      <p className="muted">
        등록 후 IDE 를 재시작하면 AI 가 sh-ui 툴을 인식한다. <code>npx -y</code> 가 처음 호출 시 <code>sh-ui-cli</code> 를 자동으로 받아오므로 별도 설치 불필요.
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
            prop: "sh_ui_init",
            type: "(platform?, base?, radius?, mode?, cwd?, force?)",
            description: "sh-ui.config.json 생성. 누락 값은 기본값 사용.",
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
            type: "(names[], cwd?, skipInstall?)",
            description: "컴포넌트 설치. 외부 npm 패키지 deps 도 자동 설치(pnpm/npm/yarn/bun 자동 감지). 특수값 'tokens' 는 토큰 파일 생성.",
          },
          {
            prop: "sh_ui_remove_component",
            type: "(names[], cwd?, force?, dryRun?)",
            description: "설치된 컴포넌트 파일 삭제. 사용자가 수정한 파일은 기본 보호 (force 로 덮어쓰기).",
          },
          {
            prop: "sh_ui_get_changelog",
            type: "(limit?)",
            description: "sh-ui 변경 내역 반환. 최신이 맨 앞.",
          },
        ]}
      />

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
