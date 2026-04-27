import * as React from "react";
import "./styles.css";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 시각적 위계.
   * - `primary` — 페이지의 주요 액션. 한 화면에 하나만 권장.
   * - `secondary` — 보조 액션. 약한 배경 + border.
   * - `ghost` — 배경 없는 hover 강조 액션. 툴바/메뉴 항목에 적합.
   * - `danger` — 파괴적 액션(삭제, 취소 등).
   * - `link` — 텍스트 링크처럼 보이는 인라인 버튼.
   *
   * @default "primary"
   */
  variant?: Variant;
  /**
   * 크기.
   * - `sm` — 조밀한 영역(테이블 행, 툴바)
   * - `md` — 일반
   * - `lg` — CTA·랜딩 영역
   *
   * @default "md"
   */
  size?: Size;
}

/**
 * 사용자 액션을 트리거하는 기본 버튼. variant로 시각적 위계(primary/secondary/ghost/danger/link)를,
 * size로 크기를 결정한다. 페이지 이동 목적이면 anchor를 감싼 `link` variant를 사용할 것.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    const classes = [
      "sh-ui-button",
      `sh-ui-button--${variant}`,
      `sh-ui-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = "Button";
