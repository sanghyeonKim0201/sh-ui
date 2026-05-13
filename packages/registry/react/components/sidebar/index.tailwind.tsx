"use client";

import * as React from "react";
import { cn } from "@SH_UI_UTILS@";
import { ChevronRightIcon, PanelLeftIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MOBILE_BREAKPOINT = 768;

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
      const firstEl = items[0]; const lastEl = items[items.length - 1];
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

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean; setOpen: (open: boolean) => void;
  openMobile: boolean; setOpenMobile: (open: boolean) => void;
  isMobile: boolean; toggleSidebar: () => void;
  activePanel: string | null;
  setActivePanel: (id: string | null) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);
export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.");
  return ctx;
}

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean; open?: boolean;
  onOpenChange?: (open: boolean) => void;
  embedded?: boolean;
}

export function SidebarProvider({
  defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, embedded, ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(open) : value;
    if (setOpenProp) setOpenProp(next); else _setOpen(next);
    if (typeof document !== "undefined") {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }
  }, [open, setOpenProp]);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v);
    else setOpen((v) => !v);
  }, [isMobile, setOpen]);

  const [activePanel, _setActivePanel] = React.useState<string | null>(null);
  const setActivePanel = React.useCallback((id: string | null) => {
    _setActivePanel((prev) => (prev === id ? null : id));
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  const state: "expanded" | "collapsed" = open ? "expanded" : "collapsed";
  const value = React.useMemo<SidebarContextValue>(() => ({
    state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, activePanel, setActivePanel,
  }), [state, open, setOpen, isMobile, openMobile, toggleSidebar, activePanel, setActivePanel]);

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={cn("[--sidebar-width:16rem] [--sidebar-width-icon:3rem] [--sidebar-width-mobile:18rem]",
          "[--sidebar-bg:var(--background-subtle)] [--sidebar-fg:var(--foreground)] [--sidebar-border:var(--border)]",
          "[--sidebar-accent:var(--background-muted)] [--sidebar-accent-fg:var(--foreground)]",
          "flex w-full",
          embedded ? "min-h-0 h-full" : "min-h-[100svh]",
          className)}
        style={style}
        data-embedded={embedded || undefined}
        data-panel-open={activePanel ? "true" : undefined}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarRenderCtx = {
  collapsible: "offcanvas" | "icon" | "none";
  variant: "sidebar" | "floating" | "inset";
  side: "left" | "right";
};
const SidebarRenderContext = React.createContext<SidebarRenderCtx>({ collapsible: "offcanvas", variant: "sidebar", side: "left" });
export const useSidebarRender = () => React.useContext(SidebarRenderContext);

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

const sidebarRoot =
  "flex flex-col w-[var(--sidebar-width)] shrink-0 bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] border-r border-[var(--sidebar-border)] transition-[width] duration-[var(--duration-slow)] relative z-[5] data-[side=right]:border-r-0 data-[side=right]:border-l data-[side=right]:order-1 data-[state=collapsed]:data-[collapsible=offcanvas]:w-0 data-[state=collapsed]:data-[collapsible=offcanvas]:border-r-0 data-[state=collapsed]:data-[collapsible=offcanvas]:border-l-0 data-[state=collapsed]:data-[collapsible=offcanvas]:overflow-hidden data-[state=collapsed]:data-[collapsible=icon]:w-[var(--sidebar-width-icon)] data-[variant=floating]:border-none data-[variant=floating]:p-[var(--space-2)] data-[variant=floating]:bg-transparent data-[variant=inset]:bg-transparent data-[variant=inset]:border-none motion-reduce:transition-none";

export function Sidebar({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const renderCtx = React.useMemo(() => ({ collapsible, variant, side }), [collapsible, variant, side]);
  const wrap = (node: React.ReactNode) => <SidebarRenderContext.Provider value={renderCtx}>{node}</SidebarRenderContext.Provider>;

  if (collapsible === "none") {
    return wrap(
      <aside
        className={cn(sidebarRoot, "h-[100svh] sticky top-0", className)}
        data-side={side}
        data-variant={variant}
        {...props}
      >
        {children}
      </aside>
    );
  }
  if (isMobile) {
    return wrap(<MobileSidebar side={side} className={className} openMobile={openMobile} setOpenMobile={setOpenMobile} {...props}>{children}</MobileSidebar>);
  }

  const innerWrap =
    variant === "floating"
      ? "flex flex-col h-[calc(100svh-1rem)] sticky top-[var(--space-2)] overflow-hidden border border-[var(--sidebar-border)] rounded-[var(--radius)] bg-[var(--sidebar-bg)]"
      : "flex flex-col h-[100svh] sticky top-0 overflow-hidden";

  return wrap(
    <aside
      className={cn(sidebarRoot, className)}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      {...props}
    >
      <div className={innerWrap}>{children}</div>
    </aside>
  );
}

function MobileSidebar({ side, className, openMobile, setOpenMobile, children, ...props }: {
  side: "left" | "right"; className?: string;
  openMobile: boolean; setOpenMobile: (open: boolean) => void;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const asideRef = React.useRef<HTMLElement>(null);
  const close = React.useCallback(() => setOpenMobile(false), [setOpenMobile]);
  useFocusTrap(asideRef, openMobile, close);

  return (
    <>
      {openMobile && (
        <div className="fixed inset-0 bg-black/25 [backdrop-filter:blur(8px)] z-40" onClick={close} aria-hidden />
      )}
      <aside
        ref={asideRef}
        className={cn("fixed top-0 bottom-0 w-[var(--sidebar-width-mobile)] z-[var(--z-overlay)] transition-transform duration-[var(--duration-slow)] flex flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] motion-reduce:transition-none",
          side === "left"
            ? "left-0 border-r border-[var(--sidebar-border)] data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full"
            : "right-0 border-l border-[var(--sidebar-border)] data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full",
          className)}
        data-side={side}
        data-state={openMobile ? "open" : "closed"}
        role="dialog"
        aria-modal={openMobile ? "true" : undefined}
        aria-hidden={!openMobile || undefined}
        {...props}
      >
        {children}
      </aside>
    </>
  );
}

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle Sidebar"
      className={cn("inline-flex items-center justify-center w-8 h-8 border border-transparent bg-transparent text-foreground-muted rounded-[calc(var(--radius)-2px)] cursor-pointer transition-[background-color,color,border-color] duration-[var(--duration-fast)] hover:bg-[var(--sidebar-accent)] hover:text-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 motion-reduce:transition-none",
        className)}
      onClick={(e) => { onClick?.(e); toggleSidebar(); }}
      {...props}
    >
      <PanelLeftIcon size={16} aria-hidden />
    </button>
  );
}

export interface SidebarPanelProps extends React.HTMLAttributes<HTMLDivElement> { id: string; }

export function SidebarPanel({ id, className, children, ...props }: SidebarPanelProps) {
  const { activePanel, setActivePanel, isMobile } = useSidebar();
  const open = activePanel === id;
  const ref = React.useRef<HTMLElement>(null);
  const close = React.useCallback(() => setActivePanel(null), [setActivePanel]);
  useFocusTrap(ref, open && isMobile, close);

  React.useEffect(() => {
    if (!open || isMobile) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isMobile, close]);

  return (
    <aside
      ref={ref}
      className={cn("[--sidebar-panel-width:20rem] flex flex-col w-[var(--sidebar-panel-width)] shrink-0 bg-background border-r border-[var(--sidebar-border)] relative z-[4] overflow-hidden animate-[sh-ui-sidebar-panel-in_180ms_ease-out] data-[state=closed]:hidden max-md:fixed max-md:top-0 max-md:bottom-0 max-md:left-0 max-md:w-[min(var(--sidebar-panel-width),90vw)] max-md:z-[var(--z-modal)] max-md:shadow-[var(--shadow-xl)] motion-reduce:animate-none",
        className)}
      data-state={open ? "open" : "closed"}
      role={isMobile ? "dialog" : undefined}
      aria-modal={open && isMobile ? "true" : undefined}
      hidden={!open}
      {...props}
    >
      {children}
      <button
        type="button"
        aria-label="패널 닫기"
        className="absolute top-[var(--space-2)] right-[var(--space-2)] inline-flex items-center justify-center w-8 h-8 border-0 rounded-[calc(var(--radius)-2px)] bg-transparent text-foreground-muted text-[length:var(--text-lg)] leading-none cursor-pointer transition-[background-color,color] duration-[var(--duration-fast)] hover:bg-[var(--sidebar-accent)] hover:text-foreground motion-reduce:transition-none"
        onClick={close}
      >
        ×
      </button>
    </aside>
  );
}

export function SidebarPanelHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-[var(--space-2)] py-3.5 px-[var(--space-4)] border-b border-[var(--sidebar-border)] font-semibold text-[0.9375rem]", className)}
      {...props}
    />
  );
}

