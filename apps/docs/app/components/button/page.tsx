export const dynamic = "force-static";

import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";

const variants = ["primary", "secondary", "ghost", "danger", "link"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function ButtonPage() {
  return (
    <main className="container">
      <h1>Button</h1>
      <p className="muted">기본 상호작용 요소. 5가지 variant × 3가지 size.</p>

      <Preview>
        <Preview.Demo>
          <Button>저장</Button>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Button>저장</Button>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx sh-ui add button`}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/button/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { Button } from "@/components/ui/button";

<Button variant="primary" size="md" onClick={handleClick}>
  저장
</Button>`}
      />

      <h2>Examples</h2>

      <h3>Variants</h3>
      <Preview>
        <Preview.Demo>
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Button variant="primary">primary</Button>
<Button variant="secondary">secondary</Button>
<Button variant="ghost">ghost</Button>
<Button variant="danger">danger</Button>
<Button variant="link">link</Button>`}
        />
      </Preview>

      <h3>Sizes</h3>
      <Preview>
        <Preview.Demo>
          {sizes.map((s) => (
            <Button key={s} size={s}>
              size = {s}
            </Button>
          ))}
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Button size="sm">size = sm</Button>
<Button size="md">size = md</Button>
<Button size="lg">size = lg</Button>`}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <Button disabled>primary</Button>
          <Button variant="secondary" disabled>secondary</Button>
          <Button variant="ghost" disabled>ghost</Button>
          <Button variant="danger" disabled>danger</Button>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Button disabled>primary</Button>
<Button variant="secondary" disabled>secondary</Button>
<Button variant="ghost" disabled>ghost</Button>
<Button variant="danger" disabled>danger</Button>`}
        />
      </Preview>

      <h3>전체 매트릭스</h3>
      <Preview>
        <Preview.Demo>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto repeat(3, auto)",
              gap: "0.75rem 1.25rem",
              alignItems: "center",
              justifyItems: "start",
            }}
          >
            <div />
            {sizes.map((s) => (
              <div key={s} className="muted" style={{ fontSize: "0.75rem", textAlign: "center" }}>
                {s}
              </div>
            ))}
            {variants.map((v) => (
              <Fragment key={v}>
                <div className="muted" style={{ fontSize: "0.75rem" }}>{v}</div>
                {sizes.map((s) => (
                  <Button key={`${v}-${s}`} variant={v} size={s}>
                    {v}
                  </Button>
                ))}
              </Fragment>
            ))}
          </div>
        </Preview.Demo>
      </Preview>

      <h2>API Reference</h2>

      <h3>Button</h3>
      <p className="muted">
        네이티브 <code>&lt;button&gt;</code>을 감싸 토큰 기반 스타일과 variant/size를 제공한다.
        나열되지 않은 모든 네이티브 <code>button</code> 속성을 그대로 받는다.
      </p>
      <PropsTable
        rows={[
          {
            prop: "variant",
            type: `"primary" | "secondary" | "ghost" | "danger" | "link"`,
            default: `"primary"`,
            description: "시각적 스타일 종류.",
          },
          {
            prop: "size",
            type: `"sm" | "md" | "lg"`,
            default: `"md"`,
            description: "버튼 크기. 패딩과 폰트 사이즈가 함께 변한다.",
          },
          {
            prop: "disabled",
            type: "boolean",
            description: "비활성 상태. 포인터 이벤트와 키보드 인터랙션이 차단된다.",
          },
        ]}
      />
    </main>
  );
}