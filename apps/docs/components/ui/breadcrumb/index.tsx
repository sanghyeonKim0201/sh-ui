import * as React from "react";
import "./styles.css";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

/* ───────── Breadcrumb (nav) ─────────
 * 시맨틱: <nav aria-label="Breadcrumb"><ol>...</ol></nav>.
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

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(function BreadcrumbLink({ className, ...props }, ref) {
  return (
    <a
      ref={ref}
      className={cx("sh-ui-breadcrumb__link", className)}
      {...props}
    />
  );
});

/* ───────── Page (현재 위치 — 링크 아님) ───────── */

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
