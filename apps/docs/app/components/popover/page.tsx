export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { PopoverBasicDemo } from "./_demos/basic";

export default function PopoverPage() {
  return (
    <main className="container">
      <h1>Popover</h1>
      <p className="muted">
        트리거에 앵커된 떠오르는 패널. 클릭/hover로 열고 바깥 클릭·Esc로 닫힌다. <a href="https://base-ui.com/react/components/popover" target="_blank" rel="noreferrer">Base UI Popover</a> 위에 sh-ui 토큰 스타일을 얹음.
      </p>

      <Preview>
        <Preview.Demo>
          <PopoverBasicDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Popover>
  <PopoverTrigger>
    <Button variant="secondary">팝오버 열기</Button>
  </PopoverTrigger>
  <PopoverContent showArrow>
    <PopoverTitle>알림 설정</PopoverTitle>
    <PopoverDescription>
      여기서 알림 수신 방법을 변경할 수 있습니다.
    </PopoverDescription>
  </PopoverContent>
</Popover>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add popover`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/popover/</code>로 복사하고 Base UI를 설치한다.
      </p>
      <CodePanel language="bash" showLineNumbers={false} code={`pnpm add @base-ui-components/react`} />

      <h2>Examples</h2>

      <h3>배치 방향</h3>
      <p className="muted">
        <code>side</code>와 <code>align</code>으로 트리거 기준 팝오버 위치를 제어.
      </p>
      <CodePanel
        language="tsx"
        code={`<PopoverContent side="right" align="start">
  ...
</PopoverContent>

<PopoverContent side="top" align="center">
  ...
</PopoverContent>`}
      />

      <h3>제어 모드</h3>
      <CodePanel
        language="tsx"
        code={`const [open, setOpen] = useState(false);

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger>열기</PopoverTrigger>
  <PopoverContent>내용</PopoverContent>
</Popover>`}
      />

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Popover", description: "루트. open/onOpenChange 등 Base UI props 그대로." },
          { name: "PopoverTrigger", description: "클릭/hover로 팝오버를 여는 트리거. openOnHover/delay/closeDelay 지원." },
          { name: "PopoverContent", description: "Portal + Positioner + Popup 래퍼. side/align/sideOffset/showArrow props." },
          { name: "PopoverTitle", description: "팝오버 제목." },
          { name: "PopoverDescription", description: "팝오버 설명 텍스트." },
          { name: "PopoverClose", description: "닫기 트리거." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>PopoverContent</h3>
      <PropsTable
        rows={[
          { prop: "side", type: `"top" | "right" | "bottom" | "left"`, description: "트리거 기준 팝오버 배치 방향." },
          { prop: "align", type: `"start" | "center" | "end"`, description: "정렬." },
          { prop: "sideOffset", type: "number", default: "8", description: "트리거와의 간격 (px)." },
          { prop: "showArrow", type: "boolean", default: "false", description: "화살표 표시." },
          { prop: "container", type: "Element | null", description: "Portal 마운트 노드." },
        ]}
      />

      <h3>PopoverTrigger</h3>
      <PropsTable
        rows={[
          { prop: "openOnHover", type: "boolean", default: "false", description: "hover로 열기." },
          { prop: "delay", type: "number", default: "300", description: "hover 열기 지연 (ms)." },
          { prop: "closeDelay", type: "number", default: "0", description: "hover 닫기 지연 (ms)." },
        ]}
      />
    </main>
  );
}
