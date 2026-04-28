export const dynamic = "force-static";

import { Input } from "@/components/ui/input";
import { Label, LabelTitle, LabelSubtitle, LabelDescription, LabelCaption } from "@/components/ui/label";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";

export default function LabelPage() {
  return (
    <main className="container">
      <h1>Label</h1>
      <p className="muted">
        폼 입력 필드와 연결되는 라벨. <code>isRequired</code>로 필수 필드 표시(* 마크) 자동 추가.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <Label htmlFor="label-demo-1">이름</Label>
              <Input id="label-demo-1" placeholder="홍길동" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <Label htmlFor="label-demo-2">이메일</Label>
              <Input id="label-demo-2" type="email" placeholder="you@example.com" required />
            </div>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `{/* 일반 필드 */}
<Label htmlFor="name">이름</Label>
<Input id="name" placeholder="홍길동" />

{/* required 자동 감지 — isRequired 없이도 * 표시 */}
<Label htmlFor="email">이메일</Label>
<Input id="email" type="email" placeholder="you@example.com" required />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// 일반 필드
const ShUiLabel(child: ShUiLabelTitle('이름')),
const ShUiInput(placeholder: '홍길동'),

// 필수 필드 — isRequired로 * 표시
const ShUiLabel(
  isRequired: true,
  child: ShUiLabelTitle('이메일'),
),
const ShUiInput(placeholder: 'you@example.com'),`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add label`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add label`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 복사한다. (React: <code>components/ui/label/</code>, Flutter: <code>lib/widgets/sh_ui_label.dart</code>)
      </p>
      <ul>
        <li>React: <code>index.tsx</code>, <code>styles.css</code></li>
        <li>Flutter: <code>packages/registry/flutter/widgets/sh_ui_label.dart</code></li>
      </ul>

      <h2>Usage</h2>
      <p className="muted">
        <code>Label</code>과 <code>Input</code>을 <code>htmlFor</code>/<code>id</code>로 연결하면, Input에 <code>required</code>·<code>disabled</code> 속성이 있을 때 CSS <code>:has()</code>로 자동 감지해 Label 표시를 바꿔줍니다. (Flutter는 <code>isRequired</code> prop을 명시적으로 지정.)
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

{/* 기본 */}
<Label htmlFor="username">사용자 이름</Label>
<Input id="username" placeholder="..." />

{/* Input에 required → Label에 * 자동 표시 */}
<Label htmlFor="password">비밀번호</Label>
<Input id="password" type="password" required />

{/* :has() 미지원 환경 대비 수동 지정도 가능 */}
<Label htmlFor="email" isRequired>이메일</Label>
<Input id="email" type="email" required />`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import 'widgets/sh_ui_label.dart';
import 'widgets/sh_ui_input.dart';

// 기본
const ShUiLabel(child: ShUiLabelTitle('사용자 이름')),
const ShUiInput(placeholder: '...'),

// 필수 필드는 isRequired로 명시
const ShUiLabel(
  isRequired: true,
  child: ShUiLabelTitle('비밀번호'),
),
const ShUiPasswordInput(),`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>텍스트 계층</h3>
      <p className="muted">
        <code>LabelTitle</code>, <code>LabelSubtitle</code>, <code>LabelDescription</code>, <code>LabelCaption</code>으로 폼 필드에 계층적 안내 텍스트를 배치.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", maxWidth: 360 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <Label htmlFor="label-hier-1">
                <LabelTitle>프로젝트 이름</LabelTitle>
                <LabelDescription>다른 팀원에게 보이는 이름입니다.</LabelDescription>
              </Label>
              <Input id="label-hier-1" placeholder="my-project" required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <Label htmlFor="label-hier-2">
                <LabelTitle>슬러그</LabelTitle>
                <LabelSubtitle>URL에 사용</LabelSubtitle>
                <LabelDescription>영문 소문자, 숫자, 하이픈만 가능합니다.</LabelDescription>
                <LabelCaption>변경 시 기존 링크가 깨질 수 있습니다.</LabelCaption>
              </Label>
              <Input id="label-hier-2" placeholder="my-project" required />
            </div>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Label htmlFor="name">
  <LabelTitle>프로젝트 이름</LabelTitle>
  <LabelDescription>다른 팀원에게 보이는 이름입니다.</LabelDescription>
</Label>
<Input id="name" placeholder="my-project" required />

<Label htmlFor="slug">
  <LabelTitle>슬러그</LabelTitle>
  <LabelSubtitle>URL에 사용</LabelSubtitle>
  <LabelDescription>영문 소문자, 숫자, 하이픈만 가능.</LabelDescription>
  <LabelCaption>변경 시 기존 링크가 깨질 수 있습니다.</LabelCaption>
</Label>
<Input id="slug" placeholder="my-project" required />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiLabel(
  isRequired: true,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      ShUiLabelTitle('프로젝트 이름'),
      SizedBox(height: 2),
      ShUiLabelDescription('다른 팀원에게 보이는 이름입니다.'),
    ],
  ),
),
ShUiInput(placeholder: 'my-project'),

