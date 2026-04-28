export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { BasicDemo } from "./_demos/basic";
import { JsonDemo } from "./_demos/json";
import { ReadOnlyDemo } from "./_demos/readonly";
import { MarkdownDemo } from "./_demos/markdown";

export default function CodeEditorPage() {
  return (
    <main className="container">
      <h1>CodeEditor</h1>
      <p className="muted">
        CodeMirror 6 기반 인라인 코드 에디터. <code>basicSetup</code>의 신택스 하이라이팅·자동
        들여쓰기·괄호 매칭을 그대로 쓰고, 컬러·여백은 sh-ui 토큰으로 매핑돼 다크 모드까지 자동 추종.
      </p>

      <Preview>
        <Preview.Demo>
          <BasicDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodeEditor
  value={value}
  onChange={setValue}
  language="typescript"
/>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add code-editor`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 <code>components/ui/code-editor/</code>로 파일을 복사하고, CodeMirror 6 패키지를 설치한다.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`pnpm add codemirror @codemirror/state @codemirror/view \\
  @codemirror/lang-javascript @codemirror/lang-json \\
  @codemirror/lang-css @codemirror/lang-html @codemirror/lang-markdown`}
      />
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/ui/code-editor";

export function Demo() {
  const [code, setCode] = useState("");
  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      language="typescript"
      placeholder="여기에 입력..."
    />
  );
}`}
      />
      <p className="muted">
        <code>CodeEditor</code>는 클라이언트 컴포넌트다. 서버 컴포넌트에서 직접 import할 수 없으니
        반드시 <code>&quot;use client&quot;</code> 경계 안에서 사용한다.
      </p>

      <h2>Examples</h2>

      <h3>JSON 검증</h3>
      <p className="muted">
        controlled 값을 <code>JSON.parse</code>로 검사해 실시간 피드백을 보여주는 패턴.
      </p>
      <Preview>
        <Preview.Demo>
          <JsonDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const error = useMemo(() => {
  try { JSON.parse(value); return null; }
  catch (e) { return (e as Error).message; }
}, [value]);

<CodeEditor
  value={value}
  onChange={setValue}
  language="json"
  aria-invalid={!!error || undefined}
/>`}
        />
      </Preview>

      <h3>Markdown</h3>
      <Preview>
        <Preview.Demo>
          <MarkdownDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodeEditor
  value={value}
  onChange={setValue}
  language="markdown"
  minHeight="240px"
/>`}
        />
      </Preview>

      <h3>읽기 전용</h3>
      <p className="muted">
        키 입력만 차단되고 선택·복사·키보드 네비게이션은 가능. 리뷰 패널이나 코드 미리보기에 적합.
      </p>
      <Preview>
        <Preview.Demo>
          <ReadOnlyDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodeEditor value={code} language="typescript" readOnly />`}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>CodeEditor</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string", description: "Controlled — 현재 코드. 명시 시 외부 상태가 진실원천. 미지정이면 uncontrolled." },
          { prop: "defaultValue", type: "string", default: `""`, description: "Uncontrolled 초기값. value 미지정 시에만 사용." },
          {
            prop: "onChange",
            type: "(value: string) => void",
            description: "코드가 바뀔 때마다 호출 (controlled · uncontrolled 모두).",
          },
          {
            prop: "language",
            type: `"text" | "javascript" | "typescript" | "jsx" | "tsx" | "json" | "css" | "html" | "markdown"`,
            default: `"text"`,
            description: "신택스 하이라이팅 언어. 런타임 변경 시 Compartment로 hot-swap.",
          },
          { prop: "placeholder", type: "string", description: "비어 있을 때 표시할 placeholder 문자열." },
          {
            prop: "readOnly",
            type: "boolean",
            default: "false",
            description: "키 입력 차단. 선택·복사·키보드 네비게이션은 그대로.",
          },
          {
            prop: "showLineNumbers",
            type: "boolean",
            default: "true",
            description: "좌측 줄 번호 + 거터 표시 여부.",
          },
          { prop: "minHeight", type: "string", description: "에디터 최소 높이 (CSS 길이 단위)." },
          {
            prop: "maxHeight",
            type: "string",
            description: "에디터 최대 높이. 초과 시 내부 스크롤.",
          },
          { prop: "className", type: "string" },
          { prop: "id", type: "string", description: "에디터 contentDOM에 부여되는 id (label 연결용)." },
          { prop: "aria-label", type: "string" },
          { prop: "aria-labelledby", type: "string" },
        ]}
      />
    </main>
  );
}
