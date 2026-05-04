import { style } from "@vanilla-extract/css";

export const header = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  height: "var(--control-md)",
  padding: "0 var(--space-3)",
  background: "var(--background)",
  borderBottom: "1px solid var(--border)",
  transition: "transform var(--duration-base) var(--ease-standard),\n    background-color var(--duration-base) var(--ease-standard)",
  "--sh-ui-header-hover-bg": "var(--background-muted)",
  "--sh-ui-header-blur-opacity": "85%",
  "--sh-ui-header-blur-radius": "16px",
  selectors: {
    "&[data-sticky-hide][data-hidden]": {
      transform: "translateY(-100%)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
    "(max-width: 767px)": {
      gap: "var(--space-2)",
    },
  },
});

export const headerSolid = style({
  background: "var(--background)",
});

export const headerTransparent = style({
  background: "transparent",
  borderBottomColor: "transparent",
  "--sh-ui-header-hover-bg": "color-mix(in srgb, currentColor 14%, transparent)",
});

export const headerBlur = style({
  background: "color-mix(in srgb, var(--background) var(--sh-ui-header-blur-opacity), transparent)",
  backdropFilter: "saturate(180%) blur(var(--sh-ui-header-blur-radius))",
  WebkitBackdropFilter: "saturate(180%) blur(var(--sh-ui-header-blur-radius))",
  "--sh-ui-header-hover-bg": "color-mix(in srgb, currentColor 14%, transparent)",
});

export const header__brand = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  flexShrink: 0,
});

export const header__logo = style({
  display: "inline-flex",
  alignItems: "center",
  color: "var(--foreground)",
});

export const header__title = style({
  fontSize: "var(--text-base)",
  fontWeight: "var(--weight-bold)",
  color: "var(--foreground)",
  letterSpacing: "-0.3px",
});

export const header__trigger = style({
  display: "none",
  alignItems: "center",
  justifyContent: "center",
  width: "2.25rem",
  height: "2.25rem",
  padding: 0,
  background: "transparent",
  border: 0,
  color: "var(--foreground)",
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  transition: "background-color var(--duration-fast)",
  selectors: {
    "&:hover": {
      background: "var(--sh-ui-header-hover-bg)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
  "@media": {
    "(max-width: 767px)": {
      display: "inline-flex",
      order: -1,
    },
  },
});

export const header__nav = style({
  display: "flex",
  alignItems: "center",
  gap: "var(--space-1)",
  flex: 1,
  minWidth: 0,
  overflowX: "auto",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  "@media": {
    "(max-width: 767px)": {
      display: "none",
    },
  },
});

export const header__item = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  padding: "var(--space-2) var(--space-3)",
  fontSize: "var(--text-sm)",
  fontWeight: "var(--weight-medium)",
  color: "var(--foreground-muted)",
  textDecoration: "none",
  background: "transparent",
  border: 0,
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "color var(--duration-fast), background-color var(--duration-fast)",
  selectors: {
    "&:hover": {
      color: "var(--foreground)",
      background: "var(--sh-ui-header-hover-bg)",
    },
    "&[data-active]": {
      color: "var(--foreground)",
      fontWeight: "var(--weight-semibold)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
});

export const header__actions = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  marginLeft: "auto",
  flexShrink: 0,
});

export const headerDesktopOnly = style({
  display: "contents",
  "@media": {
    "(max-width: 767px)": {
      display: "none",
    },
  },
});

export const headerMobileOnly = style({
  display: "none",
  "@media": {
    "(max-width: 767px)": {
      display: "contents",
    },
  },
});

export const headerGroupInline = style({
  display: "contents",
});

export const headerGroupDrawer = style({
  display: "flex",
  flexDirection: "column",
  marginTop: "var(--space-3)",
  selectors: {
    "&:first-child": {
      marginTop: 0,
    },
  },
});

export const headerGroupLabel = style({
  display: "flex",
  alignItems: "center",
  height: "2rem",
  padding: "0 var(--space-2)",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-medium)",
  color: "var(--foreground-muted)",
});

export const headerGroupItems = style({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
});

export const header__menu = style({
  position: "relative",
});

export const headerMenuInline = style({
  display: "inline-block",
});

