"use client";

import * as React from "react";
import { cn } from "@SH_UI_UTILS@";
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
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (!firstEl || !lastEl) {
        e.preventDefault();
        return;
      }
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

/** Sidebar의 open/state·toggle·activePanel 등을 읽고 쓰기 위한 훅. SidebarProvider 내부에서만 호출 가능. */
export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.");
  return ctx;
}

/* ───────────── Provider ───────────── */

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 초기 열림 상태 (비제어 모드). 쿠키 기반 영속화와 함께 쓰려면 서버 컴포넌트에서
   * `cookies().get("sidebar_state")`를 읽어 주입해야 hydration 레이아웃 시프트가 없다.
   *
   * @default true
   * @example
   * // Next.js App Router
   * const s = (await cookies()).get("sidebar_state")?.value;
   * <SidebarProvider defaultOpen={s !== "false"}>...</SidebarProvider>
   */
  defaultOpen?: boolean;
  /** 열림 상태 (제어 모드). 지정 시 내부 state 대신 이 값이 우선. */
  open?: boolean;
  /** 열림 변경 콜백. 제어 모드에서는 이 안에서 외부 상태를 업데이트해야 한다. */
  onOpenChange?: (open: boolean) => void;
  /**
   * 부모 컨테이너 안에 임베드. `100svh` 대신 부모 크기를 따른다. 문서 데모·iframe 등에 사용.
   *
   * @default false
   */
  embedded?: boolean;
}

/**
 * Sidebar 영역 전체를 감싸는 Provider. open/closed 상태 관리, 모바일 감지, ⌘/Ctrl+B 단축키,
 * 쿠키 영속화, 보조 패널 상태를 담당한다. 반드시 Sidebar 사용 영역 바깥에 한 번 두어야 한다.
 */
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

  const classes = cn("sh-ui-sidebar-wrapper", className);

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
/** 부모 Sidebar의 collapsible/variant/side를 자식에서 읽는 훅. Collapsible 등 내부에서 사용. */
export const useSidebarRender = () => React.useContext(SidebarRenderContext);

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 좌/우 배치.
   * @default "left"
   */
  side?: "left" | "right";
  /**
   * 외형 변형.
   * - `sidebar` — 가장자리에 붙는 기본 사이드바 (기본)
   * - `floating` — 카드처럼 띄워 여백·radius 적용
   * - `inset` — 사이드바는 가장자리에 붙고 메인 콘텐츠(`SidebarInset`)가 둥근 카드
   *
   * @default "sidebar"
   */
  variant?: "sidebar" | "floating" | "inset";
  /**
   * 접힘(collapsed) 동작.
   * - `offcanvas` — 사이드바가 화면 밖으로 슬라이드 아웃 (기본)
   * - `icon` — 아이콘만 보이는 좁은 폭으로 축소. hover 시 메뉴 flyout
   * - `none` — 접기 비활성. 항상 펼친 상태
   *
   * @default "offcanvas"
   */
  collapsible?: "offcanvas" | "icon" | "none";
}

/**
 * 좌/우 사이드바 컨테이너. `collapsible`로 접힘 동작(offcanvas/icon/none),
 * `variant`로 외형(sidebar/floating/inset), `side`로 좌우 배치를 결정한다. 모바일에서는
 * 자동으로 drawer로 전환되며 포커스 트랩·Esc 닫힘이 활성화된다.
 */
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
    const classes = cn("sh-ui-sidebar", "sh-ui-sidebar--static", className);
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
      className={cn("sh-ui-sidebar", className)}
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
        className={cn("sh-ui-sidebar", "sh-ui-sidebar--mobile", className)}
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

/** Sidebar 토글 버튼. 데스크탑에서는 expand/collapse, 모바일에서는 drawer open/close. */
export function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle Sidebar"
      className={cn("sh-ui-sidebar__trigger", className)}
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
  /**
   * `SidebarMenuButton`의 `panelId`와 매칭되는 식별자.
   * 이 id를 가진 버튼이 클릭되면 패널이 열린다.
   */
  id: string;
}

/**
 * SidebarMenuButton의 `panelId`로 열고 닫는 보조 패널. 데스크탑에서는 인라인 영역,
 * 모바일에서는 dialog 오버레이로 전환되며 포커스 트랩과 Esc 닫힘이 자동 적용된다.
 */
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
      className={cn("sh-ui-sidebar__panel", className)}
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

/** SidebarPanel 상단 헤더 슬롯. */
export function SidebarPanelHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__panel-header", className)}
      {...props}
    />
  );
}

