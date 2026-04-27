import * as React from "react";
import "./styles.css";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** 필수 필드 표시. true이면 ::after로 * 표시. Input에 required가 있으면 CSS :has()로 자동 감지되므로 보통 불필요. */
  isRequired?: boolean;
}

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

/**
 * 폼 컨트롤과 1:1로 연결되는 레이블. `htmlFor`로 컨트롤의 `id`와 매칭하거나
 * Label 안에 컨트롤을 감싸 묵시적으로 연결한다. 클릭 시 자동으로 컨트롤에 포커스가 간다.
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, isRequired, ...props }, ref) => (
    <label
      ref={ref}
      className={cx("sh-ui-label", className)}
      data-required={isRequired || undefined}
      {...props}
    >
      {children}
    </label>
  ),
);
Label.displayName = "Label";

/** Label 안의 주 라벨 텍스트. 구조적 그룹핑이 필요할 때 Label과 함께 사용. */
export function LabelTitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("sh-ui-label__title", className)} {...props} />;
}

/** 라벨 옆에 약하게 표시되는 보조 텍스트(예: "선택 사항"). */
export function LabelSubtitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("sh-ui-label__subtitle", className)} {...props} />;
}

/** 라벨 아래에 붙는 안내 문구. 컨트롤과 `aria-describedby`로 연결할 것. */
export function LabelDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("sh-ui-label__description", className)} {...props} />;
}

/** 라벨 아래의 보조 캡션(예: 입력 형식 예시, 글자 수 제한). */
export function LabelCaption({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("sh-ui-label__caption", className)} {...props} />;
}
