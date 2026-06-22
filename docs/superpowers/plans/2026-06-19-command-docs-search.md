# Command Phase 2 — docs search-dialog dogfooding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/docs/components/search-dialog.tsx` 를 sh-ui `command`(cmdk) 컴포넌트 기반으로 재작성해 docs 가 자기 컴포넌트를 dogfooding하게 한다(MiniSearch 검색은 유지).

**Architecture:** MiniSearch 가 검색을 계속 담당(`shouldFilter={false}` 로 cmdk 자체 필터 OFF), cmdk 는 키보드 네비·active·스크롤·a11y 만 담당. 자체 Dialog/Input/listbox/handleKeyDown/active/scrollIntoView 를 CommandDialog/CommandInput/CommandList/CommandGroup/CommandItem/CommandEmpty 로 교체.

**Tech Stack:** Next.js(apps/docs), `@/components/ui/command`(cmdk), MiniSearch, next-intl, lucide-react.

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/search-command-dogfood`). 검증은 `apps/docs` 에서 `pnpm build` / `pnpm tsc --noEmit`.

> **docs 전용 — 릴리즈 없음.** versions.json·cli/package.json·react summary 모두 건드리지 않는다.

---

## File Structure

| 파일 | 변경 |
|---|---|
| `apps/docs/components/search-dialog.tsx` | CommandDialog 기반으로 재작성 |
| `apps/docs/components/search-dialog.css` | listbox/item 스타일 제거(Command 가 대체), 트리거·footer·highlight·snippet 스타일 유지 |

---

## Task 1: search-dialog.tsx 재작성 + CSS 정리

**Files:**
- Modify: `apps/docs/components/search-dialog.tsx`
- Modify: `apps/docs/components/search-dialog.css`

- [ ] **Step 1: 기존 파일 정독**

`apps/docs/components/search-dialog.tsx` 와 `apps/docs/components/search-dialog.css` 를 먼저 READ. 유지할 로직(MiniSearch `ensureIndex`/검색 옵션, `CATEGORY_KEYS`/`categoryLabel`, `buildSnippet`, `highlight`, Cmd+K//`/` effect, i18n `useTranslations("search")`, `useRouter`/`go`, 트리거 Button)을 파악. 제거할 것(`active` state, `handleKeyDown`, `scrollIntoView` effect, 자체 `role="listbox"`/`role="option"` 마크업, `inputRef`/`listRef`, `setTimeout focus`).

- [ ] **Step 2: search-dialog.tsx 재작성**

`apps/docs/components/search-dialog.tsx` 전체를 아래로 교체(유지 헬퍼는 그대로, 렌더/상태만 Command 로):

```tsx
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import MiniSearch, { type SearchResult } from "minisearch";
import { SearchIcon } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import "./search-dialog.css";

type IndexRecord = {
  id: string;
  url: string;
  title: string;
  headings: string[];
  body: string;
};

type Hit = SearchResult & { url: string; title: string };

const MAX_RESULTS = 12;
const SNIPPET_LEN = 110;

const CATEGORY_KEYS: Record<string, string> = {
  components: "components", recipes: "recipes", plugins: "plugins", examples: "examples",
  "getting-started": "gettingStarted", cli: "cli", mcp: "mcp", tokens: "tokens",
  theming: "theming", guidelines: "guidelines", changelog: "changelog", create: "create",
  foundations: "foundations", "css-framework": "cssFramework", architectures: "architectures",
};

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
}

function buildSnippet(body: string, query: string) {
  if (!body) return "";
  if (!query) return body.slice(0, SNIPPET_LEN);
  const lower = body.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx < 0) return body.slice(0, SNIPPET_LEN);
  const start = Math.max(0, idx - 30);
  const end = Math.min(body.length, start + SNIPPET_LEN);
  return (start > 0 ? "…" : "") + body.slice(start, end) + (end < body.length ? "…" : "");
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return text;
  const re = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  const parts = text.split(re);
  return parts.map((part, i) =>
    re.test(part) ? <mark key={i}>{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>,
  );
}

type Record_KV = { [key: string]: string | string[] | undefined };

