export const dynamic = "force-static";

import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { MenubarBasicDemo } from "./_demos/basic";

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

      <Preview>
        <Preview.Demo>
          <MenubarBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Menubar>
  <DropdownMenu>
    <DropdownMenuTrigger>파일</DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuItem>새로 만들기</DropdownMenuItem>
      <DropdownMenuItem>열기…</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <DropdownMenu>
    <DropdownMenuTrigger>편집</DropdownMenuTrigger>
    <DropdownMenuContent align="start">...</DropdownMenuContent>
  </DropdownMenu>
</Menubar>`,
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
            code: `npx sh-ui add menubar`,
          },
        ]}
      />
      <p className="muted">
        DropdownMenu가 함께 설치된다(<code>registryDependencies</code>).
      </p>

      <h2>키보드</h2>
      <ul>
        <li><code>←</code> / <code>→</code> — 메뉴 간 이동</li>
        <li><code>↓</code> / <code>Enter</code> — 메뉴 열기</li>
        <li><code>Esc</code> — 닫기</li>
      </ul>
    </main>
  );
}
