"use client";

import * as React from "react";

export interface UseActiveSectionOptions {
  /** 감시할 섹션의 DOM id 목록. 순서는 문서에서의 등장 순서와 동일해야 한다. */
  sectionIds: string[];
  /** IntersectionObserver rootMargin. 기본값은 뷰포트 상단 20% 지점에서 활성 전환. */
  rootMargin?: string;
  /** 관측 대상이 될 스크롤 컨테이너. 기본은 viewport. */
  root?: Element | Document | null;
  /** 초기 활성 섹션. 지정하지 않으면 sectionIds[0]. */
  defaultActiveId?: string;
}

/**
 * 스크롤 위치에 따라 현재 활성 섹션 id를 반환한다.
 * - 여러 섹션이 동시에 교차하면 가장 위에 있는 섹션을 선택한다.
 * - 어떤 섹션도 교차하지 않으면 직전 활성 섹션을 유지한다.
 */
export function useActiveSection({
  sectionIds,
  rootMargin = "-20% 0px -70% 0px",
  root = null,
  defaultActiveId,
}: UseActiveSectionOptions): string | undefined {
  const [activeId, setActiveId] = React.useState<string | undefined>(
    defaultActiveId ?? sectionIds[0]
  );

  const idsKey = sectionIds.join("|");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (sectionIds.length === 0) return;

    const visible = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.set(id, entry);
          else visible.delete(id);
        }

        if (visible.size === 0) return;

        let topId: string | undefined;
        let topY = Number.POSITIVE_INFINITY;
        visible.forEach((entry, id) => {
          const y = entry.boundingClientRect.top;
          if (y < topY) {
            topY = y;
            topId = id;
          }
        });
        if (topId) setActiveId(topId);
      },
      {
        rootMargin,
        root: root instanceof Document ? null : root ?? null,
        threshold: 0,
      }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    // 스크롤 끝 보정: 마지막 섹션이 트리거 라인까지 못 올라오는 경우 강제 활성화.
    const scrollTarget: Element | Window | null =
      root instanceof Document ? window : (root as Element | null) ?? window;

    const handleScroll = () => {
      const lastId = sectionIds[sectionIds.length - 1];
      if (!lastId) return;
      const el =
        (root instanceof Document ? null : (root as HTMLElement | null)) ??
        (document.scrollingElement as HTMLElement | null) ??
        document.documentElement;
      const scrollTop = el.scrollTop;
      const clientHeight = el.clientHeight;
      const scrollHeight = el.scrollHeight;
      if (scrollTop + clientHeight >= scrollHeight - 2) {
        setActiveId(lastId);
      }
    };

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
    // idsKey로 배열 내용 변경을 감지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, rootMargin, root]);

  return activeId;
}
