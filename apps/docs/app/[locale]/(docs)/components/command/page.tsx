export const dynamic = "force-static";

import { VariantSource } from "@/components/variant-source";
import { CodeTabs } from "@/components/ui/code-tabs";
import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import { CommandPaletteDemo } from "./_demos/command-palette";

export default function CommandPage() {
  return (
    <main className="container">
      <h1>Command</h1>
      <p className="muted">
        <code>⌘K</code> 명령 팔레트 — <a href="https://cmdk.paco.me/">cmdk</a>{" "}
        검색 위에 sh-ui <code>Dialog</code> 를 합성했다. 입력값으로 항목을
        자동 필터하고, 키보드(↑↓·Enter·Esc)로 탐색한다. (Flutter: 후속)
      </p>

      <Preview>
        <Preview.Demo>
          <CommandPaletteDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [open, setOpen] = useState(false);

useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, []);

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="명령 검색…" />
  <CommandList>
    <CommandEmpty>결과 없음</CommandEmpty>
    <CommandGroup heading="페이지">
      {/* cmdk 는 value/keywords 로 필터한다 — 한국어 라벨엔 keywords 를 넣어야 검색된다 */}
      <CommandItem value="components" keywords={["컴포넌트", "components"]} onSelect={...}>
        컴포넌트 <CommandShortcut>⌘C</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`,
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
            code: `npx sh-ui-cli add command`,
          },
        ]}
      />
      <p className="muted">
        <code>cmdk</code> 가 의존성으로 함께 설치된다. Flutter는 후속.
      </p>

      <h3>Manual</h3>
      <VariantSource name="command" />

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="명령 검색…" />
  <CommandList>
    <CommandEmpty>결과 없음</CommandEmpty>
    <CommandGroup heading="페이지">
      <CommandItem
        value="components"
        keywords={["컴포넌트", "components"]}
        onSelect={() => go("/components")}
      >
        컴포넌트 <CommandShortcut>⌘C</CommandShortcut>
      </CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="액션">
      <CommandItem value="theme" keywords={["테마", "theme"]} onSelect={toggleTheme}>
        테마 전환 <CommandShortcut>⌘T</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`}
      />
      <p className="muted">
        cmdk 는 보이는 텍스트가 아니라 <code>value</code> / <code>keywords</code>{" "}
        로 필터하므로, 한국어 라벨엔 <code>keywords</code> 를 넣어야 한국어로
        검색된다.
      </p>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Command", description: "루트. cmdk 검색 컨텍스트." },
          {
            name: "CommandDialog",
            description: "Cmd+K 팝업. sh-ui Dialog + Command. open/onOpenChange.",
          },
          { name: "CommandInput", description: "검색 입력 — 입력값으로 자동 필터." },
          { name: "CommandList", description: "결과 리스트(스크롤)." },
          { name: "CommandEmpty", description: "매칭 없을 때 표시." },
          { name: "CommandGroup", description: "그룹. heading prop." },
          {
            name: "CommandItem",
            description: "항목. value(필터 키)·keywords·onSelect.",
          },
          { name: "CommandSeparator", description: "구분선." },
          { name: "CommandShortcut", description: "우측 단축키 표시(⌘K 등)." },
        ]}
      />
    </main>
  );
}
