import * as React from "react";
import "./styles.css";


import { cn } from "@SH_UI_UTILS@";
export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorAlign = "start" | "center" | "end";

export interface SeparatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  orientation?: SeparatorOrientation;
  /**
   * 라벨 정렬 — children 이 있을 때만 의미를 가진다. 기본 center.
   * `start` 면 라벨이 왼쪽에 붙고 오른쪽으로만 선이 뻗는다 (반대도 마찬가지).
   */
  align?: SeparatorAlign;
  /**
   * 의미 없는 시각적 구분선인지 여부. 기본 true(aria-hidden).
   * 스크린리더에도 섹션 구분을 알려야 하면 false.
   */
  decorative?: boolean;
}

/**
 * 시각적 구분선. 두 변종을 한 컴포넌트로:
 *   - children 없음: 가로/세로 1px 선 (orientation 으로 선택)
 *   - children 있음: 가운데에 라벨이 있는 "──── label ────" 형식
 *     (horizontal 강제, align 으로 라벨 위치 지정)
 *
 * 의미 있는 구분에는 `decorative={false}` 로 role=separator 가 붙고,
 * 그렇지 않으면 aria-hidden 처리되어 보조 기술에 노출되지 않는다.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    {
      className,
      orientation = "horizontal",
      align = "center",
      decorative = true,
      children,
      ...props
    },
    ref,
  ) {
    const hasLabel = children != null && children !== false;
    if (!hasLabel) {
      return (
        <div
          ref={ref}
          role={decorative ? undefined : "separator"}
          aria-orientation={decorative ? undefined : orientation}
          aria-hidden={decorative || undefined}
          data-orientation={orientation}
          className={cn(
            "sh-ui-separator",
            `sh-ui-separator--${orientation}`,
            className,
          )}
          {...props}
        />
      );
    }
    return (
      <div
        ref={ref}
        role={decorative ? undefined : "separator"}
        aria-orientation={decorative ? undefined : "horizontal"}
        data-orientation="horizontal"
        data-align={align}
        className={cn("sh-ui-separator--labeled", className)}
        {...props}
      >
        {align !== "start" ? (
          <span aria-hidden className="sh-ui-separator__line" />
        ) : null}
        <span className="sh-ui-separator__label">{children}</span>
        {align !== "end" ? (
          <span aria-hidden className="sh-ui-separator__line" />
        ) : null}
      </div>
    );
  },
);
Separator.displayName = "Separator";
