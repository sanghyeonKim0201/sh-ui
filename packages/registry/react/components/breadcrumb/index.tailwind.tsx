import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
export const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(function Breadcrumb({ className, ...props }, ref) {
  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn("text-[length:var(--text-sm)] text-foreground-muted", className)}
      {...props}
    />
  );
});

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement>
>(function BreadcrumbList({ className, ...props }, ref) {
  return (
    <ol
      ref={ref}
      className={cn(
        "flex items-center flex-wrap gap-1.5 m-0 p-0 list-none",
        className,
      )}
      {...props}
    />
  );
});

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(function BreadcrumbItem({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      className={cn("inline-flex items-center gap-1.5 min-w-0", className)}
      {...props}
    />
  );
});

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(function BreadcrumbLink({ className, ...props }, ref) {
  return (
    <a
      ref={ref}
      className={cn(
        "text-foreground-muted no-underline rounded-[calc(var(--radius)-2px)] px-0.5 transition-colors duration-[var(--duration-fast)] hover:text-foreground hover:underline hover:underline-offset-[3px] focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
});

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
      className={cn(
        "text-foreground font-medium overflow-hidden text-ellipsis whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
});

export const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(function BreadcrumbSeparator({ className, children, ...props }, ref) {
  return (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(
        "inline-flex items-center text-foreground-muted opacity-60",
        className,
      )}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
});

export const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function BreadcrumbEllipsis({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(
        "inline-flex items-center w-6 h-6 justify-center text-foreground-muted",
        className,
      )}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <circle cx="3" cy="8" r="1.25" />
        <circle cx="8" cy="8" r="1.25" />
        <circle cx="13" cy="8" r="1.25" />
      </svg>
      <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]">
        더 보기
      </span>
    </span>
  );
});

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
