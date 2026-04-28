"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import "./styles.css";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ───────── useFocusTrap ─────────
 * drawer 가 열려 있을 때만 활성. 첫 tabbable 로 포커스 이동, Tab 순환,
 * ESC 로 닫기, 닫힐 때 이전 포커스 복원.
 */
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
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

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
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, onClose]);
}

/* ───────── Context ───────── */

type HeaderCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const HeaderContext = React.createContext<HeaderCtx | null>(null);

function useHeader(): HeaderCtx {
  const ctx = React.useContext(HeaderContext);
  if (!ctx) {
    throw new Error("Header 하위 컴포넌트는 <Header> 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}

/** 자식이 inline nav 안에 있는지 drawer 안에 있는지 알리는 컨텍스트 — HeaderMenu 가 모드 전환에 사용. */
type NavLocation = "inline" | "drawer";
const NavLocationContext = React.createContext<NavLocation>("inline");

/**
 * HeaderNav 의 `value`(현재 경로 등) 와 매칭 함수를 자식 HeaderItem 에 전파하는 컨텍스트.
 * HeaderItem 의 `active` 가 명시되지 않으면 이 컨텍스트를 통해 자동 계산된다.
 */
type NavMatch = {
  value: string | undefined;
  match: (itemHref: string, value: string) => boolean;
};

/**
 * 기본 매칭 — exact equality 또는 prefix match (`/docs` 항목이 `/docs/intro` 에서도 활성).
 * 단, root(`"/"`/`""`) 는 prefix 가 모든 경로에 매칭돼버리는 걸 막기 위해 exact 일 때만 활성.
 */
const defaultNavMatch = (itemHref: string, value: string): boolean => {
  if (itemHref === value) return true;
  if (itemHref === "" || itemHref === "/") return false;
  return value.startsWith(itemHref + "/");
};

const NavMatchContext = React.createContext<NavMatch>({
  value: undefined,
  match: defaultNavMatch,
});

/* ───────── Root ───────── */

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * 모바일 drawer 초기 상태 (비제어 모드).
   * @default false
   */
  defaultOpen?: boolean;
  /** 모바일 drawer 열림 상태 (제어 모드). 지정 시 내부 state 대신 이 값이 우선. */
  open?: boolean;
  /** drawer 열림 변경 콜백. */
  onOpenChange?: (open: boolean) => void;
  /**
   * 배경 표현 — 기본은 단색. transparent 는 hero 위 등 투명 배경, blur 는 반투명 + backdrop-filter.
   *
   * blur 의 불투명도/반경은 CSS 변수로 instance 별 조정 가능 — 컴포넌트 카피본 수정 없이
   * `style={{ "--sh-ui-header-blur-opacity": "92%", "--sh-ui-header-blur-radius": "20px" }}` 처럼.
   *
   * @default "solid"
   */
  variant?: "solid" | "transparent" | "blur";
  /**
   * 스크롤 다운 시 헤더를 자동으로 숨기고, 위로 스크롤하면 다시 노출.
   * `position: sticky` 와 함께 쓰는 걸 전제로 한다. 가장 가까운 스크롤 가능 조상을
   * 자동 감지해 그 컨테이너의 scroll 이벤트에 반응하며, `prefers-reduced-motion: reduce`
   * 환경에서는 슬라이드 애니메이션이 즉시 toggle 로 대체된다.
   *
   * @default false
   */
  stickyHide?: boolean;
  /**
   * stickyHide 가 활성일 때, 이 픽셀만큼 스크롤 다운한 뒤부터 숨김 동작 시작.
   * @default 80
   */
  stickyHideThreshold?: number;
}

/**
 * 사이트 상단 헤더(`<header>`). 데스크탑에서는 inline nav, 모바일에서는 햄버거 + drawer 로
 * CSS 가 자동 전환된다. drawer 가 열리면 focus trap · ESC 닫기 · 트리거로 포커스 복원이 활성.
 */
/** 가장 가까운 스크롤 가능 조상을 찾는다. 없으면 window 폴백. */
function findScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let node = el?.parentElement ?? null;
  while (node) {
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    if ((oy === "auto" || oy === "scroll" || oy === "overlay") && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

function getScrollY(target: HTMLElement | Window): number {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(function Header(
  {
    children,
    className,
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    variant = "solid",
    stickyHide = false,
    stickyHideThreshold = 80,
    ...props
  },
  ref,
) {
  const isControlled = openProp !== undefined;
  const [internal, setInternal] = React.useState(defaultOpen);
  const open = isControlled ? openProp : internal;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const headerRef = React.useRef<HTMLElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      headerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setInternal(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange],
  );

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    if (!stickyHide) {
      setHidden(false);
      return;
    }
    const target = findScrollParent(headerRef.current);
    let lastY = getScrollY(target);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = getScrollY(target);
        const delta = y - lastY;
        if (y < stickyHideThreshold) {
          setHidden(false);
        } else if (delta > 4) {
          setHidden(true);
        } else if (delta < -4) {
          setHidden(false);
        }
        lastY = y;
        ticking = false;
      });
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [stickyHide, stickyHideThreshold]);

  const ctx = React.useMemo<HeaderCtx>(
    () => ({ open, setOpen, triggerRef }),
    [open, setOpen],
  );

  return (
    <HeaderContext.Provider value={ctx}>
      <header
        ref={setRefs}
        className={cx("sh-ui-header", `sh-ui-header--${variant}`, className)}
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

/* ───────── Brand / Logo / Title ───────── */

export const HeaderBrand = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HeaderBrand({ className, ...props }, ref) {
  return <div ref={ref} className={cx("sh-ui-header__brand", className)} {...props} />;
});

export const HeaderLogo = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function HeaderLogo({ className, ...props }, ref) {
  return <span ref={ref} className={cx("sh-ui-header__logo", className)} {...props} />;
});

export const HeaderTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function HeaderTitle({ className, ...props }, ref) {
  return <span ref={ref} className={cx("sh-ui-header__title", className)} {...props} />;
});

/* ───────── Trigger ─────────
 * 햄버거 버튼. CSS 미디어 쿼리로 모바일에서만 노출. drawer 토글.
 */

export const HeaderTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function HeaderTrigger({ className, onClick, children, ...props }, ref) {
  const { open, setOpen, triggerRef } = useHeader();

  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ref, triggerRef],
  );

  return (
    <button
      ref={setRefs}
      type="button"
      className={cx("sh-ui-header__trigger", className)}
      aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
      aria-expanded={open}
      data-open={open ? "" : undefined}
      onClick={(e) => {
        setOpen(!open);
        onClick?.(e);
      }}
      {...props}
    >
      {children ?? (open ? <CloseIcon /> : <MenuIcon />)}
    </button>
  );
});