export function SidebarPanelContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 min-h-0 overflow-y-auto py-[var(--space-3)] px-[var(--space-4)] pb-[var(--space-4)]", className)}
      {...props}
    />
  );
}

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <main className={cn("flex-1 min-w-0 bg-background flex flex-col", className)} {...props} />;
}

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "stack" */
  align?: "stack" | "topbar";
  /** @default false */
  divider?: boolean;
}

export function SidebarHeader({ className, align = "stack", divider = false, ...props }: SidebarHeaderProps) {
  const base = align === "topbar"
    ? "flex flex-row items-center gap-[var(--space-2)] h-14 px-[var(--space-3)] overflow-hidden"
    : "flex flex-col gap-[var(--space-2)] p-[var(--space-2)] overflow-hidden";
  return (
    <div
      className={cn(base, divider && "border-b border-[var(--sidebar-border)]", className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-[var(--space-2)] p-[var(--space-2)] overflow-hidden", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col flex-1 min-h-0 overflow-y-auto gap-0", className)} {...props} />;
}

export function SidebarSeparator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("my-[var(--space-1)] mx-[var(--space-2)] border-0 border-t border-[var(--sidebar-border)] w-auto", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col p-[var(--space-2)] min-w-0", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center h-8 px-[var(--space-2)] text-[length:var(--text-xs)] font-medium text-foreground-muted rounded-[calc(var(--radius)-2px)] [[data-state=collapsed][data-collapsible=icon]_&]:hidden",
        className)}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full text-[length:var(--text-sm)]", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("list-none m-0 p-0 flex flex-col min-w-0 gap-0.5", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("relative m-0", className)} {...props} />;
}

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  /**
   * 다른 엘리먼트(예: Next.js `Link`)로 대체. sh-ui 의 슬롯 패턴은 `render` 로 통일.
   *
   *   <SidebarMenuButton render={<Link href='/'>홈</Link>} />
   */
  render?: React.ReactElement;
  sectionId?: string;
  panelId?: string;
}

