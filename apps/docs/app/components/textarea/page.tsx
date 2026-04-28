export const dynamic = "force-static";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { CharCountDemo } from "./_demos/char-count";

export default function TextareaPage() {
  return (
    <main className="container">
      <h1>Textarea</h1>
      <p className="muted">여러 줄 텍스트 입력 필드. 네이티브 <code>&lt;textarea&gt;</code>에 토큰 스타일만 입혔다.</p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <Textarea placeholder="내용을 입력하세요" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            { value: "react", label: "React", language: "tsx", code: `<Textarea placeholder="내용을 입력하세요" />` },
            { value: "flutter", label: "Flutter", language: "dart", code: `ShUiTextarea(placeholder: '내용을 입력하세요')` },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add textarea` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add textarea` },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        React: registry의 <code>components/ui/textarea/</code> 파일을 복사.
        Flutter: <code>packages/registry/flutter/widgets/sh_ui_textarea.dart</code>를 <code>lib/widgets/</code>로 복사.
      </p>
      <ul>
        <li><code>index.tsx</code> / <code>styles.css</code> (React)</li>
        <li><code>sh_ui_textarea.dart</code> (Flutter)</li>
      </ul>

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="메모" />
<Textarea rows={6} defaultValue="기본값" />
<Textarea aria-invalid={hasError} />`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import 'package:your_app/widgets/sh_ui_textarea.dart';

ShUiTextarea(placeholder: '메모')
ShUiTextarea(minLines: 6, controller: _controller)
ShUiTextarea(invalid: hasError)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>상태</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Textarea defaultValue="값이 있는 상태" />
            <Textarea placeholder="disabled" disabled />
            <Textarea defaultValue="readonly" readOnly />
            <Textarea placeholder="invalid" aria-invalid />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Textarea defaultValue="값이 있는 상태" />
<Textarea placeholder="disabled" disabled />
<Textarea defaultValue="readonly" readOnly />
<Textarea placeholder="invalid" aria-invalid />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiTextarea(controller: TextEditingController(text: '값이 있는 상태'))
ShUiTextarea(placeholder: 'disabled', enabled: false)
ShUiTextarea(readOnly: true, controller: TextEditingController(text: 'readonly'))
ShUiTextarea(placeholder: 'invalid', invalid: true)`,
            },
          ]}
        />
      </Preview>

      <h3>Label과 함께</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <Label htmlFor="demo-bio" isRequired>소개</Label>
            <Textarea id="demo-bio" placeholder="자기소개를 입력하세요" required rows={4} />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Label htmlFor="bio" isRequired>소개</Label>
<Textarea id="bio" placeholder="자기소개를 입력하세요" required rows={4} />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    const ShUiLabel(
      isRequired: true,
      child: ShUiLabelTitle('소개'),
    ),
    const SizedBox(height: 4),
    ShUiTextarea(
      placeholder: '자기소개를 입력하세요',
      minLines: 4,
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>글자 수 제한</h3>
      <Preview>
        <Preview.Demo>
          <CharCountDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [value, setValue] = useState("");
const isOver = value.length > MAX_LENGTH;

<Textarea
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="최대 200자까지 입력 가능합니다"
  aria-invalid={isOver || undefined}
/>
<p>{value.length} / {MAX_LENGTH}</p>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `String _value = '';
const maxLength = 200;
final isOver = _value.length > maxLength;

ShUiTextarea(
  placeholder: '최대 200자까지 입력 가능합니다',
  invalid: isOver,
  onChanged: (v) => setState(() => _value = v),
)
Text('\${_value.length} / $maxLength')`,
            },
          ]}
        />
      </Preview>

      <h3>rows 조절</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Textarea rows={2} placeholder="rows=2" />
            <Textarea rows={6} placeholder="rows=6" />
            <Textarea rows={10} placeholder="rows=10" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Textarea rows={2} placeholder="rows=2" />
<Textarea rows={6} placeholder="rows=6" />
<Textarea rows={10} placeholder="rows=10" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiTextarea(minLines: 2, placeholder: 'minLines=2')
ShUiTextarea(minLines: 6, placeholder: 'minLines=6')
ShUiTextarea(minLines: 10, placeholder: 'minLines=10')`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>Textarea</h3>
      <p className="muted">
        네이티브 <code>&lt;textarea&gt;</code> 모든 속성을 그대로 받는다. 추가 prop은 다음과 같다.
      </p>
      <PropsTable
        rows={[
          { prop: "aria-invalid", type: `boolean | "true"`, description: "에러 상태. 보더가 --danger로 전환." },
          { prop: "disabled", type: "boolean" },
          { prop: "readOnly", type: "boolean" },
          { prop: "rows", type: "number", description: "표시 행 수. 기본값은 브라우저 기본(보통 2)." },
        ]}
      />

      <h2>접근성</h2>
      <ul>
        <li>네이티브 <code>&lt;textarea&gt;</code> — <code>Tab</code> 이동, 멀티라인 편집 기본 동작</li>
        <li>레이블 연결: <code>&lt;Label htmlFor=&quot;id&quot;&gt;</code>로 <code>id</code>와 묶기</li>
        <li>에러 메시지: <code>aria-invalid</code> + <code>aria-describedby</code>로 연결</li>
      </ul>
    </main>
  );
}