/** SidebarPanel의 본문 영역. */
export function SidebarPanelContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__panel-content", className)}
      {...props}
    />
  );
}

/* ───────────── Inset (main content area, paired with variant=inset) ───────────── */

/** Sidebar 옆 메인 컨텐츠 영역(`<main>`). variant="inset"과 짝을 이뤄 사용. */
export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn("sh-ui-sidebar-inset", className)}
      {...props}
    />
  );
}

/* ───────────── Header / Footer / Content / Separator ───────────── */

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 헤더 레이아웃 모드.
   * - `stack` (기본) — 세로 쌓기. 로고 + 검색 등을 위아래로.
   * - `topbar` — 우측 Topbar 와 같은 56px 가로 행. admin/dashboard 에서 좌 Sidebar 헤더와
   *   우 Topbar 의 구분선을 한 줄로 정렬할 때 사용.
   * @default "stack"
   */
  align?: "stack" | "topbar";
  /**
   * 헤더 하단에 1px 구분선. 별도 `SidebarSeparator` 없이 헤더-콘텐츠 경계를 그릴 때.
   * `align="topbar"` 와 조합하면 우측 Topbar 의 border-bottom 과 정확히 정렬된다.
   * @default false
   */
  divider?: boolean;
}

/** Sidebar 상단 영역. 로고/검색/topbar-align 모드 지원. */
export function SidebarHeader({ className, align = "stack", divider = false, ...props }: SidebarHeaderProps) {
  return (
    <div
      data-align={align}
      data-divider={divider ? "true" : undefined}
      className={cn("sh-ui-sidebar__header", className)}
      {...props}
    />
  );
}

/** Sidebar 하단 영역. 사용자 정보·테마 토글 등을 둔다. */
export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__footer", className)}
      {...props}
    />
  );
}

/* ───────────── Brand (compound primitive, v0.84.0+) ─────────────
 * SidebarHeader / SidebarFooter 의 흔한 패턴 (브랜드 카드 · 워크스페이스 스위처 ·
 * 유저 프로필) 의 90% 를 커버. data-when-collapsed 컨벤션을 내장해 사용자가
 * attribute 박지 않아도 collapsed/icon 모드 자동 적응.
 *
 * 정적 예시:
 *   <SidebarBrand>
 *     <SidebarBrandIcon><Logo /></SidebarBrandIcon>
 *     <SidebarBrandText>
 *       <SidebarBrandTitle>Atlas</SidebarBrandTitle>
 *       <SidebarBrandSubtitle>workspace</SidebarBrandSubtitle>
 *     </SidebarBrandText>
 *   </SidebarBrand>
 *
 * 인터랙티브 (워크스페이스 스위처):
 *   <DropdownMenu>
 *     <DropdownMenuTrigger render={<button data-when-collapsed='strip-chrome' />}>
 *       <SidebarBrand>...</SidebarBrand>
 *     </DropdownMenuTrigger>
 *     ...
 *   </DropdownMenu>
 */

/** 브랜드 행 wrapper. collapsed 일 땐 가운데 정렬 + 좌우 padding 0 (data-when-collapsed=center 내장). */
export function SidebarBrand({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-when-collapsed="center"
      className={cn("sh-ui-sidebar__brand", className)}
      {...props}
    />
  );
}

/** 항상 visible 한 아이콘 슬롯. collapsed 일 땐 SidebarBrand 의 유일한 요소. */
export function SidebarBrandIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__brand-icon", className)}
      {...props}
    />
  );
}

/** 텍스트 컨테이너. collapsed 일 땐 hidden (data-when-collapsed=hide 내장). */
export function SidebarBrandText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-when-collapsed="hide"
      className={cn("sh-ui-sidebar__brand-text", className)}
      {...props}
    />
  );
}

/** 단일 줄 본문 (편의) — sh-ui-sidebar__brand-title 클래스만 박는다. */
export function SidebarBrandTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__brand-title", className)}
      {...props}
    />
  );
}

/** 보조 줄 — sh-ui-sidebar__brand-subtitle. text-foreground-muted + text-xs. */
export function SidebarBrandSubtitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__brand-subtitle", className)}
      {...props}
    />
  );
}

/** Trailing icon (드롭다운 chevron 등). collapsed 일 땐 hidden. */
export function SidebarBrandAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-when-collapsed="hide"
      className={cn("sh-ui-sidebar__brand-action", className)}
      {...props}
    />
  );
}

/** Sidebar의 스크롤 영역. 메뉴/그룹 목록을 둔다. */
export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__content", className)}
      {...props}
    />
  );
}

