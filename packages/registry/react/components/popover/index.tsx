import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import "./styles.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


/**
 * 트리거 요소에 떠다니는 가벼운 패널을 띄우는 비모달 컨테이너. 포커스를 가두지 않으므로
 * 짧은 폼·정보 표시에 적합하고, 강제 응답이 필요하면 Dialog를 사용할 것.
 */
export const Popover = BasePopover.Root;

/** Popover를 여는 트리거. */
export const PopoverTrigger = BasePopover.Trigger;

/** Popover를 닫는 요소. */
export const PopoverClose = BasePopover.Close;

export interface PopoverContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Popup>> {
  /**
   * Trigger 기준 배치 방향. 공간 부족 시 자동으로 반대편으로 뒤집힌다.
   * @default "bottom"
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * 트리거 축에서의 정렬.
   * - `start` — 트리거 시작 가장자리 정렬
   * - `center` — 가운데 (기본)
   * - `end` — 트리거 끝 가장자리 정렬
   *
   * @default "center"
   */
  align?: "start" | "center" | "end";
  /**
   * Trigger와 Popup 사이 간격(px).
   * @default 8
   */
  sideOffset?: number;
  /**
   * Portal이 마운트될 DOM 노드.
   * @default document.body
   */
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
  /**
   * Trigger를 가리키는 화살표 표시 여부.
   * @default false
   */
  showArrow?: boolean;
}

/**
 * Popover의 콘텐츠. 트리거에 자동 위치 조정되어 portal로 마운트된다.
 * `side`/`align`/`sideOffset`로 배치를 미세조정하고, `showArrow`로 화살표를 노출한다.
 */
export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    { className, children, side, align, sideOffset = 8, container, showArrow, ...props },
    ref,
  ) {
    return (
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner
          className="sh-ui-popover__positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BasePopover.Popup
            ref={ref}
            className={cn("sh-ui-popover__content", className)}
            {...props}
          >
            {showArrow && (
              <BasePopover.Arrow className="sh-ui-popover__arrow" />
            )}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

/** Popover 콘텐츠의 제목. 접근성을 위해 짧은 제목이라도 함께 두는 것을 권장. */
export const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Title>>
>(function PopoverTitle({ className, ...props }, ref) {
  return (
    <BasePopover.Title
      ref={ref}
      className={cn("sh-ui-popover__title", className)}
      {...props}
    />
  );
});

/** Popover 콘텐츠의 보조 설명. */
export const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Description>>
>(function PopoverDescription({ className, ...props }, ref) {
  return (
    <BasePopover.Description
      ref={ref}
      className={cn("sh-ui-popover__description", className)}
      {...props}
    />
  );
});
