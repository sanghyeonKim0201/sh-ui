import * as React from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import styles from "./styles.module.css";

import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export interface ScrollAreaProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseScrollArea.Root>> {
  /**
   * 스크롤 축. 콘텐츠가 양방향으로 넘치면 `"both"` 를 지정해 가로/세로 스크롤바를 함께 노출한다.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "both";
  /**
   * Viewport 컨테이너에 적용할 className.
   */
  viewportClassName?: string;
}

/**
 * 콘텐츠가 넘칠 때 OS-native 스크롤바를 가리고 디자인 시스템 톤의 스크롤바를 떠다니게 보여주는 컨테이너.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    { className, viewportClassName, children, orientation = "vertical", ...props },
    ref,
  ) {
    const showVertical = orientation === "vertical" || orientation === "both";
    const showHorizontal = orientation === "horizontal" || orientation === "both";

    return (
      <BaseScrollArea.Root
        className={cn(styles["scroll-area__root"], className)}
        {...props}
      >
        <BaseScrollArea.Viewport
          ref={ref}
          className={cn(styles["scroll-area__viewport"], viewportClassName)}
        >
          {children}
        </BaseScrollArea.Viewport>
        {showVertical && (
          <BaseScrollArea.Scrollbar
            orientation="vertical"
            className={cn(
              styles["scroll-area__scrollbar"],
              styles["scroll-area__scrollbar--vertical"],
            )}
          >
            <BaseScrollArea.Thumb className={styles["scroll-area__thumb"]} />
          </BaseScrollArea.Scrollbar>
        )}
        {showHorizontal && (
          <BaseScrollArea.Scrollbar
            orientation="horizontal"
            className={cn(
              styles["scroll-area__scrollbar"],
              styles["scroll-area__scrollbar--horizontal"],
            )}
          >
            <BaseScrollArea.Thumb className={styles["scroll-area__thumb"]} />
          </BaseScrollArea.Scrollbar>
        )}
        {orientation === "both" && (
          <BaseScrollArea.Corner className={styles["scroll-area__corner"]} />
        )}
      </BaseScrollArea.Root>
    );
  },
);
