import { style, keyframes } from "@vanilla-extract/css";

export const shUiSidebarPanelIn = keyframes({
  "from": {
    transform: "translateX(-8px)",
    opacity: 0,
  },
  "to": {
    transform: "translateX(0)",
    opacity: 1,
  },
});

export const sidebarWrapper = style({
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
  "--sidebar-width-mobile": "18rem",
  "--sidebar-bg": "var(--background-subtle)",
  "--sidebar-fg": "var(--foreground)",
  "--sidebar-border": "var(--border)",
  "--sidebar-accent": "var(--background-muted)",
  "--sidebar-accent-fg": "var(--foreground)",
  display: "flex",
  minHeight: "100svh",
  width: "100%",
  selectors: {
    "&[data-embedded]": {
      minHeight: 0,
      height: "100%",
    },
    [`&[data-embedded] ${sidebar__inner}`]: {
      height: "100%",
      position: "relative",
      top: 0,
    },
    [`&[data-embedded] ${sidebarStatic}`]: {
      height: "100%",
      position: "relative",
      top: 0,
    },
    [`&[data-embedded] ${sidebarMobile}`]: {
      position: "absolute",
    },
    [`&[data-embedded] ${sidebar__backdrop}`]: {
      position: "absolute",
    },
    [`&[data-embedded] ${sidebar__panel}`]: {
      position: "relative",
    },
  },
});

