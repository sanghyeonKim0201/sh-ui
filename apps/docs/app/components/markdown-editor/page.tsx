export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { BasicDemo } from "./_demos/basic";
import { BottomDemo } from "./_demos/bottom";
import { NoPreviewDemo } from "./_demos/no-preview";

export default function MarkdownEditorPage() {
  return (
    <main className="container">
      <h1>MarkdownEditor</h1>
      <p className="muted">
        <a href="/components/code-editor">CodeEditor</a> 위에 <code>react-markdown</code>{" "}
        라이브 프리뷰를 얹은 합성 컴포넌트. GFM(테이블·체크리스트·strikethrough)을 지원하고,
        raw HTML 은 기본적으로 차단되어 사용자 입력으로부터의 XSS 가 자동 방어된다.
      </p>

      <Preview>
        <Preview.Demo>
          <BasicDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<MarkdownEditor
  value={value}
  onChange={setValue}
  minHeight="320px"
/>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add markdown-editor`} />
      <p className="muted">
        <code>code-editor</code> 가 자동으로 함께 설치된다 (registry dependency).
      </p>

      <h3>Manual</h3>
      <p className="muted">
        registry에서 <code>components/ui/markdown-editor/</code>로 파일을 복사하고, 의존 패키지를 설치한다.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`pnpm add react-markdown remark-gfm`}
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
import { MarkdownEditor } from "@/components/ui/markdown-editor";

export function Demo() {
  const [md, setMd] = useState("# 안녕\\n\\n간단한 마크다운.");
  return <MarkdownEditor value={md} onChange={setMd} />;
}`}
      />
      <p className="muted">
        <code>MarkdownEditor</code> 는 클라이언트 컴포넌트다. 서버 컴포넌트에서 직접 import 할 수 없으니
        반드시 <code>&quot;use client&quot;</code> 경계 안에서 사용한다.
      </p>

      <h2>Examples</h2>

      <h3>위·아래 분할</h3>
      <Preview>
        <Preview.Demo>
          <BottomDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<MarkdownEditor
  value={value}
  onChange={setValue}
  previewPosition="bottom"
/>`}
        />
      </Preview>

      <h3>미리보기 끄기 (단순 입력기)</h3>
      <p className="muted">
        폼 필드처럼 미리보기가 필요 없는 경우 <code>preview=&#123;false&#125;</code> 로 단순 마크다운 입력기로 사용.
      </p>
      <Preview>
        <Preview.Demo>
          <NoPreviewDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<MarkdownEditor
  value={value}
  onChange={setValue}
  preview={false}
  placeholder="마크다운으로 작성..."
/>`}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>MarkdownEditor</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string", description: "현재 마크다운 (controlled)." },
          { prop: "onChange", type: "(value: string) => void", description: "마크다운이 바뀔 때 호출." },
          { prop: "placeholder", type: "string", description: "비어 있을 때 표시할 placeholder." },
          {
            prop: "readOnly",
            type: "boolean",
            default: "false",
            description: "키 입력 차단. 미리보기는 그대로 렌더.",
          },
          {
            prop: "preview",
            type: "boolean",
            default: "true",
            description: "미리보기 패널 표시 여부.",
          },
          {
            prop: "previewPosition",
            type: `"right" | "bottom"`,
            default: `"right"`,
            description: "미리보기 위치. 좁은 화면(<768px)에서는 항상 아래로 쌓임.",
          },
          { prop: "minHeight", type: "string", description: "에디터·미리보기 영역의 최소 높이." },
          { prop: "maxHeight", type: "string", description: "에디터·미리보기 영역의 최대 높이." },
          { prop: "className", type: "string" },
          { prop: "aria-label", type: "string", default: `"Markdown editor"` },
        ]}
      />
    </main>
  );
}
