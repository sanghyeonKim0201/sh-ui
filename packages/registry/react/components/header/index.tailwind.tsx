"use client";

import * as React from "react";
import { createPortal } from "react-dom";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    const previouslyFocused = (document.activeElement as HTMLElement) ?? null;
    const focusables = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => el.offsetParent !== null || el === document.activeElement);
    const first = focusables()[0];
    if (first) first.focus();
    else { container.setAttribute("tabindex", "-1"); container.focus(); }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) { e.preventDefault(); return; }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    };
    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") previouslyFocused.focus();
    };
  }, [active, containerRef, onClose]);
}

type HeaderCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};
const HeaderContext = React.createContext<HeaderCtx | null>(null);
function useHeader(): HeaderCtx {
  const ctx = React.useContext(HeaderContext);
  if (!ctx) throw new Error("Header 하위 컴포넌트는 <Header> 안에서만 사용할 수 있습니다.");
  return ctx;
}

type NavLocation = "inline" | "drawer";
const NavLocationContext = React.createContext<NavLocation>("inline");

type NavMatch = {
  value: string | undefined;
  match: (itemHref: string, value: string) => boolean;
  setValue: (value: string) => void;
};
const defaultNavMatch = (itemHref: string, value: string): boolean => {
  if (itemHref === value) return true;
  if (itemHref === "" || itemHref === "/") return false;
  return value.startsWith(itemHref + "/");
};
const NavMatchContext = React.createContext<NavMatch>({ value: undefined, match: defaultNavMatch, setValue: () => {} });

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "solid" | "transparent" | "blur";
  stickyHide?: boolean;
  stickyHideThreshold?: number;
}

function findScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let node = el?.parentElement ?? null;
  while (node) {
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    if ((oy === "auto" || oy === "scroll" || oy === "overlay") && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return window;
}
function getScrollY(target: HTMLElement | Window): number {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

const variantClasses = {
  solid: "bg-background",
  transparent: "bg-transparent border-b-transparent [--sh-ui-header-hover-bg:color-mix(in_srgb,currentColor_14%,transparent)]",
  blur: "bg-[color-mix(in_srgb,var(--background)_var(--sh-ui-header-blur-opacity),transparent)] [backdrop-filter:saturate(180%)_blur(var(--sh-ui-header-blur-radius))] [-webkit-backdrop-filter:saturate(180%)_blur(var(--sh-ui-header-blur-radius))] [--sh-ui-header-hover-bg:color-mix(in_srgb,currentColor_14%,transparent)] supports-[not_(backdrop-filter:blur(1px))]:bg-background",
};

export const Header = React.forwardRef<HTMLElement, HeaderProps>(function Header(
  { children, className, defaultOpen = false, open: openProp, onOpenChange, variant = "solid", stickyHide = false, stickyHideThreshold = 80, ...props },
  ref,
) {
  const isControlled = openProp !== undefined;
  const [internal, setInternal] = React.useState(defaultOpen);
  const open = isControlled ? openProp : internal;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const headerRef = React.useRef<HTMLElement | null>(null);

  const setRefs = React.useCallback((node: HTMLElement | null) => {
    headerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
  }, [ref]);

  const setOpen = React.useCallback((v: boolean) => {
    if (!isControlled) setInternal(v);
    onOpenChange?.(v);
  }, [isControlled, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    if (!stickyHide) { setHidden(false); return; }
    const target = findScrollParent(headerRef.current);
    let lastY = getScrollY(target);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = getScrollY(target);
        const delta = y - lastY;
        if (y < stickyHideThreshold) setHidden(false);
        else if (delta > 4) setHidden(true);
        else if (delta < -4) setHidden(false);
        lastY = y;
        ticking = false;
      });
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [stickyHide, stickyHideThreshold]);

  const ctx = React.useMemo<HeaderCtx>(() => ({ open, setOpen, triggerRef }), [open, setOpen]);

  return (
    <HeaderContext.Provider value={ctx}>
      <header
        ref={setRefs}
        className={cx(
          "relative flex items-center gap-[var(--space-4)] h-[var(--control-md)] px-[var(--space-3)] border-b border-border transition-[transform,background-color] duration-[var(--duration-base)] [--sh-ui-header-hover-bg:var(--background-muted)] [--sh-ui-header-blur-opacity:85%] [--sh-ui-header-blur-radius:16px] motion-reduce:transition-none max-md:gap-[var(--space-2)] data-[sticky-hide][data-hidden]:-translate-y-full",
          variantClasses[variant],
          className,
        )}
        data-drawer-open={open ? "" : undefined}
        data-sticky-hide={stickyHide ? "" : undefined}
        data-hidden={hidden ? "" : undefined}
        {...props}
      >
        {children}
      </header>
    </HeaderContext.Provider>
  );
});

export const HeaderBrand = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function HeaderBrand({ className, ...props }, ref) {
    return <div ref={ref} className={cx("inline-flex items-center gap-[var(--space-2)] shrink-0", className)} {...props} />;
  },
);

