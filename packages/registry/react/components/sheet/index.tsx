import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import "./styles.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

/**
 * 화면 가장자리에서 슬라이드 인 하는 side drawer 컨테이너. 글로벌 알림함 / 작업 큐 / 보조 패널
 * 처럼 사이드바와 무관한 위치에서 떠올리는 모달 시트에 사용. 사이드바 인근 detail 패널은 Sidebar 의
 * SidebarPanel 을, 강제 응답이 필요한 중앙 모달은 Dialog 를 권장.
 *
 * 위치는 `<SheetContent side>` 로 지정 — right(기본) / left / top / bottom.
 */
export const Sheet = BaseDrawer.Root;

/**
 * Sheet 를 여는 트리거. 자체로 `<button>` 을 렌더 — 자식 button 중첩 금지. 커스텀 Button 등으로
 * 슬롯하려면 `render` prop:
 *
 *   <SheetTrigger render={<Button>열기</Button>} />
 */
export const SheetTrigger = BaseDrawer.Trigger;

/**
 * 클릭 시 Sheet 를 닫는 요소 (예: footer 취소 버튼). 자체로 `<button>` 을 렌더하므로 자식 button
 * 중첩 금지. 커스텀 Button 슬롯은 `render` prop 사용.
 */
export const SheetClose = BaseDrawer.Close;

/** 우상단에 배치되는 X 닫기 버튼. `aria-label="닫기"` 가 자동 부여된다. */
export function SheetCloseX({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <BaseDrawer.Close
      className={cn("sh-ui-sheet__close", className)}
      aria-label="닫기"
      {...props}
    >
      {children ?? "×"}
    </BaseDrawer.Close>
  );
}

/** Sheet 콘텐츠 상단의 제목 영역. */
export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sh-ui-sheet__header", className)} {...props} />;
}

/** Sheet 콘텐츠 하단의 액션 버튼 영역. 보통 [취소, 확인] 순서. */
export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sh-ui-sheet__footer", className)} {...props} />;
}

export interface SheetContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDrawer.Popup>> {
  /**
   * Sheet 가 슬라이드 인 하는 방향.
   * @default "right"
   */
  side?: "right" | "left" | "top" | "bottom";
  /**
   * Portal 마운트 노드. 다른 stacking context 안에 갇혀야 할 때 지정.
   * @default document.body
   */
  container?: React.ComponentPropsWithoutRef<typeof BaseDrawer.Portal>["container"];
}

/**
 * Sheet 의 실제 콘텐츠. Portal 로 body 끝에 마운트되며 backdrop · focus trap · ESC 닫힘 등이
 * 자동 처리된다. `side` 로 진입 방향을 지정 — right/left 는 사이드 패널, top/bottom 은 시트 형태.
 * 접근성: 안에 반드시 `SheetTitle` 을 두고, 추가 설명은 `SheetDescription` 으로 연결할 것.
 */
export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  function SheetContent({ className, children, side = "right", container, ...props }, ref) {
    return (
      <BaseDrawer.Portal container={container}>
        <BaseDrawer.Backdrop className="sh-ui-sheet__backdrop" />
        <BaseDrawer.Popup
          ref={ref}
          data-side={side}
          className={cn("sh-ui-sheet__content", className)}
          {...props}
        >
          {children}
        </BaseDrawer.Popup>
      </BaseDrawer.Portal>
    );
  },
);

/** Sheet 의 제목. 접근성을 위해 SheetContent 안에 항상 포함시킬 것. */
export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDrawer.Title>>
>(function SheetTitle({ className, ...props }, ref) {
  return (
    <BaseDrawer.Title
      ref={ref}
      className={cn("sh-ui-sheet__title", className)}
      {...props}
    />
  );
});

/** Sheet 의 보조 설명. 제목만으로 맥락이 부족할 때 사용. */
export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDrawer.Description>>
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <BaseDrawer.Description
      ref={ref}
      className={cn("sh-ui-sheet__description", className)}
      {...props}
    />
  );
});
