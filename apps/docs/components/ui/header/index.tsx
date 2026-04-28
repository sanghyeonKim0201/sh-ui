"use client";

import * as React from "react";
import "./styles.css";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

type HeaderCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const HeaderContext = React.createContext<HeaderCtx | null>(null);

function useHeader(): HeaderCtx {
  const ctx = React.useContext(HeaderContext);
  if (!ctx) {
    throw new Error("Header 하위 컴포넌트는 <Header> 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}

/* ───────── Root ─────────
 * mode 판정은 CSS 미디어 쿼리에 위임(`--bp-md` 기준).
 * 이 컴포넌트는 open/close 상태만 관리한다.
 */

/**
 * 사이트 상단 헤더(`<header>`). 데스크탑에서는 inline nav, 모바일에서는 햄버거 + drawer로
 * CSS가 자동 전환한다. 컴포넌트는 open/close 상태와 body 스크롤 잠금만 담당.
 */
export const Header = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    /**
     * 모바일 drawer 초기 상태 (비제어 모드).
     * @default false
     */
    defaultOpen?: boolean;
    /** 모바일 drawer 열림 상태 (제어 모드). 지정 시 내부 state 대신 이 값이 우선. */
    open?: boolean;
    /** drawer 열림 변경 콜백. 제어 모드에서는 이 안에서 외부 상태를 업데이트해야 한다. */
    onOpenChange?: (open: boolean) => void;
  }
>(function Header(
  { children, className, defaultOpen = false, open: openProp, onOpenChange, ...props },
  ref,
) {
  const isControlled = openProp !== undefined;
  const [internal, setInternal] = React.useState(defaultOpen);
  const open = isControlled ? openProp : internal;
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setInternal(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange],
  );

  // drawer 열림 동안 body 스크롤 잠금
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <HeaderContext.Provider value={{ open, setOpen }}>
      <header
        ref={ref}
        className={cx("sh-ui-header", className)}
        data-drawer-open={open ? "" : undefined}
        {...props}
      >
        {children}
      </header>
    </HeaderContext.Provider>
  );
});

/* ───────── Brand / Logo / Title ───────── */

/** 좌측 브랜드 영역. HeaderLogo + HeaderTitle을 묶을 때 사용. */
export const HeaderBrand = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HeaderBrand({ className, ...props }, ref) {
  return <div ref={ref} className={cx("sh-ui-header__brand", className)} {...props} />;
});

/** 브랜드 로고 슬롯. SVG 또는 이미지를 자식으로 둔다. */
export const HeaderLogo = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function HeaderLogo({ className, ...props }, ref) {
  return <span ref={ref} className={cx("sh-ui-header__logo", className)} {...props} />;
});

/** 브랜드 텍스트 타이틀. */
export const HeaderTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function HeaderTitle({ className, ...props }, ref) {
  return <span ref={ref} className={cx("sh-ui-header__title", className)} {...props} />;
});

/* ───────── Trigger ─────────
 * 햄버거 버튼. 모바일에서만 표시(CSS로 제어). 클릭 시 drawer 토글.
 */

/** 모바일 햄버거 토글 버튼. CSS 미디어 쿼리로 모바일에서만 노출되며 drawer 열림을 제어한다. */
export const HeaderTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function HeaderTrigger({ className, onClick, children, ...props }, ref) {
  const { open, setOpen } = useHeader();
  return (
    <button
      ref={ref}
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
 * 자식(HeaderItem 등)을 두 곳에 렌더:
 *   - inline nav  (wide 뷰포트)
 *   - drawer      (narrow 뷰포트 + open 상태)
 * CSS가 뷰포트에 맞춰 하나만 보이도록 처리한다.
 */

/**
 * 내비게이션 영역. 자식을 inline nav와 mobile drawer 두 곳에 동시에 렌더하며
 * CSS가 뷰포트에 따라 한 쪽만 보여준다.
 */
export const HeaderNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(function HeaderNav({ className, children, ...props }, ref) {
  const { open, setOpen } = useHeader();
  return (
    <>
      <nav
        ref={ref}
        className={cx("sh-ui-header__nav", className)}
        {...props}
      >
        {children}
      </nav>
      {/* Drawer backdrop */}
      <div
        className="sh-ui-header__backdrop"
        data-open={open ? "" : undefined}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      {/* Drawer panel */}
      <aside
        className="sh-ui-header__drawer"
        data-open={open ? "" : undefined}
        aria-hidden={!open}
      >
        <div className="sh-ui-header__drawer-head">
          <HeaderTrigger />
        </div>
        <nav className="sh-ui-header__drawer-nav">{children}</nav>
      </aside>
    </>
  );
});

/* ───────── Item ───────── */

/** 내비 한 항목(`<a>`). 클릭 시 모바일 drawer가 자동으로 닫힌다. `active`로 현재 위치 강조. */
export const HeaderItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    /**
     * 현재 페이지 표시. `true`면 시각적으로 강조된다.
     * 라우터 활성 상태와 직접 연결해 사용 (예: `active={pathname === href}`).
     *
     * @default false
     */
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

/* ───────── Actions (우측 트레일링) ───────── */

/** 우측 트레일링 액션 영역. 검색·테마 토글·로그인 버튼 등을 둔다. */
export const HeaderActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HeaderActions({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cx("sh-ui-header__actions", className)} {...props} />
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