export const HeaderLogo = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function HeaderLogo({ className, ...props }, ref) {
    return <span ref={ref} className={cx("inline-flex items-center text-foreground", className)} {...props} />;
  },
);

export const HeaderTitle = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function HeaderTitle({ className, ...props }, ref) {
    return <span ref={ref} className={cx("text-[length:var(--text-base)] font-bold text-foreground tracking-[-0.3px]", className)} {...props} />;
  },
);

export const HeaderTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function HeaderTrigger({ className, onClick, children, ...props }, ref) {
    const { open, setOpen, triggerRef } = useHeader();
    const setRefs = React.useCallback((node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    }, [ref, triggerRef]);

    return (
      <button
        ref={setRefs}
        type="button"
        className={cx(
          "hidden items-center justify-center w-9 h-9 p-0 bg-transparent border-0 text-foreground rounded-[calc(var(--radius)-2px)] cursor-pointer transition-[background-color] duration-[var(--duration-fast)] hover:bg-[var(--sh-ui-header-hover-bg)] focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2 max-md:inline-flex max-md:order-[-1]",
          className,
        )}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        data-open={open ? "" : undefined}
        onClick={(e) => { setOpen(!open); onClick?.(e); }}
        {...props}
      >
        {children ?? (open ? <CloseIcon /> : <MenuIcon />)}
      </button>
    );
  },
);

export interface HeaderNavProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  match?: (itemHref: string, value: string) => boolean;
}

export const HeaderNav = React.forwardRef<HTMLElement, HeaderNavProps>(
  function HeaderNav({ value, defaultValue, onValueChange, match, className, children, ...props }, ref) {
    const { open, setOpen } = useHeader();
    const drawerRef = React.useRef<HTMLElement | null>(null);
    const close = React.useCallback(() => setOpen(false), [setOpen]);
    useFocusTrap(drawerRef, open, close);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = isControlled ? value : internalValue;

    const setValue = React.useCallback((next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    }, [isControlled, onValueChange]);

    const navMatch = React.useMemo<NavMatch>(() => ({ value: currentValue, match: match ?? defaultNavMatch, setValue }), [currentValue, match, setValue]);

    return (
      <NavMatchContext.Provider value={navMatch}>
        <NavLocationContext.Provider value="inline">
          <nav
            ref={ref}
            className={cx(
              "flex items-center gap-[var(--space-1)] flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:hidden",
              className,
            )}
            {...props}
          >
            {children}
          </nav>
        </NavLocationContext.Provider>

        <div
          className="hidden max-md:block max-md:fixed max-md:inset-0 max-md:bg-black/25 max-md:[backdrop-filter:blur(8px)] max-md:z-[var(--z-overlay)] max-md:opacity-0 max-md:pointer-events-none max-md:transition-opacity max-md:duration-[var(--duration-base)] max-md:data-[open]:opacity-100 max-md:data-[open]:pointer-events-auto motion-reduce:max-md:transition-none"
          data-open={open ? "" : undefined}
          onClick={close}
          aria-hidden
        />
        <aside
          ref={drawerRef}
          className="hidden max-md:flex max-md:fixed max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:w-[min(17.5rem,85vw)] max-md:bg-background-subtle max-md:border-r max-md:border-border max-md:z-[var(--z-modal)] max-md:-translate-x-full max-md:transition-transform max-md:duration-[var(--duration-base)] max-md:flex-col max-md:overflow-y-auto max-md:data-[open]:translate-x-0 motion-reduce:max-md:transition-none"
          data-open={open ? "" : undefined}
          aria-hidden={!open}
          role="dialog"
          aria-modal="true"
          aria-label="메뉴"
        >
          <div className="hidden max-md:flex max-md:items-center max-md:justify-end max-md:p-[var(--space-2)] max-md:border-b max-md:border-border">
            <HeaderTrigger />
          </div>
          <NavLocationContext.Provider value="drawer">
            <nav className="hidden max-md:flex max-md:flex-col max-md:p-[var(--space-2)] max-md:gap-px">{children}</nav>
          </NavLocationContext.Provider>
        </aside>
      </NavMatchContext.Provider>
    );
  },
);