/** Sidebar 영역 사이의 시각적 구분선(`<hr>`). */
export function SidebarSeparator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("sh-ui-sidebar__separator", className)}
      {...props}
    />
  );
}

/* ───────────── Group ───────────── */

/** 의미적으로 묶이는 메뉴 그룹. SidebarGroupLabel + SidebarGroupContent와 함께 사용. */
export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__group", className)}
      {...props}
    />
  );
}

/** 그룹의 카테고리 라벨. */
export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__group-label", className)}
      {...props}
    />
  );
}

/** 그룹 내부의 항목 컨테이너. */
export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sh-ui-sidebar__group-content", className)}
      {...props}
    />
  );
}

/* ───────────── Menu ───────────── */

/** 메뉴 리스트(`<ul>`). SidebarMenuItem을 자식으로 갖는다. */
export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("sh-ui-sidebar__menu", className)}
      {...props}
    />
  );
}

/** 메뉴 항목(`<li>`). SidebarMenuButton과 (선택) SidebarMenuSub를 자식으로 둔다. */
export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn("sh-ui-sidebar__menu-item", className)}
      {...props}
    />
  );
}

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 활성 상태(현재 페이지/섹션). 명시 안 해도 `sectionId`/`panelId` 매칭으로 자동 추론된다.
   */
  isActive?: boolean;
  /**
   * 크기.
   * - `sm` — 컴팩트 메뉴
   * - `md` — 일반 (기본)
   * - `lg` — 강조 메뉴
   *
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 다른 엘리먼트(예: Next.js `Link`)로 대체. 자체로 `<button>` 을 렌더하므로
   * 자식으로 또 다른 button/anchor 를 넣지 말 것. sh-ui 의 모든 슬롯 패턴은
   * `render` 로 통일 (Base UI 표준).
   *
   *   <SidebarMenuButton render={<Link href='/'>홈</Link>} />
   */
  render?: React.ReactElement;
  /**
   * `SidebarTOC` 안에서 활성 섹션 id를 자동 동기화. 이 값과 TOC active id가 일치하면
   * `isActive`가 자동으로 `true`가 된다.
   */
  sectionId?: string;
  /**
   * 보조 패널 트리거. 지정 시 클릭으로 같은 id의 `SidebarPanel`을 토글하고,
   * `activePanel === panelId`일 때 `isActive`가 자동으로 `true`가 된다.
   */
  panelId?: string;
}

/**
 * 메뉴 한 줄을 누를 수 있는 버튼. `render` prop 으로 `<a>` 등 다른 엘리먼트로
 * 슬롯 가능 (Next.js Link 결합). `sectionId`/`panelId` 로 활성 상태 자동 결정.
 *
 *   <SidebarMenuButton render={<Link href='/projects'>All projects</Link>} />
 */
export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton(
    { className, isActive, size = "sm", render, sectionId, panelId, onClick, children, ...props },
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

    const cls = cn("sh-ui-sidebar__menu-button",
      `sh-ui-sidebar__menu-button--${size}`,
      className);

    if (render && React.isValidElement(render)) {
      const child = render as React.ReactElement<{
        className?: string;
        children?: React.ReactNode;
        "data-active"?: string | boolean;
      }>;
      // 자식이 명시한 data-active 가 있으면 보존 (사용자가 자기 디자인 시스템의
      // active state 를 data-active 셀렉터로 다루는 경우). 그 외엔 sh-ui 의
      // 자동 추론값 사용.
      const childDataActive = child.props["data-active"];
      const dataActive =
        childDataActive !== undefined
          ? childDataActive
          : resolvedIsActive || undefined;
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

/** 메뉴 항목 내부의 서브 메뉴 리스트. SidebarMenuItem 안에 둔다. */
export function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("sh-ui-sidebar__menu-sub", className)}
      {...props}
    />
  );
}

/** 서브 메뉴 항목(`<li>`). */
export function SidebarMenuSubItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn("sh-ui-sidebar__menu-sub-item", className)}
      {...props}
    />
  );
}

export interface SidebarMenuSubButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 활성 상태. 명시 안 해도 `sectionId` 매칭으로 자동 추론된다. */
  isActive?: boolean;
  /**
   * 크기.
   * @default "sm"
   */
  size?: "sm" | "md";
  /**
   * 다른 anchor 컴포넌트(예: Next.js `Link`)로 대체. sh-ui 의 모든 슬롯
   * 패턴은 `render` 로 통일 (Base UI 표준).
   *
   *   <SidebarMenuSubButton render={<Link href='/...'>서브</Link>} />
   */
  render?: React.ReactElement;
  /** `SidebarTOC`의 활성 섹션 id 자동 동기화. 일치하면 `isActive`가 자동으로 `true`. */
  sectionId?: string;
}

