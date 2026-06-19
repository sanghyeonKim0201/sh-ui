# command palette (Phase 1 코어) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sh-ui 에 `cmdk` 위 sh-ui presentational `command` 컴포넌트(9종, React, 3 CSS 변종) + `CommandDialog`(Base UI dialog) + 동작하는 Cmd+K docs 데모를 추가한다.

**Architecture:** shadcn command 모델 — `cmdk`(headless: fuzzy 검색·필터·키보드·role/aria) 위에 sh-ui 토큰 스타일. `CommandDialog` 는 기존 sh-ui `dialog`(Base UI, cross-component import `../dialog`)와 `Command` 조합. Tree·Table 과 동일한 컴포넌트 인프라.

**Tech Stack:** React(TSX, `@SH_UI_UTILS@`/`cn`), vitest + @testing-library/react, `cmdk`(^1) peer, sh-ui `dialog`(registryDependency), CSS 변수 토큰.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/command-palette`). React 테스트는 `packages/registry/react` 에서 `pnpm vitest run`.

> **Cross-component import:** command 컴포넌트가 sh-ui dialog 를 `import { Dialog, DialogContent, DialogTitle } from "../dialog"` 로 참조한다(code-tabs 의 `../code-panel` 선례). CLI 의 `rewriteCrossComponentImports` 가 설치 시 사용자 `aliases.components` 로 재작성한다. registry 엔트리에 `registryDependencies: ["utils","dialog"]` 필수.
> **cmdk:** registry 컴포넌트는 `import { Command as CommandPrimitive } from "cmdk"`. registry deps `["cmdk"]`. docs 는 `apps/docs` 에 cmdk 설치.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `packages/registry/react/components/command/index.tsx` | plain — 9 컴포넌트(cmdk 래핑 + CommandDialog) |
| `packages/registry/react/components/command/styles.css` | plain 스타일(토큰) |
| `packages/registry/react/components/command/index.tailwind.tsx` | Tailwind 변종 |
| `packages/registry/react/components/command/index.module.tsx` | CSS Modules 변종 |
| `packages/registry/react/components/command/styles.module.css` | CSS Modules 스타일 |
| `packages/registry/react/components/command/command.test.tsx` | 렌더/필터/onSelect 테스트 |
| `packages/registry/react/registry.json` | `command` 엔트리 |
| `apps/docs/components/ui/command/{index.tsx,styles.css}` | docs 복사본(cx) |
| `apps/docs/app/[locale]/(docs)/components/command/page.tsx` + `_demos/command-palette.tsx` | docs 페이지 + 데모 |
| `apps/docs/components/app-sidebar.tsx` + `.../components/page.tsx` | 등록 |
| `apps/docs/package.json` | cmdk 추가 |
| `packages/changelog/versions.json` + `packages/cli/package.json` + `packages/llms/summaries/react.json` | 릴리즈 |

---

## Task 1: command primitives (plain) + CommandDialog + 테스트

**Files:**
- Create: `packages/registry/react/components/command/index.tsx`
- Create: `packages/registry/react/components/command/styles.css`
- Test: `packages/registry/react/components/command/command.test.tsx`

**참고:** shadcn 의 command.tsx 가 cmdk 래핑의 표준 형태다(Command=CommandPrimitive, CommandInput=CommandPrimitive.Input, …). sh-ui 는 className 을 `cn`+BEM `sh-ui-command*` 로. `cmdk` Command 컴포넌트는 `cmdk-*` data 속성을 emit하므로 그걸로도 스타일 가능.

- [ ] **Step 1: cmdk 설치 (registry 워크스페이스)**

cmdk 는 registry 컴포넌트가 import 하므로 registry 워크스페이스에 dev 의존이 있어야 테스트가 돈다.
Run: `cd packages/registry/react && pnpm add cmdk`
확인: `node -e "console.log(require('./packages/registry/react/package.json').dependencies?.cmdk || require('./packages/registry/react/package.json').devDependencies?.cmdk)"` (repo root) → `^1...` (v9 아님, cmdk 는 ^1 이 최신 stable).

- [ ] **Step 2: 실패하는 테스트 — `command.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
} from "./index";

