import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import styles from "./styles.module.css";


import { cn } from "@SH_UI_UTILS@";
/* ───────────── Switch ───────────── */

export type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
  "className"
> & {
  className?: string;
  /**
   * 크기.
   * - `sm` — 조밀한 폼이나 툴바
   * - `md` — 일반 (기본)
   *
   * @default "md"
   */
  size?: "sm" | "md";
};

/**
 * 즉시 반영되는 on/off 토글. 변경이 즉시 적용되는 설정에 사용하고, 폼 제출과
 * 함께 적용되는 선택에는 Checkbox를 권장. label과 연결해 접근성 텍스트를 함께 제공할 것.
 */
export const Switch = React.forwardRef<HTMLElement, SwitchProps>(
  ({ className, size = "md", ...props }, ref) => (
    <BaseSwitch.Root
      ref={ref}
      className={cn(styles.switch, styles[`switch--${size}`], className)}
      {...props}
    >
      <BaseSwitch.Thumb className={styles.switch__thumb} />
    </BaseSwitch.Root>
  ),
);
Switch.displayName = "Switch";
