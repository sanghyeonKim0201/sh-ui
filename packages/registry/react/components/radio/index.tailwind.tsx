import * as React from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";


import { cn } from "@SH_UI_UTILS@";
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
      className={cn(
        "inline-flex items-center justify-center w-[1.125rem] h-[1.125rem] border border-border-strong rounded-full bg-background cursor-pointer shrink-0 transition-[border-color] duration-[var(--duration-fast)] hover:not-data-[disabled]:border-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-foreground focus-visible:outline-offset-2 data-[checked]:border-primary data-[disabled]:opacity-[var(--opacity-disabled)] data-[disabled]:cursor-not-allowed motion-reduce:transition-none [@media(hover:none)_and_(pointer:coarse)]:w-5 [@media(hover:none)_and_(pointer:coarse)]:h-5",
        className,
      )}
      {...props}
    >
      <BaseRadio.Indicator className="w-2 h-2 rounded-full bg-primary scale-0 transition-transform duration-[var(--duration-fast)] ease-out data-[checked]:scale-100 motion-reduce:transition-none" />
    </BaseRadio.Root>
  ),
);
Radio.displayName = "Radio";

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
      className={cn(
        "flex gap-2.5",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className,
      )}
      data-orientation={orientation}
      {...props}
    />
  ),
);
RadioGroup.displayName = "RadioGroup";
