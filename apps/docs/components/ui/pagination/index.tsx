import * as React from "react";
import "./styles.css";


function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
/* ───────── Pagination (nav) ─────────
 * 시맨틱: <nav aria-label="Pagination"><ul>...</ul></nav>.
 * 현재 페이지 링크에 aria-current="page"를 부여해 스크린리더가 위치를 읽게 한다.
 */

/**
 * 페이지 분할 내비게이션의 시맨틱 컨테이너(`<nav aria-label="Pagination">`).
 * 자식 구조: PaginationContent > PaginationItem × n > PaginationLink/Previous/Next/Ellipsis.
 */
export const Pagination = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(function Pagination({ className, ...props }, ref) {
  return (
    <nav
      ref={ref}
      aria-label="Pagination"
      className={cx("sh-ui-pagination", className)}
      {...props}
    />
  );
});

/* ───────── Content (ul) ───────── */

/** 페이지 항목들을 담는 정렬되지 않은 리스트(`<ul>`). */
export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(function PaginationContent({ className, ...props }, ref) {
  return (
    <ul
      ref={ref}
      className={cx("sh-ui-pagination__content", className)}
      {...props}
    />
  );
});

/* ───────── Item (li) ───────── */

/** 한 페이지 슬롯(`<li>`). PaginationLink/Previous/Next/Ellipsis를 자식으로 둔다. */
export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(function PaginationItem({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      className={cx("sh-ui-pagination__item", className)}
      {...props}
    />
  );
});

/* ───────── Link ─────────
 * 숫자 페이지 링크. isActive일 때 aria-current="page" + 시각 강조.
 */

export interface PaginationLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * 현재 페이지 표시. `true`면 `aria-current="page"`가 자동 부여되고 시각적으로 강조된다.
   * @default false
   */
  isActive?: boolean;
  /**
   * 크기.
   * - `sm` — 컴팩트
   * - `md` — 일반 (기본)
   *
   * @default "md"
   */
  size?: "sm" | "md";
}

/**
 * 숫자 페이지 링크. `isActive`이면 `aria-current="page"`가 자동 부여되어
 * 스크린리더가 현재 위치를 읽는다.
 */
export const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(function PaginationLink(
  { className, isActive, size = "md", ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive ? "" : undefined}
      data-size={size}
      className={cx("sh-ui-pagination__link", className)}
      {...props}
    />
  );
});

/* ───────── Previous / Next ─────────
 * 아이콘 + 레이블. 레이블이 없는 아이콘 버튼에는 aria-label로 의미 전달.
 */

/** "이전 페이지" 링크. 화살표 아이콘과 라벨이 함께 렌더되며 `aria-label`이 자동 부여된다. */
export const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(function PaginationPrevious({ className, children, ...props }, ref) {
  return (
    <PaginationLink
      ref={ref}
      aria-label="이전 페이지"
      className={cx("sh-ui-pagination__nav", className)}
      {...props}
    >
      <ChevronLeftIcon />
      {children ?? <span>이전</span>}
    </PaginationLink>
  );
});

/** "다음 페이지" 링크. */
export const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(function PaginationNext({ className, children, ...props }, ref) {
  return (
    <PaginationLink
      ref={ref}
      aria-label="다음 페이지"
      className={cx("sh-ui-pagination__nav", className)}
      {...props}
    >
      {children ?? <span>다음</span>}
      <ChevronRightIcon />
    </PaginationLink>
  );
});

/* ───────── Ellipsis — 생략 표시 ───────── */

/** 페이지 사이 생략을 표현하는 점 3개. 시각만 표현하고 스크린리더에는 무시된다. */
export const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function PaginationEllipsis({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cx("sh-ui-pagination__ellipsis", className)}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <circle cx="3" cy="8" r="1.25" />
        <circle cx="8" cy="8" r="1.25" />
        <circle cx="13" cy="8" r="1.25" />
      </svg>
      <span className="sh-ui-pagination__sr">더 많은 페이지</span>
    </span>
  );
});

/* ───────── 페이지 범위 유틸 ─────────
 * 현재 페이지 주변 siblings개 + 양 끝 1개 + 필요한 곳에 "dots"를 넣어
 * 렌더할 토큰 배열을 돌려준다.
 *
 * 예: page=5, totalPages=10, siblings=1 → [1, "dots", 4, 5, 6, "dots", 10]
 *
 * page·totalPages는 1-based를 가정한다.
 */

export type PaginationToken = number | "dots";

/**
 * 1-based `page`/`totalPages`로부터 렌더할 토큰 배열을 만든다.
 * 양 끝과 현재 주변 `siblings`개를 보여주고, 끊긴 구간엔 `"dots"`를 넣어준다.
 *
 * @param args.page - 1-based 현재 페이지.
 * @param args.siblings - 현재 페이지 양옆에 보일 페이지 개수.
 * @returns 렌더 토큰 배열. 숫자 또는 문자열 `"dots"`로 구성.
 * @example
 * getPaginationRange({ page: 5, totalPages: 10, siblings: 1 })
 * // [1, "dots", 4, 5, 6, "dots", 10]
 */
export function getPaginationRange({
  page,
  totalPages,
  siblings = 1,
}: {
  /** 1-based 현재 페이지. */
  page: number;
  /** 전체 페이지 수. */
  totalPages: number;
  /**
   * 현재 페이지 양옆에 보일 페이지 개수.
   * @default 1
   */
  siblings?: number;
}): PaginationToken[] {
  if (totalPages <= 0) return [];

  // 끝점 2개(첫/마지막) + 현재 주변 (2*siblings + 1) + dots 2개가 총 페이지 수보다 크거나 같으면
  // 생략 없이 전부 보여준다.
  const totalSlots = siblings * 2 + 5;
  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  // 왼쪽만 닫혀있음 → [1 ... right side]
  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + 2 * siblings;
    return [...range(1, leftCount), "dots", totalPages];
  }

  // 오른쪽만 닫혀있음 → [1 ... left side]
  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + 2 * siblings;
    return [1, "dots", ...range(totalPages - rightCount + 1, totalPages)];
  }

  // 양쪽 모두 생략
  return [1, "dots", ...range(leftSibling, rightSibling), "dots", totalPages];
}

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 4l-4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
