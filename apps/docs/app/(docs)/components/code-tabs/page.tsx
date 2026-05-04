export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { VariantSource } from "@/components/variant-source";

const reactSnippet = `import { Button } from "@/components/ui/button";

export function Demo() {
  return <Button>Click</Button>;
}`;

const flutterSnippet = `import 'package:flutter/material.dart';

class Demo extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
    ElevatedButton(onPressed: () {}, child: Text('Click'));
}`;

export default function CodeTabsDocsPage() {
  return (
    <main className="container">
      <h1>CodeTabs</h1>
      <p className="muted">
        같은 예제의 여러 코드 뷰를 탭으로 전환 — React/Flutter 같은 멀티 플랫폼 코드,
        혹은 "강조 부분 / 전체 코드" 처럼 여러 시점의 같은 코드를 한 자리에 보여줄 때.
        각 탭의 내용은 그대로 <code>CodePanel</code> 로 렌더돼 shiki 하이라이팅 · 복사 버튼 · 파일명 헤더 모두 그대로 사용.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <CodeTabs
              items={[
                { value: "react", label: "React", language: "tsx", code: reactSnippet },
                { value: "flutter", label: "Flutter", language: "dart", code: flutterSnippet },
              ]}
            />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CodeTabs
  items={[
    { value: "react", label: "React", language: "tsx", code: reactSnippet },
    { value: "flutter", label: "Flutter", language: "dart", code: flutterSnippet },
  ]}
/>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add code-tabs`} />
      <p className="muted">
        <code>tabs</code> 와 <code>code-panel</code> 이 자동으로 함께 설치된다 (registry dependencies).
      </p>
      <h3>Manual</h3>
      <VariantSource name="code-tabs" />


      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { CodeTabs } from "@/components/ui/code-tabs";

<CodeTabs
  defaultValue="react"
  items={[
    {
      value: "react",
      label: "React",
      language: "tsx",
      filename: "demo.tsx",
      code: reactCode,
    },
    {
      value: "flutter",
      label: "Flutter",
      language: "dart",
      code: flutterCode,
    },
  ]}
/>`}
      />
      <p className="muted">
        각 항목은 <code>CodePanelProps</code> 의 모든 prop(<code>filename</code>·<code>showLineNumbers</code>·
        <code>hideCopy</code> 등) 을 그대로 받을 수 있다.
      </p>

      <h2>API Reference</h2>

      <h3>CodeTabs</h3>
      <PropsTable
        rows={[
          {
            prop: "items",
            type: "CodeTabsItem[]",
            description: "각 탭의 코드 정의. value · label · code 외에 CodePanelProps 를 그대로 받는다.",
          },
          {
            prop: "defaultValue",
            type: "string",
            description: "초기 활성 탭 value. 미지정 시 첫 번째 항목.",
          },
        ]}
      />

      <h3>CodeTabsItem</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string", description: "탭 식별자 (Tabs 의 value 와 동일)." },
          { prop: "label", type: "string", description: "탭 트리거에 표시될 라벨." },
          { prop: "code", type: "string", description: "표시할 코드." },
          {
            prop: "...rest",
            type: "Omit<CodePanelProps, \"code\">",
            description: "language · filename · showLineNumbers · hideCopy 등 CodePanel prop 그대로.",
          },
        ]}
      />
    </main>
  );
}