/* ───────── Nav ─────────
 * 자식을 inline nav 와 drawer 두 곳에 렌더하며 CSS 가 뷰포트에 따라 한쪽만 노출.
 * 각 렌더 위치를 NavLocationContext 로 전파해 HeaderMenu 가 dropdown vs collapsible 모드를 자동 선택.
 *
 * `value` + `match` 로 자식 HeaderItem 의 active 를 일괄 관리할 수 있다 — 항목마다 active 비교를
 * 반복하는 대신 부모가 진실원천 한 군데에서 결정한다 (Tabs/RadioGroup 와 같은 패턴).
 */

export interface HeaderNavProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * 현재 활성 경로/키 (예: Next.js usePathname() 결과). 자식 HeaderItem 의 `href` 와 비교해
   * `data-active` 가 자동 부여된다. 자식에 `active` prop 이 명시되면 그게 우선.
   */
  value?: string;
  /**
   * 매칭 함수 커스터마이즈. 기본은 exact 또는 prefix(`/docs` 가 `/docs/intro` 에서도 활성).
   * root(`/`/`""`) 는 prefix 매칭에서 제외된다 — 모든 경로에 매칭되는 걸 막기 위해.
   */
  match?: (itemHref: string, value: string) => boolean;
}

export const HeaderNav = React.forwardRef<HTMLElement, HeaderNavProps>(
  function HeaderNav({ value, match, className, children, ...props }, ref) {
    const { open, setOpen } = useHeader();
    const drawerRef = React.useRef<HTMLElement | null>(null);

    const close = React.useCallback(() => setOpen(false), [setOpen]);
    useFocusTrap(drawerRef, open, close);

    const navMatch = React.useMemo<NavMatch>(
      () => ({ value, match: match ?? defaultNavMatch }),
      [value, match],
    );

    return (
      <NavMatchContext.Provider value={navMatch}>
        <NavLocationContext.Provider value="inline">
          <nav ref={ref} className={cx("sh-ui-header__nav", className)} {...props}>
            {children}
          </nav>
        </NavLocationContext.Provider>

        <div
          className="sh-ui-header__backdrop"
          data-open={open ? "" : undefined}
          onClick={close}
          aria-hidden
        />
        <aside
          ref={drawerRef}
          className="sh-ui-header__drawer"
          data-open={open ? "" : undefined}
          aria-hidden={!open}
          role="dialog"
          aria-modal="true"
          aria-label="메뉴"
        >
          <div className="sh-ui-header__drawer-head">
            <HeaderTrigger />
          </div>
          <NavLocationContext.Provider value="drawer">
            <nav className="sh-ui-header__drawer-nav">{children}</nav>
          </NavLocationContext.Provider>
        </aside>
      </NavMatchContext.Provider>
    );
  },
);

