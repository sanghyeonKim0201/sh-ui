"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type ToastVariant = "default" | "success" | "danger" | "warning";

interface ToastItem {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant: ToastVariant;
  duration: number;
  action?: React.ReactNode;
}

type ToastInput = Omit<ToastItem, "id" | "variant" | "duration"> & {
  variant?: ToastVariant;
  duration?: number;
};

type Listener = () => void;
let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => l());
let counter = 0;
const genId = () => `sh-toast-${++counter}`;

function addToast(input: ToastInput): string {
  const id = genId();
  toasts = [...toasts, {
    id, variant: input.variant ?? "default", duration: input.duration ?? 4000,
    title: input.title, description: input.description, action: input.action,
  }];
  notify();
  return id;
}
function removeToast(id: string) { toasts = toasts.filter((t) => t.id !== id); notify(); }

function useToastStore() {
  return React.useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => toasts,
    () => toasts,
  );
}

export function toast(input: ToastInput | string): string {
  if (typeof input === "string") return addToast({ description: input });
  return addToast(input);
}
toast.success = (input: ToastInput | string) =>
  toast(typeof input === "string" ? { description: input, variant: "success" } : { ...input, variant: "success" });
toast.danger = (input: ToastInput | string) =>
  toast(typeof input === "string" ? { description: input, variant: "danger" } : { ...input, variant: "danger" });
toast.warning = (input: ToastInput | string) =>
  toast(typeof input === "string" ? { description: input, variant: "warning" } : { ...input, variant: "warning" });
