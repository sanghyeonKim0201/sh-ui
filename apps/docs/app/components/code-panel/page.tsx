export const dynamic = "force-static";

import {
  CodePanel,
  CodePanelHeader,
  CodePanelFilename,
  CodePanelCopy,
  CodePanelBody,
} from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";

const buttonExample = `import { Button } from "@/components/ui/button";

export function Demo() {
  return (
    <div className="flex gap-2">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  );
}`;

const bashExample = `npx sh-ui-cli init
npx sh-ui-cli add tokens button`;

const jsonExample = `{
  "platform": "react",
  "theme": { "base": "neutral", "radius": "md" }
}`;

const cssExample = `:root {
  --background: #FFFFFF;
  --primary: #171717;
  --radius: 0.5rem;
}`;

export default function CodePanelPage() {
  return (
    <main className="container">
      <h1>CodePanel</h1>
      <p className="muted">
        Shiki 기반 코드 패널. 서버 컴포넌트로 빌드 시 하이라이팅 → 번들 비용 없음, 복사 버튼만 클라이언트.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <CodePanel code={buttonExample} language="tsx" filename="components/demo.tsx" />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodePanel
  code={code}
  language="tsx"
  filename="components/demo.tsx"
/>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add code-panel`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/code-panel/</code>로 복사하고, Shiki를 설치한다.
      </p>
      <CodePanel language="bash" showLineNumbers={false} code={`pnpm add shiki`} />
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>copy.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { CodePanel } from "@/components/ui/code-panel";

<CodePanel
  code={\`const greet = (name: string) => \\\`Hello, \\\${name}\\\`;\`}
  language="tsx"
  filename="greet.ts"
/>`}
      />

      <h2>Examples</h2>

      <h3>파일명 없이 (호버 시 복사 버튼)</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <CodePanel code={bashExample} language="bash" showLineNumbers={false} />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodePanel code={bash} language="bash" showLineNumbers={false} />`}
        />
      </Preview>

      <h3>JSON</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <CodePanel code={jsonExample} language="json" filename="sh-ui.config.json" />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodePanel code={json} language="json" filename="sh-ui.config.json" />`}
        />
      </Preview>

      <h3>CSS</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <CodePanel code={cssExample} language="css" filename="tokens.css" />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodePanel code={css} language="css" filename="tokens.css" />`}
        />
      </Preview>

      <h3>복사 버튼 숨기기</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <CodePanel code={`console.log("no copy button");`} language="ts" hideCopy />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodePanel code={code} language="ts" hideCopy />`}
        />
      </Preview>

      <h3>Compound 구성</h3>
      <p className="muted">
        헤더에 커스텀 액션을 붙이거나 복사 버튼 위치를 바꾸고 싶으면 하위 컴포넌트를 직접 조합한다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <CodePanel>
              <CodePanelHeader>
                <CodePanelFilename>demo.tsx</CodePanelFilename>
                <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                  React · TypeScript
                </span>
                <CodePanelCopy code={buttonExample} />
              </CodePanelHeader>
              <CodePanelBody code={buttonExample} language="tsx" />
            </CodePanel>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodePanel>
  <CodePanelHeader>
    <CodePanelFilename>demo.tsx</CodePanelFilename>
    <span>React · TypeScript</span>
    <CodePanelCopy code={code} />
  </CodePanelHeader>
  <CodePanelBody code={code} language="tsx" />
</CodePanel>`}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>CodePanel</h3>
      <PropsTable
        rows={[
          { prop: "code", type: "string", description: "하이라이팅할 코드 문자열. children 미제공 시 필수." },
          { prop: "language", type: "string", default: `"text"`, description: "Shiki 언어 ID (tsx, typescript, css, json, bash, dart 등)." },
          { prop: "filename", type: "string", description: "헤더에 표시할 파일명. 있으면 헤더가 그려진다." },
          { prop: "showLineNumbers", type: "boolean", default: "true", description: "줄 번호 표시 여부." },
          { prop: "hideCopy", type: "boolean", description: "복사 버튼 숨기기." },
          { prop: "className", type: "string" },
          { prop: "children", type: "ReactNode", description: "제공 시 직접 구성한 하위 컴포넌트를 그대로 렌더." },
        ]}
      />

      <h3>하위 컴포넌트</h3>
      <PropsTable
        rows={[
          { prop: "CodePanelHeader", type: "div", description: "상단 헤더 행. 파일명·액션을 담는 슬롯." },
          { prop: "CodePanelFilename", type: "span", description: "헤더의 파일명 텍스트." },
          { prop: "CodePanelCopy", type: "{ code: string }", description: "클립보드 복사 버튼 (클라이언트)." },
          { prop: "CodePanelBody", type: "{ code, language?, showLineNumbers? }", description: "Shiki 하이라이팅 본문 (async)." },
        ]}
      />
    </main>
  );
}