export const HeaderItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }
>(function HeaderItem({ className, active, onClick, href, ...props }, ref) {
  const { setOpen } = useHeader();
  const navMatch = React.useContext(NavMatchContext);
  const computedActive = active !== undefined ? active : navMatch.value !== undefined && href !== undefined ? navMatch.match(href, navMatch.value) : false;

  return (
    <a
      ref={ref}
      href={href}
      className={cx(
        "inline-flex items-center gap-[var(--space-1)] py-[var(--space-2)] px-[var(--space-3)] text-[length:var(--text-sm)] font-medium text-foreground-muted no-underline bg-transparent border-0 rounded-[calc(var(--radius)-2px)] cursor-pointer whitespace-nowrap transition-[color,background-color] duration-[var(--duration-fast)] hover:text-foreground hover:bg-[var(--sh-ui-header-hover-bg)] data-[active]:text-foreground data-[active]:font-semibold focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2 motion-reduce:transition-none max-md:py-[var(--space-3)] max-md:px-[var(--space-3)]",
        className,
      )}
      data-active={computedActive ? "" : undefined}
      aria-current={computedActive ? "page" : undefined}
      onClick={(e) => {
        setOpen(false);
        if (href !== undefined) navMatch.setValue(href);
        onClick?.(e);
      }}
      {...props}
    />
  );
});

export const HeaderActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function HeaderActions({ className, ...props }, ref) {
    return <div ref={ref} className={cx("inline-flex items-center gap-[var(--space-2)] ml-auto shrink-0", className)} {...props} />;
  },
);

export const HeaderDesktopOnly = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function HeaderDesktopOnly({ className, ...props }, ref) {
    return <div ref={ref} className={cx("contents max-md:hidden", className)} {...props} />;
  },
);

export const HeaderMobileOnly = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function HeaderMobileOnly({ className, ...props }, ref) {
    return <div ref={ref} className={cx("hidden max-md:contents", className)} {...props} />;
  },
);

export interface HeaderNavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
}

export const HeaderNavGroup = React.forwardRef<HTMLDivElement, HeaderNavGroupProps>(
  function HeaderNavGroup({ className, label, children, ...props }, ref) {
    const location = React.useContext(NavLocationContext);
    if (location === "inline") {
      return <div ref={ref} className={cx("contents", className)} {...props}>{children}</div>;
    }
    return (
      <div
        ref={ref}
        className={cx("flex flex-col mt-[var(--space-3)] first:mt-0", className)}
        role="group"
        aria-label={typeof label === "string" ? label : undefined}
        {...props}
      >
        {label != null && (
          <div className="flex items-center h-8 px-[var(--space-2)] text-[length:var(--text-xs)] font-medium text-foreground-muted">
            {label}
          </div>
        )}
        <div className="flex flex-col gap-px">{children}</div>
      </div>
    );
  },
);

type MenuCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerId: string;
  contentId: string;
  location: NavLocation;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};
const MenuContext = React.createContext<MenuCtx | null>(null);
function useMenu() {
  const ctx = React.useContext(MenuContext);
  if (!ctx) throw new Error("HeaderMenu 하위 컴포넌트는 <HeaderMenu> 안에서만 사용할 수 있습니다.");
  return ctx;
}

