"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SHOWCASES,
  type ShowcaseCategory,
  type ShowcaseManifest,
} from "./showcases";

type Props = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  drawerOpen?: boolean;
  onClose?: () => void;
};

export function ShowcasePicker({ selectedIds, onToggle, drawerOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? SHOWCASES.filter((s) => s.label.toLowerCase().includes(q) || s.id.includes(q))
      : SHOWCASES;
    const map = new Map<ShowcaseCategory, ShowcaseManifest[]>();
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return CATEGORY_ORDER.flatMap((cat) => {
      const items = map.get(cat);
      if (!items || items.length === 0) return [];
      return [{ category: cat, items: items.sort((a, b) => a.label.localeCompare(b.label)) }];
    });
  }, [query]);

  return (
    <div
      className="sh-create-pane sh-create-pane--picker"
      data-open={drawerOpen ? "true" : "false"}
      style={{
        height: "100%",
        background: "var(--background-subtle)",
        padding: "0.875rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <strong style={{ fontSize: "0.875rem" }}>컴포넌트</strong>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>
            {selectedIds.length} / {SHOWCASES.length}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="sh-create-drawer-toggle"
              style={{
                width: "1.5rem",
                height: "1.5rem",
                display: "grid",
                placeItems: "center",
                padding: 0,
                border: "1px solid var(--border)",
                borderRadius: "calc(var(--radius) - 2px)",
                background: "transparent",
                color: "var(--foreground-muted)",
                cursor: "pointer",
                fontSize: "0.875rem",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색…"
        aria-label="컴포넌트 검색"
        style={{
          width: "100%",
          padding: "0.375rem 0.625rem",
          fontSize: "0.8125rem",
          border: "1px solid var(--border)",
          borderRadius: "calc(var(--radius) - 2px)",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", overflowY: "auto" }}>
        {grouped.length === 0 && (
          <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", padding: "0.5rem" }}>
            일치하는 컴포넌트 없음
          </div>
        )}
        {grouped.map(({ category, items }) => (
          <div key={category} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--foreground-muted)",
                paddingBottom: "0.25rem",
              }}
            >
              {CATEGORY_LABELS[category]}
            </div>
            {items.map((s) => {
              const active = selectedSet.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onToggle(s.id)}
                  aria-pressed={active}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    padding: "0.375rem 0.5rem",
                    fontSize: "0.8125rem",
                    border: active ? "1px solid var(--foreground)" : "1px solid var(--border)",
                    borderRadius: "calc(var(--radius) - 2px)",
                    background: active ? "var(--background-muted)" : "var(--background)",
                    color: "var(--foreground)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span>{s.label}</span>
                  <span
                    aria-hidden
                    style={{
                      fontSize: "0.875rem",
                      color: active ? "var(--foreground)" : "var(--foreground-muted)",
                    }}
                  >
                    {active ? "✓" : "+"}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