/* ───────── Item ───────── */

export const HeaderItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    /**
     * 활성 상태. 명시하지 않으면 부모 `HeaderNav` 의 `value` 와 자기 `href` 를 비교해 자동 계산된다.
     * 명시적으로 `active={true}` / `active={false}` 를 주면 자동 계산보다 우선.
     */
    active?: boolean;
  }
>(function HeaderItem({ className, active, onClick, href, ...props }, ref) {
  const { setOpen } = useHeader();
  const navMatch = React.useContext(NavMatchContext);

  const computedActive =
    active !== undefined
      ? active
      : navMatch.value !== undefined && href !== undefined
        ? navMatch.match(href, navMatch.value)
        : false;

  return (
    <a
      ref={ref}
      href={href}
      className={cx("sh-ui-header__item", className)}
      data-active={computedActive ? "" : undefined}
      aria-current={computedActive ? "page" : undefined}
      onClick={(e) => {
        setOpen(false);
        onClick?.(e);
      }}
      {...props}
    />
  );
});

/* ───────── Actions ───────── */

export const HeaderActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HeaderActions({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cx("sh-ui-header__actions", className)} {...props} />
  );
});

/* ───────── 반응형 가시성 유틸 ─────────
 * HeaderNav 와 달리 자식을 drawer 로 옮기지 않고 단순히 가시성만 토글한다.
 * display: contents 라 부모의 flex/grid 흐름을 그대로 유지 — wrapper 가 레이아웃에 잡히지 않음.
 */

/** 데스크탑(≥768px) 에서만 보이는 슬롯. 모바일에서는 자식이 통째로 사라진다 (drawer 로 이동하지 않음). */
export const HeaderDesktopOnly = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HeaderDesktopOnly({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cx("sh-ui-header__desktop-only", className)} {...props} />
  );
});

/** 모바일(<768px) 에서만 보이는 슬롯. 데스크탑에서는 자식이 통째로 사라진다. 사용자 정의 drawer 트리거 등에 사용. */
export const HeaderMobileOnly = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HeaderMobileOnly({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cx("sh-ui-header__mobile-only", className)} {...props} />
  );
});

/* ───────── NavGroup (drawer 안 섹션 라벨) ─────────
 * inline nav 에서는 자식만 펼쳐 평면으로 렌더(라벨 숨김), drawer 에서는 라벨 + 들여쓴 항목으로 렌더.
 */

export interface HeaderNavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 그룹 섹션 라벨. drawer 모드에서만 보인다. */
  label?: React.ReactNode;
}

/** drawer 안에서 nav 항목을 섹션으로 묶는다. inline 모드에서는 라벨 없이 자식만 펼쳐 렌더. */
export const HeaderNavGroup = React.forwardRef<HTMLDivElement, HeaderNavGroupProps>(
  function HeaderNavGroup({ className, label, children, ...props }, ref) {
    const location = React.useContext(NavLocationContext);
    if (location === "inline") {
      return (
        <div
          ref={ref}
          className={cx("sh-ui-header__group sh-ui-header__group--inline", className)}
          {...props}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cx("sh-ui-header__group sh-ui-header__group--drawer", className)}
        role="group"
        aria-label={typeof label === "string" ? label : undefined}
        {...props}
      >
        {label != null && (
          <div className="sh-ui-header__group-label">{label}</div>
        )}
        <div className="sh-ui-header__group-items">{children}</div>
      </div>
    );
  },
);

