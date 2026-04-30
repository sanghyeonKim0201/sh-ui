import * as React from "react";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


/**
 * 상단 앱 메뉴바 (Tailwind 변종). DropdownMenu 와 함께 사용 — DropdownMenu 의
 * Tailwind 변종이 plain 으로 fallback 된 경우 트리거 스타일은 plain CSS 로 적용됨.
 *
 * Tailwind 변종에서는 메뉴바 안의 DropdownMenu 트리거 재지정을 utility 로 표현하기
 * 어려워 (자식 컴포넌트 클래스 의존), 메뉴바 자체의 외형만 utility 로 변환.
 * 트리거 스타일링이 필요하면 사용자가 trigger 에 직접 className 부여.
 */
export const Menubar = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenubar>>
>(function Menubar({ className, ...props }, ref) {
  return (
    <BaseMenubar
      ref={ref}
      className={cn(
        "inline-flex items-center gap-[var(--space-1)] p-[var(--space-1)] bg-background border border-border rounded-[var(--radius)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      )}
      {...props}
    />
  );
});
