import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui-components/react/switch";
import "./styles.css";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

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
      className={cx("sh-ui-switch", `sh-ui-switch--${size}`, className)}
      {...props}
    >
      <BaseSwitch.Thumb className="sh-ui-switch__thumb" />
    </BaseSwitch.Root>
  ),
);
Switch.displayName = "Switch";
