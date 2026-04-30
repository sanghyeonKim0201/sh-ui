"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MiniSearch, { type SearchResult } from "minisearch";
import { SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import "./search-dialog.css";

type Record = {
  id: string;
  url: string;
  title: string;
  headings: string[];
  body: string;
};

type Hit = SearchResult & {
  url: string;
  title: string;
  headings: string[];
};

const MAX_RESULTS = 12;
const SNIPPET_LEN = 140;

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
  const start = Math.max(0, idx - 40);
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
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [active, setActive] = React.useState(0);
  const [mac, setMac] = React.useState(false);

  const indexRef = React.useRef<MiniSearch<Record> | null>(null);
  const recordsRef = React.useRef<Map<string, Record>>(new Map());
  const loadingRef = React.useRef<Promise<void> | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);

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
      const data = (await res.json()) as { records: Record[] };
      const ms = new MiniSearch<Record>({
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
        aria-label="검색 열기"
      >
        <SearchIcon size={14} aria-hidden className="sh-ui-search-trigger__icon" />
        <span className="sh-ui-search-trigger__label">문서 검색…</span>
        <kbd className="sh-ui-search-trigger__kbd">{mac ? "⌘ K" : "Ctrl K"}</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sh-ui-search-dialog">
          <DialogTitle className="sr-only">문서 검색</DialogTitle>
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="컴포넌트, prop, 가이드 검색…"
            prefix={<SearchIcon size={16} aria-hidden />}
            aria-label="검색어"
            aria-autocomplete="list"
            aria-controls="sh-ui-search-results"
            aria-activedescendant={hits[active] ? `sh-ui-search-result-${active}` : undefined}
          />

          {query.trim() && hits.length === 0 && (
            <p className="sh-ui-search-dialog__empty">검색 결과 없음</p>
          )}

          {hits.length > 0 && (
            <ul
              ref={listRef}
              id="sh-ui-search-results"
              role="listbox"
              className="sh-ui-search-dialog__list"
            >
              {hits.map((hit, i) => {
                const rec = recordsRef.current.get(hit.id);
                const snippet = buildSnippet(rec?.body ?? "", query);
                const matchedHeading = hit.headings?.find((h) =>
                  h.toLowerCase().includes(query.toLowerCase()),
                );
                return (
                  <li key={hit.id}>
                    <button
                      type="button"
                      id={`sh-ui-search-result-${i}`}
                      role="option"
                      aria-selected={i === active}
                      data-active={i === active}
                      className="sh-ui-search-dialog__item"
                      onClick={() => go(hit.url)}
                      onMouseEnter={() => setActive(i)}
                    >
                      <span className="sh-ui-search-dialog__item-title">
                        {highlight(hit.title, query)}
                      </span>
                      {matchedHeading && (
                        <span className="sh-ui-search-dialog__item-heading">
                          › {highlight(matchedHeading, query)}
                        </span>
                      )}
                      <span className="sh-ui-search-dialog__item-url">{hit.url}</span>
                      {snippet && (
                        <span className="sh-ui-search-dialog__item-snippet">
                          {highlight(snippet, query)}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="sh-ui-search-dialog__footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
            <span><kbd>Enter</kbd> 열기</span>
            <span><kbd>Esc</kbd> 닫기</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// extractField helper: minisearch 의 extractField 가 인덱스 시그니처를 요구해서 임시 타입.
type Record_KV = { [key: string]: string | string[] | undefined };
