export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import { ContextMenuBasicDemo } from "./_demos/basic";
import { VariantSource } from "@/components/variant-source";

export default function ContextMenuPage() {
  return (
    <main className="container">
      <h1>ContextMenu</h1>
      <p className="muted">
        우클릭(혹은 터치 long-press)으로 열리는 명령 메뉴. DropdownMenu와 같은 Menu 엔진을 공유하며
        시각·키보드 동작이 동일하다.{" "}
        <a href="https://base-ui.com/react/components/context-menu" target="_blank" rel="noreferrer">
          Base UI ContextMenu
        </a>{" "}
        위에 sh-ui 토큰 스타일을 얹음.
      </p>

      <Preview>
        <Preview.Demo>
          <ContextMenuBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<ContextMenu>
  <ContextMenuTrigger>
    <div className="hit-area">이 영역에서 우클릭</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>편집</ContextMenuLabel>
    <ContextMenuItem>잘라내기</ContextMenuItem>
    <ContextMenuItem>복사</ContextMenuItem>
    <ContextMenuItem>붙여넣기</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>삭제</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiContextMenu<String>(
  onSelected: (v) => print(v),
  items: const [
    ShUiDropdownMenuLabel('편집'),
    ShUiDropdownMenuItem(value: 'cut', label: '잘라내기'),
    ShUiDropdownMenuItem(value: 'copy', label: '복사'),
    ShUiDropdownMenuItem(value: 'paste', label: '붙여넣기'),
    ShUiDropdownMenuDivider(),
    ShUiDropdownMenuItem(value: 'delete', label: '삭제'),
  ],
  child: Container(
    /* 우클릭/long-press 감지할 영역 */
    width: 320, height: 128,
    alignment: Alignment.center,
    child: const Text('이 영역에서 우클릭'),
  ),
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
            code: `npx sh-ui-cli add context-menu`,
          },
        ]}
      />
      <h3>Manual</h3>
      <VariantSource name="context-menu" />


      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "ContextMenu", description: "루트." },
          { name: "ContextMenuTrigger", description: "우클릭 감지 영역. children을 그대로 감싼다." },
          { name: "ContextMenuContent", description: "Portal + Positioner + Popup 래퍼." },
          { name: "ContextMenuItem", description: "명령 항목." },
          { name: "ContextMenuCheckboxItem", description: "체크박스 항목." },
          { name: "ContextMenuRadioGroup / RadioItem", description: "라디오 그룹·항목." },
          { name: "ContextMenuGroup / Label / Separator", description: "섹션 구분." },
          { name: "ContextMenuSub / SubTrigger / SubContent", description: "서브메뉴." },
        ]}
      />

      <h2>API Reference</h2>
      <p className="muted">
        모든 하위 컴포넌트는 Base UI <code>Menu.*</code> 의 props 를 그대로 받는다 (DropdownMenu 와 동일).
        주요 prop 만 정리:
      </p>
      <ul>
        <li><code>ContextMenuItem</code> — <code>disabled?: boolean</code>, <code>onSelect?: (event) =&gt; void</code></li>
        <li><code>ContextMenuCheckboxItem</code> — <code>checked: boolean</code>, <code>onCheckedChange: (v) =&gt; void</code>, <code>disabled?: boolean</code></li>
        <li><code>ContextMenuRadioGroup</code> — <code>value: string</code>, <code>onValueChange: (v) =&gt; void</code></li>
        <li><code>ContextMenuRadioItem</code> — <code>value: string</code>, <code>disabled?: boolean</code></li>
      </ul>

      <h2>접근성 — 키보드</h2>
      <ul>
        <li><code>↑</code> / <code>↓</code> — 이전/다음 항목</li>
        <li><code>Enter</code> / <code>Space</code> — 선택</li>
        <li><code>→</code> — 서브메뉴 열기, <code>←</code> — 서브메뉴 닫기</li>
        <li><code>Esc</code> — 닫기</li>
      </ul>
    </main>
  );
}
