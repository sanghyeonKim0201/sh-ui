"use client";

import * as React from "react";
import { ChevronRightIcon, PanelLeftIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import "./styles.css";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MOBILE_BREAKPOINT = 768;

/* ───────────── 포커스 트랩 + Esc 닫기 훅 ─────────────
 * `active`가 true일 때:
 *  - 컨테이너 내부로 초기 포커스 이동 (첫 tabbable 요소)
 *  - Tab/Shift+Tab 순환을 컨테이너 안에서 가둠
 *  - Esc 키로 onClose 호출
 *  - 닫힐 때 열기 전 포커스 요소로 복귀 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
) {
  React.useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = (document.activeElement as HTMLElement) ?? null;
    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((el) => el.offsetParent !== null || el === document.activeElement);

    // 초기 포커스 — 첫 tabbable 또는 컨테이너 자체
    const first = focusables()[0];
    if (first) first.focus();
    else {
      container.setAttribute("tabindex", "-1");
      container.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      // 이전에 포커스 되어 있던 요소로 복귀
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, onClose]);
}

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
  /** 현재 열린 보조 패널 id. 없으면 null. */
  activePanel: string | null;
  /** 보조 패널 전환. 같은 id를 다시 주면 닫힌다. */
  setActivePanel: (id: string | null) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.");
  return ctx;
}

/* ───────────── Provider ───────────── */

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 초기 열림 상태. 쿠키 기반 영속화와 함께 쓰려면 서버 컴포넌트에서
   *  `cookies().get("sidebar_state")`를 읽어 주입해야 하이드레이션 레이아웃 시프트가 없다.
   *  예(Next.js):
   *    const s = (await cookies()).get("sidebar_state")?.value;
   *    <SidebarProvider defaultOpen={s !== "false"}>...</SidebarProvider>
   */
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

  const [activePanel, _setActivePanel] = React.useState<string | null>(null);
  const setActivePanel = React.useCallback((id: string | null) => {
    _setActivePanel((prev) => (prev === id ? null : id));
  }, []);

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
    () => ({
      state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar,
      activePanel, setActivePanel,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar, activePanel, setActivePanel]
  );

  const classes = ["sh-ui-sidebar-wrapper", className].filter(Boolean).join(" ");

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={classes}
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

/* ───────────── Sidebar ─────────────
 * Sidebar의 collapsible/variant/side를 자손 컴포넌트(Collapsible 등)에 전파하기 위한 컨텍스트. */

type SidebarRenderCtx = {
  collapsible: "offcanvas" | "icon" | "none";
  variant: "sidebar" | "floating" | "inset";
  side: "left" | "right";
};
const SidebarRenderContext = React.createContext<SidebarRenderCtx>({
  collapsible: "offcanvas",
  variant: "sidebar",
  side: "left",
});
export const useSidebarRender = () => React.useContext(SidebarRenderContext);

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
  const renderCtx = React.useMemo(
    () => ({ collapsible, variant, side }),
    [collapsible, variant, side],
  );

  const wrap = (node: React.ReactNode) => (
    <SidebarRenderContext.Provider value={renderCtx}>{node}</SidebarRenderContext.Provider>
  );

  if (collapsible === "none") {
    const classes = ["sh-ui-sidebar", "sh-ui-sidebar--static", className].filter(Boolean).join(" ");
    return wrap(
      <aside className={classes} data-side={side} data-variant={variant} {...props}>
        {children}
      </aside>
    );
  }

  if (isMobile) {
    return wrap(
      <MobileSidebar
        side={side}
        className={className}
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
        {...props}
      >
        {children}
      </MobileSidebar>
    );
  }

  return wrap(
    <aside
      className={["sh-ui-sidebar", className].filter(Boolean).join(" ")}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      {...props}
    >
      <div className="sh-ui-sidebar__inner">{children}</div>
    </aside>
  );
}

/* ───────────── MobileSidebar (내부 전용) ─────────────
 * 모바일 드로어 전용 래퍼. 포커스 트랩 + Esc 닫기 내장. */
