import * as React from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import "./styles.css";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export interface ScrollAreaProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseScrollArea.Root>> {
  /**
   * 스크롤 축. 콘텐츠가 양방향으로 넘치면 `"both"` 를 지정해 가로/세로 스크롤바를 함께 노출한다.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "both";
  /**
   * Viewport 컨테이너에 적용할 className. 패딩·flex 같은 콘텐츠 레이아웃은 viewport 에 두는 것이 자연스럽다.
   */
  viewportClassName?: string;
}

/**
 * 콘텐츠가 넘칠 때 OS-native 스크롤바를 가리고 디자인 시스템 톤의 스크롤바를 떠다니게 보여주는 컨테이너.
 * `orientation` 으로 축을 지정하고, 콘텐츠 패딩 등은 `viewportClassName` 으로 viewport 에 둔다.
 * 외부에서 height/width 를 줘야 스크롤이 발생한다 — 예: `<ScrollArea style={{ height: 240 }}>`.
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
        className={cx("sh-ui-scroll-area__root", className)}
        {...props}
      >
        <BaseScrollArea.Viewport
          ref={ref}
          className={cx("sh-ui-scroll-area__viewport", viewportClassName)}
        >
          {children}
        </BaseScrollArea.Viewport>
        {showVertical && (
          <BaseScrollArea.Scrollbar
            orientation="vertical"
            className="sh-ui-scroll-area__scrollbar sh-ui-scroll-area__scrollbar--vertical"
          >
            <BaseScrollArea.Thumb className="sh-ui-scroll-area__thumb" />
          </BaseScrollArea.Scrollbar>
        )}
        {showHorizontal && (
          <BaseScrollArea.Scrollbar
            orientation="horizontal"
            className="sh-ui-scroll-area__scrollbar sh-ui-scroll-area__scrollbar--horizontal"
          >
            <BaseScrollArea.Thumb className="sh-ui-scroll-area__thumb" />
          </BaseScrollArea.Scrollbar>
        )}
        {orientation === "both" && (
          <BaseScrollArea.Corner className="sh-ui-scroll-area__corner" />
        )}
      </BaseScrollArea.Root>
    );
  },
);