toast.dismiss = removeToast;

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8.5 7 10.5 11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const VARIANT_ICON: Record<ToastVariant, React.ReactNode> = {
  default: null, success: <CheckIcon />, danger: <XIcon />, warning: <AlertIcon />,
};
const VARIANT_ICON_COLOR: Record<ToastVariant, string> = {
  default: "",
  success: "text-[var(--success,#16a34a)]",
  danger: "text-danger",
  warning: "text-[var(--warning,#d97706)]",
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    if (item.duration <= 0) return;
    const timer = setTimeout(() => setExiting(true), item.duration);
    return () => clearTimeout(timer);
  }, [item.duration]);

  const handleAnimationEnd = () => { if (exiting) onDismiss(); };
  const icon = VARIANT_ICON[item.variant];

  return (
    <div
      className="sh-ui-toast relative flex items-start gap-2.5 w-full pl-[var(--space-3)] pr-9 py-[var(--space-3)] bg-background text-foreground border border-border rounded-[var(--radius)] shadow-[0_4px_16px_rgba(0,0,0,0.12)] pointer-events-auto motion-reduce:!animate-none"
      role={item.variant === "danger" ? "alert" : "status"}
      aria-live={item.variant === "danger" ? "assertive" : "polite"}
      data-exiting={exiting || undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      {icon && (
        <span className={`shrink-0 inline-flex items-center mt-0.5 ${VARIANT_ICON_COLOR[item.variant]}`}>
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        {item.title && (
          <p className="m-0 text-[length:var(--text-sm)] font-semibold leading-snug">{item.title}</p>
        )}
        {item.description && (
          <p className="m-0 text-[0.8125rem] leading-snug text-foreground-muted [&:not(:first-child)]:mt-0.5">
            {item.description}
          </p>
        )}
      </div>
      {item.action && (
        <div className="shrink-0 inline-flex items-center ml-auto">{item.action}</div>
      )}
      <button
        type="button"
        className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-6 h-6 p-0 border-none rounded-[calc(var(--radius)-2px)] bg-transparent text-foreground-muted text-[length:var(--text-sm)] leading-none cursor-pointer transition-[background-color,color] duration-[var(--duration-fast)] hover:bg-background-muted hover:text-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-primary focus-visible:outline-offset-2 motion-reduce:transition-none"
        onClick={() => setExiting(true)}
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  );
}

export type ToastPosition =
  | "top-left" | "top-right" | "top-center"
  | "bottom-left" | "bottom-right" | "bottom-center";

export interface ToasterProps {
  position?: ToastPosition;
  container?: Element | null;
}

const POSITION_CLASSES: Record<ToastPosition, string> = {
  "bottom-right": "bottom-[var(--space-4)] right-[var(--space-4)] flex-col-reverse max-sm:right-0 max-sm:left-0 max-sm:bottom-0",
  "bottom-left": "bottom-[var(--space-4)] left-[var(--space-4)] flex-col-reverse max-sm:right-0 max-sm:left-0 max-sm:bottom-0",
  "bottom-center": "bottom-[var(--space-4)] left-1/2 -translate-x-1/2 flex-col-reverse max-sm:right-0 max-sm:left-0 max-sm:bottom-0 max-sm:translate-x-0",
  "top-right": "top-[var(--space-4)] right-[var(--space-4)] max-sm:right-0 max-sm:left-0 max-sm:top-0",
  "top-left": "top-[var(--space-4)] left-[var(--space-4)] max-sm:right-0 max-sm:left-0 max-sm:top-0",
  "top-center": "top-[var(--space-4)] left-1/2 -translate-x-1/2 max-sm:right-0 max-sm:left-0 max-sm:top-0 max-sm:translate-x-0",
};

export function Toaster({ position = "bottom-right", container }: ToasterProps) {
  const items = useToastStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted || items.length === 0) return null;
  const isBottom = position.startsWith("bottom");

  const el = (
    <div
      className={`fixed z-[var(--z-toast)] flex gap-[var(--space-2)] max-w-96 w-full pointer-events-none max-sm:max-w-full max-sm:p-[var(--space-4)] flex-col ${POSITION_CLASSES[position]}`}
      data-position={position}
      aria-label="알림"
    >
      {(isBottom ? items : [...items].reverse()).map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
      ))}
    </div>
  );

  return createPortal(el, container ?? document.body);
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-toast]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-toast", "");
  style.textContent = `
[data-position="bottom-right"] .sh-ui-toast, [data-position="top-right"] .sh-ui-toast { animation: sh-ui-toast-enter-right var(--duration-slow) cubic-bezier(0.16,1,0.3,1) forwards; }
[data-position="bottom-right"] .sh-ui-toast[data-exiting], [data-position="top-right"] .sh-ui-toast[data-exiting] { animation: sh-ui-toast-exit-right 150ms ease-in forwards; }
[data-position="bottom-left"] .sh-ui-toast, [data-position="top-left"] .sh-ui-toast { animation: sh-ui-toast-enter-left var(--duration-slow) cubic-bezier(0.16,1,0.3,1) forwards; }
[data-position="bottom-left"] .sh-ui-toast[data-exiting], [data-position="top-left"] .sh-ui-toast[data-exiting] { animation: sh-ui-toast-exit-left 150ms ease-in forwards; }
[data-position="bottom-center"] .sh-ui-toast { animation: sh-ui-toast-enter-bottom var(--duration-slow) cubic-bezier(0.16,1,0.3,1) forwards; }
[data-position="bottom-center"] .sh-ui-toast[data-exiting] { animation: sh-ui-toast-exit-bottom 150ms ease-in forwards; }
[data-position="top-center"] .sh-ui-toast { animation: sh-ui-toast-enter-top var(--duration-slow) cubic-bezier(0.16,1,0.3,1) forwards; }
[data-position="top-center"] .sh-ui-toast[data-exiting] { animation: sh-ui-toast-exit-top 150ms ease-in forwards; }
@keyframes sh-ui-toast-enter-right { from { opacity:0; transform: translateX(100%) } to { opacity:1; transform: translateX(0) } }
@keyframes sh-ui-toast-exit-right { from { opacity:1; transform: translateX(0) } to { opacity:0; transform: translateX(100%) } }
@keyframes sh-ui-toast-enter-left { from { opacity:0; transform: translateX(-100%) } to { opacity:1; transform: translateX(0) } }
@keyframes sh-ui-toast-exit-left { from { opacity:1; transform: translateX(0) } to { opacity:0; transform: translateX(-100%) } }
@keyframes sh-ui-toast-enter-bottom { from { opacity:0; transform: translateY(100%) } to { opacity:1; transform: translateY(0) } }
@keyframes sh-ui-toast-exit-bottom { from { opacity:1; transform: translateY(0) } to { opacity:0; transform: translateY(100%) } }
@keyframes sh-ui-toast-enter-top { from { opacity:0; transform: translateY(-100%) } to { opacity:1; transform: translateY(0) } }
@keyframes sh-ui-toast-exit-top { from { opacity:1; transform: translateY(0) } to { opacity:0; transform: translateY(-100%) } }
@media (max-width: 40rem) {
  [data-position] .sh-ui-toast { animation-name: sh-ui-toast-enter-bottom !important }
  [data-position^="top-"] .sh-ui-toast { animation-name: sh-ui-toast-enter-top !important }
  [data-position] .sh-ui-toast[data-exiting] { animation-name: sh-ui-toast-exit-bottom !important }
  [data-position^="top-"] .sh-ui-toast[data-exiting] { animation-name: sh-ui-toast-exit-top !important }
}
  `;
  document.head.appendChild(style);
}
