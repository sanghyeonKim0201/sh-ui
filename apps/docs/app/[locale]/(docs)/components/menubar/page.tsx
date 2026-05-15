export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { VariantSource } from "@/components/variant-source";
import {
  loadComponentSources,
  loadExtraComponent,
} from "@/components/sandbox-code/load-component-sources";
import { MenubarLiveDemo } from "./menubar-live-demo";

const sources = loadComponentSources("menubar");
const extras = [loadExtraComponent("dropdown-menu")];

export default function MenubarPage() {
  return (
    <main className="container">
      <h1>Menubar</h1>
      <p className="muted">
        데스크탑 앱 상단에 놓는 가로 메뉴바. 내부에 <code>DropdownMenu</code>를 나란히 배치하면 좌우 화살표로
        메뉴 간 이동이 가능해진다.{" "}
        <a href="https://base-ui.com/react/components/menubar" target="_blank" rel="noreferrer">
          Base UI Menubar
        </a>{" "}
        래핑.
      </p>

      <MenubarLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
        extraComponents={extras}
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
            code: `npx sh-ui-cli add menubar`,
          },
        ]}
      />
      <p className="muted">
        DropdownMenu가 함께 설치된다(<code>registryDependencies</code>).
      </p>

      <h3>Manual</h3>
      <VariantSource name="menubar" />

      <h2>API Reference</h2>
      <p className="muted">
        <code>Menubar</code> 자체는 <a href="https://base-ui.com/react/components/menubar" target="_blank" rel="noreferrer">Base UI Menubar</a> 를 그대로 래핑한 컨테이너로 표준 div 속성을 받는다 (className/style).
        하위 메뉴 항목 props 는 <a href="/components/dropdown-menu">DropdownMenu</a> 와 동일.
      </p>

      <h2>접근성 — 키보드</h2>
      <ul>
        <li><code>←</code> / <code>→</code> — 메뉴 간 이동</li>
        <li><code>↓</code> / <code>Enter</code> — 메뉴 열기</li>
        <li><code>Esc</code> — 닫기</li>
      </ul>
    </main>
  );
}