export const headerMenuTrigger = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  padding: "var(--space-2) var(--space-3)",
  fontSize: "var(--text-sm)",
  fontWeight: "var(--weight-medium)",
  color: "var(--foreground-muted)",
  background: "transparent",
  border: 0,
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "color var(--duration-fast), background-color var(--duration-fast)",
  selectors: {
    "&:hover": {
      color: "var(--foreground)",
      background: "var(--sh-ui-header-hover-bg)",
    },
    "&[data-open]": {
      color: "var(--foreground)",
      background: "var(--sh-ui-header-hover-bg)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
    [`&[data-open] ${header__chevron}`]: {
      transform: "rotate(180deg)",
    },
  },
});

export const header__chevron = style({
  transition: "transform var(--duration-fast) var(--ease-standard)",
});

export const headerMenuContentPortal = style({
  zIndex: "var(--z-dropdown, 50)",
  padding: "var(--space-1)",
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "0 8px 24px -8px rgba(0, 0, 0, 0.18)",
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  color: "var(--foreground)",
  selectors: {
    [`& ${header__item}`]: {
      padding: "var(--space-2) var(--space-3)",
      fontSize: "var(--text-sm)",
    },
  },
});

export const header__backdrop = style({
  display: "none",
  "@media": {
    "(max-width: 767px)": {
      display: "block",
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.25)",
      backdropFilter: "blur(8px)",
      zIndex: "var(--z-overlay)",
      opacity: 0,
      pointerEvents: "none",
      transition: "opacity var(--duration-base) var(--ease-standard)",
      selectors: {
        "&[data-open]": {
          opacity: 1,
          pointerEvents: "auto",
        },
      },
    },
  },
});

export const header__drawer = style({
  display: "none",
  "@media": {
    "(max-width: 767px)": {
      display: "flex",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      width: "min(17.5rem, 85vw)",
      background: "var(--background-subtle)",
      borderRight: "1px solid var(--border)",
      zIndex: "var(--z-modal)",
      transform: "translateX(-100%)",
      transition: "transform var(--duration-base) var(--ease-standard)",
      flexDirection: "column",
      overflowY: "auto",
      selectors: {
        "&[data-open]": {
          transform: "translateX(0)",
        },
        [`& ${header__item}`]: {
          padding: "var(--space-3) var(--space-3)",
          fontSize: "var(--text-sm)",
          borderRadius: "calc(var(--radius) - 2px)",
        },
      },
    },
  },
});

export const headerDrawerHead = style({
  "@media": {
    "(max-width: 767px)": {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "var(--space-2) var(--space-2)",
      borderBottom: "1px solid var(--border)",
    },
  },
});

export const headerDrawerNav = style({
  "@media": {
    "(max-width: 767px)": {
      display: "flex",
      flexDirection: "column",
      padding: "var(--space-2)",
      gap: "1px",
    },
  },
});

export const headerMenuDrawer = style({
  "@media": {
    "(max-width: 767px)": {
      display: "flex",
      flexDirection: "column",
      selectors: {
        [`& > ${headerMenuTrigger}`]: {
          justifyContent: "space-between",
          width: "100%",
          padding: "var(--space-3) var(--space-3)",
        },
        [`& > ${headerMenuContent}`]: {
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-1) 0 var(--space-1) var(--space-4)",
          gap: "1px",
        },
        [`& > ${headerMenuContent}[hidden]`]: {
          display: "none",
        },
      },
    },
  },
});

export const header__group = style({
});

export const headerMenuTriggerLabel = style({
});

export const headerMenuContent = style({
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "header": header,
  "header--solid": headerSolid,
  "header--transparent": headerTransparent,
  "header--blur": headerBlur,
  "header__brand": header__brand,
  "header__logo": header__logo,
  "header__title": header__title,
  "header__trigger": header__trigger,
  "header__nav": header__nav,
  "header__item": header__item,
  "header__actions": header__actions,
  "header__desktop-only": headerDesktopOnly,
  "header__mobile-only": headerMobileOnly,
  "header__group--inline": headerGroupInline,
  "header__group--drawer": headerGroupDrawer,
  "header__group-label": headerGroupLabel,
  "header__group-items": headerGroupItems,
  "header__menu": header__menu,
  "header__menu--inline": headerMenuInline,
  "header__menu-trigger": headerMenuTrigger,
  "header__chevron": header__chevron,
  "header__menu-content--portal": headerMenuContentPortal,
  "header__backdrop": header__backdrop,
  "header__drawer": header__drawer,
  "header__drawer-head": headerDrawerHead,
  "header__drawer-nav": headerDrawerNav,
  "header__menu--drawer": headerMenuDrawer,
  "header__group": header__group,
  "header__menu-trigger-label": headerMenuTriggerLabel,
  "header__menu-content": headerMenuContent,
};
