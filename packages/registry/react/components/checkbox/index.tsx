import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import "./styles.css";


import { cn } from "@SH_UI_UTILS@";
/* ───────────── Checkbox ───────────── */

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  "className"
> & {
  className?: string;
};

/**
 * 폼 제출 시 함께 적용되는 다중 선택. `indeterminate`로 부분 선택 상태를
 * 표현할 수 있고, 여러 개를 묶을 때는 `CheckboxGroup`으로 감싸 그룹 단위 상태를 관리한다.
 */
export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <BaseCheckbox.Root
      ref={ref}
      className={cn("sh-ui-checkbox", className)}
      {...props}
    >
      <BaseCheckbox.Indicator className="sh-ui-checkbox__indicator">
        {props.indeterminate ? <MinusIcon /> : <CheckIcon />}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  ),
);
Checkbox.displayName = "Checkbox";

/* ───────────── CheckboxGroup ───────────── */

export type CheckboxGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCheckboxGroup>,
  "className"
> & {
  className?: string;
  /**
   * 그룹 내 체크박스 배치 방향.
   * - `vertical` — 세로 나열 (기본)
   * - `horizontal` — 가로 나열. 짧은 라벨 2~3개에만 권장
   *
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
};

/**
 * 여러 Checkbox를 묶는 컨테이너. `value`/`onValueChange`로 선택된 값 배열을 관리하고,
 * `orientation`으로 가로/세로 배치를 정한다. 그룹 라벨은 외부 `<Label>`로 제공할 것.
 */
export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <BaseCheckboxGroup
      ref={ref}
      className={cn("sh-ui-checkbox-group", className)}
      data-orientation={orientation}
      {...props}
    />
  ),
);
CheckboxGroup.displayName = "CheckboxGroup";

/* ───────────── Icons ───────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
      <path
        d="M4 8h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
