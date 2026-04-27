"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import "./styles.css";

/* ───────── Types ───────── */

type ToastVariant = "default" | "success" | "danger" | "warning";

interface ToastItem {
  id: string;
  /** 짧은 제목. 한 줄 굵게 표시. */
  title?: React.ReactNode;
  /** 본문 설명. 줄바꿈 가능. */
  description?: React.ReactNode;
  variant: ToastVariant;
  duration: number;
  /** 우측에 표시될 액션 노드(예: "다시 시도" 버튼). */
  action?: React.ReactNode;
}

type ToastInput = Omit<ToastItem, "id" | "variant" | "duration"> & {
  /**
   * 토스트 종류.
   * - `default` — 정보성 알림
   * - `success` — 성공
   * - `warning` — 주의
   * - `danger` — 오류 (스크린리더에 즉시 읽힘)
   *
   * @default "default"
   */
  variant?: ToastVariant;
  /**
   * 자동 닫힘 시간(ms). `0` 이하면 자동 닫힘 비활성.
   * @default 4000
   */
  duration?: number;
};

/* ───────── Store (외부 상태) ───────── */

type Listener = () => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

const notify = () => listeners.forEach((l) => l());

let counter = 0;
const genId = () => `sh-toast-${++counter}`;

function addToast(input: ToastInput): string {
  const id = genId();
  toasts = [
    ...toasts,
    {
      id,
      variant: input.variant ?? "default",
      duration: input.duration ?? 4000,
      title: input.title,
      description: input.description,
      action: input.action,
    },
  ];
  notify();
  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

function useToastStore() {
  return React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => toasts,
  );
}

/* ───────── Public API ───────── */

/**
 * 토스트 알림을 발생시키는 명령형 API. 문자열만 전달하면 description으로 사용된다.
 * variant별 헬퍼(`toast.success` 등)와 `toast.dismiss(id)`도 함께 노출된다.
 * 사용 전에 앱 어딘가에 `<Toaster />`가 마운트되어 있어야 화면에 보인다.
 *
 * @param input - 문자열(빠른 알림) 또는 `{ title, description, variant, duration, action }`.
 * @returns 생성된 토스트 id. `toast.dismiss(id)`로 수동 닫을 때 사용.
 * @example
 * toast.success("저장 완료");
 * toast({ title: "오류", description: e.message, variant: "danger" });
 */
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

/* ───────── Icons ───────── */

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
  default: null,
  success: <CheckIcon />,
  danger: <XIcon />,
  warning: <AlertIcon />,
};

/* ───────── Single Toast ───────── */

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    if (item.duration <= 0) return;
    const timer = setTimeout(() => setExiting(true), item.duration);
    return () => clearTimeout(timer);
  }, [item.duration]);

  const handleAnimationEnd = () => {
    if (exiting) onDismiss();
  };

  const icon = VARIANT_ICON[item.variant];

  return (
    <div
      className={`sh-ui-toast sh-ui-toast--${item.variant}`}
      role={item.variant === "danger" ? "alert" : "status"}
      aria-live={item.variant === "danger" ? "assertive" : "polite"}
      data-exiting={exiting || undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      {icon && <span className="sh-ui-toast__icon">{icon}</span>}
      <div className="sh-ui-toast__body">
        {item.title && <p className="sh-ui-toast__title">{item.title}</p>}
        {item.description && <p className="sh-ui-toast__description">{item.description}</p>}
      </div>
      {item.action && <div className="sh-ui-toast__action">{item.action}</div>}
      <button
        type="button"
        className="sh-ui-toast__close"
        onClick={() => setExiting(true)}
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  );
}

/* ───────── Toaster (Provider) ───────── */

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export interface ToasterProps {
  /**
   * 토스트 표시 위치.
   * `top-*` 위치는 새 토스트가 위에 쌓이고, `bottom-*` 위치는 아래에 쌓인다.
   *
   * @default "bottom-right"
   */
  position?: ToastPosition;
  /**
   * Portal이 마운트될 DOM 노드.
   * @default document.body
   */
  container?: Element | null;
}

/**
 * `toast()`로 발생한 알림을 그리는 viewport. 앱 루트에 한 번만 마운트한다.
 * `danger` variant는 `role="alert"`+`aria-live="assertive"`로 즉시 읽히고, 그 외는 `polite`로 큐잉된다.
 */
export function Toaster({ position = "bottom-right", container }: ToasterProps) {
  const items = useToastStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;

  const isBottom = position.startsWith("bottom");

  const el = (
    <div
      className="sh-ui-toast-viewport"
      data-position={position}
      aria-label="알림"
    >
      {isBottom ? items.map((item) => (
        <ToastCard
          key={item.id}
          item={item}
          onDismiss={() => removeToast(item.id)}
        />
      )) : [...items].reverse().map((item) => (
        <ToastCard
          key={item.id}
          item={item}
          onDismiss={() => removeToast(item.id)}
        />
      ))}
    </div>
  );

  return createPortal(el, container ?? document.body);
}
