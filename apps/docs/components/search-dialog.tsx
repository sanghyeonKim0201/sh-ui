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

  const ensureIndex = React.useCallback(async () => {
    if (indexRef.current) return;
    if (loadingRef.current) return loadingRef.current;
    loadingRef.current = (async () => {
      // no-cache: 매 세션 첫 로드에 조건부 요청으로 재검증한다. force-cache 는 URL 이
      // 배포마다 그대로(/search-index.json)여서, 인덱스 내용이 바뀌어도(새 컴포넌트 추가 등)
      // 브라우저가 옛 캐시본을 무기한 반환 → 신규 컴포넌트가 검색에 안 잡히는 버그가 있었다.
      // no-cache 면 서버가 변경분(200)만 내려주고 미변경 시 304 라 비용도 작다.
      const res = await fetch("/search-index.json", { cache: "no-cache" });
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
