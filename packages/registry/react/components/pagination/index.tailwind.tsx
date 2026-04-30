import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
export const Pagination = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function Pagination({ className, ...props }, ref) {
    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={cn("flex justify-center text-[length:var(--text-sm)] text-foreground", className)}
        {...props}
      />
    );
  },
);

export const PaginationContent = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  function PaginationContent({ className, ...props }, ref) {
    return (
      <ul
        ref={ref}
        className={cn("flex flex-wrap items-center gap-1 m-0 p-0 list-none", className)}
        {...props}
      />
    );
  },
);

export const PaginationItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  function PaginationItem({ className, ...props }, ref) {
    return <li ref={ref} className={cn("inline-flex items-center", className)} {...props} />;
  },
);

const linkBase =
  "inline-flex items-center justify-center gap-1.5 min-w-9 h-9 px-3 rounded-[calc(var(--radius)-2px)] border border-transparent bg-transparent text-foreground no-underline transition-[background-color,border-color,color] duration-[var(--duration-fast)] cursor-pointer select-none hover:bg-background-muted focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2 data-[active]:bg-foreground data-[active]:text-background data-[active]:font-medium data-[active]:hover:opacity-90 aria-disabled:pointer-events-none aria-disabled:opacity-45 data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[size=sm]:min-w-8 data-[size=sm]:h-8 data-[size=sm]:px-2 motion-reduce:transition-none";

export interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  size?: "sm" | "md";
}

export const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  function PaginationLink({ className, isActive, size = "md", ...props }, ref) {
    return (
      <a
        ref={ref}
        aria-current={isActive ? "page" : undefined}
        data-active={isActive ? "" : undefined}
        data-size={size}
        className={cn(linkBase, className)}
        {...props}
      />
    );
  },
);

export const PaginationPrevious = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  function PaginationPrevious({ className, children, ...props }, ref) {
    return (
      <PaginationLink ref={ref} aria-label="이전 페이지" className={cn("px-2.5", className)} {...props}>
        <ChevronLeftIcon />
        {children ?? <span>이전</span>}
      </PaginationLink>
    );
  },
);

export const PaginationNext = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  function PaginationNext({ className, children, ...props }, ref) {
    return (
      <PaginationLink ref={ref} aria-label="다음 페이지" className={cn("px-2.5", className)} {...props}>
        {children ?? <span>다음</span>}
        <ChevronRightIcon />
      </PaginationLink>
    );
  },
);

export const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function PaginationEllipsis({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn("inline-flex items-center justify-center w-9 h-9 text-foreground-muted", className)}
        {...props}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="3" cy="8" r="1.25" />
          <circle cx="8" cy="8" r="1.25" />
          <circle cx="13" cy="8" r="1.25" />
        </svg>
        <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]">
          더 많은 페이지
        </span>
      </span>
    );
  },
);

export type PaginationToken = number | "dots";

export function getPaginationRange({
  page, totalPages, siblings = 1,
}: { page: number; totalPages: number; siblings?: number }): PaginationToken[] {
  if (totalPages <= 0) return [];
  const totalSlots = siblings * 2 + 5;
  if (totalPages <= totalSlots) return range(1, totalPages);
  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, totalPages);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;
  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + 2 * siblings;
    return [...range(1, leftCount), "dots", totalPages];
  }
  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + 2 * siblings;
    return [1, "dots", ...range(totalPages - rightCount + 1, totalPages)];
  }
  return [1, "dots", ...range(leftSibling, rightSibling), "dots", totalPages];
}

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