export function HeaderMenu({ children, className, defaultOpen = false }: { children: React.ReactNode; className?: string; defaultOpen?: boolean; }) {
  const location = React.useContext(NavLocationContext);
  const [open, setOpen] = React.useState(location === "drawer" ? defaultOpen : false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const triggerId = React.useId();
  const contentId = React.useId();

  React.useEffect(() => {
    if (location !== "inline") return;
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, location]);

  React.useEffect(() => { if (location === "inline") setOpen(false); }, [location]);

  const ctx = React.useMemo<MenuCtx>(() => ({ open, setOpen, triggerId, contentId, location, triggerRef, contentRef }), [open, triggerId, contentId, location]);

  return (
    <MenuContext.Provider value={ctx}>
      <div
        ref={containerRef}
        className={cx(
          "relative",
          location === "inline" ? "inline-block" : "flex flex-col",
          className,
        )}
        data-open={open ? "" : undefined}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export const HeaderMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function HeaderMenuTrigger({ className, children, onClick, ...props }, ref) {
    const { open, setOpen, triggerId, contentId, triggerRef, location } = useMenu();
    const setRefs = React.useCallback((node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    }, [ref, triggerRef]);

    return (
      <button
        ref={setRefs}
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={contentId}
        data-open={open ? "" : undefined}
        className={cx(
          "inline-flex items-center gap-[var(--space-1)] py-[var(--space-2)] px-[var(--space-3)] text-[length:var(--text-sm)] font-medium text-foreground-muted bg-transparent border-0 rounded-[calc(var(--radius)-2px)] cursor-pointer whitespace-nowrap transition-[color,background-color] duration-[var(--duration-fast)] hover:text-foreground hover:bg-[var(--sh-ui-header-hover-bg)] data-[open]:text-foreground data-[open]:bg-[var(--sh-ui-header-hover-bg)] focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2 motion-reduce:transition-none",
          location === "drawer" && "max-md:justify-between max-md:w-full max-md:py-[var(--space-3)] max-md:px-[var(--space-3)]",
          className,
        )}
        onClick={(e) => { setOpen(!open); onClick?.(e); }}
        {...props}
      >
        <span>{children}</span>
        <ChevronDownIcon />
      </button>
    );
  },
);

export const HeaderMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function HeaderMenuContent({ className, children, style, ...props }, ref) {
    const { open, contentId, triggerId, location, triggerRef, contentRef } = useMenu();
    const setRefs = React.useCallback((node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }, [ref, contentRef]);

    if (location === "drawer") {
      return (
        <div
          ref={setRefs}
          id={contentId}
          role="menu"
          aria-labelledby={triggerId}
          data-open={open ? "" : undefined}
          hidden={!open}
          className={cx(
            "max-md:flex max-md:flex-col max-md:py-[var(--space-1)] max-md:pl-[var(--space-4)] max-md:gap-px max-md:[&[hidden]]:hidden",
            className,
          )}
          style={style}
          {...props}
        >
          {children}
        </div>
      );
    }

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    const [pos, setPos] = React.useState<{ top: number; left: number; minWidth: number }>({ top: 0, left: 0, minWidth: 0 });

    React.useLayoutEffect(() => {
      if (!open) return;
      const update = () => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, minWidth: rect.width });
      };
      update();
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }, [open, triggerRef]);

    if (!mounted || !open) return null;

    return createPortal(
      <div
        ref={setRefs}
        id={contentId}
        role="menu"
        aria-labelledby={triggerId}
        data-open=""
        className={cx(
          "z-[var(--z-dropdown,50)] p-[var(--space-1)] bg-background border border-border rounded-[var(--radius)] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] flex flex-col gap-px text-foreground",
          className,
        )}
        style={{ position: "absolute", top: pos.top, left: pos.left, minWidth: Math.max(pos.minWidth, 192), ...style }}
        {...props}
      >
        {children}
      </div>,
      document.body,
    );
  },
);

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-[var(--duration-fast)] [[data-open]_&]:rotate-180">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