export const sidebar = style({
  display: "flex",
  flexDirection: "column",
  width: "var(--sidebar-width)",
  flexShrink: 0,
  background: "var(--sidebar-bg)",
  color: "var(--sidebar-fg)",
  borderRight: "1px solid var(--sidebar-border)",
  transition: "width var(--duration-slow) ease",
  position: "relative",
  zIndex: 5,
  selectors: {
    "&[data-side="right"]": {
      borderRight: "none",
      borderLeft: "1px solid var(--sidebar-border)",
      order: 1,
    },
    "&[data-state="collapsed"][data-collapsible="offcanvas"]": {
      width: 0,
      borderRightWidth: 0,
      borderLeftWidth: 0,
      overflow: "hidden",
    },
    "&[data-state="collapsed"][data-collapsible="icon"]": {
      width: "var(--sidebar-width-icon)",
    },
    [`&[data-state="collapsed"][data-collapsible="icon"] ${sidebarGroupLabel}`]: {
      display: "none",
    },
    [`&[data-state="collapsed"][data-collapsible="icon"] ${sidebarMenuButton} > span`]: {
      display: "none",
    },
    [`&[data-state="collapsed"][data-collapsible="icon"] ${sidebarMenuSub}`]: {
      display: "none",
    },
    [`&[data-state="collapsed"][data-collapsible="icon"] ${sidebarMenuButton}`]: {
      justifyContent: "center",
      padding: "var(--space-2)",
    },
    "&[data-variant="floating"]": {
      border: "none",
      padding: "var(--space-2)",
      background: "transparent",
    },
    [`&[data-variant="floating"] ${sidebar__inner}`]: {
      border: "1px solid var(--sidebar-border)",
      borderRadius: "var(--radius)",
      background: "var(--sidebar-bg)",
      height: "calc(100svh - 1rem)",
      top: "var(--space-2)",
    },
    "&[data-variant="inset"]": {
      background: "transparent",
      border: "none",
    },
    [`&[data-state="collapsed"][data-collapsible="icon"] ${sidebar__chevron}`]: {
      display: "none",
    },
    [`&[data-state="collapsed"][data-collapsible="icon"] ${sidebarCollapsibleContent}`]: {
      display: "none",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const sidebar__inner = style({
  display: "flex",
  flexDirection: "column",
  height: "100svh",
  position: "sticky",
  top: 0,
  overflow: "hidden",
});

export const sidebarStatic = style({
  height: "100svh",
  position: "sticky",
  top: 0,
});

export const sidebarMobile = style({
  position: "fixed",
  top: 0,
  bottom: 0,
  width: "var(--sidebar-width-mobile)",
  zIndex: "var(--z-overlay)",
  transition: "transform var(--duration-slow) ease",
  borderRight: "1px solid var(--sidebar-border)",
  selectors: {
    "&[data-side="left"]": {
      left: 0,
      transform: "translateX(-100%)",
    },
    "&[data-side="right"]": {
      right: 0,
      transform: "translateX(100%)",
      borderRight: "none",
      borderLeft: "1px solid var(--sidebar-border)",
    },
    "&[data-state="open"]": {
      transform: "translateX(0)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const sidebar__backdrop = style({
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.25)",
  backdropFilter: "blur(8px)",
  zIndex: 40,
});

export const sidebar__trigger = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  border: "1px solid transparent",
  background: "transparent",
  color: "var(--foreground-muted)",
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  transition: "background-color var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast)",
  selectors: {
    "&:hover": {
      background: "var(--sidebar-accent)",
      color: "var(--foreground)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "2px",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const sidebar__panel = style({
  "--sidebar-panel-width": "20rem",
  display: "flex",
  flexDirection: "column",
  width: "var(--sidebar-panel-width)",
  flexShrink: 0,
  background: "var(--background)",
  borderRight: "1px solid var(--sidebar-border)",
  position: "relative",
  zIndex: 4,
  overflow: "hidden",
  animation: "sh-ui-sidebar-panel-in 180ms ease",
  selectors: {
    "&[data-state="closed"]": {
      display: "none",
    },
  },
  "@media": {
    "(max-width: 47.9375rem)": {
      position: "fixed",
      top: 0,
      bottom: 0,
      left: 0,
      width: "min(var(--sidebar-panel-width), 90vw)",
      zIndex: "var(--z-modal)",
      borderRight: "1px solid var(--sidebar-border)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    },
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const sidebarPanelHeader = style({
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "0.875rem var(--space-4)",
  borderBottom: "1px solid var(--sidebar-border)",
  fontWeight: "var(--weight-semibold)",
  fontSize: "0.9375rem",
});

export const sidebarPanelContent = style({
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  padding: "var(--space-3) var(--space-4) var(--space-4)",
});

export const sidebarPanelClose = style({
  position: "absolute",
  top: "var(--space-2)",
  right: "var(--space-2)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  border: 0,
  borderRadius: "calc(var(--radius) - 2px)",
  background: "transparent",
  color: "var(--foreground-muted)",
  fontSize: "var(--text-lg)",
  lineHeight: 1,
  cursor: "pointer",
  transition: "background-color var(--duration-fast), color var(--duration-fast)",
  selectors: {
    "&:hover": {
      background: "var(--sidebar-accent)",
      color: "var(--foreground)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const sidebarInset = style({
  flex: "1 1 0%",
  minWidth: 0,
  background: "var(--background)",
  display: "flex",
  flexDirection: "column",
});

export const sidebar__header = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  padding: "var(--space-2)",
  overflow: "hidden",
});

export const sidebar__footer = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  padding: "var(--space-2)",
  overflow: "hidden",
});

export const sidebar__content = style({
  display: "flex",
  flexDirection: "column",
  flex: "1 1 0%",
  minHeight: 0,
  overflowY: "auto",
  gap: 0,
});

export const sidebar__separator = style({
  margin: "var(--space-1) var(--space-2)",
  border: "none",
  borderTop: "1px solid var(--sidebar-border)",
  width: "auto",
});

export const sidebar__group = style({
  display: "flex",
  flexDirection: "column",
  padding: "var(--space-2)",
  minWidth: 0,
});

export const sidebarGroupLabel = style({
  display: "flex",
  alignItems: "center",
  height: "2rem",
  padding: "0 var(--space-2)",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-medium)",
  color: "var(--foreground-muted)",
  borderRadius: "calc(var(--radius) - 2px)",
});

export const sidebarGroupContent = style({
  width: "100%",
  fontSize: "var(--text-sm)",
});

export const sidebar__menu = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  gap: 0,
});

export const sidebarMenuItem = style({
  position: "relative",
  margin: 0,
});

export const sidebarMenuButton = style({
  display: "flex",
  width: "100%",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2)",
  textAlign: "left",
  fontSize: "var(--text-sm)",
  color: "var(--sidebar-fg)",
  background: "transparent",
  border: "none",
  borderRadius: "calc(var(--radius) - 2px)",
  cursor: "pointer",
  transition: "background-color var(--duration-fast), color var(--duration-fast)",
  textDecoration: "none",
  fontFamily: "inherit",
  lineHeight: 1.4,
  selectors: {
    "& > svg": {
      width: "1rem",
      height: "1rem",
      flexShrink: 0,
    },
    "& > span": {
      flex: "1 1 0%",
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    "&:hover": {
      background: "var(--sidebar-accent)",
      color: "var(--sidebar-accent-fg)",
    },
    "&:focus-visible": {
      outline: "var(--border-width-strong) solid var(--foreground)",
      outlineOffset: "-2px",
    },
    "&[data-active]": {
      background: "var(--primary)",
      color: "var(--primary-foreground)",
      fontWeight: "var(--weight-semibold)",
    },
    "&[data-active]:hover": {
      background: "var(--primary-hover)",
      color: "var(--primary-foreground)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      pointerEvents: "none",
    },
    "&[aria-disabled="true"]": {
      opacity: "var(--opacity-disabled)",
      pointerEvents: "none",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const sidebarMenuButtonSm = style({
  height: "1.75rem",
  padding: "var(--space-1) var(--space-2)",
  fontSize: "0.8125rem",
});

export const sidebarMenuButtonLg = style({
  padding: "var(--space-3)",
  fontSize: "0.9375rem",
});

export const sidebarMenuSub = style({
  listStyle: "none",
  margin: "0.125rem 0 0",
  padding: "0.125rem 0 0.125rem 0.625rem",
  marginLeft: "0.875rem",
  borderLeft: "1px solid var(--sidebar-border)",
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
  minWidth: 0,
});

export const sidebarMenuSubItem = style({
  position: "relative",
});

export const sidebarMenuSubButton = style({
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  height: "1.75rem",
  padding: "0 var(--space-2)",
  borderRadius: "calc(var(--radius) - 2px)",
  fontSize: "0.8125rem",
  color: "var(--sidebar-fg)",
  textDecoration: "none",
  transition: "background-color var(--duration-fast), color var(--duration-fast)",
  minWidth: 0,
  selectors: {
    "& > span": {
      flex: "1 1 0%",
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    "&:hover": {
      background: "var(--sidebar-accent)",
      color: "var(--sidebar-accent-fg)",
    },
    "&[data-active]": {
      background: "var(--primary)",
      color: "var(--primary-foreground)",
      fontWeight: "var(--weight-semibold)",
    },
    "&[data-active]:hover": {
      background: "var(--primary-hover)",
      color: "var(--primary-foreground)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const sidebarMenuSubButtonSm = style({
  fontSize: "var(--text-xs)",
});

export const sidebar__chevron = style({
  width: "0.875rem !important",
  height: "0.875rem !important",
  marginLeft: "auto",
  flexShrink: 0,
  transition: "transform 150ms ease",
  color: "var(--foreground-muted)",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const sidebarCollapsibleTrigger = style({
  selectors: {
    [`&[data-state="open"] ${sidebar__chevron}`]: {
      transform: "rotate(90deg)",
    },
  },
});

export const sidebarCollapsibleContent = style({
  selectors: {
    "&[data-state="closed"]": {
      display: "none",
    },
  },
});

export const sidebarCollapsibleFlyout = style({
  selectors: {
    [`& ${sidebarMenuSub}`]: {
      display: "flex !important",
      flexDirection: "column",
      gap: "0.125rem",
      margin: 0,
      padding: 0,
      borderLeft: 0,
    },
    [`& ${sidebarMenuSubButton}`]: {
      paddingLeft: "0.625rem",
    },
  },
});

/** 동적 키로 클래스 참조용 — `byKey[\`badge--${variant}\`]` 같은 패턴 지원. */
export const byKey: Record<string, string> = {
  "sidebar-wrapper": sidebarWrapper,
  "sidebar": sidebar,
  "sidebar__inner": sidebar__inner,
  "sidebar--static": sidebarStatic,
  "sidebar--mobile": sidebarMobile,
  "sidebar__backdrop": sidebar__backdrop,
  "sidebar__trigger": sidebar__trigger,
  "sidebar__panel": sidebar__panel,
  "sidebar__panel-header": sidebarPanelHeader,
  "sidebar__panel-content": sidebarPanelContent,
  "sidebar__panel-close": sidebarPanelClose,
  "sidebar-inset": sidebarInset,
  "sidebar__header": sidebar__header,
  "sidebar__footer": sidebar__footer,
  "sidebar__content": sidebar__content,
  "sidebar__separator": sidebar__separator,
  "sidebar__group": sidebar__group,
  "sidebar__group-label": sidebarGroupLabel,
  "sidebar__group-content": sidebarGroupContent,
  "sidebar__menu": sidebar__menu,
  "sidebar__menu-item": sidebarMenuItem,
  "sidebar__menu-button": sidebarMenuButton,
  "sidebar__menu-button--sm": sidebarMenuButtonSm,
  "sidebar__menu-button--lg": sidebarMenuButtonLg,
  "sidebar__menu-sub": sidebarMenuSub,
  "sidebar__menu-sub-item": sidebarMenuSubItem,
  "sidebar__menu-sub-button": sidebarMenuSubButton,
  "sidebar__menu-sub-button--sm": sidebarMenuSubButtonSm,
  "sidebar__chevron": sidebar__chevron,
  "sidebar__collapsible-trigger": sidebarCollapsibleTrigger,
  "sidebar__collapsible-content": sidebarCollapsibleContent,
  "sidebar__collapsible-flyout": sidebarCollapsibleFlyout,
};
