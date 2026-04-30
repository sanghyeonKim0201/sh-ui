import * as React from "react";
import "./styles.css";


import { cn } from "@SH_UI_UTILS@";
/* ───────── Breadcrumb (nav) ─────────
 * 시맨틱: <nav aria-label="Breadcrumb"><ol>...</ol></nav>.
 */

/**
 * 현재 페이지의 위치를 사이트 계층 위에서 보여주는 내비게이션. 항상 `BreadcrumbList`로
 * 감싸고, 마지막 항목은 링크 대신 `BreadcrumbPage`로 표기해 현재 위치를 알린다.
 */
export const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(function Breadcrumb({ className, ...props }, ref) {
  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn("sh-ui-breadcrumb", className)}
      {...props}
    />
  );
});

/* ───────── List (ol) ───────── */

/** 항목들을 담는 정렬 리스트(`<ol>`). Breadcrumb 직계 자식으로 사용. */
export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement>
>(function BreadcrumbList({ className, ...props }, ref) {
  return (
    <ol
      ref={ref}
      className={cn("sh-ui-breadcrumb__list", className)}
      {...props}
    />
  );
});

/* ───────── Item (li) ───────── */

/** 한 단계의 항목(`<li>`). 안에 `BreadcrumbLink` 또는 `BreadcrumbPage`를 둔다. */
export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(function BreadcrumbItem({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      className={cn("sh-ui-breadcrumb__item", className)}
      {...props}
    />
  );
});

/* ───────── Link ───────── */

/** 상위 단계로 이동하는 링크. 라우터 사용 시 `asChild` 패턴 대신 직접 `<a>` 속성으로 전달. */
export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(function BreadcrumbLink({ className, ...props }, ref) {
  return (
    <a
      ref={ref}
      className={cn("sh-ui-breadcrumb__link", className)}
      {...props}
    />
  );
});

/* ───────── Page (현재 위치 — 링크 아님) ───────── */

/** 마지막(현재) 항목. 링크가 아니므로 `aria-current="page"`가 자동 부여된다. */
export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function BreadcrumbPage({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      role="link"
      aria-current="page"
      aria-disabled="true"
      className={cn("sh-ui-breadcrumb__page", className)}
      {...props}
    />
  );
});

/* ───────── Separator ───────── */

/** 항목 사이 구분자. 기본은 `>` 아이콘이며 children으로 교체 가능. 스크린리더에서는 무시된다. */
export const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(function BreadcrumbSeparator({ className, children, ...props }, ref) {
  return (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("sh-ui-breadcrumb__separator", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
});

/* ───────── Ellipsis — 중간 항목 축약 ───────── */

/** 깊은 경로에서 중간 항목들을 축약하는 점 3개 표시. 클릭 가능한 전체 경로 메뉴와 함께 쓰면 유용. */
export const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function BreadcrumbEllipsis({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("sh-ui-breadcrumb__ellipsis", className)}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <circle cx="3" cy="8" r="1.25" />
        <circle cx="8" cy="8" r="1.25" />
        <circle cx="13" cy="8" r="1.25" />
      </svg>
      <span className="sh-ui-breadcrumb__ellipsis-sr">더 보기</span>
    </span>
  );
});

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
