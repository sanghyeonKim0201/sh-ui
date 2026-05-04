"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import MiniSearch, { type SearchResult } from "minisearch";
import { SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import "./search-dialog.css";

type IndexRecord = {
  id: string;
  url: string;
  title: string;
  headings: string[];
  body: string;
};

type Hit = SearchResult & {
  url: string;
  title: string;
};

const MAX_RESULTS = 12;
const SNIPPET_LEN = 110;

// URL 의 첫 세그먼트 → search.json 의 categories 키.
const CATEGORY_KEYS: Record<string, string> = {
  components: "components",
  recipes: "recipes",
  plugins: "plugins",
  examples: "examples",
  "getting-started": "gettingStarted",
  cli: "cli",
  mcp: "mcp",
  tokens: "tokens",
  theming: "theming",
  guidelines: "guidelines",
  changelog: "changelog",
  create: "create",
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
  const [active, setActive] = React.useState(0);
  const [mac, setMac] = React.useState(false);

  const indexRef = React.useRef<MiniSearch<IndexRecord> | null>(null);
  const recordsRef = React.useRef<Map<string, IndexRecord>>(new Map());
  const loadingRef = React.useRef<Promise<void> | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMac(isMac());
  }, []);

  // cmd/ctrl+K 단축키
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isModK) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !open) {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // 인덱스 lazy load — 다이얼로그 처음 열릴 때만
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
        searchOptions: {
          boost: { title: 4, headings: 2 },
          prefix: true,
          fuzzy: 0.2,
          combineWith: "AND",
        },
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
      // 다이얼로그가 마운트된 후 input focus
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setHits([]);
      setActive(0);
    }
  }, [open, ensureIndex]);

  // 쿼리 변화 → 검색
  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setHits([]);
      setActive(0);
      return;
    }
    const ms = indexRef.current;
    if (!ms) return;
    const results = ms.search(q).slice(0, MAX_RESULTS) as Hit[];
    setHits(results);
    setActive(0);
  }, [query]);

  const go = React.useCallback(
    (url: string) => {
      setOpen(false);
      router.push(url);
    },
    [router],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(0, hits.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const hit = hits[active];
      if (hit) {
        e.preventDefault();
        go(hit.url);
      }
    }
  };

  // 활성 항목이 화면 안에 들어오게
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-active="true"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <>
      <button
        type="button"
        className="sh-ui-search-trigger"
        onClick={() => setOpen(true)}
        aria-label={t("triggerLabel")}
      >
        <SearchIcon size={14} aria-hidden className="sh-ui-search-trigger__icon" />
        <span className="sh-ui-search-trigger__label">{t("triggerPlaceholder")}</span>
        <kbd className="sh-ui-search-trigger__kbd">{mac ? "⌘ K" : "Ctrl K"}</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sh-ui-search-dialog">
          <DialogTitle className="sr-only">{t("dialogTitle")}</DialogTitle>
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            prefix={<SearchIcon size={16} aria-hidden />}
            aria-label={t("inputAriaLabel")}
            aria-autocomplete="list"
            aria-controls="sh-ui-search-results"
            aria-activedescendant={hits[active] ? `sh-ui-search-result-${active}` : undefined}
          />

          {query.trim() && hits.length === 0 && (
            <p className="sh-ui-search-dialog__empty">{t("empty")}</p>
          )}

          {hits.length > 0 && (
            <div
              ref={listRef}
              id="sh-ui-search-results"
              role="listbox"
              className="sh-ui-search-dialog__list"
            >
              {(() => {
                // 등장 순서를 보존하면서 같은 카테고리 항목들을 그룹화.
                const groups: { label: string; items: { hit: Hit; idx: number }[] }[] = [];
                hits.forEach((hit, idx) => {
                  const label = categoryLabel(hit.url);
                  const last = groups[groups.length - 1];
                  if (last && last.label === label) last.items.push({ hit, idx });
                  else groups.push({ label, items: [{ hit, idx }] });
                });
                return groups.map((group) => (
                  <div key={`${group.label}-${group.items[0].idx}`} className="sh-ui-search-dialog__group">
                    <div className="sh-ui-search-dialog__group-label">{group.label}</div>
                    <ul className="sh-ui-search-dialog__group-list">
                      {group.items.map(({ hit, idx }) => {
                        const rec = recordsRef.current.get(hit.id);
                        const matchedHeading = rec?.headings?.find((h) =>
                          h.toLowerCase().includes(query.toLowerCase()),
                        );
                        const sub = matchedHeading
                          ? `› ${matchedHeading}`
                          : buildSnippet(rec?.body ?? "", query);
                        return (
                          <li key={hit.id}>
                            <button
                              type="button"
                              id={`sh-ui-search-result-${idx}`}
                              role="option"
                              aria-selected={idx === active}
                              data-active={idx === active}
                              className="sh-ui-search-dialog__item"
                              onClick={() => go(hit.url)}
                              onMouseEnter={() => setActive(idx)}
                            >
                              <span className="sh-ui-search-dialog__item-title">
                                {highlight(hit.title, query)}
                              </span>
                              {sub && (
                                <span className="sh-ui-search-dialog__item-sub">
                                  {highlight(sub, query)}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ));
              })()}
            </div>
          )}

          <div className="sh-ui-search-dialog__footer">
            <span className="sh-ui-search-dialog__hint">
              <span className="sh-ui-search-dialog__hint-keys">
                <kbd>↑</kbd>
                <kbd>↓</kbd>
              </span>
              <span>{t("hints.navigate")}</span>
            </span>
            <span className="sh-ui-search-dialog__hint">
              <kbd>Enter</kbd>
              <span>{t("hints.open")}</span>
            </span>
            <span className="sh-ui-search-dialog__hint">
              <kbd>Esc</kbd>
              <span>{t("hints.close")}</span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// extractField helper: minisearch 의 extractField 가 인덱스 시그니처를 요구해서 임시 타입.
type Record_KV = { [key: string]: string | string[] | undefined };
