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
  size?: "sm" | "md";
};

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