const menuButtonBase =
  "flex w-full items-center gap-[var(--space-2)] p-[var(--space-2)] text-left text-[length:var(--text-sm)] text-[var(--sidebar-fg)] bg-transparent border-none rounded-[calc(var(--radius)-2px)] cursor-pointer transition-[background-color,color] duration-[var(--duration-fast)] no-underline font-[inherit] leading-snug [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0 [&>span]:flex-1 [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:[text-overflow:ellipsis] [&>span]:whitespace-nowrap hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-fg)] focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:[outline-offset:-2px] data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:font-semibold data-[active]:hover:bg-primary-hover disabled:opacity-[var(--opacity-disabled)] disabled:pointer-events-none aria-disabled:opacity-[var(--opacity-disabled)] aria-disabled:pointer-events-none [[data-state=collapsed][data-collapsible=icon]_&]:justify-center [[data-state=collapsed][data-collapsible=icon]_&]:p-[var(--space-2)] [[data-state=collapsed][data-collapsible=icon]_&>span]:hidden motion-reduce:transition-none";

const menuButtonSize = {
  sm: "h-7 py-[var(--space-1)] px-[var(--space-2)] text-[0.8125rem]",
  md: "",
  lg: "p-[var(--space-3)] text-[0.9375rem]",
};

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton({ className, isActive, size = "sm", render, sectionId, panelId, onClick, children, ...props }, ref) {
    const tocActive = useTOCActiveId();
    const ctx = React.useContext(SidebarContext);
    const panelActive = panelId != null && ctx?.activePanel === panelId;
    const resolvedIsActive = isActive ?? (panelId != null ? panelActive : undefined) ?? (sectionId != null ? tocActive === sectionId : undefined);

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented && panelId != null && ctx) ctx.setActivePanel(panelId);
    }, [onClick, panelId, ctx]);

    const cls = cn(menuButtonBase, menuButtonSize[size], className);

    if (render && React.isValidElement(render)) {
      const child = render as React.ReactElement<{ className?: string; children?: React.ReactNode; "data-active"?: string | boolean }>;
      const childDataActive = child.props["data-active"];
      const dataActive = childDataActive !== undefined ? childDataActive : resolvedIsActive || undefined;
      return React.cloneElement(
        child,
        {
          ref,
          ...props,
          onClick: handleClick,
          className: cn(child.props.className, cls),
          "data-active": dataActive,
        } as Record<string, unknown>,
        children ?? child.props.children,
      );
    }

    return (
      <button ref={ref} type="button" className={cls} data-active={resolvedIsActive || undefined} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);

