export const dynamic = "force-static";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/ui/code-tabs";
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Skeleton style={{ height: "1.25rem", width: "70%" }} />
<Skeleton style={{ height: "1rem" }} />
<Skeleton style={{ height: "1rem", width: "85%" }} />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiSkeleton(height: 20, width: 220),
const ShUiSkeleton(height: 16),
const ShUiSkeleton(height: 16, width: 270),`,
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
            code: `npx sh-ui-cli add skeleton`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add skeleton

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_skeleton.dart → lib/widgets/`,
          },
        ]}
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
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Skeleton } from "@/components/ui/skeleton";

<Skeleton style={{ height: "1rem", width: "12rem" }} />`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_skeleton.dart';

// 직사각형
const ShUiSkeleton(width: 192, height: 16)

// 원형 아바타
ShUiSkeleton.avatar(size: 40)

// 한 줄 텍스트 자리
ShUiSkeleton.text(width: 120)

// 풀너비 블록
ShUiSkeleton.block(height: 120)`,
          },
        ]}
      />
      <p className="muted">
        React는 <code>display: block</code>·너비 100% 기본이라{" "}
        <code>style</code>/<code>className</code>으로 크기를 제어한다. Flutter는{" "}
        <code>width</code>·<code>height</code>·<code>borderRadius</code> prop으로
        제어하며, <code>avatar</code>/<code>text</code>/<code>block</code>{" "}
        편의 생성자를 제공한다.
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
  <Skeleton
    style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px" }}
  />
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
    <Skeleton style={{ height: "0.875rem", width: "60%" }} />
    <Skeleton style={{ height: "0.75rem", width: "40%" }} />
  </div>
</div>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `Row(
  children: [
    ShUiSkeleton.avatar(size: 40),
    const SizedBox(width: 12),
    Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          ShUiSkeleton(height: 14, width: 160),
          SizedBox(height: 8),
          ShUiSkeleton(height: 12, width: 100),
        ],
      ),
    ),
  ],
)`,
            },
          ]}
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Card>
  <CardHeader>
    <Skeleton style={{ height: "1.125rem", width: "50%" }} />
    <Skeleton style={{ height: "0.875rem", width: "75%" }} />
  </CardHeader>
  <CardContent>
    <Skeleton style={{ height: "0.875rem" }} />
    <Skeleton style={{ height: "0.875rem", width: "90%" }} />
    <Skeleton style={{ height: "0.875rem", width: "60%" }} />
  </CardContent>
</Card>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiCard(
  children: [
    const ShUiCardHeader(
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShUiSkeleton(height: 18, width: 160),
          SizedBox(height: 8),
          ShUiSkeleton(height: 14, width: 240),
        ],
      ),
    ),
    ShUiCardContent(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          ShUiSkeleton(height: 14),
          SizedBox(height: 8),
          ShUiSkeleton(height: 14, width: 280),
          SizedBox(height: 8),
          ShUiSkeleton(height: 14, width: 200),
        ],
      ),
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>
      <p className="muted">
        React <code>Skeleton</code>은 네이티브 <code>div</code> 속성을 그대로
        받는다. 별도 prop은 없으며 접근성을 위해{" "}
        <code>aria-hidden=&quot;true&quot;</code>가 기본 적용된다.
      </p>
      <p className="muted">
        Flutter <code>ShUiSkeleton</code>은{" "}
        <code>width</code>·<code>height</code>·<code>borderRadius</code> prop과
        세 가지 편의 생성자(<code>text</code>, <code>avatar</code>,{" "}
        <code>block</code>)를 제공한다.
      </p>
      <CodePanel
        language="dart"
        code={`ShUiSkeleton({double? width, double? height, double? borderRadius})

// 편의 생성자
ShUiSkeleton.text({double? width, double height = 14, double? borderRadius})
ShUiSkeleton.avatar({double size = 40})
ShUiSkeleton.block({double height = 96, double? borderRadius})`}
      />
    </main>
  );
}
