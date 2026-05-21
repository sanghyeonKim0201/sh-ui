export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { VariantSource } from "@/components/variant-source";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { ScrollAreaLiveDemo } from "./scroll-area-live-demo";

const sources = loadComponentSources("scroll-area");

export default function ScrollAreaPage() {
  return (
    <main className="container">
      <h1>Scroll Area</h1>
      <p className="muted">
        커스텀 스크롤 컨테이너. OS-native 스크롤바를 가리고 디자인 시스템 톤의 스크롤바를 hover/scrolling 시에 떠다니게 표시한다.{" "}
        <a href="https://base-ui.com/react/components/scroll-area" target="_blank" rel="noreferrer">
          Base UI ScrollArea
        </a>{" "}
        위에 sh-ui 토큰 스타일을 얹음.
      </p>

      <ScrollAreaLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add scroll-area`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="scroll-area" />
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

      <h3>세로 스크롤 (기본)</h3>
      <p className="muted">
        외부 컨테이너에 <code>height</code> 를 정해줘야 스크롤이 발생한다. 콘텐츠 패딩은{" "}
        <code>viewportClassName</code> 으로 viewport 에 둔다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `<ScrollArea style={{ height: 240 }} viewportClassName="p-3">
  <ul>...</ul>
</ScrollArea>`,
          },
        ]}
      />

      <h3>가로 스크롤</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `<ScrollArea orientation="horizontal" style={{ width: 320 }}>
  <div style={{ display: "flex", gap: 8, padding: 12 }}>
    {tiles.map((t) => <Tile key={t.id} {...t} />)}
  </div>
</ScrollArea>`,
          },
        ]}
      />

      <h3>양방향 스크롤</h3>
      <p className="muted">
        가로·세로 모두 넘치는 콘텐츠 — 우하단 corner 도 함께 노출된다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `<ScrollArea
  orientation="both"
  style={{ width: 320, height: 240 }}
>
  <pre style={{ margin: 0, padding: 12, whiteSpace: "pre" }}>
    {longCodeBlock}
  </pre>
</ScrollArea>`,
          },
        ]}
      />

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          {
            name: "ScrollArea",
            description:
              "단일 composite. 내부에서 Base UI 의 Root + Viewport + Scrollbar + Thumb + Corner 를 자동 구성한다.",
          },
        ]}
      />

      <h2>API Reference</h2>

      <h3>ScrollArea</h3>
      <PropsTable
        rows={[
          {
            prop: "orientation",
            type: `"vertical" | "horizontal" | "both"`,
            default: `"vertical"`,
            description: "스크롤 축. `both` 는 가로·세로 스크롤바와 corner 를 모두 표시.",
          },
          {
            prop: "viewportClassName",
            type: "string",
            description:
              "Viewport 컨테이너에 적용할 className. 패딩·flex 같은 콘텐츠 레이아웃은 viewport 쪽에 두는 것이 자연스럽다.",
          },
          {
            prop: "className",
            type: "string",
            description: "Root 컨테이너 className. 외곽 height/width/border 등은 여기에 적용.",
          },
        ]}
      />

      <h2>접근성</h2>
      <ul>
        <li>
          Viewport 는 native 스크롤 컨테이너로 동작 — 키보드의 <code>↑</code>/<code>↓</code>,{" "}
          <code>PageUp</code>/<code>PageDown</code>, <code>Home</code>/<code>End</code> 기본 동작 유지.
        </li>
        <li>
          Viewport 가 포커스를 받으면 토큰 색의 focus ring 이 표시되어 키보드 사용자가 스크롤 위치를 인지할 수 있다.
        </li>
        <li>
          <code>prefers-reduced-motion</code> 사용자에게는 스크롤바 fade in/out 트랜지션을 제거한다.
        </li>
      </ul>

      <h2>스타일 커스터마이즈</h2>
      <p className="muted">
        스크롤바 두께·thumb 색은 컴포넌트 styles.css 의 토큰 (<code>--border-strong</code>,{" "}
        <code>--foreground-muted</code>) 을 사용한다. 톤을 바꾸려면 토큰 자체를 조정하거나, 클래스 셀렉터로 override.
      </p>
    </main>
  );
}
