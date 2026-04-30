import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

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
      className={cx(
        "inline-flex items-center justify-center w-[1.125rem] h-[1.125rem] border border-border-strong rounded-[calc(var(--radius)-2px)] bg-background text-primary-foreground cursor-pointer shrink-0 transition-[background-color,border-color] duration-[var(--duration-fast)] hover:not-data-[disabled]:border-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2 data-[checked]:bg-primary data-[checked]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:border-primary data-[disabled]:opacity-[var(--opacity-disabled)] data-[disabled]:cursor-not-allowed motion-reduce:transition-none [@media(hover:none)_and_(pointer:coarse)]:w-5 [@media(hover:none)_and_(pointer:coarse)]:h-5",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator className="inline-flex items-center justify-center">
        {props.indeterminate ? <MinusIcon /> : <CheckIcon />}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  ),
);
Checkbox.displayName = "Checkbox";

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
      className={cx(
        "flex gap-2.5",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className,
      )}
      data-orientation={orientation}
      {...props}
    />
  ),
);
CheckboxGroup.displayName = "CheckboxGroup";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
      <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