function MobileSidebar({
  side,
  className,
  openMobile,
  setOpenMobile,
  children,
  ...props
}: {
  side: "left" | "right";
  className?: string;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const asideRef = React.useRef<HTMLElement>(null);
  const close = React.useCallback(() => setOpenMobile(false), [setOpenMobile]);
  useFocusTrap(asideRef, openMobile, close);

  return (
    <>
      {openMobile && (
        <div className="sh-ui-sidebar__backdrop" onClick={close} aria-hidden />
      )}
      <aside
        ref={asideRef}
        className={["sh-ui-sidebar", "sh-ui-sidebar--mobile", className]
          .filter(Boolean)
          .join(" ")}
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

/* ───────────── Trigger ───────────── */

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle Sidebar"
      className={["sh-ui-sidebar__trigger", className].filter(Boolean).join(" ")}
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

/* ───────────── Panel (보조 확장 패널) ─────────────
 * SidebarMenuButton의 panelId로 열고 닫는 보조 패널.
 * 사이드바와 Inset 사이에 위치해 데스크탑에서는 Inset을 밀어내고,
 * 모바일에서는 사이드바 드로어 위에 오버레이된다.
 */

export interface SidebarPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** SidebarMenuButton의 panelId와 매칭되는 식별자. */
  id: string;
}

export function SidebarPanel({ id, className, children, ...props }: SidebarPanelProps) {
  const { activePanel, setActivePanel, isMobile } = useSidebar();
  const open = activePanel === id;
  const ref = React.useRef<HTMLElement>(null);
  const close = React.useCallback(() => setActivePanel(null), [setActivePanel]);
  // 모바일에선 오버레이 형태로 뜨므로 dialog 취급 (포커스 트랩 + Esc).
  // 데스크탑에선 인라인 영역이므로 Esc만 걸고 트랩은 생략.
  useFocusTrap(ref, open && isMobile, close);

  React.useEffect(() => {
    if (!open || isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isMobile, close]);

  return (
    <aside
      ref={ref}
      className={["sh-ui-sidebar__panel", className].filter(Boolean).join(" ")}
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
        className="sh-ui-sidebar__panel-close"
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
      className={["sh-ui-sidebar__panel-header", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarPanelContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["sh-ui-sidebar__panel-content", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

/* ───────────── Inset (main content area, paired with variant=inset) ───────────── */

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={["sh-ui-sidebar-inset", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

/* ───────────── Header / Footer / Content / Separator ───────────── */

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["sh-ui-sidebar__header", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["sh-ui-sidebar__footer", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["sh-ui-sidebar__content", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarSeparator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={["sh-ui-sidebar__separator", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

/* ───────────── Group ───────────── */

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["sh-ui-sidebar__group", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["sh-ui-sidebar__group-label", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["sh-ui-sidebar__group-content", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

/* ───────────── Menu ───────────── */

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={["sh-ui-sidebar__menu", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={["sh-ui-sidebar__menu-item", className].filter(Boolean).join(" ")}
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
  /** 보조 패널 트리거. 클릭 시 같은 id의 SidebarPanel을 토글한다. isActive는 activePanel === panelId로 자동 결정. */
  panelId?: string;
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton(
    { className, isActive, size = "md", asChild, sectionId, panelId, onClick, children, ...props },
    ref
  ) {
    const tocActive = useTOCActiveId();
    const ctx = React.useContext(SidebarContext);
    const panelActive = panelId != null && ctx?.activePanel === panelId;
    const resolvedIsActive =
      isActive ??
      (panelId != null ? panelActive : undefined) ??
      (sectionId != null ? tocActive === sectionId : undefined);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && panelId != null && ctx) {
          ctx.setActivePanel(panelId);
        }
      },
      [onClick, panelId, ctx]
    );

    const cls = [
      "sh-ui-sidebar__menu-button",
      `sh-ui-sidebar__menu-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      const merged: Record<string, unknown> = {
        ...props,
        onClick: handleClick,
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
        onClick={handleClick}
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
      className={["sh-ui-sidebar__menu-sub", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={["sh-ui-sidebar__menu-sub-item", className].filter(Boolean).join(" ")}
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
      "sh-ui-sidebar__menu-sub-button",
      `sh-ui-sidebar__menu-sub-button--${size}`,
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
  /** 사이드바가 icon-축소 상태면 자식(Trigger/Content)은 Popover 모드로 전환. */
  flyoutMode: boolean;
  flyoutOpen: boolean;
  setFlyoutOpen: (open: boolean) => void;
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

  // 부모 Sidebar가 collapsed + icon 모드일 때 flyout(팝오버)로 동작.
  const sidebar = React.useContext(SidebarContext);
  const render = useSidebarRender();
  const flyoutMode =
    !!sidebar &&
    !sidebar.isMobile &&
    sidebar.state === "collapsed" &&
    render.collapsible === "icon";

  const [flyoutOpen, setFlyoutOpen] = React.useState(false);
  React.useEffect(() => {
    if (!flyoutMode) setFlyoutOpen(false);
  }, [flyoutMode]);

  const value = React.useMemo(
    () => ({ open, toggle, flyoutMode, flyoutOpen, setFlyoutOpen }),
    [open, toggle, flyoutMode, flyoutOpen],
  );

  // flyout 모드면 Popover로 감싸 Trigger/Content가 자연스럽게 anchor된다.
  if (flyoutMode) {
    return (
      <CollapsibleContext.Provider value={value}>
        <Popover open={flyoutOpen} onOpenChange={setFlyoutOpen}>
          {children}
        </Popover>
      </CollapsibleContext.Provider>
    );
  }

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
  const { open, toggle, flyoutMode, flyoutOpen } = useCollapsible();

  const cls = [
    "sh-ui-sidebar__menu-button",
    `sh-ui-sidebar__menu-button--${size}`,
    "sh-ui-sidebar__collapsible-trigger",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isOpen = flyoutMode ? flyoutOpen : open;

  const content = (
    <>
      {children}
      <ChevronRightIcon className="sh-ui-sidebar__chevron" aria-hidden />
    </>
  );

  // flyout 모드면 Popover가 트리거 anchor/hover/focus 처리 전체를 담당.
  if (flyoutMode) {
    return (
      <PopoverTrigger
        openOnHover
        delay={0}
        closeDelay={150}
        render={(triggerProps) => (
          <button
            {...triggerProps}
            {...props}
            type="button"
            className={cls}
            data-state={isOpen ? "open" : "closed"}
          >
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
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
      {...props}
    >
      {content}
    </button>
  );
}

export function SidebarCollapsibleContent({ children }: { children: React.ReactNode }) {
  const { open, flyoutMode } = useCollapsible();
  const render = useSidebarRender();

  // flyout 모드: Popover의 Content로 래핑. 위치/포커스/바깥 클릭은 Popover가 처리.
  if (flyoutMode) {
    return (
      <PopoverContent
        side={render.side === "right" ? "left" : "right"}
        align="start"
        className="sh-ui-sidebar__collapsible-flyout"
      >
        {children}
      </PopoverContent>
    );
  }

  return (
    <div className="sh-ui-sidebar__collapsible-content" data-state={open ? "open" : "closed"} hidden={!open}>
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