/** 서브 메뉴 항목 내부의 링크. `render` prop 으로 다른 엘리먼트 슬롯 가능. `sectionId`로 TOC 활성 연동. */
export const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  function SidebarMenuSubButton(
    { className, isActive, size = "sm", render, sectionId, children, ...props },
    ref
  ) {
    const tocActive = useTOCActiveId();
    const resolvedIsActive =
      isActive ?? (sectionId != null ? tocActive === sectionId : undefined);
    const cls = cn("sh-ui-sidebar__menu-sub-button",
      `sh-ui-sidebar__menu-sub-button--${size}`,
      className);

    if (render && React.isValidElement(render)) {
      const child = render as React.ReactElement<{
        className?: string;
        children?: React.ReactNode;
        "data-active"?: string | boolean;
      }>;
      // 자식이 명시한 data-active 우선 (자기 디자인 시스템 호환).
      const childDataActive = child.props["data-active"];
      const dataActive =
        childDataActive !== undefined
          ? childDataActive
          : resolvedIsActive || undefined;
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
  /**
   * 초기 펼침 상태 (비제어 모드).
   * @default false
   */
  defaultOpen?: boolean;
  /** 펼침 상태 (제어 모드). 지정 시 내부 state 대신 이 값이 우선. */
  open?: boolean;
  /** 펼침 변경 콜백. */
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * 메뉴 안에서 펼침/접힘 상태를 가진 그룹. Sidebar가 icon-축소 상태이면 자동으로 flyout(Popover) 모드로
 * 전환되어 hover/focus 시 우측에 메뉴를 띄운다.
 */
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
  /**
   * 크기. 부모 메뉴와 시각 위계를 맞춘다.
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
}

/** Collapsible을 토글하는 메뉴 버튼. flyout 모드면 Popover Trigger로 자동 위임된다. */
export function SidebarCollapsibleTrigger({
  className,
  size = "sm",
  children,
  onClick,
  ...props
}: SidebarCollapsibleTriggerProps) {
  const { open, toggle, flyoutMode, flyoutOpen } = useCollapsible();

  const cls = cn("sh-ui-sidebar__menu-button",
    `sh-ui-sidebar__menu-button--${size}`,
    "sh-ui-sidebar__collapsible-trigger",
    className);

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
        render={(triggerProps: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
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

/** Collapsible의 펼쳐지는 본문. flyout 모드면 PopoverContent로 자동 래핑된다. */
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
    <div
      className="sh-ui-sidebar__collapsible-content"
      data-state={open ? "open" : "closed"}
      inert={!open}
      aria-hidden={!open || undefined}
    >
      <div className="sh-ui-sidebar__collapsible-content-inner">{children}</div>
    </div>
  );
}

/* ───────────── TOC (Table of Contents — 페이지 내 섹션 스크롤 활성화) ─────────────
 *
 * 사용 예:
 *   <SidebarTOC sectionIds={["intro", "install", "usage"]}>
 *     <SidebarMenu>
 *       <SidebarMenuItem>
 *         <SidebarMenuButton sectionId="intro" render={<a href="#intro">Intro</a>} />
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
  /** 감시할 섹션의 DOM `id` 목록. 문서 등장 순서대로 나열할 것. */
  sectionIds: string[];
  /**
   * `IntersectionObserver` rootMargin. 어느 지점에서 섹션이 "활성"으로 전환되는지 결정.
   * 기본값은 뷰포트 상단 20% / 하단 70% 지점.
   *
   * @default "-20% 0px -70% 0px"
   */
  rootMargin?: string;
  /**
   * 관측 대상 스크롤 컨테이너.
   * @default null (뷰포트)
   */
  root?: Element | null;
  /**
   * 초기 활성 섹션 id.
   * @default sectionIds[0]
   */
  defaultActiveId?: string;
  /** 활성 섹션 변경 콜백. URL 해시 동기화 등 외부 연동 용도. */
  onActiveChange?: (id: string | undefined) => void;
  children: React.ReactNode;
}

/**
 * 페이지 내 섹션 스크롤 위치를 IntersectionObserver로 추적해 활성 섹션 id를 자식에게 전달한다.
 * 자식 SidebarMenuButton/SidebarMenuSubButton에 `sectionId`만 지정하면 활성 강조가 자동 동기화된다.
 */
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
