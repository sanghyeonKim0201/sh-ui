"use client";

import * as React from "react";

/**
 * docs 데모 영역에서 placeholder 링크 클릭이 실제 navigate / URL fragment 변경으로 이어지지 않도록
 * 가로채는 client 래퍼.
 *
 * - `display: contents` 라 부모(grid/flex 등)의 레이아웃 흐름을 끊지 않음
 * - 이벤트 위임으로 안의 모든 anchor 에 한 번에 적용 — 데모마다 anchor 별로 onClick 을 달 필요 없음
 * - 실제 anchor 의 onClick(예: HeaderItem 의 drawer 자동 close, NavMatch 자동 active) 은 그대로 동작
 *
 * 기본 동작 — 다음 href 들의 navigate 만 막는다:
 *   - `null` / `""` (빈 href)
 *   - `"#"` 또는 `"#anchor"` (fragment)
 *
 * `strict` 모드 — 위에 더해서 절대 경로(`/foo`)도 막는다. Breadcrumb 처럼 실제 url 형태로
 *  `/components`, `/products/cli` 같은 illustrative 경로를 보여줘야 하는 데모에 사용.
 *
 * 외부 절대 URL(`http://`, `https://`, `mailto:` 등)은 두 모드 모두 그대로 둔다.
 */
export function NoNav({
  children,
  strict = false,
}: {
  children: React.ReactNode;
  /** 절대 경로(`/...`) 도 가로채려면 true. 기본은 fragment / 빈 href 만 차단. */
  strict?: boolean;
}) {
  return (
    <div
      style={{ display: "contents" }}
      onClick={(e) => {
        const anchor = (e.target as HTMLElement).closest("a");
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (
          href === null ||
          href === "" ||
          href === "#" ||
          href.startsWith("#") ||
          (strict && href.startsWith("/"))
        ) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </div>
  );
}
