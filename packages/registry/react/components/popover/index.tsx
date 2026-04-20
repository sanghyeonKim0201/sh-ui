import * as React from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import "./styles.css";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

export const Popover = BasePopover.Root;

export const PopoverTrigger = BasePopover.Trigger;

export const PopoverClose = BasePopover.Close;

export interface PopoverContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Popup>> {
  /** Trigger에 대한 배치 방향. */
  side?: "top" | "right" | "bottom" | "left";
  /** 정렬. */
  align?: "start" | "center" | "end";
  /** Trigger-Popup 간격(px). 기본 8. */
  sideOffset?: number;
  /** portal이 마운트될 노드. 기본 body. */
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
  /** popup 바깥을 가리키는 화살표 표시 여부. 기본 false. */
  showArrow?: boolean;
}

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
            className={cx("sh-ui-popover__content", className)}
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

export const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Title>>
>(function PopoverTitle({ className, ...props }, ref) {
  return (
    <BasePopover.Title
      ref={ref}
      className={cx("sh-ui-popover__title", className)}
      {...props}
    />
  );
});

export const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BasePopover.Description>>
>(function PopoverDescription({ className, ...props }, ref) {
  return (
    <BasePopover.Description
      ref={ref}
      className={cx("sh-ui-popover__description", className)}
      {...props}
    />
  );
});
