export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { Progress } from "@/components/ui/progress";
import { AnimatedProgressDemo } from "./_demos/animated";

export default function ProgressPage() {
  return (
    <main className="container">
      <h1>Progress</h1>
      <p className="muted">
        작업 진행도를 가로 바로 표시. <code>value</code>가 있으면 determinate,
        없으면 무한 루프 indeterminate.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <Progress value={60} aria-label="기본 예시" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Progress value={60} aria-label="다운로드" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiProgress(value: 0.6, semanticLabel: '다운로드')`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add progress`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add progress`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Indeterminate</h3>
      <p className="muted"><code>value</code>를 생략하면 끝나지 않은 작업을 표시하는 무한 루프 애니메이션.</p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%" }}>
            <Progress aria-label="로딩 중" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            { value: "react", label: "React", language: "tsx", code: `<Progress aria-label="로딩 중" />` },
            { value: "flutter", label: "Flutter", language: "dart", code: `ShUiProgress(semanticLabel: '로딩 중')` },
          ]}
        />
      </Preview>

      <h3>실시간 업데이트</h3>
      <Preview>
        <Preview.Demo>
          <AnimatedProgressDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [value, setValue] = useState(0);
// useEffect로 매 400ms마다 +5
<Progress value={value} aria-label="다운로드" />`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>
      <PropsTable
        rows={[
          { prop: "value", type: "number", description: "0~max 사이. 생략 시 indeterminate." },
          { prop: "max", type: "number", default: "100" },
          { prop: "aria-label", type: "string", description: "시각 라벨이 없을 때 권장." },
        ]}
      />
    </main>
  );
}
