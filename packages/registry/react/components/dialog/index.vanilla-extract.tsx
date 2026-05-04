import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { byKey, dialog__backdrop, dialog__content, dialog__title, dialog__description, dialog__footer, dialog__close } from "./styles.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


/**
 * 모달 다이얼로그 루트. 열림 상태를 가지며 자식으로 Trigger·Content를 둔다.
 * 주의를 강제하는 흐름(확인/입력)에 사용하고, 단순 안내는 Popover나 Toast를 권장.
 */
export const Dialog = BaseDialog.Root;

/** Dialog를 여는 트리거. 보통 Button을 감싸 사용. */
export const DialogTrigger = BaseDialog.Trigger;

/** 클릭 시 Dialog를 닫는 요소. footer의 취소 버튼 등에 사용. */
export const DialogClose = BaseDialog.Close;

/** 우상단에 배치되는 X 닫기 버튼. `aria-label="닫기"`가 자동 부여된다. */
export function DialogCloseX({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <BaseDialog.Close
      className={cn(dialog__close, className)}
      aria-label="닫기"
      {...props}
    >
      {children ?? "×"}
    </BaseDialog.Close>
  );
}

/** Dialog 본문 하단의 액션 버튼 영역. 보통 [취소, 확인] 순서로 배치. */
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(dialog__footer, className)} {...props} />;
}

export interface DialogContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>> {
  /**
   * Portal이 마운트될 DOM 노드. 모달이 다른 stacking context에 갇혀야 할 때 지정한다.
   * @default document.body
   */
  container?: React.ComponentPropsWithoutRef<typeof BaseDialog.Portal>["container"];
}

/**
 * Dialog의 실제 콘텐츠. Portal로 body 끝에 마운트되며 backdrop·focus trap·ESC 닫힘 등이 자동 처리된다.
 * 접근성: 안에 반드시 `DialogTitle`을 두고, 추가 설명은 `DialogDescription`으로 연결할 것.
 */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, container, ...props }, ref) {
    return (
      <BaseDialog.Portal container={container}>
        <BaseDialog.Backdrop className={dialog__backdrop} />
        <BaseDialog.Popup
          ref={ref}
          className={cn(dialog__content, className)}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    );
  },
);

/** Dialog의 제목. 접근성을 위해 DialogContent 안에 항상 포함시킬 것. */
export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDialog.Title>>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <BaseDialog.Title
      ref={ref}
      className={cn(dialog__title, className)}
      {...props}
    />
  );
});

/** Dialog의 보조 설명. 제목만으로 맥락이 부족할 때 사용한다. */
export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseDialog.Description>>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <BaseDialog.Description
      ref={ref}
      className={cn(dialog__description, className)}
      {...props}
    />
  );
});