export function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("list-none mt-0.5 ml-3.5 pt-0.5 pr-0 pb-0.5 pl-2.5 border-l border-[var(--sidebar-border)] flex flex-col gap-0.5 min-w-0 [[data-state=collapsed][data-collapsible=icon]_&]:hidden",
        className)}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("relative", className)} {...props} />;
}

export interface SidebarMenuSubButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  size?: "sm" | "md";
  /**
   * 다른 anchor 컴포넌트(예: Next.js `Link`)로 대체. sh-ui 의 슬롯 패턴은 `render` 로 통일.
   */
  render?: React.ReactElement;
  sectionId?: string;
}

const menuSubButtonBase =
  "flex items-center gap-[var(--space-2)] h-7 px-[var(--space-2)] rounded-[calc(var(--radius)-2px)] text-[0.8125rem] text-[var(--sidebar-fg)] no-underline transition-[background-color,color] duration-[var(--duration-fast)] min-w-0 [&>span]:flex-1 [&>span]:min-w-0 [&>span]:overflow-hidden [&>span]:[text-overflow:ellipsis] [&>span]:whitespace-nowrap hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-fg)] data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:font-semibold data-[active]:hover:bg-primary-hover motion-reduce:transition-none";

export const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  function SidebarMenuSubButton({ className, isActive, size = "sm", render, sectionId, children, ...props }, ref) {
    const tocActive = useTOCActiveId();
    const resolvedIsActive = isActive ?? (sectionId != null ? tocActive === sectionId : undefined);
    const cls = cn(menuSubButtonBase, size === "sm" && "text-[length:var(--text-xs)]", className);

    if (render && React.isValidElement(render)) {
      const child = render as React.ReactElement<{ className?: string; children?: React.ReactNode; "data-active"?: string | boolean }>;
      const childDataActive = child.props["data-active"];
      const dataActive = childDataActive !== undefined ? childDataActive : resolvedIsActive || undefined;
      return React.cloneElement(
        child,
        {
          ref,
          ...props,
          className: cn(child.props.className, cls),
          "data-active": dataActive,
        } as Record<string, unknown>,
        children ?? child.props.children,
      );
    }

    return <a ref={ref} className={cls} data-active={resolvedIsActive || undefined} {...props}>{children}</a>;
  }
);

type CollapsibleContextValue = {
  open: boolean; toggle: () => void;
  flyoutMode: boolean;
  flyoutOpen: boolean; setFlyoutOpen: (open: boolean) => void;
};
const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);
function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error("SidebarCollapsible 하위에서만 사용할 수 있습니다.");
  return ctx;
}

