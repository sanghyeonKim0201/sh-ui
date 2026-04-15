"use client";

import * as React from "react";
import { ChevronRightIcon, PanelLeftIcon } from "lucide-react";
import "./styles.css";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MOBILE_BREAKPOINT = 768;

/* ───────────── useIsMobile ───────────── */

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

/* ───────────── Context ───────────── */

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.");
  return ctx;
}

/* ───────────── Provider ───────────── */

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 부모 컨테이너 안에 임베드. min-height/100svh 대신 부모 크기를 따른다. (문서 데모용) */
  embedded?: boolean;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  embedded,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value;
      if (setOpenProp) setOpenProp(next);
      else _setOpen(next);
      if (typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [open, setOpenProp]
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v);
    else setOpen((v) => !v);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  const state: "expanded" | "collapsed" = open ? "expanded" : "collapsed";

  const value = React.useMemo<SidebarContextValue>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar]
  );

  const classes = ["hyeon-sidebar-wrapper", className].filter(Boolean).join(" ");

  return (
    <SidebarContext.Provider value={value}>
      <div className={classes} style={style} data-embedded={embedded || undefined} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/* ───────────── Sidebar ───────────── */

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    const classes = ["hyeon-sidebar", "hyeon-sidebar--static", className].filter(Boolean).join(" ");
    return (
      <aside className={classes} data-side={side} data-variant={variant} {...props}>
        {children}
      </aside>
    );
  }

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <div
            className="hyeon-sidebar__backdrop"
            onClick={() => setOpenMobile(false)}
            aria-hidden
          />
        )}
        <aside
          className={["hyeon-sidebar", "hyeon-sidebar--mobile", className].filter(Boolean).join(" ")}
          data-side={side}
          data-state={openMobile ? "open" : "closed"}
          {...props}
        >
          {children}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={["hyeon-sidebar", className].filter(Boolean).join(" ")}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      {...props}
    >
      <div className="hyeon-sidebar__inner">{children}</div>
    </aside>
  );
}

/* ───────────── Trigger ───────────── */

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle Sidebar"
      className={["hyeon-sidebar__trigger", className].filter(Boolean).join(" ")}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon size={16} aria-hidden />
    </button>
  );
}

