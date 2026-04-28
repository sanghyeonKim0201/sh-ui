"use client";

import * as React from "react";

/**
 * docs 데모 영역에서 `href="#"` · `""` · `"#anchor"` 같은 placeholder 링크를 클릭해도
 * URL 에 fragment 가 붙지 않도록 가로채는 client 래퍼.
 *
 * - `display: contents` 라 부모의 레이아웃(flex/grid) 흐름을 끊지 않음
 * - 이벤트 위임으로 처리하므로 demo 안의 모든 anchor 에 한 번에 적용
 * - 실제 anchor 의 onClick(예: HeaderItem 의 drawer 자동 close) 은 그대로 동작
 */
export function NoNav({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ display: "contents" }}
      onClick={(e) => {
        const anchor = (e.target as HTMLElement).closest("a");
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (href === null || href === "" || href === "#" || href.startsWith("#")) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </div>
  );
}
