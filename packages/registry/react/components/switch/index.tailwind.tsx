import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cva, type VariantProps } from "class-variance-authority";


import { cn } from "@SH_UI_UTILS@";
const switchRoot = cva(
  "inline-flex items-center border-none rounded-full bg-background-muted cursor-pointer shrink-0 p-0.5 transition-colors duration-150 hover:not-data-[disabled]:bg-border-strong focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 data-[checked]:bg-primary data-[checked]:hover:not-data-[disabled]:bg-primary-hover data-[disabled]:opacity-[var(--opacity-disabled)] data-[disabled]:cursor-not-allowed motion-reduce:transition-none",
  {
    variants: {
      size: {
        sm: "w-8 h-[1.125rem]",
        md: "w-10 h-[1.375rem]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const switchThumb = cva(
  "block rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-transform duration-150 ease-out motion-reduce:transition-none",
  {
    variants: {
      size: {
        sm: "w-3.5 h-3.5",
        md: "w-[1.125rem] h-[1.125rem]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type SwitchSize = NonNullable<VariantProps<typeof switchRoot>["size"]>;

export type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
  "className"
> & {
  className?: string;
  size?: SwitchSize;
};

export const Switch = React.forwardRef<HTMLElement, SwitchProps>(
  ({ className, size = "md", ...props }, ref) => (
    <BaseSwitch.Root
      ref={ref}
      className={cn(switchRoot({ size }), className)}
      {...props}
    >
      <BaseSwitch.Thumb
        className={cn(
          switchThumb({ size }),
          size === "sm" && "data-[checked]:translate-x-3.5",
          size === "md" && "data-[checked]:translate-x-[1.125rem]",
        )}
      />
    </BaseSwitch.Root>
  ),
);
Switch.displayName = "Switch";
