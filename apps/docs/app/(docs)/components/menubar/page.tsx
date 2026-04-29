export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
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
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiMenubar(
  menus: [
    ShUiMenubarMenu(
      label: '파일',
      onSelected: (v) => print(v),
      items: const [
        ShUiDropdownMenuItem(value: 'new', label: '새로 만들기'),
        ShUiDropdownMenuItem(value: 'open', label: '열기…'),
      ],
    ),
    ShUiMenubarMenu(
      label: '편집',
      onSelected: (v) => print(v),
      items: const [
        ShUiDropdownMenuItem(value: 'undo', label: '실행 취소'),
        ShUiDropdownMenuItem(value: 'redo', label: '다시 실행'),
      ],
    ),
  ],
)`,
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
            code: `npx sh-ui-cli add menubar`,
          },
        ]}
      />
      <p className="muted">
        DropdownMenu가 함께 설치된다(<code>registryDependencies</code>).
      </p>

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
