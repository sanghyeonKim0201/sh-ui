"use client";

import * as React from "react";
import { Radio as BaseRadio } from "@base-ui-components/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui-components/react/radio-group";
import "./styles.css";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

/* ───────────── Radio ───────────── */

export type RadioProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadio.Root>,
  "className"
> & {
  className?: string;
};

export const Radio = React.forwardRef<HTMLElement, RadioProps>(
  ({ className, ...props }, ref) => (
    <BaseRadio.Root
      ref={ref}
      className={cx("sh-ui-radio", className)}
      {...props}
    >
      <BaseRadio.Indicator className="sh-ui-radio__indicator" />
    </BaseRadio.Root>
  ),
);
Radio.displayName = "Radio";

/* ───────────── RadioGroup ───────────── */

export type RadioGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadioGroup>,
  "className"
> & {
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <BaseRadioGroup
      ref={ref}
      className={cx("sh-ui-radio-group", className)}
      data-orientation={orientation}
      {...props}
    />
  ),
);
RadioGroup.displayName = "RadioGroup";