export interface SidebarCollapsibleProps {
  defaultOpen?: boolean; open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function SidebarCollapsible({ defaultOpen = false, open: openProp, onOpenChange, children }: SidebarCollapsibleProps) {
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const toggle = React.useCallback(() => {
    const next = !open;
    if (onOpenChange) onOpenChange(next); else _setOpen(next);
  }, [open, onOpenChange]);

  const sidebar = React.useContext(SidebarContext);
  const render = useSidebarRender();
  const flyoutMode = !!sidebar && !sidebar.isMobile && sidebar.state === "collapsed" && render.collapsible === "icon";
  const [flyoutOpen, setFlyoutOpen] = React.useState(false);

  React.useEffect(() => { if (!flyoutMode) setFlyoutOpen(false); }, [flyoutMode]);

  const value = React.useMemo(() => ({ open, toggle, flyoutMode, flyoutOpen, setFlyoutOpen }), [open, toggle, flyoutMode, flyoutOpen]);

  if (flyoutMode) {
    return (
      <CollapsibleContext.Provider value={value}>
        <Popover open={flyoutOpen} onOpenChange={setFlyoutOpen}>{children}</Popover>
      </CollapsibleContext.Provider>
    );
  }
  return <CollapsibleContext.Provider value={value}>{children}</CollapsibleContext.Provider>;
}

export interface SidebarCollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

export function SidebarCollapsibleTrigger({ className, size = "sm", children, onClick, ...props }: SidebarCollapsibleTriggerProps) {
  const { open, toggle, flyoutMode, flyoutOpen } = useCollapsible();
  const cls = cn(menuButtonBase, menuButtonSize[size], className);
  const isOpen = flyoutMode ? flyoutOpen : open;

  const content = (
    <>
      {children}
      <ChevronRightIcon className="!w-3.5 !h-3.5 ml-auto shrink-0 transition-transform duration-[150ms] [[data-state=open]_&]:rotate-90 text-foreground-muted [[data-state=collapsed][data-collapsible=icon]_&]:hidden motion-reduce:transition-none" aria-hidden />
    </>
  );

  if (flyoutMode) {
    return (
      <PopoverTrigger
        openOnHover
        delay={0}
        closeDelay={150}
        render={(triggerProps: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
          <button {...triggerProps} {...props} type="button" className={cls} data-state={isOpen ? "open" : "closed"}>
            {content}
          </button>
        )}
      />
    );
  }

  return (
    <button
      type="button"
      className={cls}
      data-state={isOpen ? "open" : "closed"}
      aria-expanded={open}
      onClick={(e) => { onClick?.(e); toggle(); }}
      {...props}
    >
      {content}
    </button>
  );
}

export function SidebarCollapsibleContent({ children }: { children: React.ReactNode }) {
  const { open, flyoutMode } = useCollapsible();
  const render = useSidebarRender();

  if (flyoutMode) {
    return (
      <PopoverContent
        side={render.side === "right" ? "left" : "right"}
        align="start"
        className="[&_ul]:!flex [&_ul]:!flex-col [&_ul]:gap-0.5 [&_ul]:m-0 [&_ul]:p-0 [&_ul]:border-l-0 [&_a]:pl-2.5"
      >
        {children}
      </PopoverContent>
    );
  }
  return (
    <div className="data-[state=closed]:hidden [[data-state=collapsed][data-collapsible=icon]_&]:hidden" data-state={open ? "open" : "closed"} hidden={!open}>
      {children}
    </div>
  );
}

const TOCContext = React.createContext<string | undefined>(undefined);
function useTOCActiveId(): string | undefined { return React.useContext(TOCContext); }

export interface SidebarTOCProps {
  sectionIds: string[];
  rootMargin?: string;
  root?: Element | null;
  defaultActiveId?: string;
  onActiveChange?: (id: string | undefined) => void;
  children: React.ReactNode;
}

export function SidebarTOC({ sectionIds, rootMargin = "-20% 0px -70% 0px", root = null, defaultActiveId, onActiveChange, children }: SidebarTOCProps) {
  const [activeId, setActiveId] = React.useState<string | undefined>(defaultActiveId ?? sectionIds[0]);
  const idsKey = sectionIds.join("|");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (sectionIds.length === 0) return;
    const visible = new Map<string, IntersectionObserverEntry>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) visible.set(id, entry); else visible.delete(id);
      }
      if (visible.size === 0) return;
      let topId: string | undefined; let topY = Number.POSITIVE_INFINITY;
      visible.forEach((entry, id) => {
        const y = entry.boundingClientRect.top;
        if (y < topY) { topY = y; topId = id; }
      });
      if (topId) setActiveId(topId);
    }, { rootMargin, root, threshold: 0 });

    const ids = idsKey.split("|").filter(Boolean);
    ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null).forEach((el) => observer.observe(el));

    const scrollTarget: Element | Window = root ?? (typeof window !== "undefined" ? window : (null as never));
    if (!scrollTarget) return () => observer.disconnect();

    const handleScroll = () => {
      const lastId = ids[ids.length - 1]; if (!lastId) return;
      const el = root ?? (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
      const scrollTop = "scrollTop" in el ? el.scrollTop : 0;
      const clientHeight = "clientHeight" in el ? el.clientHeight : window.innerHeight;
      const scrollHeight = "scrollHeight" in el ? el.scrollHeight : 0;
      if (scrollTop + clientHeight >= scrollHeight - 2) setActiveId(lastId);
    };

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
  }, [idsKey, rootMargin, root]);

  React.useEffect(() => { onActiveChange?.(activeId); }, [activeId, onActiveChange]);

  return <TOCContext.Provider value={activeId}>{children}</TOCContext.Provider>;
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-sidebar]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-sidebar", "");
  style.textContent = `@keyframes sh-ui-sidebar-panel-in { from { transform: translateX(-8px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`;
  document.head.appendChild(style);
}
