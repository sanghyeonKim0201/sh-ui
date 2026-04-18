"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui-components/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui-components/react/checkbox-group";
import "./styles.css";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

/* ───────────── Checkbox ───────────── */

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  "className"
> & {
  className?: string;
};

export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <BaseCheckbox.Root
      ref={ref}
      className={cx("sh-ui-checkbox", className)}
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
  orientation?: "horizontal" | "vertical";
};

export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <BaseCheckboxGroup
      ref={ref}
      className={cx("sh-ui-checkbox-group", className)}
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
