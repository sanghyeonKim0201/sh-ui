# 실전 예제 섹션 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/docs`에 `/examples` 갤러리 + `/examples/[slug]` 풀스크린 쇼케이스 + v1 예제 8개를 구현해, sh-ui 컴포넌트가 실제로 어떻게 "이쁘게" 조합될 수 있는지 쇼케이스한다.

**Architecture:** docs 앱 내부에 닫힌 구조. 예제 파일은 `apps/docs/examples/<slug>/`에 저장하고, `apps/docs/examples/index.ts`가 동적 import 기반 카탈로그를 집계. 갤러리는 `use client`로 카테고리 탭 + URL query 동기화, 쇼케이스 페이지는 서버 컴포넌트에서 `fs.readFile`로 소스를 읽어 클라이언트 코드 패널(Dialog + 기존 `CodePanel`)에 내려줌. 풀스크린 레이아웃은 `app/examples/[slug]/layout.tsx`로 루트 `AppShell`을 오버라이드.

**Tech Stack:** Next.js 15 (App Router), React 19, sh-ui docs UI 패키지(`@/components/ui/*`), shiki (이미 docs에 설치됨), Base UI Dialog.

---

## 전체 파일 맵

| 파일 | 생성/수정 | 책임 |
|---|---|---|
| `apps/docs/examples/types.ts` | 생성 | `ExampleCategory` / `ExampleMeta` / `ExampleEntry` 타입 정의 |
| `apps/docs/examples/index.ts` | 생성 | 8개 예제 카탈로그 + `findExample` |
| `apps/docs/examples/<slug>/meta.ts` × 8 | 생성 | 각 예제 메타데이터 |
| `apps/docs/examples/<slug>/Example.tsx` × 8 | 생성 | 각 예제 컴포넌트 |
| `apps/docs/examples/<slug>/example.css` × 필요시 | 생성 | 예제 전용 장식 |
| `apps/docs/components/examples/example-card.tsx` | 생성 | 갤러리 카드 |
| `apps/docs/components/examples/example-gallery.tsx` | 생성 | 탭 + URL query + 그리드 |
| `apps/docs/components/examples/example-topbar.tsx` | 생성 | 풀스크린 상단 바 |
| `apps/docs/components/examples/example-source-panel.tsx` | 생성 | 코드 보기 Dialog |
| `apps/docs/app/examples/page.tsx` | 생성 | 갤러리 라우트 |
| `apps/docs/app/examples/examples.css` | 생성 | 갤러리/카드 스타일 |
| `apps/docs/app/examples/[slug]/layout.tsx` | 생성 | 풀스크린 레이아웃 |
| `apps/docs/app/examples/[slug]/page.tsx` | 생성 | 쇼케이스 라우트 (서버) |
| `apps/docs/app/examples/[slug]/showcase.css` | 생성 | 상단 바·쇼케이스 스타일 |
| `apps/docs/components/app-sidebar.tsx` | 수정 | "실전 예제" topLink 추가 |

---

## Task 1 — 타입 · 빈 카탈로그 · 사이드바 링크

**Files:**
- Create: `apps/docs/examples/types.ts`
- Create: `apps/docs/examples/index.ts`
- Modify: `apps/docs/components/app-sidebar.tsx` (import + topLinks 배열)

- [ ] **Step 1: 타입 파일 작성**

`apps/docs/examples/types.ts`:
```ts
import type { ComponentType } from "react";

export type ExampleCategory = "blocks" | "pages" | "flows" | "themes";

export interface ExampleMeta {
  slug: string;
  title: string;
  category: ExampleCategory;
  description: string;
}

export interface ExampleEntry extends ExampleMeta {
  Component: ComponentType;
  /** 쇼케이스 코드 패널에 노출할 파일들. `apps/docs/examples/`로부터의 상대 경로. */
  sourceFiles: string[];
}
```

- [ ] **Step 2: 빈 카탈로그 작성**

`apps/docs/examples/index.ts`:
```ts
import type { ExampleEntry } from "./types";

export const examples: ExampleEntry[] = [];

export const findExample = (slug: string) =>
  examples.find((e) => e.slug === slug);
```

- [ ] **Step 3: 사이드바에 "실전 예제" topLink 추가**

`apps/docs/components/app-sidebar.tsx` 상단 import에 `LayoutTemplateIcon` 추가:
```ts
import {
  BookOpenIcon,
  BoxesIcon,
  BrushIcon,
  FolderPlusIcon,
  HistoryIcon,
  LayoutTemplateIcon,
  PaletteIcon,
  RocketIcon,
  TerminalIcon,
  type LucideIcon,
} from "lucide-react";
```

`topLinks` 배열을 수정 (가이드라인과 변경 내역 사이에 실전 예제 삽입):
```ts
const topLinks: { title: string; href: string; icon: LucideIcon }[] = [
  { title: "시작하기", href: "/getting-started", icon: RocketIcon },
  { title: "프로젝트 생성", href: "/create", icon: FolderPlusIcon },
  { title: "CLI", href: "/cli", icon: TerminalIcon },
  { title: "토큰", href: "/tokens", icon: PaletteIcon },
  { title: "테마 커스터마이징", href: "/theming", icon: BrushIcon },
  { title: "가이드라인", href: "/guidelines", icon: BookOpenIcon },
  { title: "실전 예제", href: "/examples", icon: LayoutTemplateIcon },
  { title: "변경 내역", href: "/changelog", icon: HistoryIcon },
];
```

- [ ] **Step 4: 타입 체크**

Run: `cd /Users/gimsanghyeon/development/PROJECT/sh-ui && pnpm tsc --noEmit`
Expected: 에러 없음 (사이드바의 새 아이콘 import + topLink 추가만 반영).

- [ ] **Step 5: 커밋**

```bash
git add apps/docs/examples/types.ts apps/docs/examples/index.ts apps/docs/components/app-sidebar.tsx
git commit -m "docs(examples): 타입/카탈로그 뼈대 + 사이드바 항목 추가"
```

---

## Task 2 — 갤러리 라우트 & ExampleGallery / ExampleCard

**Files:**
- Create: `apps/docs/app/examples/page.tsx`
- Create: `apps/docs/app/examples/examples.css`
- Create: `apps/docs/components/examples/example-card.tsx`
- Create: `apps/docs/components/examples/example-gallery.tsx`

이 시점에 예제는 0개라서 갤러리는 empty 상태만 보이지만, 컴포넌트 뼈대가 먼저 서야 이후 예제 태스크가 바로 갤러리에 노출된다.

- [ ] **Step 1: ExampleCard 작성**

`apps/docs/components/examples/example-card.tsx`:
```tsx
import Link from "next/link";
import type { ExampleEntry } from "@/examples/types";

export interface ExampleCardProps {
  entry: ExampleEntry;
}

export function ExampleCard({ entry }: ExampleCardProps) {
  const { slug, title, category, description, Component } = entry;
  return (
    <Link href={`/examples/${slug}`} className="sh-ui-example-card">
      <div className="sh-ui-example-card__preview" aria-hidden>
        <div className="sh-ui-example-card__preview-inner">
          <Component />
        </div>
      </div>
      <div className="sh-ui-example-card__body">
        <span className={`sh-ui-example-card__badge sh-ui-example-card__badge--${category}`}>
          {category}
        </span>
        <h3 className="sh-ui-example-card__title">{title}</h3>
        <p className="sh-ui-example-card__desc">{description}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: ExampleGallery 작성 (탭 + URL query)**

`apps/docs/components/examples/example-gallery.tsx`:
```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { ExampleCategory, ExampleEntry } from "@/examples/types";
import { ExampleCard } from "./example-card";

const CATEGORIES: { value: ExampleCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "blocks", label: "Blocks" },
  { value: "pages", label: "Pages" },
  { value: "flows", label: "Flows" },
  { value: "themes", label: "Themes" },
];

export interface ExampleGalleryProps {
  examples: ExampleEntry[];
}