export function SearchDialog() {
  const router = useRouter();
  const t = useTranslations("search");
  const categoryLabel = React.useCallback(
    (url: string) => {
      const segs = url.split("/").filter(Boolean);
      if (!segs.length) return t("homeCategory");
      const key = CATEGORY_KEYS[segs[0]];
      return key ? t(`categories.${key}`) : segs[0];
    },
    [t],
  );

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [mac, setMac] = React.useState(false);

  const indexRef = React.useRef<MiniSearch<IndexRecord> | null>(null);
  const recordsRef = React.useRef<Map<string, IndexRecord>>(new Map());
  const loadingRef = React.useRef<Promise<void> | null>(null);

  React.useEffect(() => { setMac(isMac()); }, []);

  // cmd/ctrl+K, '/' 단축키
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isModK) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !open) {
        const el = e.target as HTMLElement | null;
        const tag = el?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // MiniSearch 인덱스 lazy load
  const ensureIndex = React.useCallback(async () => {
    if (indexRef.current) return;
    if (loadingRef.current) return loadingRef.current;
    loadingRef.current = (async () => {
      const res = await fetch("/search-index.json", { cache: "force-cache" });
      const data = (await res.json()) as { records: IndexRecord[] };
      const ms = new MiniSearch<IndexRecord>({
        idField: "id",
        fields: ["title", "headings", "body"],
        storeFields: ["url", "title", "headings"],
        searchOptions: { boost: { title: 4, headings: 2 }, prefix: true, fuzzy: 0.2, combineWith: "AND" },
        extractField: (doc, field) => {
          const v = (doc as unknown as Record_KV)[field];
          return Array.isArray(v) ? v.join(" ") : (v ?? "");
        },
      });
      ms.addAll(data.records);
      indexRef.current = ms;
      recordsRef.current = new Map(data.records.map((r) => [r.id, r]));
    })();
    return loadingRef.current;
  }, []);

  React.useEffect(() => {
    if (open) {
      void ensureIndex();
    } else {
      setQuery("");
      setHits([]);
    }
  }, [open, ensureIndex]);

  // 쿼리 → MiniSearch 검색
  React.useEffect(() => {
    const q = query.trim();
    if (!q) { setHits([]); return; }
    const ms = indexRef.current;
    if (!ms) return;
    setHits(ms.search(q).slice(0, MAX_RESULTS) as Hit[]);
  }, [query]);

  const go = React.useCallback(
    (url: string) => { setOpen(false); router.push(url); },
    [router],
  );

  // 카테고리 그룹화 (등장 순서 보존)
  const groups = React.useMemo(() => {
    const out: { label: string; items: Hit[] }[] = [];
    hits.forEach((hit) => {
      const label = categoryLabel(hit.url);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(hit);
      else out.push({ label, items: [hit] });
    });
    return out;
  }, [hits, categoryLabel]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="md"
        className="sh-ui-search-trigger"
        onClick={() => setOpen(true)}
        aria-label={t("triggerLabel")}
      >
        <SearchIcon size={14} aria-hidden className="sh-ui-search-trigger__icon" />
        <span className="sh-ui-search-trigger__label">{t("triggerPlaceholder")}</span>
        <kbd className="sh-ui-search-trigger__kbd">{mac ? "⌘ K" : "Ctrl K"}</kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("dialogTitle")}
        shouldFilter={false}
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t("inputPlaceholder")}
          aria-label={t("inputAriaLabel")}
        />
        <CommandList>
          {query.trim() ? <CommandEmpty>{t("empty")}</CommandEmpty> : null}
          {groups.map((group, gi) => (
            <CommandGroup key={`${group.label}-${gi}`} heading={group.label}>
              {group.items.map((hit) => {
                const rec = recordsRef.current.get(hit.id);
                const matchedHeading = rec?.headings?.find((h) =>
                  h.toLowerCase().includes(query.toLowerCase()),
                );
                const sub = matchedHeading ? `› ${matchedHeading}` : buildSnippet(rec?.body ?? "", query);
                return (
                  <CommandItem
                    key={hit.id}
                    value={hit.id}
                    onSelect={() => go(hit.url)}
                    className="sh-ui-search-dialog__item"
                  >
                    <span className="sh-ui-search-dialog__item-title">{highlight(hit.title, query)}</span>
                    {sub ? <span className="sh-ui-search-dialog__item-sub">{highlight(sub, query)}</span> : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

**구현 시 검증할 cmdk 동작 (빌드/수동으로 확인하며 조정):**
1. **`shouldFilter={false}` 전달** — `CommandDialog` 가 `...props` 를 내부 `Command` 로 전파하므로 `shouldFilter` 가 cmdk Command 에 닿는다(확인됨). 닿지 않으면 CommandDialog 가 내부 Command 에 `shouldFilter` 를 명시 전달하도록 command 컴포넌트를 보는 대신, SearchDialog 에서 `CommandDialog` 안에 직접 `Command` 를 쓰는 구조는 불가(CommandDialog 가 Command 를 감쌈) — 이 경우 `shouldFilter` 가 전파되는지만 확인하고, 안 되면 DONE_WITH_CONCERNS 로 보고.
2. **자동 포커스** — cmdk/Dialog 가 열릴 때 CommandInput 에 포커스가 가는지 확인. 안 가면 CommandInput 에 `autoFocus` 추가.
3. **CommandEmpty** — cmdk 의 Empty 는 "표시 중인 아이템 0" 일 때 보인다. `shouldFilter={false}` 에서 우리가 hits 0 이면 CommandItem 0개 → Empty 표시. query 빈 상태엔 `query.trim() ? <CommandEmpty/> : null` 로 숨김. 실제 동작이 다르면(예: query 없이도 Empty 깜빡임) 조정.
4. **onValueChange** — `CommandInput` 이 cmdk Command.Input 을 래핑하므로 `onValueChange(value: string)` 를 받는다. 안 되면 `onInput`/`onChange` 로 fallback.

- [ ] **Step 3: search-dialog.css 정리**

`apps/docs/components/search-dialog.css` 에서 **자체 listbox/item 관련 규칙 제거**(`.sh-ui-search-dialog__list`, `.sh-ui-search-dialog__group`, `.sh-ui-search-dialog__group-label`, `.sh-ui-search-dialog__group-list` 등 — 이제 Command 컴포넌트의 `sh-ui-command__*` 가 담당). **유지**: `.sh-ui-search-trigger*`(트리거), `.sh-ui-search-dialog__footer`/`__hint`(있으면), `mark`(highlight), `.sh-ui-search-dialog__item-title`/`__item-sub`(CommandItem 내부 커스텀 텍스트). `.sh-ui-search-dialog`(다이얼로그 컨테이너 너비 등)은 CommandDialog 의 `sh-ui-command__dialog` 와 겹치면 정리하되, 검색 특화 너비/패딩이 필요하면 유지.

> 주의: 제거 전 각 셀렉터가 새 마크업에서 안 쓰이는지 확인(CommandItem 에 `sh-ui-search-dialog__item` 클래스를 줬으므로 그 규칙은 유지하되, 내부 레이아웃은 command item 스타일과 조화롭게). footer 힌트(↑↓/Enter/Esc)를 새 렌더에서 뺐다면 관련 CSS 도 제거 — 위 재작성본은 footer 를 생략했으므로 `.sh-ui-search-dialog__footer*` 규칙 제거.

- [ ] **Step 4: 빌드 + 타입체크**

Run: `cd apps/docs && pnpm tsc --noEmit 2>&1 | grep -iE "search-dialog" | head`
Expected: empty (search-dialog 에러 없음).

Run: `cd apps/docs && pnpm build 2>&1 | tail -25`
Expected: 빌드 성공(search-dialog 는 모든 페이지 헤더에서 렌더되므로 빌드가 통합 검증). 깨지면 cmdk prop(onValueChange/shouldFilter)·import 를 실제 API 에 맞춰 수정 후 재빌드. 빌드 깨진 채 두지 말 것.

- [ ] **Step 5: (선택) 수동 동작 확인**

preview 도구가 가능하면 dev 서버에서 확인: Cmd+K/`/` 로 열림, 입력 시 MiniSearch 결과 표시, ↑↓ 네비·Enter 라우팅, 카테고리 그룹·highlight·snippet, Esc 닫힘. (env 상 preview 불가하면 빌드 성공으로 갈음하고 보고.)

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/components/search-dialog.tsx apps/docs/components/search-dialog.css
git commit -m "feat(docs): search-dialog 를 sh-ui CommandDialog 로 교체 (dogfooding)"
```

---

## 릴리즈 절차

**없음** — docs 전용 변경. dev → live 는 일반 docs PR(버전 범프·태그·npm 없음), 사용자 확인 후.

## 자기 점검 메모

- MiniSearch 검색 로직(ensureIndex/검색 옵션/groups)은 그대로, UI 만 Command 로 — 검색 품질 유지.
- 제거: active/handleKeyDown/scrollIntoView/inputRef/listRef/자체 listbox — cmdk 가 대체.
- cmdk 동작(shouldFilter 전파·autofocus·Empty)은 빌드/수동으로 확인하며 조정(Step 2 주의점).
- 릴리즈 파일 일절 건드리지 않음(docs 전용).
