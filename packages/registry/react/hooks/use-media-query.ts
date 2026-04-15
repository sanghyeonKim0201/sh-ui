"use client";

import { useEffect, useState } from "react";

/**
 * 미디어 쿼리에 따른 boolean 상태를 반환한다. SSR 안전(초기값 false).
 *
 *   const isWide = useMediaQuery("(min-width: 64rem)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** 모바일(< 768px) 여부. Sidebar 등에서 사용. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 47.99rem)");
}
