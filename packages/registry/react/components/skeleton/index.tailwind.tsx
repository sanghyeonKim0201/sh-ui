import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
/**
 * 로딩 중 콘텐츠 자리를 채우는 placeholder 박스 (Tailwind utility 변종).
 * `aria-hidden`이 기본 적용되므로 스크린리더에 노출되지 않는다.
 */
export const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn(
      "block w-full h-4 bg-background-muted rounded-[calc(var(--radius)-2px)] animate-[sh-ui-skeleton-pulse_1.6s_ease-in-out_infinite] motion-reduce:animate-none",
      className,
    )}
    style={
      {
        ...(props.style as React.CSSProperties),
      }
    }
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

/* keyframes — Tailwind 4 의 @theme 가 keyframe 도 가져가지만,
 * 사용자 토큰에는 없으므로 컴포넌트 옆에 한 번만 inject. */
if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-skeleton]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-skeleton", "");
  style.textContent = `@keyframes sh-ui-skeleton-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.55 } }`;
  document.head.appendChild(style);
}
