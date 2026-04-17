"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-");

const HEADER_OFFSET_REM = 5;

export function PageTOC() {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) {
      setItems([]);
      return;
    }

    // Preview 데모 안의 헤딩(시뮬레이션 페이지의 h3 등)은 실제 목차가 아니므로 제외.
    const headings = Array.from(
      main.querySelectorAll<HTMLHeadingElement>("h2, h3"),
    ).filter((h) => !h.closest(".sh-ui-preview"));
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
      h.style.scrollMarginTop = `${HEADER_OFFSET_REM}rem`;
      const level = h.tagName === "H2" ? 2 : 3;
      return { id, text, level };
    });

    setItems(collected);

    if (collected.length === 0) return;

    const remInPx =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const topOffsetPx = Math.round(HEADER_OFFSET_REM * remInPx);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${topOffsetPx}px 0px -70% 0px`,
        threshold: 0,
      },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [pathname]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (items.length === 0) return null;

  return (
    <nav className="sh-ui-page-toc" aria-label="목차">
      <div className="sh-ui-page-toc__label">On this page</div>
      <ul className="sh-ui-page-toc__list">
        {items.map((item) => (
          <li key={item.id} data-level={item.level}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className="sh-ui-page-toc__link"
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