ShUiLabel(
  isRequired: true,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      ShUiLabelTitle('슬러그'),
      SizedBox(height: 2),
      ShUiLabelSubtitle('URL에 사용'),
      SizedBox(height: 4),
      ShUiLabelDescription('영문 소문자, 숫자, 하이픈만 가능.'),
      SizedBox(height: 8),
      ShUiLabelCaption('변경 시 기존 링크가 깨질 수 있습니다.'),
    ],
  ),
),
ShUiInput(placeholder: 'my-project'),`,
            },
          ]}
        />
      </Preview>

      <h3>Label 없이 단독 사용</h3>
      <p className="muted">
        <code>LabelTitle</code>·<code>LabelDescription</code> 등은 순수 스타일 요소이므로 <code>Label</code>로 감싸지 않아도 어디서든 독립적으로 쓸 수 있습니다. 카드 헤더, 설정 항목, 폼 밖 설명 등에 활용 가능.
      </p>
      <p className="muted">
        <code>Label</code>로 감싸야 하는 경우는: ① <code>htmlFor</code>/<code>id</code>로 Input과 접근성 연결이 필요할 때, ② <code>*</code> 필수 표시 자동 감지가 필요할 때.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", width: "100%", maxWidth: 360 }}>
            <LabelTitle>알림 설정</LabelTitle>
            <LabelDescription>이메일과 푸시 알림을 받을지 선택하세요.</LabelDescription>
            <LabelCaption>설정은 즉시 반영됩니다.</LabelCaption>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `{/* Label 없이 — 순수 시각 계층으로만 사용 */}
