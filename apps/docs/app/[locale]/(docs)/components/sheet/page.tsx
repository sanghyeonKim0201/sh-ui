export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { VariantSource } from "@/components/variant-source";
import {
  loadComponentSources,
  loadExtraComponent,
} from "@/components/sandbox-code/load-component-sources";
import { SheetLiveDemo } from "./sheet-live-demo";

const sources = loadComponentSources("sheet");
const extras = [loadExtraComponent("button")];

export default function SheetPage() {
  return (
    <main className="container">
      <h1>Sheet</h1>
      <p className="muted">
        화면 가장자리에서 슬라이드 인 하는 side drawer. 헤더의 알림함, 글로벌 작업 큐, 보조 설정 패널처럼{" "}
        <strong>사이드바와 무관한 위치</strong>에서 모달 시트를 띄우는 케이스에 사용.{" "}
        <a href="https://base-ui.com/react/components/drawer" target="_blank" rel="noreferrer">
          Base UI Drawer
        </a>{" "}
        위에 sh-ui 토큰 스타일을 얹음.
      </p>

      <SheetLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
        extraComponents={extras}
      />

      <h2>언제 쓰나</h2>
      <ul>
        <li>
          <strong>Sheet</strong> — 사이드바와 무관한 글로벌 모달 시트. 헤더 알림함, 작업 큐, 보조 설정 패널.
        </li>
        <li>
          <strong>Dialog</strong> — 중앙에 떠올라 강제 응답을 요구하는 모달 (확인/입력). 닫기 액션이 필수일 때.
        </li>
        <li>
          <strong>SidebarPanel</strong> — Sidebar 인접 detail 뷰. Sidebar 와 stacked 되어 자연스럽게 연결.
        </li>
      </ul>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add sheet`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="sheet" />
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `pnpm add @base-ui/react`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>진입 방향</h3>
      <p className="muted">
        <code>side</code> 로 슬라이드 진입 방향을 지정한다. right/left 는 사이드 패널, top/bottom 은 시트 형태.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `<SheetContent side="right">...</SheetContent>
<SheetContent side="left">...</SheetContent>
<SheetContent side="top">...</SheetContent>
<SheetContent side="bottom">...</SheetContent>`,
          },
        ]}
      />

      <h3>제어 모드</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `const [open, setOpen] = useState(false);

<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger>열기</SheetTrigger>
  <SheetContent side="right">
    <SheetCloseX />
    <SheetHeader>
      <SheetTitle>알림</SheetTitle>
    </SheetHeader>
    내용...
  </SheetContent>
</Sheet>`,
          },
        ]}
      />

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Sheet", description: "루트. open/onOpenChange 등 Base UI Drawer props 그대로." },
          { name: "SheetTrigger", description: "Sheet 를 여는 트리거. 자체로 <button>." },
          { name: "SheetContent", description: "Portal + Backdrop + Popup 래퍼. side props (\"right\"|\"left\"|\"top\"|\"bottom\")." },
          { name: "SheetTitle", description: "시트 제목 (a11y 권장)." },
          { name: "SheetDescription", description: "시트 보조 설명." },
          { name: "SheetHeader", description: "Title/Description 묶음용 컨테이너." },
          { name: "SheetFooter", description: "하단 액션 버튼 영역." },
          { name: "SheetClose", description: "닫기 트리거. 자체로 <button>." },
          { name: "SheetCloseX", description: "우상단 X 닫기 버튼. aria-label=\"닫기\" 자동." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>SheetContent</h3>
      <PropsTable
        rows={[
          {
            prop: "side",
            type: `"right" | "left" | "top" | "bottom"`,
            default: `"right"`,
            description: "슬라이드 진입 방향.",
          },
          {
            prop: "container",
            type: "Element | null",
            description: "Portal 마운트 노드.",
          },
        ]}
      />

      <h2>접근성</h2>
      <ul>
        <li>
          <code>Esc</code> — 닫기 + 열기 트리거로 포커스 복귀
        </li>
        <li>바깥(backdrop) 클릭 — 닫기 (Base UI Drawer 기본 동작)</li>
        <li>포커스 트랩 — 시트 열림 동안 시트 내부 포커스만 이동</li>
        <li>
          Base UI 가 <code>aria-expanded</code>, <code>aria-controls</code> 자동 관리. Title/Description 이 있으면{" "}
          <code>aria-labelledby</code> / <code>aria-describedby</code> 도 자동 연결.
        </li>
        <li>
          <code>prefers-reduced-motion</code> 사용자에게는 transform 트랜지션 제거 — 즉시 표시.
        </li>
      </ul>

      <h2>스타일 커스터마이즈</h2>
      <p className="muted">
        시트 폭 / 패딩 / 색은 styles.css 의 토큰 (<code>--background</code>, <code>--border</code>,{" "}
        <code>--shadow-xl</code>, <code>--space-6</code>) 을 사용. 톤을 바꾸려면 토큰을 조정하거나
        클래스 셀렉터로 override.
      </p>
    </main>
  );
}
