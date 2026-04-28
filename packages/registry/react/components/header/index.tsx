"use client";

import * as React from "react";
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
   * @default "solid"
   * @beta variant 와 stickyHide 는 베타 — API 가 v1 전에 바뀔 수 있다.
   */
  variant?: "solid" | "transparent" | "blur";
  /**
   * 스크롤 다운 시 헤더를 자동으로 숨기고, 위로 스크롤하면 다시 노출.
   * `position: sticky` 와 함께 쓰는 걸 전제로 한다.
   *
   * @default false
   * @beta variant 와 stickyHide 는 베타 — API 가 v1 전에 바뀔 수 있다.
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
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [stickyHide, stickyHideThreshold]);

  const ctx = React.useMemo<HeaderCtx>(
    () => ({ open, setOpen, triggerRef }),
    [open, setOpen],
  );

  return (
    <HeaderContext.Provider value={ctx}>
      <header
        ref={ref}
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
 */

export const HeaderNav = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function HeaderNav({ className, children, ...props }, ref) {
    const { open, setOpen } = useHeader();
    const drawerRef = React.useRef<HTMLElement | null>(null);

    const close = React.useCallback(() => setOpen(false), [setOpen]);
    useFocusTrap(drawerRef, open, close);

    return (
      <>
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
      </>
    );
  },
);

/* ───────── Item ───────── */

export const HeaderItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** 현재 페이지 표시. */
    active?: boolean;
  }
>(function HeaderItem({ className, active, onClick, href, ...props }, ref) {
  const { setOpen } = useHeader();
  return (
    <a
      ref={ref}
      href={href}
      className={cx("sh-ui-header__item", className)}
      data-active={active ? "" : undefined}
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
  const triggerId = React.useId();
  const contentId = React.useId();

  // dropdown 모드에서만 외부 클릭 닫기 + ESC 닫기
  React.useEffect(() => {
    if (location !== "inline") return;
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const c = containerRef.current;
      if (c && !c.contains(e.target as Node)) setOpen(false);
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
    () => ({ open, setOpen, triggerId, contentId, location }),
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
  const { open, setOpen, triggerId, contentId } = useMenu();
  return (
    <button
      ref={ref}
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

/** HeaderMenu 의 펼쳐지는 본문. 안에 <HeaderItem> 등을 둔다. */
export const HeaderMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HeaderMenuContent({ className, children, ...props }, ref) {
  const { open, contentId, triggerId } = useMenu();
  return (
    <div
      ref={ref}
      id={contentId}
      role="menu"
      aria-labelledby={triggerId}
      data-open={open ? "" : undefined}
      hidden={!open}
      className={cx("sh-ui-header__menu-content", className)}
      {...props}
    >
      {children}
    </div>
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
