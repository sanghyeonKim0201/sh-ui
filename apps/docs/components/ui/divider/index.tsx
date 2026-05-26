import * as React from "react";
import "./styles.css";


function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
export type DividerOrientation = "horizontal" | "vertical";
export type DividerAlign = "start" | "center" | "end";

export interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  orientation?: DividerOrientation;
  /**
   * 라벨 정렬 — children 이 있을 때만 의미를 가진다. 기본 center.
   * `start` 면 라벨이 왼쪽에 붙고 오른쪽으로만 선이 뻗는다 (반대도 마찬가지).
   */
  align?: DividerAlign;
  /**
   * 의미 없는 시각적 구분선인지. 기본 true(aria-hidden).
   * 라벨이 섹션 시작을 알리는 의미라면 `decorative={false}` 로.
   */
  decorative?: boolean;
}

/**
 * 시각적 구분선 — 가로/세로 1px (children 없음) 또는 가운데 라벨이 있는
 * "──── label ────" 형식 (children 있음). children 이 있으면 orientation 은
 * 항상 horizontal 로 강제된다.
 *
 * Separator 와의 관계: Separator 는 라벨 없는 단순 1px 만 다룸. Divider 는
 * 그 superset — 새 코드에선 Divider 권장, Separator 는 backwards compat 유지.
 */
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  function Divider(
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
          className={cx(
            "sh-ui-divider",
            "sh-ui-divider--plain",
            `sh-ui-divider--${orientation}`,
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
        className={cx(
          "sh-ui-divider",
          "sh-ui-divider--labeled",
          `sh-ui-divider--align-${align}`,
          className,
        )}
        {...props}
      >
        {align !== "start" ? (
          <span aria-hidden className="sh-ui-divider__line" />
        ) : null}
        <span className="sh-ui-divider__label">{children}</span>
        {align !== "end" ? (
          <span aria-hidden className="sh-ui-divider__line" />
        ) : null}
      </div>
    );
  },
);
Divider.displayName = "Divider";
