"use client";

import * as React from "react";

import { cn } from "@SH_UI_UTILS@";
export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface PageTOCProps {
  containerSelector?: string;
  routeKey?: string;
  headerOffsetRem?: number;
  label?: React.ReactNode;
  levels?: HeadingLevel[];
  excludeSelector?: string;
  className?: string;
}

const slugify = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-");

interface TocItem {
  id: string;
  text: string;
  level: HeadingLevel;
}

const cx = (...args: (string | undefined | false | null)[]) =>
  args.filter(Boolean).join(" ");

const linkBase =
  "block px-2 py-1 rounded-[calc(var(--radius)-4px)] text-foreground-muted no-underline leading-snug transition-[color,background-color] duration-[var(--duration-fast)] hover:text-foreground hover:bg-background-subtle focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2 data-[active=true]:text-foreground data-[active=true]:font-semibold data-[active=true]:bg-background-subtle motion-reduce:transition-none";

export function PageTOC({
  containerSelector = "main",
  routeKey,
  headerOffsetRem = 5,
  label = "On this page",
  levels = ["h2", "h3"],
  excludeSelector,
  className,
}: PageTOCProps) {
  const [items, setItems] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const levelsKey = levels.join(",");
  const levelsRef = React.useRef(levels);
  levelsRef.current = levels;

  React.useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      setItems([]);
      return;
    }

    const headingSelector = levelsRef.current.join(", ");
    let headings = Array.from(
      container.querySelectorAll<HTMLHeadingElement>(headingSelector),
    );
    if (excludeSelector) {
      headings = headings.filter((h) => !h.closest(excludeSelector));
    }

    const usedIds = new Set<string>();
    const collected: TocItem[] = headings.map((h) => {
      const text = h.textContent?.trim() ?? "";
      let id = h.id || slugify(text);
      let suffix = 2;
      const base = id;
      while (!id || usedIds.has(id)) {
        id = `${base}-${suffix++}`;
      }
      usedIds.add(id);
      if (!h.id) h.id = id;
      h.style.scrollMarginTop = `${headerOffsetRem}rem`;
      const level = h.tagName.toLowerCase() as HeadingLevel;
      return { id, text, level };
    });

    setItems(collected);
    if (collected.length === 0) return;

    const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const topOffsetPx = Math.round(headerOffsetRem * remInPx);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: `-${topOffsetPx}px 0px -70% 0px`, threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [containerSelector, headerOffsetRem, levelsKey, excludeSelector, routeKey]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (items.length === 0) return null;

  const linkClassesForLevel = (level: HeadingLevel) => {
    const num = parseInt(level.replace("h", ""), 10);
    if (num === 3 || num === 4) return "pl-5 text-[0.8125em] text-[var(--foreground-subtle,var(--foreground-muted))]";
    if (num >= 5) return "pl-8 text-[0.75em] text-[var(--foreground-subtle,var(--foreground-muted))]";
    return "";
  };

  return (
    <nav
      className={cn(
        "fixed top-20 right-6 w-56 max-h-[calc(100vh-7rem)] overflow-y-auto pl-4 pr-2 py-3 border-l border-border text-[0.8125rem] z-[5] max-[80rem]:hidden",
        className,
      )}
      aria-label={typeof label === "string" ? label : "목차"}
    >
      <div className="font-semibold text-[length:var(--text-xs)] text-foreground-muted uppercase tracking-[0.04em] mb-2">
        {label}
      </div>
      <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id} data-level={item.level.replace("h", "")}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(linkBase, linkClassesForLevel(item.level))}
              data-active={activeId === item.id ? "true" : undefined}
              aria-current={activeId === item.id ? "true" : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