/* ───────── Menu (서브메뉴) ─────────
 * desktop (inline) 에서는 절대 위치 dropdown, drawer 안에서는 collapsible.
 * 동일한 자식 트리를 두 모드 모두 동일하게 렌더.
 */

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

/** 드롭다운/콜랩서블 서브메뉴 wrapper. <HeaderMenuTrigger> + <HeaderMenuContent> 와 함께 사용. */
export function HeaderMenu({
  children,
  className,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** drawer 모드에서 collapsible 의 초기 펼침 상태. */
  defaultOpen?: boolean;
}) {
  const location = React.useContext(NavLocationContext);
  const [open, setOpen] = React.useState(location === "drawer" ? defaultOpen : false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const triggerId = React.useId();
  const contentId = React.useId();

  // dropdown 모드에서만 외부 클릭 닫기 + ESC 닫기.
  // portal 로 띄운 content 는 containerRef 의 자식이 아니므로 contentRef 도 별도 검사.
  React.useEffect(() => {
    if (location !== "inline") return;
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, location]);

  // location 이 inline ↔ drawer 로 바뀔 때 reset
  React.useEffect(() => {
    if (location === "inline") setOpen(false);
  }, [location]);

  const ctx = React.useMemo<MenuCtx>(
    () => ({ open, setOpen, triggerId, contentId, location, triggerRef, contentRef }),
    [open, triggerId, contentId, location],
  );

  return (
    <MenuContext.Provider value={ctx}>
      <div
        ref={containerRef}
        className={cx(
          "sh-ui-header__menu",
          `sh-ui-header__menu--${location}`,
          open && "is-open",
          className,
        )}
        data-open={open ? "" : undefined}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
}

/** HeaderMenu 토글 버튼. HeaderItem 과 비슷한 룩, 우측에 chevron. */
export const HeaderMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function HeaderMenuTrigger({ className, children, onClick, ...props }, ref) {
  const { open, setOpen, triggerId, contentId, triggerRef } = useMenu();

  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ref, triggerRef],
  );

  return (
    <button
      ref={setRefs}
      type="button"
      id={triggerId}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={contentId}
      data-open={open ? "" : undefined}
      className={cx("sh-ui-header__menu-trigger", className)}
      onClick={(e) => {
        setOpen(!open);
        onClick?.(e);
      }}
      {...props}
    >
      <span className="sh-ui-header__menu-trigger-label">{children}</span>
      <ChevronDownIcon />
    </button>
  );
});

/** HeaderMenu 의 펼쳐지는 본문. inline 모드에서는 document.body 로 portal — 부모 overflow 클리핑을 회피한다. */
export const HeaderMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HeaderMenuContent({ className, children, style, ...props }, ref) {
  const { open, contentId, triggerId, location, triggerRef, contentRef } = useMenu();

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref, contentRef],
  );

  // drawer 모드 — 트리거 바로 아래 inline 으로 펼쳐지는 collapsible.
  if (location === "drawer") {
    return (
      <div
        ref={setRefs}
        id={contentId}
        role="menu"
        aria-labelledby={triggerId}
        data-open={open ? "" : undefined}
        hidden={!open}
        className={cx("sh-ui-header__menu-content", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }

  // inline 모드 — document.body 로 portal + 트리거 위치 추종
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [pos, setPos] = React.useState<{ top: number; left: number; minWidth: number }>({
    top: 0,
    left: 0,
    minWidth: 0,
  });

  React.useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
      });
    };
    update();
    // capture: true 로 모든 스크롤 컨테이너 변화를 잡아 재배치
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
      className={cx("sh-ui-header__menu-content sh-ui-header__menu-content--portal", className)}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        minWidth: Math.max(pos.minWidth, 192),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
});

/* ───────── 기본 아이콘 ───────── */

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="sh-ui-header__chevron">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