<LabelTitle>알림 설정</LabelTitle>
<LabelDescription>이메일과 푸시 알림을 받을지 선택하세요.</LabelDescription>
<LabelCaption>설정은 즉시 반영됩니다.</LabelCaption>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// ShUiLabel 없이 — 순수 시각 계층으로만 사용
const ShUiLabelTitle('알림 설정'),
const ShUiLabelDescription('이메일과 푸시 알림을 받을지 선택하세요.'),
const ShUiLabelCaption('설정은 즉시 반영됩니다.'),`,
            },
          ]}
        />
      </Preview>

      <h3>비활성 상태</h3>
      <p className="muted">
        연결된 Input이 <code>disabled</code>면 Label도 자동으로 흐려진다 (CSS <code>:has()</code>).
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", width: "100%", maxWidth: 320 }}>
            <Label htmlFor="label-demo-dis">비활성 필드</Label>
            <Input id="label-demo-dis" placeholder="수정 불가" disabled />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Label htmlFor="field">비활성 필드</Label>
<Input id="field" disabled />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter는 자동 감지가 없으므로 enabled를 함께 지정
const ShUiLabel(child: ShUiLabelTitle('비활성 필드')),
const ShUiInput(placeholder: '수정 불가', enabled: false),`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Label", description: "루트. 네이티브 <label>을 래핑. isRequired/htmlFor." },
          { name: "LabelTitle", description: "주 라벨 텍스트. 굵고 진한 색. 필수 * 마크가 이 요소 뒤에 붙음." },
          { name: "LabelSubtitle", description: "부제. 타이틀 아래 보조 강조." },
          { name: "LabelDescription", description: "설명. 입력 필드 가이드 텍스트. muted 색." },
          { name: "LabelCaption", description: "흐린 설명. 가장 덜 중요한 보조 텍스트. 가장 작고 흐림." },
        ]}
      />

      <h2>자동 감지 지원 범위</h2>
      <p className="muted">
        Label은 인접한 폼 컴포넌트의 <code>required</code>·<code>disabled</code> 상태를 CSS <code>:has()</code>로 자동 감지한다.
        자동 감지가 안 되는 컴포넌트는 <code>isRequired</code> prop을 수동으로 지정하면 된다.
      </p>

      <div className="sh-ui-props">
        <table className="sh-ui-props__table">
          <thead>
            <tr>
              <th>컴포넌트</th>
              <th>required 자동 감지</th>
              <th>disabled 자동 감지</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code className="sh-ui-props__name">Input</code></td>
              <td>✓</td>
              <td>✓</td>
              <td className="sh-ui-props__desc">prefix/suffix 래퍼 포함</td>
            </tr>
            <tr>
              <td><code className="sh-ui-props__name">Textarea</code></td>
              <td>✓</td>
              <td>✓</td>
              <td className="sh-ui-props__desc"></td>
            </tr>
            <tr>
              <td><code className="sh-ui-props__name">Combobox</code></td>
              <td>✓</td>
              <td>✓</td>
              <td className="sh-ui-props__desc"></td>
            </tr>
            <tr>
              <td><code className="sh-ui-props__name">Select</code></td>
              <td>—</td>
              <td>✓</td>
              <td className="sh-ui-props__desc"><code>isRequired</code> 수동 지정</td>
            </tr>
            <tr>
              <td><code className="sh-ui-props__name">DatePicker</code></td>
              <td>—</td>
              <td>✓</td>
              <td className="sh-ui-props__desc"><code>isRequired</code> 수동 지정</td>
            </tr>
            <tr>
              <td><code className="sh-ui-props__name">DateRangePicker</code></td>
              <td>—</td>
              <td>✓</td>
              <td className="sh-ui-props__desc"><code>isRequired</code> 수동 지정</td>
            </tr>
            <tr>
              <td><code className="sh-ui-props__name">FileUpload</code></td>
              <td>—</td>
              <td>✓</td>
              <td className="sh-ui-props__desc"><code>isRequired</code> 수동 지정</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="muted">
        <strong>required 자동 감지</strong>는 네이티브 <code>&lt;input&gt;</code>/<code>&lt;textarea&gt;</code> 요소의 <code>:required</code> CSS 의사 클래스를 사용하므로, <code>&lt;button&gt;</code>/<code>&lt;div&gt;</code> 기반 컴포넌트(Select, DatePicker, FileUpload)에서는 동작하지 않는다.
        이 경우 <code>&lt;Label isRequired&gt;</code>를 사용한다.
      </p>

      <h2>API Reference</h2>

      <h3>Label</h3>
      <p className="muted">
        네이티브 <code>&lt;label&gt;</code> 모든 속성을 그대로 받는다.
      </p>
      <PropsTable
        rows={[
          { prop: "isRequired", type: "boolean", description: "필수 표시(* 마크)를 수동 지정. Input/Textarea/Combobox는 required 자동 감지가 되므로 보통 불필요." },
          { prop: "htmlFor", type: "string", description: "연결할 input의 id." },
        ]}
      />
    </main>
  );
}
