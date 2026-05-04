import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import styles from "./styles.module.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };


/** 여러 Tooltip이 공통 delay를 공유하도록 묶는다. 앱 루트에 한 번 두는 것을 권장. */
export const TooltipProvider = BaseTooltip.Provider;

/** Tooltip 루트. Trigger + Content를 자식으로 갖는다. */
export const Tooltip = BaseTooltip.Root;

/** 호버/포커스로 tooltip을 표시할 엘리먼트를 감싼다. render prop으로 Button 등과 결합. */
export const TooltipTrigger = BaseTooltip.Trigger;

export interface TooltipContentProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup>
  > {
  /**
   * Trigger 기준 배치 방향. 공간 부족 시 자동으로 반대편으로 뒤집힌다.
   * @default "top"
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * 트리거 축에서의 정렬.
   * @default "center"
   */
  align?: "start" | "center" | "end";
  /**
   * Trigger와 Popup 사이 간격(px).
   * @default 6
   */
  sideOffset?: number;
  /**
   * Trigger를 가리키는 화살표 표시 여부.
   * @default false
   */
  showArrow?: boolean;
  /**
   * Portal이 마운트될 DOM 노드.
   * @default document.body
   */
  container?: React.ComponentPropsWithoutRef<
    typeof BaseTooltip.Portal
  >["container"];
}

/**
 * Tooltip의 본문. portal로 마운트되어 트리거 옆에 자동 위치 조정된다.
 * 내용은 짧게 — 긴 설명이 필요하면 Popover를 사용할 것.
 */
export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(function TooltipContent(
  { className, children, side, align, sideOffset = 6, showArrow, container, ...props },
  ref,
) {
  return (
    <BaseTooltip.Portal container={container}>
      <BaseTooltip.Positioner
        className={styles.tooltip__positioner}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BaseTooltip.Popup
          ref={ref}
          className={cn(styles.tooltip__content, className)}
          {...props}
        >
          {showArrow && (
            <BaseTooltip.Arrow className={styles.tooltip__arrow} />
          )}
          {children}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
});
