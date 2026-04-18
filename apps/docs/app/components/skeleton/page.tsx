export const dynamic = "force-static";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";

export default function SkeletonPage() {
  return (
    <main className="container">
      <h1>Skeleton</h1>
      <p className="muted">
        데이터 로딩 중 자리를 대신 차지하는 플레이스홀더. 폭/높이/모양은{" "}
        <code>style</code>이나 <code>className</code>으로 지정한다.
      </p>

      <Preview>
        <Preview.Demo>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              width: "100%",
              maxWidth: 320,
            }}
          >
            <Skeleton style={{ height: "1.25rem", width: "70%" }} />
            <Skeleton style={{ height: "1rem" }} />
            <Skeleton style={{ height: "1rem", width: "85%" }} />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Skeleton style={{ height: "1.25rem", width: "70%" }} />
<Skeleton style={{ height: "1rem" }} />
<Skeleton style={{ height: "1rem", width: "85%" }} />`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx sh-ui add skeleton`}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/skeleton/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { Skeleton } from "@/components/ui/skeleton";

<Skeleton style={{ height: "1rem", width: "12rem" }} />`}
      />
      <p className="muted">
        기본 <code>display: block</code>, 너비 100%. 크기는{" "}
        <code>style</code>/<code>className</code>으로 제어한다. 동그란 아바타
        자리는 <code>border-radius: 999px</code>로 덮어쓴다.
      </p>

      <h2>Examples</h2>

      <h3>아바타 + 텍스트 줄</h3>
      <Preview>
        <Preview.Demo>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              maxWidth: 320,
            }}
          >
            <Skeleton
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "999px",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                flex: 1,
              }}
            >
              <Skeleton style={{ height: "0.875rem", width: "60%" }} />
              <Skeleton style={{ height: "0.75rem", width: "40%" }} />
            </div>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
  <Skeleton
    style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px" }}
  />
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
    <Skeleton style={{ height: "0.875rem", width: "60%" }} />
    <Skeleton style={{ height: "0.75rem", width: "40%" }} />
  </div>
</div>`}
        />
      </Preview>

      <h3>카드 플레이스홀더</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <Card>
              <CardHeader>
                <Skeleton style={{ height: "1.125rem", width: "50%" }} />
                <Skeleton style={{ height: "0.875rem", width: "75%" }} />
              </CardHeader>
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <Skeleton style={{ height: "0.875rem" }} />
                  <Skeleton style={{ height: "0.875rem", width: "90%" }} />
                  <Skeleton style={{ height: "0.875rem", width: "60%" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Card>
  <CardHeader>
    <Skeleton style={{ height: "1.125rem", width: "50%" }} />
    <Skeleton style={{ height: "0.875rem", width: "75%" }} />
  </CardHeader>
  <CardContent>
    <Skeleton style={{ height: "0.875rem" }} />
    <Skeleton style={{ height: "0.875rem", width: "90%" }} />
    <Skeleton style={{ height: "0.875rem", width: "60%" }} />
  </CardContent>
</Card>`}
        />
      </Preview>

      <h2>API Reference</h2>
      <p className="muted">
        <code>Skeleton</code>은 네이티브 <code>div</code> 속성을 그대로 받는다.
        별도 prop은 없으며 접근성을 위해 <code>aria-hidden="true"</code>가 기본
        적용된다.
      </p>
    </main>
  );
}