function Sample({ onSelect }: { onSelect?: (v: string) => void }) {
  return (
    <Command>
      <CommandInput placeholder="검색" />
      <CommandList>
        <CommandEmpty>결과 없음</CommandEmpty>
        <CommandGroup heading="페이지">
          <CommandItem value="components" onSelect={() => onSelect?.("components")}>
            컴포넌트 <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem value="tokens" onSelect={() => onSelect?.("tokens")}>토큰</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="액션">
          <CommandItem value="theme" onSelect={() => onSelect?.("theme")}>테마 전환</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe("Command", () => {
  it("그룹/아이템을 렌더", () => {
    render(<Sample />);
    expect(screen.getByText("컴포넌트")).toBeTruthy();
    expect(screen.getByText("페이지")).toBeTruthy();
    expect(screen.getByRole("option", { name: /토큰/ })).toBeTruthy();
  });

  it("입력으로 아이템을 필터", () => {
    render(<Sample />);
    fireEvent.change(screen.getByPlaceholderText("검색"), { target: { value: "테마" } });
    expect(screen.getByText("테마 전환")).toBeTruthy();
    expect(screen.queryByText("토큰")).toBeNull();
  });

  it("매칭 없으면 CommandEmpty 표시", () => {
    render(<Sample />);
    fireEvent.change(screen.getByPlaceholderText("검색"), { target: { value: "zzzzz" } });
    expect(screen.getByText("결과 없음")).toBeTruthy();
  });

  it("아이템 클릭이 onSelect 호출", () => {
    const onSelect = vi.fn();
    render(<Sample onSelect={onSelect} />);
    fireEvent.click(screen.getByText("토큰"));
    expect(onSelect).toHaveBeenCalledWith("tokens");
  });
});
```

> 참고: cmdk 는 jsdom 에서 동작하나 일부 키보드/scroll 기능은 제한적일 수 있다. 위 테스트는 렌더·필터·onSelect 로 한정(cmdk 내부 키보드는 cmdk 자체 테스트 영역). 만약 jsdom 에서 cmdk 필터가 동작 안 하면(예: `cmdk` 가 `ResizeObserver`/`scrollIntoView` 요구) `vitest.config.ts`/setup 에 폴리필을 추가하거나, 필터 테스트를 onSelect+렌더 테스트로 축소하고 DONE_WITH_CONCERNS 로 보고. 폴리필 추가 시 보고.

- [ ] **Step 3: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm vitest run components/command/command.test.tsx`
Expected: FAIL — Cannot find module './index'

- [ ] **Step 4: `index.tsx` (plain)**

```tsx
import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import "./styles.css";
import { cn } from "@SH_UI_UTILS@";
import { Dialog, DialogContent, DialogTitle } from "../dialog";

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive ref={ref} className={cn("sh-ui-command", className)} {...props} />
));
Command.displayName = "Command";

export interface CommandDialogProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
}

export function CommandDialog({ open, onOpenChange, title = "명령 팔레트", children, ...props }: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sh-ui-command__dialog">
        <DialogTitle className="sh-ui-command__sr-only">{title}</DialogTitle>
        <Command {...props}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="sh-ui-command__input-wrapper">
    <CommandPrimitive.Input ref={ref} className={cn("sh-ui-command__input", className)} {...props} />
  </div>
));
CommandInput.displayName = "CommandInput";

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List ref={ref} className={cn("sh-ui-command__list", className)} {...props} />
));
CommandList.displayName = "CommandList";

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="sh-ui-command__empty" {...props} />
));
CommandEmpty.displayName = "CommandEmpty";

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group ref={ref} className={cn("sh-ui-command__group", className)} {...props} />
));
CommandGroup.displayName = "CommandGroup";

export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("sh-ui-command__separator", className)} {...props} />
));
CommandSeparator.displayName = "CommandSeparator";

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item ref={ref} className={cn("sh-ui-command__item", className)} {...props} />
));
CommandItem.displayName = "CommandItem";

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("sh-ui-command__shortcut", className)} {...props} />;
}
CommandShortcut.displayName = "CommandShortcut";
```

> `DialogTitle` 이 sh-ui dialog 에서 export 되는지 Step 0 에서 확인할 것(grep 으로 dialog/index.tsx 에 `export ... DialogTitle` 존재 확인됨). 없으면 dialog 의 실제 title export 이름으로 맞춘다.

- [ ] **Step 5: `styles.css` (토큰)**

```css
.sh-ui-command {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--popover, var(--background));
  color: var(--foreground);
  border-radius: var(--radius);
  overflow: hidden;
}
.sh-ui-command__dialog { padding: 0; max-width: 40rem; }
.sh-ui-command__sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.sh-ui-command__input-wrapper { border-bottom: 1px solid var(--border); padding: 0 var(--space-3); }
.sh-ui-command__input {
  width: 100%; height: var(--control-md); background: transparent; border: none; outline: none;
  color: var(--foreground); font-size: var(--text-sm);
}
.sh-ui-command__input::placeholder { color: var(--foreground-muted); }
.sh-ui-command__list { max-height: 20rem; overflow-y: auto; padding: var(--space-1); }
.sh-ui-command__empty { padding: var(--space-4); text-align: center; color: var(--foreground-muted); font-size: var(--text-sm); }
.sh-ui-command__group-heading,
.sh-ui-command__group [cmdk-group-heading] {
  padding: var(--space-2) var(--space-2) var(--space-1);
  font-size: var(--text-xs); color: var(--foreground-muted);
}
.sh-ui-command__item {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-2); border-radius: calc(var(--radius) - 2px);
  font-size: var(--text-sm); cursor: pointer; user-select: none;
}
.sh-ui-command__item[data-selected="true"],
.sh-ui-command__item[aria-selected="true"] { background: var(--background-muted); }
.sh-ui-command__item[data-disabled="true"],
.sh-ui-command__item[aria-disabled="true"] { color: var(--foreground-muted); cursor: not-allowed; }
.sh-ui-command__separator { height: 1px; background: var(--border); margin: var(--space-1) 0; }
.sh-ui-command__shortcut { margin-inline-start: auto; font-size: var(--text-xs); color: var(--foreground-muted); letter-spacing: 0.05em; }
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm vitest run components/command/command.test.tsx`
Expected: PASS (4 tests). cmdk 필터가 jsdom 에서 동작하지 않으면 Step 2 의 폴리필/축소 지침을 따르고 보고.

- [ ] **Step 7: 커밋**

```bash
git add packages/registry/react/components/command/index.tsx packages/registry/react/components/command/styles.css packages/registry/react/components/command/command.test.tsx packages/registry/react/package.json
git commit -m "feat(command): cmdk 위 command primitives + CommandDialog (plain) + 테스트"
```

---

## Task 2: tailwind + css-modules 변종

**Files:**
- Create: `packages/registry/react/components/command/index.tailwind.tsx`
- Create: `packages/registry/react/components/command/index.module.tsx`
- Create: `packages/registry/react/components/command/styles.module.css`

**참고:** accordion 변종 idiom. 로직(9 컴포넌트 + CommandDialog, cmdk 래핑, `../dialog` import)은 Task 1 과 동일, className 만 차이.

- [ ] **Step 1: index.module.tsx**

Task 1 `index.tsx` 복사 후 `import "./styles.css";` → `import styles from "./styles.module.css";`, 클래스 문자열을 `styles.command`/`styles.command__item` 등으로 치환(하이픈/data-selected 셀렉터는 styles.module.css 에서 처리). `../dialog` import 와 cmdk import 는 유지.

- [ ] **Step 2: styles.module.css**

Task 1 `styles.css` 복사 후 `.sh-ui-command*` → `.command*` 셀렉터 치환. `[data-selected="true"]`/`[aria-selected]`/`[cmdk-group-heading]` 속성 셀렉터·토큰·sr-only 보존.

- [ ] **Step 3: index.tailwind.tsx**

Task 1 로직 복사, className 을 Tailwind utility 로(accordion idiom, `var(--*)` `[...]`):
- command: `flex flex-col w-full bg-[var(--popover,var(--background))] text-foreground rounded-[var(--radius)] overflow-hidden`
- input-wrapper: `border-b border-border px-[var(--space-3)]`
- input: `w-full h-[var(--control-md)] bg-transparent border-none outline-none text-foreground text-[length:var(--text-sm)] placeholder:text-foreground-muted`
- list: `max-h-80 overflow-y-auto p-[var(--space-1)]`
- empty: `p-[var(--space-4)] text-center text-foreground-muted text-[length:var(--text-sm)]`
- group: heading 은 cmdk data 속성에 의존 — `[&_[cmdk-group-heading]]:px-[var(--space-2)] [&_[cmdk-group-heading]]:py-[var(--space-1)] [&_[cmdk-group-heading]]:text-[length:var(--text-xs)] [&_[cmdk-group-heading]]:text-foreground-muted`
- item: `flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-2)] rounded-[calc(var(--radius)-2px)] text-[length:var(--text-sm)] cursor-pointer select-none data-[selected=true]:bg-background-muted aria-selected:bg-background-muted data-[disabled=true]:text-foreground-muted`
- separator: `h-px bg-border my-[var(--space-1)]`
- shortcut: `ms-auto text-[length:var(--text-xs)] text-foreground-muted tracking-wider`
- sr-only: `sr-only`
- CommandDialog content: `p-0 max-w-2xl`
- cn import 유지.

- [ ] **Step 4: 회귀 확인**

Run: `cd packages/registry/react && pnpm vitest run components/command/`
Expected: PASS (plain 테스트 회귀 없음).

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/command/index.tailwind.tsx packages/registry/react/components/command/index.module.tsx packages/registry/react/components/command/styles.module.css
git commit -m "feat(command): tailwind·css-modules 변종"
```

---

## Task 3: registry 엔트리 + docs 복사본

**Files:**
- Modify: `packages/registry/react/registry.json`
- Create: `apps/docs/components/ui/command/index.tsx`, `apps/docs/components/ui/command/styles.css`

- [ ] **Step 1: registry.json `command` 엔트리**

`components` 에 추가(accordion 포맷):

```json
"command": {
  "name": "command",
  "type": "component",
  "files": [
    { "src": "components/command/index.tsx", "dest": "{components}/command/index.tsx", "frameworks": ["plain"] },
    { "src": "components/command/styles.css", "dest": "{components}/command/styles.css", "frameworks": ["plain"] },
    { "src": "components/command/index.tailwind.tsx", "dest": "{components}/command/index.tsx", "frameworks": ["tailwind"] },
    { "src": "components/command/index.module.tsx", "dest": "{components}/command/index.tsx", "frameworks": ["css-modules"] },
    { "src": "components/command/styles.module.css", "dest": "{components}/command/styles.module.css", "frameworks": ["css-modules"] }
  ],
  "dependencies": ["cmdk"],
  "registryDependencies": ["utils", "dialog"]
}
```

Validate: `node -e "JSON.parse(require('fs').readFileSync('packages/registry/react/registry.json','utf8')); console.log('OK')"`

- [ ] **Step 2: docs 복사본**

docs 는 cross-component import 가 alias 가 아니라 실제 경로여야 한다. accordion docs 복사본처럼 로컬 `cx` 를 쓰고, `../dialog` import 는 docs 의 `@/components/ui/dialog` 로 바꾼다(docs 복사본끼리 참조).

`apps/docs/components/ui/command/index.tsx` — Task 1 `index.tsx` 복사 후:
- `import { cn } from "@SH_UI_UTILS@";` → 로컬 `cx` 함수(accordion docs 관행), 모든 `cn(` → `cx(`.
- `import { Dialog, DialogContent, DialogTitle } from "../dialog";` → `import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";`
- `import { Command as CommandPrimitive } from "cmdk";` 유지(apps/docs 에 cmdk 설치 — Task 4 에서).
- `import "./styles.css";` 유지.

`apps/docs/components/ui/command/styles.css` — Task 1 `styles.css` 동일 복사.

> apps/docs 에 `@/components/ui/dialog` 가 존재하는지 확인(`ls apps/docs/components/ui/dialog`). 없으면 dialog docs 복사본이 먼저 있어야 하므로, 있다고 가정(dialog 는 기존 컴포넌트라 docs 에도 있을 것). 없으면 보고.

- [ ] **Step 3: docs 타입 체크** (cmdk 설치 후여야 통과 — Task 4 와 순서 의존. 여기선 registry/JSON 만 확인)

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/registry/react/registry.json','utf8')); console.log('registry OK')"`
(docs tsc 는 cmdk 설치 후 Task 4 Step 6 에서 함께 확인)

- [ ] **Step 4: 커밋**

```bash
git add packages/registry/react/registry.json apps/docs/components/ui/command/
git commit -m "feat(command): registry 엔트리 + docs 복사본"
```

---

## Task 4: docs 페이지 + Cmd+K 데모 + 등록

**Files:**
- Modify: `apps/docs/package.json` (cmdk 추가)
- Create: `apps/docs/app/[locale]/(docs)/components/command/page.tsx`, `_demos/command-palette.tsx`
- Modify: `apps/docs/components/app-sidebar.tsx`, `apps/docs/app/[locale]/(docs)/components/page.tsx`

- [ ] **Step 1: cmdk 설치**

Run: `cd apps/docs && pnpm add cmdk`
확인: `node -e "console.log(require('./apps/docs/package.json').dependencies.cmdk)"` (repo root) → `^1...`.

- [ ] **Step 2: `_demos/command-palette.tsx`**

```tsx
"use client";
import * as React from "react";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
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

  const run = (id: string) => { setLast(id); setOpen(false); };

  return (
    <div>
      <button type="button" className="sh-ui-button" onClick={() => setOpen(true)} style={{ padding: "var(--space-2) var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--background)", cursor: "pointer" }}>
        ⌘K 로 열기
      </button>
      {last ? <p style={{ marginTop: "var(--space-2)", color: "var(--foreground-muted)", fontSize: "var(--text-sm)" }}>실행: {last}</p> : null}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="명령 검색…" />
        <CommandList>
          <CommandEmpty>결과 없음</CommandEmpty>
          <CommandGroup heading="페이지">
            <CommandItem value="components" onSelect={() => run("페이지: 컴포넌트")}>컴포넌트 <CommandShortcut>⌘C</CommandShortcut></CommandItem>
            <CommandItem value="tokens" onSelect={() => run("페이지: 토큰")}>토큰</CommandItem>
            <CommandItem value="changelog" onSelect={() => run("페이지: 변경 내역")}>변경 내역</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="액션">
            <CommandItem value="theme" onSelect={() => run("액션: 테마 전환")}>테마 전환 <CommandShortcut>⌘T</CommandShortcut></CommandItem>
            <CommandItem value="copy" onSelect={() => run("액션: 링크 복사")}>현재 링크 복사</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
```

- [ ] **Step 3: `page.tsx`**

accordion `page.tsx` 구조: `export const dynamic = "force-static"`, h1 "Command" + 설명, `<Preview>` 로 `<CommandPaletteDemo />`, Installation(`npx sh-ui-cli add command`; cmdk 는 자동 의존성 설치 안내), Usage(`<CodePanel>` — CommandDialog 조립 코드), API Reference `<SubComponents>` 로 9개(Command/CommandDialog/CommandInput/CommandList/CommandEmpty/CommandGroup/CommandItem/CommandSeparator/CommandShortcut). React-only(Flutter 후속 한 줄).

```tsx
<SubComponents rows={[
  { name: "Command", description: "루트. cmdk 검색 컨텍스트." },
  { name: "CommandDialog", description: "Cmd+K 팝업. sh-ui Dialog + Command. open/onOpenChange." },
  { name: "CommandInput", description: "검색 입력 — 입력값으로 자동 필터." },
  { name: "CommandList", description: "결과 리스트(스크롤)." },
  { name: "CommandEmpty", description: "매칭 없을 때 표시." },
  { name: "CommandGroup", description: "그룹. heading prop." },
  { name: "CommandItem", description: "항목. value(필터 키) + onSelect." },
  { name: "CommandSeparator", description: "구분선." },
  { name: "CommandShortcut", description: "우측 단축키 표시(⌘K 등)." },
]} />
```

- [ ] **Step 4: 사이드바 + 인덱스 등록**

`app-sidebar.tsx` `components` 배열 알파벳 위치: `{ title: "Command", href: "/components/command" }`
`components/page.tsx` — READ 후 적합 그룹(예: "Feedback & Overlay" 또는 "Navigation")에 `{ name: "Command", slug: "command", description: "Cmd+K 명령 팔레트 — cmdk 검색." }` 추가(실제 그룹/shape 맞춤).

- [ ] **Step 5: 빌드 확인**

Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공, `/components/command` 정적 생성. dialog import/cmdk 가 깨지면 실제 경로/export 맞춰 수정. 빌드 깨진 채 두지 말 것.

- [ ] **Step 6: docs 타입 체크**

Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -i "ui/command\|command-palette" | head`
Expected: empty.

- [ ] **Step 7: 커밋**

```bash
git add apps/docs/package.json pnpm-lock.yaml apps/docs/app apps/docs/components/app-sidebar.tsx
git commit -m "feat(command): docs 페이지 + Cmd+K 데모 + 등록"
```

---

## Task 5: 릴리즈 반영 (cli sync + react summary)

**Files:**
- Modify: `packages/changelog/versions.json`
- Modify: `packages/cli/package.json`
- Modify: `packages/llms/summaries/react.json`

> ⚠️ **두 학습 반영 (필수):**
> 1. **cli sync** — registry 가 sh-ui-cli npm 에 번들되므로 cli version = 태그 필수(v0.117.0 실패).
> 2. **react summary** — 신규 컴포넌트는 `react.json` 에 summary 없으면 `lint:drift`(CI)가 red(v0.118.0 누락).

- [ ] **Step 1: 현재 버전 확인**

Run: `node -e "console.log('changelog:', require('./packages/changelog/versions.json').versions[0].version, '/ cli:', require('./packages/cli/package.json').version)"`
Expected: 둘 다 `0.118.0`. 새 버전 MINOR → `0.119.0`.

- [ ] **Step 2: cli/package.json version → 0.119.0**

- [ ] **Step 3: react.json summary 추가**

`packages/llms/summaries/react.json` 의 `summaries` 에 `command` 추가(`tree`/`table` 포맷 참고):
```
"command": "Cmd+K 명령 팔레트 — cmdk 위 sh-ui. Command/CommandDialog/CommandInput/CommandList/CommandEmpty/CommandGroup/CommandItem/CommandSeparator/CommandShortcut. CommandDialog=sh-ui Dialog+Command(open/onOpenChange), 입력값 자동 필터·키보드 네비는 cmdk. CommandItem value/onSelect."
```
(summary 의 PascalCase 식별자가 index.tsx export 에 존재해야 lint 통과 — 9개 모두 export 됨.)

- [ ] **Step 4: versions.json 엔트리 prepend**

```json
{
  "version": "0.119.0",
  "date": "2026-06-19",
  "title": "Command 컴포넌트 — Cmd+K 명령 팔레트",
  "type": "minor",
  "highlights": [
    "신규 Command — cmdk 위 sh-ui 명령 팔레트(9 컴포넌트). CommandDialog 로 Cmd+K 팝업(sh-ui Dialog 기반)",
    "검색 필터·키보드 네비·접근성은 cmdk 에 위임, sh-ui 토큰 스타일. CommandItem value/onSelect 로 액션 실행",
    "shadcn command 모델. docs dogfooding·액션 자동화는 후속 phase. Flutter 별도"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.119.0"
}
```

- [ ] **Step 5: 검증**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/changelog/versions.json','utf8')); console.log('OK')"` → `OK`
Run: `node -e "const c=require('./packages/changelog/versions.json').versions[0].version, p=require('./packages/cli/package.json').version; console.log(c===p && c==='0.119.0' ? 'SYNC OK '+c : 'MISMATCH')"` → `SYNC OK 0.119.0`
Run: `pnpm lint:drift 2>&1 | tail -5` → 통과(registry/summary 포함). lint:drift 가 없으면 `node scripts/lint-registry.mjs`.
Run: `cd packages/registry/react && pnpm vitest run components/command/` → PASS

- [ ] **Step 6: 커밋**

```bash
git add packages/changelog/versions.json packages/cli/package.json packages/llms/summaries/react.json
git commit -m "feat(command): Command Phase 1 릴리즈 (v0.119.0, cli+summary sync)"
```

---

## 릴리즈 절차 (구현 완료 후, 사용자 확인 하에)

dev → live PR → live 태그. ⚠️ cli=태그 일치(Task 5) + react summary(Task 5) — 둘 다 보장돼야 CI/publish 통과.
1. dev push → `gh pr create --base live`.
2. CI 그린(특히 lint:drift) → 머지 → live 에서 `v0.119.0` 태그 → publish/release.
3. 머지·태그·publish 는 outward — 사용자 확인.

## 자기 점검 메모

- cmdk 는 registry(테스트용) + apps/docs(데모용) 양쪽에 설치.
- CommandDialog 는 `../dialog`(registry) / `@/components/ui/dialog`(docs) cross-import. registryDependencies 에 dialog 포함.
- Task 5 에서 cli sync + react summary 둘 다 — 지난 두 릴리즈 사고(0.117 publish 실패, 0.118 lint red) 재발 방지.
- docs 복사본은 plain 만(cx). 변종은 registry 만(0.118 docs 변종 오추가 사고 재발 금지).
- 후속(docs dogfooding·자동화·Flutter)은 spec 백로그.
