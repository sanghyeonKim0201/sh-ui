export const dynamic = "force-static";

import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { TooltipBasicDemo } from "./_demos/basic";

export default function TooltipPage() {
  return (
    <main className="container">
      <h1>Tooltip</h1>
      <p className="muted">
        hover/focus로 잠깐 뜨는 설명 패널. 짧은 텍스트나 단축키 안내에 적합.{" "}
        <a href="https://base-ui.com/react/components/tooltip" target="_blank" rel="noreferrer">
          Base UI Tooltip
        </a>{" "}
        래핑.
      </p>

      <Preview>
        <Preview.Demo>
          <TooltipBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<TooltipProvider delay={200}>
  <Tooltip>
    <TooltipTrigger render={<Button variant="secondary">저장</Button>} />
    <TooltipContent>변경 사항을 저장합니다 (⌘S)</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
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
            code: `npx sh-ui add tooltip`,
          },
        ]}
      />

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "TooltipProvider", description: "공통 delay를 공유하는 그룹. 앱 루트에 한 번." },
          { name: "Tooltip", description: "개별 tooltip 루트. open/onOpenChange 지원." },
          { name: "TooltipTrigger", description: "호버 대상 엘리먼트. render prop으로 Button 등과 결합." },
          { name: "TooltipContent", description: "Portal + Positioner + Popup 래퍼." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>TooltipContent</h3>
      <PropsTable
        rows={[
          { prop: "side", type: `"top" | "right" | "bottom" | "left"`, description: "배치 방향." },
          { prop: "align", type: `"start" | "center" | "end"`, description: "정렬." },
          { prop: "sideOffset", type: "number", default: "6", description: "트리거와의 간격(px)." },
          { prop: "showArrow", type: "boolean", default: "false", description: "화살표 표시." },
          { prop: "container", type: "Element | null", description: "Portal 마운트 노드." },
        ]}
      />

      <h3>TooltipProvider</h3>
      <PropsTable
        rows={[
          { prop: "delay", type: "number", description: "열기까지 지연(ms)." },
          { prop: "closeDelay", type: "number", description: "닫기 지연(ms)." },
        ]}
      />
    </main>
  );
}
