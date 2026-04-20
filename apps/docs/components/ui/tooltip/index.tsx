import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import "./styles.css";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

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
  /** 트리거에 대한 배치 방향. */
  side?: "top" | "right" | "bottom" | "left";
  /** 정렬. */
  align?: "start" | "center" | "end";
  /** Trigger-Popup 간격(px). 기본 6. */
  sideOffset?: number;
  /** 화살표 표시 여부. 기본 false. */
  showArrow?: boolean;
  /** portal 마운트 노드. */
  container?: React.ComponentPropsWithoutRef<
    typeof BaseTooltip.Portal
  >["container"];
}

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
        className="sh-ui-tooltip__positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BaseTooltip.Popup
          ref={ref}
          className={cx("sh-ui-tooltip__content", className)}
          {...props}
        >
          {showArrow && (
            <BaseTooltip.Arrow className="sh-ui-tooltip__arrow" />
          )}
          {children}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
});
