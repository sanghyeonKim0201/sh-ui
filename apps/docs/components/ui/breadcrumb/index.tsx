import * as React from "react";
import "./styles.css";


function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
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
      className={cx("sh-ui-breadcrumb", className)}
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
      className={cx("sh-ui-breadcrumb__list", className)}
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
      className={cx("sh-ui-breadcrumb__item", className)}
      {...props}
    />
  );
});

/* ───────── Link ───────── */

export interface BreadcrumbLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * 다른 anchor 컴포넌트(예: Next.js `Link`)로 대체. 자체로 `<a>` 를 렌더
   * 하므로 자식으로 또 다른 `<a>` 를 넣으면 anchor 중첩(invalid HTML). 정석은
   * Base UI 패턴과 동일한 `render` prop:
   *
   *   <BreadcrumbLink render={<Link href='/projects'>Projects</Link>} />
   *
   * sh-ui 의 모든 슬롯 패턴은 `render` 로 통일 (Base UI 표준 따름).
   */
  render?: React.ReactElement;
}

/** 상위 단계로 이동하는 링크. `render` prop 으로 다른 엘리먼트(Next Link 등) 슬롯 가능. */
export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(function BreadcrumbLink({ className, render, children, ...props }, ref) {
  const mergedClass = cx("sh-ui-breadcrumb__link", className);
  if (render && React.isValidElement(render)) {
    const child = render as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    return React.cloneElement(
      child,
      {
        ref,
        className: cx(child.props.className, mergedClass),
        ...props,
      } as Record<string, unknown>,
      children ?? child.props.children,
    );
  }
  return (
    <a ref={ref} className={mergedClass} {...props}>
      {children}
    </a>
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
      className={cx("sh-ui-breadcrumb__page", className)}
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
      className={cx("sh-ui-breadcrumb__separator", className)}
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
      className={cx("sh-ui-breadcrumb__ellipsis", className)}
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
