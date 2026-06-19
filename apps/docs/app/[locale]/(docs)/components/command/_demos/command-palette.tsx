"use client";
import * as React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandPaletteDemo() {
  const [open, setOpen] = React.useState(false);
  const [last, setLast] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const run = (label: string) => {
    setLast(label);
    setOpen(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "var(--space-2) var(--space-3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--background)",
          color: "var(--foreground)",
          cursor: "pointer",
          fontSize: "var(--text-sm)",
        }}
      >
        ⌘K 로 명령 팔레트 열기
      </button>
      {last ? (
        <p
          style={{
            marginTop: "var(--space-2)",
            color: "var(--foreground-muted)",
            fontSize: "var(--text-sm)",
          }}
        >
          실행: {last}
        </p>
      ) : null}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="명령 검색…" />
        <CommandList>
          <CommandEmpty>결과 없음</CommandEmpty>
          <CommandGroup heading="페이지">
            <CommandItem
              value="components"
              keywords={["컴포넌트", "components"]}
              onSelect={() => run("페이지: 컴포넌트")}
            >
              컴포넌트 <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="tokens"
              keywords={["토큰", "tokens"]}
              onSelect={() => run("페이지: 토큰")}
            >
              토큰
            </CommandItem>
            <CommandItem
              value="changelog"
              keywords={["변경 내역", "changelog"]}
              onSelect={() => run("페이지: 변경 내역")}
            >
              변경 내역
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="액션">
            <CommandItem
              value="theme"
              keywords={["테마", "theme", "다크"]}
              onSelect={() => run("액션: 테마 전환")}
            >
              테마 전환 <CommandShortcut>⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="copy-link"
              keywords={["링크 복사", "copy"]}
              onSelect={() => run("액션: 링크 복사")}
            >
              현재 링크 복사
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
