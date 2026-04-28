export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { BasicDemo } from "./_demos/basic";
import { WithOutputDemo } from "./_demos/with-output";
import { ReadOnlyDemo } from "./_demos/readonly";

export default function RichTextEditorPage() {
  return (
    <main className="container">
      <h1>RichTextEditor</h1>
      <p className="muted">
        Tiptap 3 위에 sh-ui 토큰 테마와 기본 toolbar 를 얹은 WYSIWYG 에디터.
        <code>value</code> 는 HTML 문자열, <code>onChange</code> 는 매 편집마다 최신 HTML 을 넘긴다.
      </p>

      <Preview>
        <Preview.Demo>
          <BasicDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<RichTextEditor
  value={html}
  onChange={setHtml}
  placeholder="여기에 작성..."
/>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add rich-text-editor`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 <code>components/ui/rich-text-editor/</code>로 파일을 복사하고, Tiptap 패키지를 설치한다.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit \\
  @tiptap/extension-placeholder @tiptap/extension-link \\
  lucide-react`}
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function Demo() {
  const [html, setHtml] = useState("<p>안녕</p>");
  return <RichTextEditor value={html} onChange={setHtml} />;
}`}
      />
      <p className="muted">
        <code>RichTextEditor</code> 는 클라이언트 컴포넌트다. 서버 컴포넌트에서 직접 import 할 수 없으니
        반드시 <code>&quot;use client&quot;</code> 경계 안에서 사용한다.
      </p>

      <h2>Examples</h2>

      <h3>HTML 출력 미리보기</h3>
      <p className="muted">
        <code>onChange</code> 가 넘기는 HTML 을 옆에 그대로 보여주는 패턴 — 폼 제출 전 검수에 유용.
      </p>
      <Preview>
        <Preview.Demo>
          <WithOutputDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<RichTextEditor value={value} onChange={setValue} />
<CodePanel code={value} language="html" />`}
        />
      </Preview>

      <h3>읽기 전용</h3>
      <p className="muted">
        키 입력·툴바가 차단되지만 본문은 ProseMirror 가 그대로 렌더해 마크업이 보존된다.
      </p>
      <Preview>
        <Preview.Demo>
          <ReadOnlyDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<RichTextEditor value={html} readOnly />`}
        />
      </Preview>

      <h2>Notes</h2>
      <ul>
        <li>
          <strong>XSS</strong> — <code>onChange</code> 가 돌려주는 HTML 은 Tiptap 의 schema 가 거른 결과지만,
          서버에 저장하기 전 또 다른 sanitize 레이어(예: <code>DOMPurify</code>)를 두는 걸 권장.
        </li>
        <li>
          <strong>SSR</strong> — Tiptap 에는 <code>immediatelyRender: false</code> 가 적용되어 Next 15+ 의
          stricter SSR 환경에서도 hydration mismatch 없이 렌더된다.
        </li>
        <li>
          <strong>확장</strong> — 이 컴포넌트는 StarterKit + Placeholder + Link 만 포함한다.
          이미지·테이블·멘션 등이 필요하면 <code>@tiptap/extension-*</code> 를 추가하고
          <code>extensions</code> 배열에 직접 끼워 넣어 확장한다 (registry 카피본 직접 수정).
        </li>
      </ul>

      <h2>API Reference</h2>

      <h3>RichTextEditor</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string", description: "현재 HTML (controlled)." },
          {
            prop: "onChange",
            type: "(html: string) => void",
            description: "본문이 바뀔 때마다 최신 HTML 을 넘긴다.",
          },
          { prop: "placeholder", type: "string", description: "비어 있을 때 표시할 placeholder." },
          {
            prop: "readOnly",
            type: "boolean",
            default: "false",
            description: "키 입력·툴바 차단. 본문은 그대로 렌더.",
          },
          {
            prop: "hideToolbar",
            type: "boolean",
            default: "false",
            description: "상단 툴바를 숨기고 본문 영역만 렌더.",
          },
          { prop: "minHeight", type: "string", description: "본문 영역의 최소 높이." },
          {
            prop: "maxHeight",
            type: "string",
            description: "본문 영역의 최대 높이. 초과 시 내부 스크롤.",
          },
          { prop: "className", type: "string" },
          { prop: "aria-label", type: "string", default: `"Rich text editor"` },
        ]}
      />
    </main>
  );
}