/* ───────────── Inset (main content area, paired with variant=inset) ───────────── */

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={["hyeon-sidebar-inset", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

/* ───────────── Header / Footer / Content / Separator ───────────── */

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["hyeon-sidebar__header", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["hyeon-sidebar__footer", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["hyeon-sidebar__content", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarSeparator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={["hyeon-sidebar__separator", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

/* ───────────── Group ───────────── */

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["hyeon-sidebar__group", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["hyeon-sidebar__group-label", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["hyeon-sidebar__group-content", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

/* ───────────── Menu ───────────── */

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={["hyeon-sidebar__menu", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={["hyeon-sidebar__menu-item", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  /** SidebarTOC 안에서 사용할 때, 이 값과 활성 섹션 id가 같으면 자동으로 isActive가 true가 된다. */
  sectionId?: string;
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton(
    { className, isActive, size = "md", asChild, sectionId, children, ...props },
    ref
  ) {
    const tocActive = useTOCActiveId();
    const resolvedIsActive =
      isActive ?? (sectionId != null ? tocActive === sectionId : undefined);
    const cls = [
      "hyeon-sidebar__menu-button",
      `hyeon-sidebar__menu-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      const merged: Record<string, unknown> = {
        ...props,
        className: [(child.props.className as string) || "", cls]
          .filter(Boolean)
          .join(" "),
        "data-active": resolvedIsActive || undefined,
      };
      return React.cloneElement(child, merged);
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cls}
        data-active={resolvedIsActive || undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);

/* ───────────── Sub menu ───────────── */

export function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={["hyeon-sidebar__menu-sub", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={["hyeon-sidebar__menu-sub-item", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export interface SidebarMenuSubButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  size?: "sm" | "md";
  asChild?: boolean;
  /** SidebarTOC 안에서 사용할 때, 이 값과 활성 섹션 id가 같으면 자동으로 isActive가 true가 된다. */
  sectionId?: string;
}

export const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  function SidebarMenuSubButton(
    { className, isActive, size = "md", asChild, sectionId, children, ...props },
    ref
  ) {
    const tocActive = useTOCActiveId();
    const resolvedIsActive =
      isActive ?? (sectionId != null ? tocActive === sectionId : undefined);
    const cls = [
      "hyeon-sidebar__menu-sub-button",
      `hyeon-sidebar__menu-sub-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      const merged: Record<string, unknown> = {
        ...props,
        className: [(child.props.className as string) || "", cls]
          .filter(Boolean)
          .join(" "),
        "data-active": resolvedIsActive || undefined,
      };
      return React.cloneElement(child, merged);
    }

    return (
      <a
        ref={ref}
        className={cls}
        data-active={resolvedIsActive || undefined}
        {...props}
      >
        {children}
      </a>
    );
  }
);

/* ───────────── Collapsible (펼침/접힘 메뉴) ───────────── */

type CollapsibleContextValue = {
  open: boolean;
  toggle: () => void;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error("SidebarCollapsible 하위에서만 사용할 수 있습니다.");
  return ctx;
}

export interface SidebarCollapsibleProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function SidebarCollapsible({
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
}: SidebarCollapsibleProps) {
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const toggle = React.useCallback(() => {
    const next = !open;
    if (onOpenChange) onOpenChange(next);
    else _setOpen(next);
  }, [open, onOpenChange]);

  const value = React.useMemo(() => ({ open, toggle }), [open, toggle]);

  return (
    <CollapsibleContext.Provider value={value}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export interface SidebarCollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

export function SidebarCollapsibleTrigger({
  className,
  size = "md",
  children,
  onClick,
  ...props
}: SidebarCollapsibleTriggerProps) {
  const { open, toggle } = useCollapsible();
  return (
    <button
      type="button"
      className={[
        "hyeon-sidebar__menu-button",
        `hyeon-sidebar__menu-button--${size}`,
        "hyeon-sidebar__collapsible-trigger",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
      {...props}
    >
      {children}
      <ChevronRightIcon className="hyeon-sidebar__chevron" aria-hidden />
    </button>
  );
}

export function SidebarCollapsibleContent({ children }: { children: React.ReactNode }) {
  const { open } = useCollapsible();
  return (
    <div className="hyeon-sidebar__collapsible-content" data-state={open ? "open" : "closed"} hidden={!open}>
      {children}
    </div>
  );
}

/* ───────────── TOC (Table of Contents — 페이지 내 섹션 스크롤 활성화) ─────────────
 *
 * 사용 예:
 *   <SidebarTOC sectionIds={["intro", "install", "usage"]}>
 *     <SidebarMenu>
 *       <SidebarMenuItem>
 *         <SidebarMenuButton sectionId="intro" asChild>
 *           <a href="#intro">Intro</a>
 *         </SidebarMenuButton>
 *       </SidebarMenuItem>
 *       ...
 *     </SidebarMenu>
 *   </SidebarTOC>
 */

const TOCContext = React.createContext<string | undefined>(undefined);

function useTOCActiveId(): string | undefined {
  return React.useContext(TOCContext);
}

export interface SidebarTOCProps {
  /** 감시할 섹션의 DOM id 목록 (문서 등장 순서). */
  sectionIds: string[];
  /** IntersectionObserver rootMargin. 기본값은 뷰포트 상단 20% 지점에서 활성 전환. */
  rootMargin?: string;
  /** 관측 대상이 될 스크롤 컨테이너. 기본은 viewport. */
  root?: Element | null;
  /** 초기 활성 섹션. 지정하지 않으면 sectionIds[0]. */
  defaultActiveId?: string;
  /** 외부에서 활성 섹션 변경을 관찰하고 싶을 때. (URL 해시 동기화 등) */
  onActiveChange?: (id: string | undefined) => void;
  children: React.ReactNode;
}

export function SidebarTOC({
  sectionIds,
  rootMargin = "-20% 0px -70% 0px",
  root = null,
  defaultActiveId,
  onActiveChange,
  children,
}: SidebarTOCProps) {
  const [activeId, setActiveId] = React.useState<string | undefined>(
    defaultActiveId ?? sectionIds[0]
  );

  const idsKey = sectionIds.join("|");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (sectionIds.length === 0) return;

    const visible = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.set(id, entry);
          else visible.delete(id);
        }

        if (visible.size === 0) return;

        let topId: string | undefined;
        let topY = Number.POSITIVE_INFINITY;
        visible.forEach((entry, id) => {
          const y = entry.boundingClientRect.top;
          if (y < topY) {
            topY = y;
            topId = id;
          }
        });
        if (topId) setActiveId(topId);
      },
      { rootMargin, root, threshold: 0 }
    );

    const ids = idsKey.split("|").filter(Boolean);
    ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
      .forEach((el) => observer.observe(el));

    // 스크롤 컨테이너가 끝에 도달하면 마지막 섹션을 강제 활성화.
    // (마지막 섹션이 컨테이너보다 작아서 트리거 라인까지 올라오지 못하는 케이스 보정)
    const scrollTarget: Element | Window =
      root ?? (typeof window !== "undefined" ? window : (null as never));
    if (!scrollTarget) return () => observer.disconnect();

    const handleScroll = () => {
      const lastId = ids[ids.length - 1];
      if (!lastId) return;
      const el =
        root ??
        (document.scrollingElement as HTMLElement | null) ??
        document.documentElement;
      const scrollTop = "scrollTop" in el ? el.scrollTop : 0;
      const clientHeight =
        "clientHeight" in el ? el.clientHeight : window.innerHeight;
      const scrollHeight = "scrollHeight" in el ? el.scrollHeight : 0;
      if (scrollTop + clientHeight >= scrollHeight - 2) {
        setActiveId(lastId);
      }
    };

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
  }, [idsKey, rootMargin, root]);

  React.useEffect(() => {
    onActiveChange?.(activeId);
  }, [activeId, onActiveChange]);

  return (
    <TOCContext.Provider value={activeId}>
      {children}
    </TOCContext.Provider>
  );
}
