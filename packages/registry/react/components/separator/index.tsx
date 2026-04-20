import * as React from "react";
import "./styles.css";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  orientation?: SeparatorOrientation;
  /**
   * 의미 없는 시각적 구분선인지 여부. 기본 true(aria-hidden).
   * 스크린리더에도 섹션 구분을 알려야 하면 false.
   */
  decorative?: boolean;
}

/**
 * 시각적 구분선. 가로(height=1px) / 세로(width=1px).
 *
 * 의미 있는 구분에는 `decorative={false}`로 role=separator가 붙고, 그렇지 않으면
 * aria-hidden 처리되어 보조 기술에 노출되지 않는다.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role={decorative ? undefined : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        aria-hidden={decorative || undefined}
        data-orientation={orientation}
        className={cx(
          "sh-ui-separator",
          `sh-ui-separator--${orientation}`,
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";
