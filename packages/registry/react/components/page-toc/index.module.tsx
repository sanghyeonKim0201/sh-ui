"use client";

import * as React from "react";
import { cn } from "@SH_UI_UTILS@";
import styles from "./styles.module.css";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface PageTOCProps {
  /**
   * 스캔할 컨테이너 selector. 기본 `"main"`.
   */
  containerSelector?: string;
  /**
   * 외부 신호로 TOC 재스캔. Next.js 사용 시 `usePathname()` 결과를 그대로 전달하면
   * 라우트 변경 때마다 자동 갱신. 같은 페이지 안에서 헤딩이 동적으로 바뀌면 이 값을 갱신.
   */
  routeKey?: string;
  /**
   * sticky 헤더 아래로 헤딩이 가려지지 않도록 띄울 거리(rem). `scroll-margin-top` 으로 적용.
   * @default 5
   */
  headerOffsetRem?: number;
  /**
   * 라벨 텍스트.
   * @default "On this page"
   */
  label?: React.ReactNode;
  /**
   * 수집할 헤딩 레벨.
   * @default ["h2", "h3"]
   */
  levels?: HeadingLevel[];
  /**
   * 제외할 헤딩 selector. 컨테이너 안에서 이 selector 의 자손인 헤딩은 무시.
   * 데모 미리보기·중첩 위젯 등을 TOC 에서 빼고 싶을 때 사용.
   */
  excludeSelector?: string;
  /** 추가 클래스. */
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


/**
 * 페이지 내 자동 목차 (On this page).
 *
 * 컨테이너 안의 지정한 헤딩 레벨을 스캔해 자동 slugify · id 부여 · `IntersectionObserver` 로
 * 현재 보이는 섹션을 active 표시 · 클릭 시 smooth scroll. 라우터 비종속 — `routeKey` 를
 * 외부에서 갱신하면 재스캔된다.
 */
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

  // levels 가 inline 배열(["h2", "h3"]) 로 전달되면 매 렌더마다 새 참조라 useEffect 가
  // 무한 루프에 빠짐. 내용 기반 안정 키로 비교하고, 효과 안에서는 ref 로 최신 값 사용.
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

    const remInPx =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const topOffsetPx = Math.round(headerOffsetRem * remInPx);

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

  return (
    <nav
      className={cn(styles["page-toc"], className)}
      aria-label={typeof label === "string" ? label : "목차"}
    >
      <div className={styles["page-toc__label"]}>{label}</div>
      <ul className={styles["page-toc__list"]}>
        {items.map((item) => (
          <li key={item.id} data-level={item.level.replace("h", "")}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={styles["page-toc__link"]}
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