export function ExampleGallery({ examples }: ExampleGalleryProps) {
  const router = useRouter();
  const params = useSearchParams();
  const rawCat = params.get("cat");
  const activeCat: ExampleCategory | "all" =
    rawCat === "blocks" || rawCat === "pages" || rawCat === "flows" || rawCat === "themes"
      ? rawCat
      : "all";

  const filtered = useMemo(
    () => (activeCat === "all" ? examples : examples.filter((e) => e.category === activeCat)),
    [activeCat, examples],
  );

  const selectCategory = (next: ExampleCategory | "all") => {
    const q = new URLSearchParams(params);
    if (next === "all") q.delete("cat");
    else q.set("cat", next);
    const qs = q.toString();
    router.replace(qs ? `/examples?${qs}` : "/examples");
  };

  const reset = () => selectCategory("all");

  return (
    <div className="sh-ui-example-gallery">
      <div role="tablist" aria-label="예제 카테고리" className="sh-ui-example-gallery__tabs">
        {CATEGORIES.map((c) => {
          const isActive = activeCat === c.value;
          return (
            <button
              key={c.value}
              role="tab"
              aria-selected={isActive}
              className="sh-ui-example-gallery__tab"
              data-active={isActive ? "" : undefined}
              onClick={() => selectCategory(c.value)}
              type="button"
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="sh-ui-example-gallery__empty" role="status">
          <p>해당 카테고리의 예제가 아직 없습니다.</p>
          <button type="button" onClick={reset} className="sh-ui-example-gallery__reset">
            전체 예제 보기
          </button>
        </div>
      ) : (
        <div className="sh-ui-example-gallery__grid">
          {filtered.map((entry) => (
            <ExampleCard key={entry.slug} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 갤러리 페이지 라우트 작성**

`apps/docs/app/examples/page.tsx`:
```tsx
import { Suspense } from "react";
import { ExampleGallery } from "@/components/examples/example-gallery";
import { examples } from "@/examples";
import "./examples.css";

export const metadata = {
  title: "실전 예제 — sh-ui",
  description: "sh-ui 컴포넌트를 조합한 실제 화면 예제 모음",
};

export default function ExamplesPage() {
  return (
    <main className="sh-ui-examples-page">
      <header className="sh-ui-examples-page__header">
        <h1>실전 예제</h1>
        <p>sh-ui 컴포넌트로 만든 화면들. 카드를 클릭하면 풀스크린 쇼케이스와 소스 코드를 볼 수 있어요.</p>
      </header>
      <Suspense fallback={null}>
        <ExampleGallery examples={examples} />
      </Suspense>
    </main>
  );
}
```

> `useSearchParams`를 쓰는 클라이언트 컴포넌트는 `Suspense`로 감싸야 Next.js가 정적 프리렌더를 허용한다.

- [ ] **Step 4: examples.css 작성**

`apps/docs/app/examples/examples.css`:
```css
.sh-ui-examples-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) var(--space-12);
}

.sh-ui-examples-page__header {
  margin-bottom: var(--space-8);
}
.sh-ui-examples-page__header h1 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin: 0 0 var(--space-2);
}
.sh-ui-examples-page__header p {
  color: var(--color-foreground-muted);
  margin: 0;
}

.sh-ui-example-gallery__tabs {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}
.sh-ui-example-gallery__tab {
  background: transparent;
  border: 0;
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  color: var(--color-foreground-muted);
  font: inherit;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.sh-ui-example-gallery__tab:hover {
  color: var(--color-foreground);
}
.sh-ui-example-gallery__tab:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
.sh-ui-example-gallery__tab[data-active] {
  color: var(--color-foreground);
  border-bottom-color: var(--color-primary);
}

.sh-ui-example-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}

.sh-ui-example-gallery__empty {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-foreground-muted);
}
.sh-ui-example-gallery__reset {
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.sh-ui-example-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-background);
  text-decoration: none;
  color: inherit;
  transition: transform 150ms ease, border-color 150ms ease;
}
.sh-ui-example-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}
.sh-ui-example-card:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

.sh-ui-example-card__preview {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: var(--color-background-subtle);
  border-bottom: 1px solid var(--color-border);
  pointer-events: none;
}
.sh-ui-example-card__preview-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 250%;
  height: 250%;
  transform: scale(0.4);
  transform-origin: top left;
}

.sh-ui-example-card__body {
  padding: var(--space-4);
}
.sh-ui-example-card__badge {
  display: inline-block;
  font-size: var(--font-size-xs);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-2);
  color: var(--color-foreground);
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
}
.sh-ui-example-card__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0 0 var(--space-1);
}
.sh-ui-example-card__desc {
  margin: 0;
  color: var(--color-foreground-muted);
  font-size: var(--font-size-sm);
}
```

> 토큰명은 이 레포가 이미 쓰는 패턴(`--space-*`, `--color-*`, `--radius-*`, `--font-size-*`)과 일치. 토큰이 실제 이름과 살짝 다르면 `apps/docs/app/globals.css` 또는 `packages/tokens/` 쪽을 참고해 1:1 치환. 하드코딩 금지.

- [ ] **Step 5: 타입 체크 + dev 서버 스모크**

Run: `cd /Users/gimsanghyeon/development/PROJECT/sh-ui && pnpm tsc --noEmit`
Expected: 에러 없음.

Run: `cd /Users/gimsanghyeon/development/PROJECT/sh-ui && pnpm --filter docs dev`
브라우저에서 `/examples` 접속. 헤더 렌더 + 탭 5개 + empty 상태 "해당 카테고리의 예제가 아직 없습니다." 확인. `?cat=blocks` 등 쿼리 전환 시 탭 활성 이동 확인. Ctrl+C로 dev 종료.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/app/examples apps/docs/components/examples
git commit -m "docs(examples): 갤러리 페이지/탭/카드 뼈대"
```

---

## Task 3 — 풀스크린 쇼케이스 라우팅 & 서버 소스 추출

**Files:**
- Create: `apps/docs/app/examples/[slug]/layout.tsx`
- Create: `apps/docs/app/examples/[slug]/page.tsx`
- Create: `apps/docs/app/examples/[slug]/showcase.css`

- [ ] **Step 1: 풀스크린 layout 작성**

`apps/docs/app/examples/[slug]/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import "./showcase.css";

export default function ExampleShowcaseLayout({ children }: { children: ReactNode }) {
  return <div className="sh-ui-showcase-root">{children}</div>;
}
```

> 루트 `app/layout.tsx`가 감싸는 `<AppShell>`은 그대로 유지되지만, 이 segment layout은 본문을 `sh-ui-showcase-root`로 감싸 CSS에서 사이드바/헤더를 숨길 수 있는 훅을 제공한다. (CSS는 아래 Step 4에서 추가.)

- [ ] **Step 2: 쇼케이스 page 작성 (서버 컴포넌트, fs.readFile)**

`apps/docs/app/examples/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { examples, findExample } from "@/examples";
import { ExampleTopBar } from "@/components/examples/example-topbar";

export const dynamicParams = false;

export async function generateStaticParams() {
  return examples.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findExample(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} — sh-ui 실전 예제`,
    description: entry.description,
  };
}

interface Source {
  path: string;
  code: string;
  language: string;
}

const EXAMPLES_ROOT = join(process.cwd(), "examples");

const languageOf = (path: string): string => {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".css")) return "css";
  return "text";
};

export default async function ExampleShowcasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findExample(slug);
  if (!entry) notFound();

  const sources: Source[] = await Promise.all(
    entry.sourceFiles.map(async (rel) => ({
      path: rel,
      code: await readFile(join(EXAMPLES_ROOT, rel), "utf8"),
      language: languageOf(rel),
    })),
  );

  const { Component } = entry;

  return (
    <>
      <ExampleTopBar entry={entry} sources={sources} />
      <div className="sh-ui-showcase-stage">
        <Component />
      </div>
    </>
  );
}
```

> `process.cwd()`는 `apps/docs` 빌드 컨텍스트에서 `apps/docs/`를 가리킨다. 만약 모노레포 빌드 구성 때문에 경로가 어긋나면 `join(process.cwd(), "apps/docs/examples")`로 폴백.

- [ ] **Step 3: ExampleTopBar 뼈대 (Task 4에서 완성할 스캐폴드)**

먼저 import만 해결되도록 최소 뼈대를 만든다. Task 4에서 채운다.

`apps/docs/components/examples/example-topbar.tsx`:
```tsx
"use client";

import Link from "next/link";
import type { ExampleEntry } from "@/examples/types";

export interface ExampleSource {
  path: string;
  code: string;
  language: string;
}

export interface ExampleTopBarProps {
  entry: ExampleEntry;
  sources: ExampleSource[];
}

export function ExampleTopBar({ entry }: ExampleTopBarProps) {
  return (
    <header className="sh-ui-showcase-topbar">
      <Link href="/examples" className="sh-ui-showcase-topbar__back">
        ← 갤러리로
      </Link>
      <div className="sh-ui-showcase-topbar__meta">
        <span className="sh-ui-showcase-topbar__cat">{entry.category}</span>
        <h1 className="sh-ui-showcase-topbar__title">{entry.title}</h1>
      </div>
      <div className="sh-ui-showcase-topbar__actions">
        {/* Task 4에서 코드 보기 버튼 추가 */}
      </div>
    </header>
  );
}
```

- [ ] **Step 4: showcase.css 작성**

`apps/docs/app/examples/[slug]/showcase.css`:
```css
/* 루트 layout(<AppShell>) 안쪽에서도 풀스크린 느낌을 내도록
   showcase-root가 AppShell의 좌측 사이드바·상단 헤더를 시각적으로 덮는다.
   (사이드바 자체는 DOM에 남지만 showcase-root가 position:fixed로 덮는 형태.)
*/
.sh-ui-showcase-root {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sh-ui-showcase-topbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}
.sh-ui-showcase-topbar__back {
  color: var(--color-foreground-muted);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
}
.sh-ui-showcase-topbar__back:hover {
  background: var(--color-background-subtle);
  color: var(--color-foreground);
}
.sh-ui-showcase-topbar__meta {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  min-width: 0;
}
.sh-ui-showcase-topbar__cat {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-foreground-muted);
}
.sh-ui-showcase-topbar__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sh-ui-showcase-topbar__actions {
  display: flex;
  gap: var(--space-2);
}

.sh-ui-showcase-stage {
  flex: 1 1 auto;
  overflow: auto;
  position: relative;
}
```

- [ ] **Step 5: 타입 체크**

Run: `cd /Users/gimsanghyeon/development/PROJECT/sh-ui && pnpm tsc --noEmit`
Expected: 에러 없음.

> 이 시점엔 `examples` 배열이 비어서 `generateStaticParams`가 빈 배열을 반환하고, `[slug]` 경로 자체가 404로 처리된다(dynamicParams=false). 다음 태스크에서 예제 추가하며 검증.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/app/examples/\[slug\] apps/docs/components/examples/example-topbar.tsx
git commit -m "docs(examples): 쇼케이스 라우트 + 서버 소스 추출 로직"
```

---

## Task 4 — ExampleSourcePanel (Dialog + CodePanel) & TopBar 완성

**Files:**
- Create: `apps/docs/components/examples/example-source-panel.tsx`
- Modify: `apps/docs/components/examples/example-topbar.tsx`
- Modify: `apps/docs/app/examples/[slug]/showcase.css` (패널용 스타일 append)

- [ ] **Step 1: ExampleSourcePanel 작성**

`apps/docs/components/examples/example-source-panel.tsx`:
```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseX,
} from "@/components/ui/dialog";
import { CodePanel } from "@/components/ui/code-panel";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ExampleSource } from "./example-topbar";

export interface ExampleSourcePanelProps {
  sources: ExampleSource[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExampleSourcePanel({ sources, open, onOpenChange }: ExampleSourcePanelProps) {
  const [active, setActive] = useState(sources[0]?.path);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sh-ui-source-panel">
        <div className="sh-ui-source-panel__header">
          <DialogTitle className="sh-ui-source-panel__title">소스 코드</DialogTitle>
          <DialogCloseX />
        </div>
        {sources.length === 1 ? (
          <div className="sh-ui-source-panel__body">
            {/* @ts-expect-error — CodePanel은 async 서버 컴포넌트지만 React 19에서 클라이언트 경계 내부에서도 사용 가능 */}
            <CodePanel
              code={sources[0]!.code}
              language={sources[0]!.language}
              filename={sources[0]!.path}
            />
          </div>
        ) : (
          <Tabs value={active} onValueChange={setActive} className="sh-ui-source-panel__body">
            <TabsList>
              <TabsIndicator />
              {sources.map((s) => (
                <TabsTrigger key={s.path} value={s.path}>
                  {s.path.split("/").slice(-1)[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            {sources.map((s) => (
              <TabsContent key={s.path} value={s.path}>
                {/* @ts-expect-error — async 서버 컴포넌트 */}
                <CodePanel code={s.code} language={s.language} filename={s.path} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

> **주의**: `CodePanel`이 `async` 서버 컴포넌트라 `'use client'` 내부에서 직접 렌더하면 타입 에러가 난다. 런타임상으로는 React 19에서 SSR 경계에서 pre-rendered RSC의 반환값을 담은 객체를 받을 수 있지만, 타입 시스템이 그걸 모르므로 `@ts-expect-error`로 국소 우회. 실행 중 문제가 생기면 대안으로 `CodePanel` 호출을 page.tsx(서버)에서 수행한 뒤 `ReactNode`로 내려주도록 리팩터. (이 경우 page에서 각 파일마다 `CodePanel` 렌더 + 그 노드들을 `Source` 타입에 담아 전달.)

**대안 경로 (Step 1b — 타입 에러가 나면 이걸로 대체)**:
- page.tsx 서버에서 각 소스마다 `<CodePanel code=... language=... filename=.../>` 노드를 만들어 `renderedSources: { path: string; node: ReactNode }[]`로 전달.
- Panel은 단순히 `node`만 렌더. 타입 회피 트릭 불필요.

먼저 Step 1의 간단한 경로로 시도해보고, 타입 에러가 실제로 발생하면 1b로 교체한다.

- [ ] **Step 2: ExampleTopBar 완성 — 코드 보기 버튼 + 패널 연결**

`apps/docs/components/examples/example-topbar.tsx` 전체 교체:
```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import type { ExampleEntry } from "@/examples/types";
import { ExampleSourcePanel } from "./example-source-panel";

export interface ExampleSource {
  path: string;
  code: string;
  language: string;
}

export interface ExampleTopBarProps {
  entry: ExampleEntry;
  sources: ExampleSource[];
}

export function ExampleTopBar({ entry, sources }: ExampleTopBarProps) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sh-ui-showcase-topbar">
      <Link href="/examples" className="sh-ui-showcase-topbar__back">
        ← 갤러리로
      </Link>
      <div className="sh-ui-showcase-topbar__meta">
        <span className="sh-ui-showcase-topbar__cat">{entry.category}</span>
        <h1 className="sh-ui-showcase-topbar__title">{entry.title}</h1>
      </div>
      <div className="sh-ui-showcase-topbar__actions">
        <button
          type="button"
          className="sh-ui-showcase-topbar__code"
          onClick={() => setOpen(true)}
        >
          {"</>"} 코드 보기
        </button>
      </div>
      <ExampleSourcePanel sources={sources} open={open} onOpenChange={setOpen} />
    </header>
  );
}
```

- [ ] **Step 3: showcase.css에 버튼/패널 스타일 추가 (기존 파일에 append)**

```css
.sh-ui-showcase-topbar__code {
  font: inherit;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-foreground);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
}
.sh-ui-showcase-topbar__code:hover {
  background: var(--color-background-subtle);
}
.sh-ui-showcase-topbar__code:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

.sh-ui-source-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: min(640px, 100vw);
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  border-left: 1px solid var(--color-border);
  transform: translateX(0);
}
.sh-ui-source-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.sh-ui-source-panel__title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
}
.sh-ui-source-panel__body {
  flex: 1;
  overflow: auto;
  padding: var(--space-4);
}
```

- [ ] **Step 4: 타입 체크**

Run: `cd /Users/gimsanghyeon/development/PROJECT/sh-ui && pnpm tsc --noEmit`
Expected: 에러 없음 (`@ts-expect-error` 가 유효한 에러를 막고 있는지 포함 확인). 만약 `@ts-expect-error`가 "unused" 경고를 내면 CodePanel 타입이 실제로 사용 가능한 것이니 주석을 제거한다. 반대로 실런타임 에러가 나면 Step 1b(대안 경로)로 전환.

- [ ] **Step 5: 커밋**

```bash
git add apps/docs/components/examples apps/docs/app/examples/\[slug\]/showcase.css
git commit -m "docs(examples): 코드 보기 Dialog + 파일 탭 연계"
```

---

## Task 5 — 예제 1: `login-card` (blocks)

**Files:**
- Create: `apps/docs/examples/login-card/meta.ts`
- Create: `apps/docs/examples/login-card/Example.tsx`
- Create: `apps/docs/examples/login-card/example.css`
- Modify: `apps/docs/examples/index.ts`

- [ ] **Step 1: meta.ts**

`apps/docs/examples/login-card/meta.ts`:
```ts
import type { ExampleMeta } from "../types";

export const meta: ExampleMeta = {
  slug: "login-card",
  title: "로그인 카드",
  category: "blocks",
  description: "그라데이션 배경 위의 탭 전환형 로그인·회원가입 카드",
};
```

- [ ] **Step 2: Example.tsx**

`apps/docs/examples/login-card/Example.tsx`:
```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import "./example.css";

export function Example() {
  return (
    <div className="sh-ui-ex-login">
      <div className="sh-ui-ex-login__aurora" aria-hidden />
      <Card className="sh-ui-ex-login__card">
        <CardHeader>
          <CardTitle>어서오세요</CardTitle>
          <CardDescription>계정으로 로그인하거나 새로 시작하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="sh-ui-ex-login__tabs">
              <TabsIndicator />
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form className="sh-ui-ex-login__form" onSubmit={(e) => e.preventDefault()}>
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="login-email">이메일</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" />
                </div>
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="login-pw">비밀번호</Label>
                  <Input id="login-pw" type="password" placeholder="••••••••" />
                </div>
                <Button type="submit" className="sh-ui-ex-login__submit">
                  로그인
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="sh-ui-ex-login__form" onSubmit={(e) => e.preventDefault()}>
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="signup-name">이름</Label>
                  <Input id="signup-name" placeholder="홍길동" />
                </div>
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="signup-email">이메일</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" />
                </div>
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="signup-pw">비밀번호</Label>
                  <Input id="signup-pw" type="password" placeholder="8자 이상" />
                </div>
                <Button type="submit" className="sh-ui-ex-login__submit">
                  계정 만들기
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <Separator className="sh-ui-ex-login__sep" />
          <p className="sh-ui-ex-login__hint">
            계속하면 서비스 이용약관에 동의하는 것으로 간주됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: example.css**

`apps/docs/examples/login-card/example.css`:
```css
.sh-ui-ex-login {
  position: relative;
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: var(--space-8);
  background: radial-gradient(
      1000px 600px at 10% 0%,
      rgba(64, 96, 255, 0.35),
      transparent 60%
    ),
    radial-gradient(
      800px 500px at 100% 100%,
      rgba(186, 88, 255, 0.28),
      transparent 60%
    ),
    var(--color-background);
  overflow: hidden;
}
.sh-ui-ex-login__aurora {
  position: absolute;
  inset: -20% -10% auto auto;
  width: 60%;
  height: 60%;
  background: conic-gradient(
    from 180deg at 50% 50%,
    rgba(64, 96, 255, 0.0),
    rgba(64, 96, 255, 0.18),
    rgba(186, 88, 255, 0.18),
    rgba(64, 96, 255, 0.0)
  );
  filter: blur(60px);
  pointer-events: none;
}
.sh-ui-ex-login__card {
  position: relative;
  width: min(420px, 100%);
  backdrop-filter: blur(14px);
  background: color-mix(in oklab, var(--color-background) 72%, transparent);
  border: 1px solid color-mix(in oklab, var(--color-border) 80%, transparent);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
}
.sh-ui-ex-login__tabs {
  margin-bottom: var(--space-4);
}
.sh-ui-ex-login__form {
  display: grid;
  gap: var(--space-3);
}
.sh-ui-ex-login__field {
  display: grid;
  gap: var(--space-1);
}
.sh-ui-ex-login__submit {
  margin-top: var(--space-2);
}
.sh-ui-ex-login__sep {
  margin: var(--space-5) 0 var(--space-3);
}
.sh-ui-ex-login__hint {
  text-align: center;
  color: var(--color-foreground-muted);
  font-size: var(--font-size-xs);
  margin: 0;
}
```

- [ ] **Step 4: index.ts에 등록**

`apps/docs/examples/index.ts`를 수정:
```ts
import dynamic from "next/dynamic";
import type { ExampleEntry } from "./types";
import { meta as loginCard } from "./login-card/meta";

export const examples: ExampleEntry[] = [
  {
    ...loginCard,
    Component: dynamic(() => import("./login-card/Example").then((m) => m.Example)),
    sourceFiles: ["login-card/Example.tsx", "login-card/example.css"],
  },
];

export const findExample = (slug: string) =>
  examples.find((e) => e.slug === slug);
```

- [ ] **Step 5: 타입 체크 + 수동 스모크**

Run: `cd /Users/gimsanghyeon/development/PROJECT/sh-ui && pnpm tsc --noEmit`
Expected: 에러 없음.

Run: `pnpm --filter docs dev`
- `/examples` → 카드 1개 보임, blocks 탭 활성화 시 남음
- 카드 클릭 → `/examples/login-card` 풀스크린
- 상단 "← 갤러리로" 링크, "코드 보기" 버튼 작동
- 코드 보기 → Dialog 우측 패널, 파일 탭 2개(Example.tsx / example.css), shiki 하이라이트 정상
- Esc → Dialog 닫힘, 포커스 "코드 보기" 버튼 복귀

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/examples/login-card apps/docs/examples/index.ts
git commit -m "docs(examples): login-card 블록 예제 추가"
```

---

## Task 6 — 예제 2: `pricing-card` (blocks)

**Files:**
- Create: `apps/docs/examples/pricing-card/meta.ts`
- Create: `apps/docs/examples/pricing-card/Example.tsx`
- Create: `apps/docs/examples/pricing-card/example.css`
- Modify: `apps/docs/examples/index.ts`

- [ ] **Step 1: meta.ts**

```ts
import type { ExampleMeta } from "../types";

export const meta: ExampleMeta = {
  slug: "pricing-card",
  title: "요금제 카드 3단",
  category: "blocks",
  description: "중앙 추천 플랜을 강조한 가격 비교 카드 섹션",
};
```

- [ ] **Step 2: Example.tsx**

```tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import "./example.css";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "₩0",
    period: "/ 월",
    description: "개인 프로젝트와 아이디어 검증",
    features: ["컴포넌트 전체", "커뮤니티 지원", "1개 프로젝트"],
    cta: "무료로 시작",
  },
  {
    name: "Pro",
    price: "₩19,000",
    period: "/ 월",
    description: "실무 팀과 제품 개발",
    features: ["Starter의 모든 기능", "무제한 프로젝트", "이메일 지원", "프리미엄 테마"],
    cta: "Pro 시작하기",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "맞춤",
    period: "",
    description: "대규모 조직과 감사 요건",
    features: ["Pro의 모든 기능", "SSO·감사 로그", "전용 지원", "SLA"],
    cta: "문의하기",
  },
];

export function Example() {
  return (
    <div className="sh-ui-ex-pricing">
      <header className="sh-ui-ex-pricing__header">
        <h2 className="sh-ui-ex-pricing__title">필요에 딱 맞는 요금제</h2>
        <p className="sh-ui-ex-pricing__subtitle">
          언제든지 업그레이드하거나 다운그레이드할 수 있어요.
        </p>
      </header>
      <div className="sh-ui-ex-pricing__grid">
        {plans.map((p) => (
          <Card
            key={p.name}
            className={`sh-ui-ex-pricing__card ${p.featured ? "sh-ui-ex-pricing__card--featured" : ""}`}
          >
            {p.featured ? (
              <div className="sh-ui-ex-pricing__ribbon" aria-hidden />
            ) : null}
            <CardHeader>
              <div className="sh-ui-ex-pricing__plan-row">
                <CardTitle>{p.name}</CardTitle>
                {p.featured ? <Badge>추천</Badge> : null}
              </div>
              <CardDescription>{p.description}</CardDescription>
              <div className="sh-ui-ex-pricing__price">
                <span className="sh-ui-ex-pricing__amount">{p.price}</span>
                <span className="sh-ui-ex-pricing__period">{p.period}</span>
              </div>
            </CardHeader>
            <Separator />
            <CardContent>
              <ul className="sh-ui-ex-pricing__features">
                {p.features.map((f) => (
                  <li key={f}>
                    <span aria-hidden className="sh-ui-ex-pricing__check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="sh-ui-ex-pricing__cta" variant={p.featured ? "default" : "outline"}>
                {p.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

> `Card` 컴포넌트가 `CardFooter`를 제공하지 않으면 `apps/docs/components/ui/card/index.tsx`를 확인해 실제 export 이름으로 치환. (예: 최상위 `Card`에 `<div className="...">`로 대체.)

- [ ] **Step 3: example.css**

```css
.sh-ui-ex-pricing {
  min-height: 100%;
  padding: var(--space-12) var(--space-6);
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 10%, transparent), transparent 30%),
    var(--color-background);
}
.sh-ui-ex-pricing__header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto var(--space-8);
}
.sh-ui-ex-pricing__title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin: 0 0 var(--space-2);
}
.sh-ui-ex-pricing__subtitle {
  color: var(--color-foreground-muted);
  margin: 0;
}
.sh-ui-ex-pricing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  max-width: 1080px;
  margin: 0 auto;
}
.sh-ui-ex-pricing__card {
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.sh-ui-ex-pricing__card--featured {
  border-color: color-mix(in oklab, var(--color-primary) 60%, var(--color-border));
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--color-primary) 40%, transparent),
    0 20px 60px color-mix(in oklab, var(--color-primary) 20%, transparent);
  transform: translateY(-8px);
}
.sh-ui-ex-pricing__ribbon {
  position: absolute;
  inset: -2px -2px auto -2px;
  height: 4px;
  background: linear-gradient(90deg, #4060ff, #ba58ff);
}
.sh-ui-ex-pricing__plan-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.sh-ui-ex-pricing__price {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  margin-top: var(--space-3);
}
.sh-ui-ex-pricing__amount {
  font-size: var(--font-size-3xl);
  font-weight: 700;
}
.sh-ui-ex-pricing__period {
  color: var(--color-foreground-muted);
}
.sh-ui-ex-pricing__features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-2);
}
.sh-ui-ex-pricing__features li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-foreground);
}
.sh-ui-ex-pricing__check {
  display: inline-grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--radius-full);
  background: color-mix(in oklab, var(--color-primary) 18%, transparent);
  color: var(--color-primary);
  font-size: 0.8rem;
}
.sh-ui-ex-pricing__cta {
  width: 100%;
}
```

- [ ] **Step 4: index.ts 업데이트**

```ts
import dynamic from "next/dynamic";
import type { ExampleEntry } from "./types";
import { meta as loginCard } from "./login-card/meta";
import { meta as pricingCard } from "./pricing-card/meta";

export const examples: ExampleEntry[] = [
  {
    ...loginCard,
    Component: dynamic(() => import("./login-card/Example").then((m) => m.Example)),
    sourceFiles: ["login-card/Example.tsx", "login-card/example.css"],
  },
  {
    ...pricingCard,
    Component: dynamic(() => import("./pricing-card/Example").then((m) => m.Example)),
    sourceFiles: ["pricing-card/Example.tsx", "pricing-card/example.css"],
  },
];

export const findExample = (slug: string) =>
  examples.find((e) => e.slug === slug);
```

- [ ] **Step 5: 타입 체크 + 스모크**

Run: `pnpm tsc --noEmit`
Expected: 에러 없음.

수동: `/examples` blocks 탭에 2개 카드, `/examples/pricing-card` 풀스크린 → 중앙 Pro 카드가 튀어나와 보이고, ribbon 그라데이션·글로우 확인.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/examples/pricing-card apps/docs/examples/index.ts
git commit -m "docs(examples): pricing-card 블록 예제 추가"
```

---

## Task 7 — 예제 3: `saas-dashboard` (pages)

**Files:**
- Create: `apps/docs/examples/saas-dashboard/meta.ts`
- Create: `apps/docs/examples/saas-dashboard/Example.tsx`
- Create: `apps/docs/examples/saas-dashboard/example.css`
- Modify: `apps/docs/examples/index.ts`

- [ ] **Step 1: meta.ts**

```ts
import type { ExampleMeta } from "../types";

export const meta: ExampleMeta = {
  slug: "saas-dashboard",
  title: "SaaS 대시보드",
  category: "pages",
  description: "KPI 카드 + 최근 활동 + 팀 현황으로 구성된 관리자 홈",
};
```

- [ ] **Step 2: Example.tsx**

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import "./example.css";

interface Kpi {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}

const kpis: Kpi[] = [
  { label: "MRR", value: "₩42.8M", delta: "+12.3%", trend: "up" },
  { label: "활성 사용자", value: "28,410", delta: "+4.1%", trend: "up" },
  { label: "이탈률", value: "1.8%", delta: "-0.3%", trend: "down" },
  { label: "NPS", value: "62", delta: "+5", trend: "up" },
];

interface Activity {
  who: string;
  what: string;
  when: string;
  tone: "positive" | "neutral" | "negative";
}

const activities: Activity[] = [
  { who: "김민재", what: "새 구독 Pro 계약 (₩190,000)", when: "2분 전", tone: "positive" },
  { who: "이지은", what: "지원 티켓 #4721 해결", when: "14분 전", tone: "neutral" },
  { who: "박서준", what: "결제 실패 재시도 중", when: "1시간 전", tone: "negative" },
  { who: "최유진", what: "대시보드 템플릿 공유", when: "2시간 전", tone: "neutral" },
];

const team = [
  { name: "Alex", role: "Product", used: 76, cap: 100 },
  { name: "Bo", role: "Engineering", used: 94, cap: 100 },
  { name: "Chae", role: "Design", used: 52, cap: 100 },
];

export function Example() {
  return (
    <div className="sh-ui-ex-dash">
      <header className="sh-ui-ex-dash__header">
        <div>
          <h1 className="sh-ui-ex-dash__title">안녕하세요, 김민재 👋</h1>
          <p className="sh-ui-ex-dash__subtitle">오늘의 핵심 지표와 움직임을 한눈에.</p>
        </div>
        <Badge>플랜: Pro</Badge>
      </header>

      <section className="sh-ui-ex-dash__kpis">
        {kpis.map((k) => (
          <Card key={k.label} className="sh-ui-ex-dash__kpi">
            <CardHeader>
              <CardDescription>{k.label}</CardDescription>
              <CardTitle>{k.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span
                className="sh-ui-ex-dash__delta"
                data-trend={k.trend}
              >
                {k.delta}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="sh-ui-ex-dash__split">
        <Card className="sh-ui-ex-dash__activity">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>팀 전체의 최신 이벤트</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="sh-ui-ex-dash__feed">
              {activities.map((a, i) => (
                <li key={i} className="sh-ui-ex-dash__feed-item">
                  <Avatar>
                    <AvatarImage src="" alt="" />
                    <AvatarFallback>{a.who.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="sh-ui-ex-dash__feed-main">
                    <p className="sh-ui-ex-dash__feed-text">
                      <strong>{a.who}</strong> {a.what}
                    </p>
                    <span className="sh-ui-ex-dash__feed-time">{a.when}</span>
                  </div>
                  <span
                    className="sh-ui-ex-dash__dot"
                    data-tone={a.tone}
                    aria-hidden
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="sh-ui-ex-dash__team">
          <CardHeader>
            <CardTitle>팀 캐패시티</CardTitle>
            <CardDescription>이번 주 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="sh-ui-ex-dash__team-list">
              {team.map((t) => (
                <li key={t.name}>
                  <div className="sh-ui-ex-dash__team-head">
                    <span>
                      <strong>{t.name}</strong>
                      <span className="sh-ui-ex-dash__team-role"> · {t.role}</span>
                    </span>
                    <span className="sh-ui-ex-dash__team-used">{t.used}%</span>
                  </div>
                  <Progress value={t.used} max={t.cap} />
                  <Separator />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

> Avatar, Progress 등의 실제 export 이름은 `apps/docs/components/ui/avatar`, `apps/docs/components/ui/progress` 참조. 이름이 다르면 치환.

- [ ] **Step 3: example.css**

```css
.sh-ui-ex-dash {
  min-height: 100%;
  padding: var(--space-8) var(--space-6);
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 8%, transparent), transparent 30%),
    var(--color-background);
  color: var(--color-foreground);
}
.sh-ui-ex-dash__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}
.sh-ui-ex-dash__title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: 0 0 var(--space-1);
}
.sh-ui-ex-dash__subtitle {
  color: var(--color-foreground-muted);
  margin: 0;
}
.sh-ui-ex-dash__kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}
.sh-ui-ex-dash__kpi {
  background:
    linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent 60%),
    var(--color-background);
}
.sh-ui-ex-dash__delta {
  font-size: var(--font-size-sm);
  font-weight: 600;
}
.sh-ui-ex-dash__delta[data-trend="up"] {
  color: #16a34a;
}
.sh-ui-ex-dash__delta[data-trend="down"] {
  color: #dc2626;
}
.sh-ui-ex-dash__delta[data-trend="flat"] {
  color: var(--color-foreground-muted);
}

.sh-ui-ex-dash__split {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-6);
}
@media (max-width: 900px) {
  .sh-ui-ex-dash__split {
    grid-template-columns: 1fr;
  }
}

.sh-ui-ex-dash__feed {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-3);
}
.sh-ui-ex-dash__feed-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-3);
}
.sh-ui-ex-dash__feed-main {
  min-width: 0;
}
.sh-ui-ex-dash__feed-text {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sh-ui-ex-dash__feed-time {
  font-size: var(--font-size-xs);
  color: var(--color-foreground-muted);
}
.sh-ui-ex-dash__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}
.sh-ui-ex-dash__dot[data-tone="positive"] {
  background: #22c55e;
}
.sh-ui-ex-dash__dot[data-tone="neutral"] {
  background: var(--color-primary);
}
.sh-ui-ex-dash__dot[data-tone="negative"] {
  background: #f97316;
}

.sh-ui-ex-dash__team-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-3);
}
.sh-ui-ex-dash__team-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}
.sh-ui-ex-dash__team-role {
  color: var(--color-foreground-muted);
}
.sh-ui-ex-dash__team-used {
  color: var(--color-foreground-muted);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: index.ts 업데이트 (기존 배열에 prepend 아님, append)**

```ts
  {
    ...saasDashboard,
    Component: dynamic(() => import("./saas-dashboard/Example").then((m) => m.Example)),
    sourceFiles: ["saas-dashboard/Example.tsx", "saas-dashboard/example.css"],
  },
```

import 추가:
```ts
import { meta as saasDashboard } from "./saas-dashboard/meta";
```

- [ ] **Step 5: 타입 체크 + 스모크**

Run: `pnpm tsc --noEmit`. `/examples/saas-dashboard` 진입 시 KPI 4개 + 활동 피드 + 팀 캐패시티 프로그레스 바가 각각 정렬된 상태로 렌더.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/examples/saas-dashboard apps/docs/examples/index.ts
git commit -m "docs(examples): saas-dashboard 페이지 예제 추가"
```

---

## Task 8 — 예제 4: `settings-page` (pages)

**Files:**
- Create: `apps/docs/examples/settings-page/meta.ts`
- Create: `apps/docs/examples/settings-page/Example.tsx`
- Create: `apps/docs/examples/settings-page/example.css`
- Modify: `apps/docs/examples/index.ts`

- [ ] **Step 1: meta.ts**

```ts
import type { ExampleMeta } from "../types";

export const meta: ExampleMeta = {
  slug: "settings-page",
  title: "설정 페이지",
  category: "pages",
  description: "좌측 네비 + 프로필/계정/알림 탭 구성의 설정 페이지",
};
```

- [ ] **Step 2: Example.tsx**

```tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import "./example.css";

export function Example() {
  return (
    <div className="sh-ui-ex-settings">
      <aside className="sh-ui-ex-settings__side">
        <div className="sh-ui-ex-settings__brand">⚙️ 설정</div>
        <nav className="sh-ui-ex-settings__nav" aria-label="설정 섹션">
          <a href="#account" className="sh-ui-ex-settings__nav-item" data-active>계정</a>
          <a href="#team" className="sh-ui-ex-settings__nav-item">팀</a>
          <a href="#billing" className="sh-ui-ex-settings__nav-item">결제</a>
          <a href="#integrations" className="sh-ui-ex-settings__nav-item">통합</a>
          <a href="#api" className="sh-ui-ex-settings__nav-item">API 키</a>
        </nav>
      </aside>

      <main className="sh-ui-ex-settings__main">
        <header>
          <h1 className="sh-ui-ex-settings__title">계정 설정</h1>
          <p className="sh-ui-ex-settings__subtitle">프로필·보안·알림을 관리하세요.</p>
        </header>

        <Tabs defaultValue="profile" className="sh-ui-ex-settings__tabs">
          <TabsList>
            <TabsIndicator />
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="security">보안</TabsTrigger>
            <TabsTrigger value="notifications">알림</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="sh-ui-ex-settings__panel">
            <section className="sh-ui-ex-settings__section">
              <div className="sh-ui-ex-settings__avatar-row">
                <Avatar>
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>민</AvatarFallback>
                </Avatar>
                <div>
                  <h2>프로필 사진</h2>
                  <p>PNG 또는 JPG · 최대 2MB</p>
                </div>
                <Button variant="outline">업로드</Button>
              </div>
              <Separator />
              <div className="sh-ui-ex-settings__grid">
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-name">이름</Label>
                  <Input id="s-name" defaultValue="김민재" />
                </div>
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-email">이메일</Label>
                  <Input id="s-email" type="email" defaultValue="minjae@example.com" />
                </div>
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-lang">언어</Label>
                  <Select defaultValue="ko">
                    <SelectTrigger id="s-lang">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-tz">시간대</Label>
                  <Select defaultValue="seoul">
                    <SelectTrigger id="s-tz">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seoul">Asia/Seoul (UTC+9)</SelectItem>
                      <SelectItem value="tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="sh-ui-ex-settings__actions">
                <Button variant="outline">취소</Button>
                <Button>저장하기</Button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="security" className="sh-ui-ex-settings__panel">
            <section className="sh-ui-ex-settings__section">
              <h2>비밀번호 변경</h2>
              <div className="sh-ui-ex-settings__grid">
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-pw-current">현재 비밀번호</Label>
                  <Input id="s-pw-current" type="password" />
                </div>
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-pw-new">새 비밀번호</Label>
                  <Input id="s-pw-new" type="password" />
                </div>
              </div>
              <Separator />
              <h2>2단계 인증</h2>
              <div className="sh-ui-ex-settings__switch-row">
                <div>
                  <p className="sh-ui-ex-settings__switch-title">TOTP 앱 사용</p>
                  <p className="sh-ui-ex-settings__switch-desc">
                    Authy, 1Password 등에서 6자리 코드를 입력합니다.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="notifications" className="sh-ui-ex-settings__panel">
            <section className="sh-ui-ex-settings__section">
              <h2>이메일 알림</h2>
              {[
                { title: "주간 요약", desc: "매주 월요일 오전 지표 요약 전송" },
                { title: "제품 업데이트", desc: "새 기능·릴리즈 공지" },
                { title: "보안 경고", desc: "의심스러운 로그인 시도 감지" },
              ].map((n, i) => (
                <div key={i} className="sh-ui-ex-settings__switch-row">
                  <div>
                    <p className="sh-ui-ex-settings__switch-title">{n.title}</p>
                    <p className="sh-ui-ex-settings__switch-desc">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={i !== 1} />
                </div>
              ))}
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: example.css**

```css
.sh-ui-ex-settings {
  min-height: 100%;
  display: grid;
  grid-template-columns: 240px 1fr;
  background: var(--color-background);
}
@media (max-width: 800px) {
  .sh-ui-ex-settings {
    grid-template-columns: 1fr;
  }
}

.sh-ui-ex-settings__side {
  border-right: 1px solid var(--color-border);
  padding: var(--space-6) var(--space-4);
  background: color-mix(in oklab, var(--color-background-subtle) 60%, var(--color-background));
}
.sh-ui-ex-settings__brand {
  font-weight: 700;
  margin-bottom: var(--space-6);
}
.sh-ui-ex-settings__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.sh-ui-ex-settings__nav-item {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-foreground-muted);
  text-decoration: none;
}
.sh-ui-ex-settings__nav-item:hover {
  background: var(--color-background-subtle);
  color: var(--color-foreground);
}
.sh-ui-ex-settings__nav-item[data-active] {
  background: color-mix(in oklab, var(--color-primary) 14%, transparent);
  color: var(--color-primary);
}

.sh-ui-ex-settings__main {
  padding: var(--space-8) var(--space-8);
  max-width: 820px;
}
.sh-ui-ex-settings__title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: 0 0 var(--space-1);
}
.sh-ui-ex-settings__subtitle {
  color: var(--color-foreground-muted);
  margin: 0 0 var(--space-6);
}
.sh-ui-ex-settings__tabs {
  margin-top: var(--space-4);
}
.sh-ui-ex-settings__panel {
  margin-top: var(--space-6);
}
.sh-ui-ex-settings__section {
  display: grid;
  gap: var(--space-5);
}
.sh-ui-ex-settings__avatar-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-4);
}
.sh-ui-ex-settings__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}
.sh-ui-ex-settings__field {
  display: grid;
  gap: var(--space-1);
}
.sh-ui-ex-settings__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
.sh-ui-ex-settings__switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--color-border);
}
.sh-ui-ex-settings__switch-row:first-of-type {
  border-top: 0;
}
.sh-ui-ex-settings__switch-title {
  margin: 0;
  font-weight: 600;
}
.sh-ui-ex-settings__switch-desc {
  margin: 0;
  color: var(--color-foreground-muted);
  font-size: var(--font-size-sm);
}
```

- [ ] **Step 4: index.ts 업데이트**

배열 끝에 추가:
```ts
import { meta as settingsPage } from "./settings-page/meta";

// ... 배열 내부:
  {
    ...settingsPage,
    Component: dynamic(() => import("./settings-page/Example").then((m) => m.Example)),
    sourceFiles: ["settings-page/Example.tsx", "settings-page/example.css"],
  },
```

- [ ] **Step 5: 타입 체크 + 스모크**

`/examples/settings-page` → 좌측 네비 + 3탭 전환 + 스위치 토글 작동.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/examples/settings-page apps/docs/examples/index.ts
git commit -m "docs(examples): settings-page 페이지 예제 추가"
```

---

## Task 9 — 예제 5: `checkout-flow` (flows)

**Files:**
- Create: `apps/docs/examples/checkout-flow/meta.ts`
- Create: `apps/docs/examples/checkout-flow/Example.tsx`
- Create: `apps/docs/examples/checkout-flow/example.css`
- Modify: `apps/docs/examples/index.ts`

- [ ] **Step 1: meta.ts**

```ts
import type { ExampleMeta } from "../types";

export const meta: ExampleMeta = {
  slug: "checkout-flow",
  title: "체크아웃 3단계",
  category: "flows",
  description: "배송지 → 결제 → 확인 스텝 폼과 진행 인디케이터",
};
```

- [ ] **Step 2: Example.tsx**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup } from "@/components/ui/radio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import "./example.css";

type StepKey = "shipping" | "payment" | "review";
const STEPS: { key: StepKey; label: string }[] = [
  { key: "shipping", label: "배송지" },
  { key: "payment", label: "결제" },
  { key: "review", label: "확인" },
];

export function Example() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx]!.key;
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const go = (delta: number) =>
    setStepIdx((i) => Math.min(STEPS.length - 1, Math.max(0, i + delta)));

  return (
    <div className="sh-ui-ex-checkout">
      <div className="sh-ui-ex-checkout__wrap">
        <ol className="sh-ui-ex-checkout__steps">
          {STEPS.map((s, i) => {
            const state =
              i < stepIdx ? "done" : i === stepIdx ? "active" : "pending";
            return (
              <li key={s.key} className="sh-ui-ex-checkout__step" data-state={state}>
                <span className="sh-ui-ex-checkout__step-dot" aria-hidden>
                  {i + 1}
                </span>
                <span className="sh-ui-ex-checkout__step-label">{s.label}</span>
              </li>
            );
          })}
        </ol>
        <div className="sh-ui-ex-checkout__bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="sh-ui-ex-checkout__bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="sh-ui-ex-checkout__panel">
          {step === "shipping" ? <ShippingStep /> : null}
          {step === "payment" ? <PaymentStep /> : null}
          {step === "review" ? <ReviewStep /> : null}
        </div>

        <div className="sh-ui-ex-checkout__actions">
          <Button variant="outline" onClick={() => go(-1)} disabled={stepIdx === 0}>
            이전
          </Button>
          {stepIdx < STEPS.length - 1 ? (
            <Button onClick={() => go(+1)}>다음</Button>
          ) : (
            <Button onClick={() => setStepIdx(0)}>주문 완료</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ShippingStep() {
  return (
    <section className="sh-ui-ex-checkout__form">
      <h2>어디로 보내드릴까요?</h2>
      <div className="sh-ui-ex-checkout__grid">
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-name">받는 사람</Label>
          <Input id="c-name" placeholder="홍길동" />
        </div>
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-phone">연락처</Label>
          <Input id="c-phone" placeholder="010-0000-0000" />
        </div>
        <div className="sh-ui-ex-checkout__field sh-ui-ex-checkout__field--wide">
          <Label htmlFor="c-addr">주소</Label>
          <Input id="c-addr" placeholder="도로명 주소" />
        </div>
      </div>
    </section>
  );
}

function PaymentStep() {
  return (
    <section className="sh-ui-ex-checkout__form">
      <h2>결제 방법</h2>
      <RadioGroup defaultValue="card">
        <label className="sh-ui-ex-checkout__radio">
          <Radio value="card" /> 신용/체크 카드
        </label>
        <label className="sh-ui-ex-checkout__radio">
          <Radio value="bank" /> 계좌 이체
        </label>
        <label className="sh-ui-ex-checkout__radio">
          <Radio value="pay" /> 간편결제
        </label>
      </RadioGroup>
      <Separator />
      <div className="sh-ui-ex-checkout__grid">
        <div className="sh-ui-ex-checkout__field sh-ui-ex-checkout__field--wide">
          <Label htmlFor="c-card">카드번호</Label>
          <Input id="c-card" inputMode="numeric" placeholder="0000 0000 0000 0000" />
        </div>
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-exp">유효기간</Label>
          <Input id="c-exp" placeholder="MM/YY" />
        </div>
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-cvc">CVC</Label>
          <Input id="c-cvc" inputMode="numeric" placeholder="123" />
        </div>
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-inst">할부</Label>
          <Select defaultValue="0">
            <SelectTrigger id="c-inst"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">일시불</SelectItem>
              <SelectItem value="3">3개월</SelectItem>
              <SelectItem value="6">6개월</SelectItem>
              <SelectItem value="12">12개월</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

function ReviewStep() {
  return (
    <section className="sh-ui-ex-checkout__form">
      <h2>주문 확인</h2>
      <dl className="sh-ui-ex-checkout__summary">
        <div><dt>상품</dt><dd>sh-ui Pro 1년 구독</dd></div>
        <div><dt>배송지</dt><dd>서울시 강남구 테헤란로 1 · 홍길동</dd></div>
        <div><dt>결제</dt><dd>신용카드 일시불</dd></div>
        <div className="sh-ui-ex-checkout__total"><dt>총 결제 금액</dt><dd>₩228,000</dd></div>
      </dl>
    </section>
  );
}
```

> Radio 컴포넌트 export 이름은 `apps/docs/components/ui/radio/index.tsx` 확인. 이름이 다르면 치환.

- [ ] **Step 3: example.css**

```css
.sh-ui-ex-checkout {
  min-height: 100%;
  padding: var(--space-8) var(--space-6);
  background:
    linear-gradient(180deg, color-mix(in oklab, #4060ff 10%, transparent), transparent 30%),
    var(--color-background);
}
.sh-ui-ex-checkout__wrap {
  max-width: 720px;
  margin: 0 auto;
  display: grid;
  gap: var(--space-6);
}

.sh-ui-ex-checkout__steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}
.sh-ui-ex-checkout__step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-foreground-muted);
}
.sh-ui-ex-checkout__step[data-state="active"] {
  color: var(--color-foreground);
}
.sh-ui-ex-checkout__step[data-state="done"] {
  color: var(--color-primary);
}
.sh-ui-ex-checkout__step-dot {
  display: inline-grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-full);
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
  font-weight: 600;
  font-size: var(--font-size-sm);
}
.sh-ui-ex-checkout__step[data-state="active"] .sh-ui-ex-checkout__step-dot {
  background: color-mix(in oklab, var(--color-primary) 20%, var(--color-background));
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.sh-ui-ex-checkout__step[data-state="done"] .sh-ui-ex-checkout__step-dot {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.sh-ui-ex-checkout__bar {
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-background-subtle);
  overflow: hidden;
}
.sh-ui-ex-checkout__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4060ff, #ba58ff);
  transition: width 200ms ease;
}

.sh-ui-ex-checkout__panel {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-background);
}
.sh-ui-ex-checkout__form {
  display: grid;
  gap: var(--space-4);
}
.sh-ui-ex-checkout__form h2 {
  margin: 0;
  font-size: var(--font-size-lg);
}
.sh-ui-ex-checkout__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.sh-ui-ex-checkout__field {
  display: grid;
  gap: var(--space-1);
}
.sh-ui-ex-checkout__field--wide {
  grid-column: 1 / -1;
}
.sh-ui-ex-checkout__radio {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}
.sh-ui-ex-checkout__summary {
  display: grid;
  gap: var(--space-2);
  margin: 0;
}
.sh-ui-ex-checkout__summary > div {
  display: flex;
  justify-content: space-between;
}
.sh-ui-ex-checkout__summary dt {
  color: var(--color-foreground-muted);
}
.sh-ui-ex-checkout__summary dd {
  margin: 0;
  font-weight: 500;
}
.sh-ui-ex-checkout__total {
  font-size: var(--font-size-lg);
  font-weight: 700;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}
.sh-ui-ex-checkout__actions {
  display: flex;
  justify-content: space-between;
}
```

- [ ] **Step 4: index.ts 업데이트**

```ts
import { meta as checkoutFlow } from "./checkout-flow/meta";

// 배열에 추가:
  {
    ...checkoutFlow,
    Component: dynamic(() => import("./checkout-flow/Example").then((m) => m.Example)),
    sourceFiles: ["checkout-flow/Example.tsx", "checkout-flow/example.css"],
  },
```

- [ ] **Step 5: 타입 체크 + 스모크**

`/examples/checkout-flow` → 스텝 3개 전환, 진행 바가 그라데이션으로 채워짐.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/examples/checkout-flow apps/docs/examples/index.ts
git commit -m "docs(examples): checkout-flow 예제 추가"
```

---

## Task 10 — 예제 6: `onboarding-flow` (flows)

**Files:**
- Create: `apps/docs/examples/onboarding-flow/meta.ts`
- Create: `apps/docs/examples/onboarding-flow/Example.tsx`
- Create: `apps/docs/examples/onboarding-flow/example.css`
- Modify: `apps/docs/examples/index.ts`

- [ ] **Step 1: meta.ts**

```ts
import type { ExampleMeta } from "../types";

export const meta: ExampleMeta = {
  slug: "onboarding-flow",
  title: "온보딩 4단계",
  category: "flows",
  description: "환영 → 프로필 → 관심사 → 완료의 대형 아이콘 온보딩",
};
```

- [ ] **Step 2: Example.tsx**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./example.css";

const STEPS = [
  { key: "welcome", label: "환영", emoji: "👋", bg: "sunset" },
  { key: "profile", label: "프로필", emoji: "🙂", bg: "meadow" },
  { key: "interests", label: "관심사", emoji: "✨", bg: "galaxy" },
  { key: "done", label: "완료", emoji: "🎉", bg: "confetti" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const INTERESTS = [
  "디자인 시스템",
  "프런트엔드",
  "백엔드",
  "DevOps",
  "데이터",
  "AI/ML",
  "모바일",
  "보안",
];

export function Example() {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx]!;

  return (
    <div className={`sh-ui-ex-onboard sh-ui-ex-onboard--${step.bg}`}>
      <div className="sh-ui-ex-onboard__wrap">
        <div className="sh-ui-ex-onboard__emoji" aria-hidden>
          {step.emoji}
        </div>
        {step.key === "welcome" ? <WelcomeStep /> : null}
        {step.key === "profile" ? <ProfileStep /> : null}
        {step.key === "interests" ? <InterestsStep /> : null}
        {step.key === "done" ? <DoneStep /> : null}

        <div className="sh-ui-ex-onboard__nav">
          <Button
            variant="outline"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            이전
          </Button>
          <div className="sh-ui-ex-onboard__dots">
            {STEPS.map((s: { key: StepKey }, i) => (
              <span key={s.key} className="sh-ui-ex-onboard__dot" data-active={i === idx ? "" : undefined} />
            ))}
          </div>
          <Button
            onClick={() => setIdx((i) => Math.min(STEPS.length - 1, i + 1))}
            disabled={idx === STEPS.length - 1}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <>
      <h1>환영합니다!</h1>
      <p>sh-ui에 오신 것을 환영해요. 3분만 투자하면 나에게 딱 맞는 경험을 준비해드릴게요.</p>
    </>
  );
}

function ProfileStep() {
  return (
    <>
      <h1>나에 대해 알려주세요</h1>
      <div className="sh-ui-ex-onboard__form">
        <div className="sh-ui-ex-onboard__field">
          <Label htmlFor="o-name">이름</Label>
          <Input id="o-name" placeholder="홍길동" />
        </div>
        <div className="sh-ui-ex-onboard__field">
          <Label htmlFor="o-role">역할</Label>
          <Input id="o-role" placeholder="예) 프런트엔드 개발자" />
        </div>
      </div>
    </>
  );
}

function InterestsStep() {
  return (
    <>
      <h1>어떤 주제에 관심이 있나요?</h1>
      <p>관심 영역에 맞춰 예제와 템플릿을 추천해드려요.</p>
      <div className="sh-ui-ex-onboard__interests">
        {INTERESTS.map((i) => (
          <label key={i} className="sh-ui-ex-onboard__chip">
            <Checkbox /> {i}
          </label>
        ))}
      </div>
    </>
  );
}

function DoneStep() {
  return (
    <>
      <h1>준비 완료!</h1>
      <p>시작할 준비가 끝났어요. 대시보드에서 다음 단계를 이어가세요.</p>
    </>
  );
}
```

- [ ] **Step 3: example.css**

```css
.sh-ui-ex-onboard {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: var(--space-8);
  color: #fff;
  transition: background 400ms ease;
}
.sh-ui-ex-onboard--sunset {
  background: radial-gradient(circle at 30% 30%, #ff7e5f, #feb47b 60%, #2c1a2e);
}
.sh-ui-ex-onboard--meadow {
  background: radial-gradient(circle at 70% 40%, #43cea2, #185a9d 60%, #0a2740);
}
.sh-ui-ex-onboard--galaxy {
  background: radial-gradient(circle at 50% 50%, #6a11cb, #2575fc 60%, #0c0a30);
}
.sh-ui-ex-onboard--confetti {
  background: radial-gradient(circle at 50% 30%, #ff9a9e, #fad0c4 50%, #7b1e3d);
}

.sh-ui-ex-onboard__wrap {
  width: min(520px, 100%);
  text-align: center;
  display: grid;
  gap: var(--space-4);
  padding: var(--space-8);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xl, 20px);
}
.sh-ui-ex-onboard__emoji {
  font-size: 5rem;
  line-height: 1;
}
.sh-ui-ex-onboard__wrap h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 700;
}
.sh-ui-ex-onboard__wrap p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}
.sh-ui-ex-onboard__form {
  display: grid;
  gap: var(--space-3);
  text-align: left;
}
.sh-ui-ex-onboard__field {
  display: grid;
  gap: var(--space-1);
}
.sh-ui-ex-onboard__interests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
}
.sh-ui-ex-onboard__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.sh-ui-ex-onboard__nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.sh-ui-ex-onboard__dots {
  display: flex;
  gap: var(--space-1);
}
.sh-ui-ex-onboard__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.3);
}
.sh-ui-ex-onboard__dot[data-active] {
  background: white;
  width: 20px;
}
```

- [ ] **Step 4: index.ts 업데이트**

```ts
import { meta as onboardingFlow } from "./onboarding-flow/meta";

// 배열에 추가:
  {
    ...onboardingFlow,
    Component: dynamic(() => import("./onboarding-flow/Example").then((m) => m.Example)),
    sourceFiles: ["onboarding-flow/Example.tsx", "onboarding-flow/example.css"],
  },
```

- [ ] **Step 5: 타입 체크 + 스모크**

`/examples/onboarding-flow` → 4단계 전환 시 배경 그라데이션이 부드럽게 바뀜.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/examples/onboarding-flow apps/docs/examples/index.ts
git commit -m "docs(examples): onboarding-flow 예제 추가"
```

---

## Task 11 — 예제 7: `theme-dashboard` (themes)

SaaS 대시보드 컴포넌트를 재사용하여 "같은 화면 + 다른 토큰"을 토글로 보여준다.

**Files:**
- Create: `apps/docs/examples/theme-dashboard/meta.ts`
- Create: `apps/docs/examples/theme-dashboard/Example.tsx`
- Create: `apps/docs/examples/theme-dashboard/example.css`
- Modify: `apps/docs/examples/index.ts`

- [ ] **Step 1: meta.ts**

```ts
import type { ExampleMeta } from "../types";

export const meta: ExampleMeta = {
  slug: "theme-dashboard",
  title: "테마 변주 대시보드",
  category: "themes",
  description: "동일한 대시보드를 3가지 브랜드 토큰(코발트/민트/앰버)으로 토글",
};
```

- [ ] **Step 2: Example.tsx**

```tsx
"use client";

import { useState } from "react";
import { Example as SaasDashboard } from "../saas-dashboard/Example";
import "./example.css";

type ThemeKey = "cobalt" | "mint" | "amber";
const THEMES: { key: ThemeKey; label: string }[] = [
  { key: "cobalt", label: "Cobalt" },
  { key: "mint", label: "Mint" },
  { key: "amber", label: "Amber" },
];

export function Example() {
  const [theme, setTheme] = useState<ThemeKey>("cobalt");
  return (
    <div className="sh-ui-ex-theme-dash" data-example-theme={theme}>
      <div className="sh-ui-ex-theme-dash__toolbar" role="tablist" aria-label="브랜드 토큰">
        {THEMES.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={theme === t.key}
            className="sh-ui-ex-theme-dash__toggle"
            data-active={theme === t.key ? "" : undefined}
            onClick={() => setTheme(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="sh-ui-ex-theme-dash__canvas">
        <SaasDashboard />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: example.css**

```css
.sh-ui-ex-theme-dash {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.sh-ui-ex-theme-dash__toolbar {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}
.sh-ui-ex-theme-dash__toggle {
  font: inherit;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-foreground-muted);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  cursor: pointer;
}
.sh-ui-ex-theme-dash__toggle[data-active] {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.sh-ui-ex-theme-dash__canvas {
  flex: 1;
  overflow: auto;
}

/* 테마 변주 — scoped CSS var override */
.sh-ui-ex-theme-dash[data-example-theme="cobalt"] {
  --color-primary: #4060ff;
  --color-ring: #4060ff;
  --radius-md: 10px;
}
.sh-ui-ex-theme-dash[data-example-theme="mint"] {
  --color-primary: #10b981;
  --color-ring: #10b981;
  --radius-md: 14px;
}
.sh-ui-ex-theme-dash[data-example-theme="amber"] {
  --color-primary: #f59e0b;
  --color-ring: #f59e0b;
  --radius-md: 6px;
}
```

> 실제 토큰 이름이 다르면 (예: `--sh-ui-color-primary`) `apps/docs/app/globals.css`를 확인해 prefix 통일.

- [ ] **Step 4: index.ts 업데이트**

```ts
import { meta as themeDashboard } from "./theme-dashboard/meta";

// 배열에 추가:
  {
    ...themeDashboard,
    Component: dynamic(() => import("./theme-dashboard/Example").then((m) => m.Example)),
    sourceFiles: ["theme-dashboard/Example.tsx", "theme-dashboard/example.css"],
  },
```

- [ ] **Step 5: 타입 체크 + 스모크**

`/examples/theme-dashboard` → 3개 토글 클릭 시 대시보드의 primary 색·radius 가 즉시 변경.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/examples/theme-dashboard apps/docs/examples/index.ts
git commit -m "docs(examples): theme-dashboard 테마 변주 예제 추가"
```

---

## Task 12 — 예제 8: `theme-login` (themes)

로그인 카드를 3열로 나란히 배치해 Light/Dark/Neon 동시 비교.

**Files:**
- Create: `apps/docs/examples/theme-login/meta.ts`
- Create: `apps/docs/examples/theme-login/Example.tsx`
- Create: `apps/docs/examples/theme-login/example.css`
- Modify: `apps/docs/examples/index.ts`

- [ ] **Step 1: meta.ts**

```ts
import type { ExampleMeta } from "../types";

export const meta: ExampleMeta = {
  slug: "theme-login",
  title: "테마 변주 로그인",
  category: "themes",
  description: "동일한 로그인 카드를 Light/Dark/Neon 세 테마로 횡렬 비교",
};
```

- [ ] **Step 2: Example.tsx**

```tsx
import { Example as LoginCard } from "../login-card/Example";
import "./example.css";

const THEMES: { key: string; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "neon", label: "Neon" },
];

export function Example() {
  return (
    <div className="sh-ui-ex-theme-login">
      {THEMES.map((t) => (
        <section
          key={t.key}
          className="sh-ui-ex-theme-login__cell"
          data-example-theme={t.key}
          aria-label={`${t.label} 테마`}
        >
          <header className="sh-ui-ex-theme-login__label">{t.label}</header>
          <div className="sh-ui-ex-theme-login__stage">
            <LoginCard />
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: example.css**

```css
.sh-ui-ex-theme-login {
  min-height: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 1000px) {
  .sh-ui-ex-theme-login {
    grid-template-columns: 1fr;
  }
}
.sh-ui-ex-theme-login__cell {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-foreground);
  position: relative;
}
.sh-ui-ex-theme-login__cell:last-child {
  border-right: 0;
}
.sh-ui-ex-theme-login__label {
  position: absolute;
  top: var(--space-3);
  left: var(--space-4);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-foreground-muted);
  z-index: 1;
}
.sh-ui-ex-theme-login__stage {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.sh-ui-ex-theme-login__cell[data-example-theme="light"] {
  --color-background: #fafafa;
  --color-foreground: #111;
  --color-foreground-muted: #555;
  --color-border: #e5e5e5;
  --color-primary: #111;
  --color-ring: #111;
}
.sh-ui-ex-theme-login__cell[data-example-theme="dark"] {
  --color-background: #0b0d12;
  --color-foreground: #f5f5f5;
  --color-foreground-muted: #9ba3b4;
  --color-border: #20242e;
  --color-primary: #8b9cff;
  --color-ring: #8b9cff;
}
.sh-ui-ex-theme-login__cell[data-example-theme="neon"] {
  --color-background: #09091a;
  --color-foreground: #f0f8ff;
  --color-foreground-muted: #9cf7ff;
  --color-border: #3a1d6e;
  --color-primary: #ff2bd6;
  --color-ring: #ff2bd6;
}
```

- [ ] **Step 4: index.ts 업데이트**

```ts
import { meta as themeLogin } from "./theme-login/meta";

// 배열에 추가:
  {
    ...themeLogin,
    Component: dynamic(() => import("./theme-login/Example").then((m) => m.Example)),
    sourceFiles: ["theme-login/Example.tsx", "theme-login/example.css"],
  },
```

- [ ] **Step 5: 타입 체크 + 스모크**

`/examples/theme-login` → 3열로 로그인 카드가 각기 다른 톤으로 렌더.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/examples/theme-login apps/docs/examples/index.ts
git commit -m "docs(examples): theme-login 테마 변주 예제 추가"
```

---

## Task 13 — 접근성 · 빌드 최종 검증

**Files:**
- Modify (필요 시): `apps/docs/components/examples/example-gallery.tsx` (arrow 키 네비게이션)

- [ ] **Step 1: 갤러리 탭 키보드 네비게이션 추가**

`apps/docs/components/examples/example-gallery.tsx`의 tabs 버튼에 `onKeyDown`을 추가해 `ArrowLeft`/`ArrowRight`/`Home`/`End` 지원. CATEGORIES 배열을 활용.

```tsx
// 교체: 탭 버튼 map 내부
const onKeyDown = (e: React.KeyboardEvent, i: number) => {
  if (e.key === "ArrowRight") {
    e.preventDefault();
    selectCategory(CATEGORIES[(i + 1) % CATEGORIES.length]!.value);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    selectCategory(CATEGORIES[(i - 1 + CATEGORIES.length) % CATEGORIES.length]!.value);
  } else if (e.key === "Home") {
    e.preventDefault();
    selectCategory(CATEGORIES[0]!.value);
  } else if (e.key === "End") {
    e.preventDefault();
    selectCategory(CATEGORIES[CATEGORIES.length - 1]!.value);
  }
};

// 버튼:
<button
  key={c.value}
  role="tab"
  aria-selected={isActive}
  tabIndex={isActive ? 0 : -1}
  className="sh-ui-example-gallery__tab"
  data-active={isActive ? "" : undefined}
  onClick={() => selectCategory(c.value)}
  onKeyDown={(e) => onKeyDown(e, CATEGORIES.findIndex((x) => x.value === c.value))}
  type="button"
>
  {c.label}
</button>
```

- [ ] **Step 2: 타입 체크**

Run: `pnpm tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 프로덕션 빌드 검증**

Run: `cd /Users/gimsanghyeon/development/PROJECT/sh-ui && pnpm --filter docs build`
Expected:
- 빌드 성공
- 로그에 `/examples`와 `/examples/[slug]` 8개 (login-card, pricing-card, saas-dashboard, settings-page, checkout-flow, onboarding-flow, theme-dashboard, theme-login) 모두 정적 생성.

만약 `fs.readFile` 경로가 빌드에서 실패하면 Task 3 Step 2의 `EXAMPLES_ROOT` 계산을 다음으로 교체:
```ts
import { fileURLToPath } from "node:url";
const EXAMPLES_ROOT = fileURLToPath(new URL("../../../examples", import.meta.url));
```
(이 경로는 `.next`로 번들될 때 안정적이지 않으니, 1차로 `process.cwd()`로 시도하고 실패할 때만 변경.)

- [ ] **Step 4: 수동 접근성 체크**

dev 서버에서:
- `/examples` Tab 키로 탭 → 카드 → 탭 순회 포커스 링 확인.
- 탭에서 ←→ 방향키로 카테고리 이동 확인.
- 쇼케이스 진입 → `</> 코드 보기` Tab 이동 → Enter로 Dialog 열기.
- Dialog 내부에서 Tab 순회 → Esc → 닫히며 포커스가 버튼 복귀.
- 다크모드 토글 → 모든 예제 & 쇼케이스가 다크에서도 올바르게 렌더.

문제 발견 시 해당 파일 수정 후 커밋 분리.

- [ ] **Step 5: 최종 커밋**

```bash
git add apps/docs/components/examples/example-gallery.tsx
git commit -m "docs(examples): 갤러리 탭 키보드 네비게이션"
```

- [ ] **Step 6: 스펙 기준 최종 확인**

아래를 모두 체크했는지 확인:
- [x] 사이드바에 "실전 예제" 항목
- [x] `/examples` 갤러리 + 5개 탭 + URL query 동기화 + empty 상태 + 초기화 버튼
- [x] `/examples/[slug]` 풀스크린 레이아웃 + 상단 바 + 코드 보기 Dialog
- [x] v1 카탈로그 8개 (blocks 2, pages 2, flows 2, themes 2)
- [x] shiki 재사용, 새 의존성 0
- [x] 모든 예제 장식은 각 `example.css` 범위 내
- [x] 테마 변주는 scoped `data-example-theme` CSS var override
- [x] `pnpm tsc --noEmit` 통과 + `pnpm --filter docs build` 통과
- [x] `versions.json` 미수정 (docs-only 변경이므로 범프 없음)

이상이면 플랜 완료.
