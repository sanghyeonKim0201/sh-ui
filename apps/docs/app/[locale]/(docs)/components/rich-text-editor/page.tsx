export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { BasicDemo } from "./_demos/basic";
import { WithOutputDemo } from "./_demos/with-output";
import { ReadOnlyDemo } from "./_demos/readonly";
import { InlineDemo } from "./_demos/inline";
import { VariantSource } from "@/components/variant-source";

export default function RichTextEditorPage() {
  return (
    <main className="container">
      <h1>RichTextEditor</h1>
      <p className="muted">
        Tiptap 3 위에 sh-ui 토큰 테마와 기본 toolbar 를 얹은 WYSIWYG 에디터.
        <code>value</code> 는 HTML 문자열, <code>onChange</code> 는 매 편집마다
        최신 HTML 을 넘긴다. 굵게·기울임·<u>밑줄</u>·취소선·글자색(테마
        추종)·인라인 링크·헤딩·리스트·인용·코드 블록을 기본 지원하며,{" "}
        <code>compact</code> 로 핵심 버튼만,{" "}
        <code>toolbarMode=&quot;focus&quot;</code> 로 포커스 시에만 툴바를 띄울
        수 있다.
      </p>
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--foreground-subtle)",
        }}
      >
        <strong>플랫폼:</strong> React 전용 — Tiptap 의 Flutter 등가물 부재.
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
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx sh-ui-cli add rich-text-editor`}
      />

      <h3>Manual</h3>
      <VariantSource name="rich-text-editor" />
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit \\
  @tiptap/extension-placeholder @tiptap/extension-link \\
  @tiptap/extension-text-style lucide-react`}
      />
      <ul>
        <li>
          <code>index.tsx</code>
        </li>
        <li>
          <code>styles.css</code>
        </li>
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
        <code>RichTextEditor</code> 는 클라이언트 컴포넌트다. 서버 컴포넌트에서
        직접 import 할 수 없으니 반드시 <code>&quot;use client&quot;</code> 경계
        안에서 사용한다.
      </p>

      <h2>Examples</h2>

      <h3>HTML 출력 미리보기</h3>
      <p className="muted">
        <code>onChange</code> 가 넘기는 HTML 을 옆에 그대로 보여주는 패턴 — 폼
        제출 전 검수에 유용.
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
        키 입력·툴바가 차단되지만 본문은 ProseMirror 가 그대로 렌더해 마크업이
        보존된다.
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

      <h3>인라인 · compact 툴바</h3>
      <p className="muted">
        <code>compact</code> 는 핵심
        버튼(굵게·기울임·밑줄·취소선·글자색·링크·목록)만 노출하고,
        <code>toolbarMode=&quot;focus&quot;</code> 는 포커스 전에는 툴바를
        숨긴다 — 좁은 패널이나 메일 작성 같은 인라인 입력에 적합.{" "}
        <code>labels</code> 로 툴바 라벨/툴팁을 현지화할 수 있다.
      </p>
      <Preview>
        <Preview.Demo>
          <InlineDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<RichTextEditor
  value={value}
  onChange={setValue}
  compact
  toolbarMode="focus"
  labels={{ bold: "굵게", italic: "기울임", link: "링크" }}
/>`}
        />
      </Preview>

      <h2>Notes</h2>
      <ul>
        <li>
          <strong>XSS</strong> — <code>onChange</code> 가 돌려주는 HTML 은
          Tiptap 의 schema 가 거른 결과지만, 서버에 저장하기 전 또 다른 sanitize
          레이어(예: <code>DOMPurify</code>)를 두는 걸 권장.
        </li>
        <li>
          <strong>SSR</strong> — Tiptap 에는{" "}
          <code>immediatelyRender: false</code> 가 적용되어 Next 15+ 의 stricter
          SSR 환경에서도 hydration mismatch 없이 렌더된다.
        </li>
        <li>
          <strong>글자색</strong> — 팔레트는 CSS 변수(
          <code>--sh-ui-rte-c-*</code>)로 저장돼 라이트/다크 테마를
          추종한다(하드 hex 가 아님). 변수 정의부는 <code>styles.css</code>.
        </li>
        <li>
          <strong>확장</strong> — 이 컴포넌트는 StarterKit(Underline 포함) +
          Placeholder + Link + TextStyle/Color 만 포함한다. 이미지·테이블·멘션
          등이 필요하면
          <code>@tiptap/extension-*</code> 를 추가하고 <code>extensions</code>{" "}
          배열에 직접 끼워 넣어 확장한다 (registry 카피본 직접 수정).
        </li>
      </ul>

      <h2>API Reference</h2>

      <h3>RichTextEditor</h3>
      <PropsTable
        rows={[
          {
            prop: "value",
            type: "string",
            description: "Controlled — 현재 HTML. 미지정이면 uncontrolled.",
          },
          {
            prop: "defaultValue",
            type: "string",
            default: `""`,
            description: "Uncontrolled 초기 HTML. value 미지정 시에만 사용.",
          },
          {
            prop: "onChange",
            type: "(html: string) => void",
            description:
              "본문이 바뀔 때마다 최신 HTML 을 넘긴다 (controlled · uncontrolled 모두).",
          },
          {
            prop: "placeholder",
            type: "string",
            description: "비어 있을 때 표시할 placeholder.",
          },
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
          {
            prop: "compact",
            type: "boolean",
            default: "false",
            description:
              "핵심 버튼만 노출(굵게·기울임·밑줄·취소선·글자색·링크·목록). 헤딩·코드 블록 등 생략 — 좁은 패널용.",
          },
          {
            prop: "toolbarMode",
            type: `"always" | "focus"`,
            default: `"always"`,
            description: `"focus" 면 포커스/편집 중에만 툴바를 노출(인라인 느낌).`,
          },
          {
            prop: "labels",
            type: "Partial<RichTextEditorLabels>",
            description: "툴바 버튼 라벨/툴팁 i18n. 누락 키는 영어 기본값.",
          },
          {
            prop: "minHeight",
            type: "string",
            description: "본문 영역의 최소 높이.",
          },
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
