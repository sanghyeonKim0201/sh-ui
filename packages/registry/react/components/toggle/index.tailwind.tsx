"use client";

import * as React from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { cva, type VariantProps } from "class-variance-authority";


import { cn } from "@SH_UI_UTILS@";
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1.5 border border-transparent rounded-[var(--radius)] font-medium leading-none cursor-pointer text-foreground-muted bg-transparent transition-[background-color,color,border-color] duration-[var(--duration-fast)] select-none focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-[var(--opacity-disabled)] disabled:pointer-events-none data-[pressed]:bg-background-muted data-[pressed]:text-foreground motion-reduce:transition-none forced-colors:focus-visible:[outline-color:Highlight] forced-colors:data-[pressed]:[background:Highlight] forced-colors:data-[pressed]:[color:HighlightText] forced-colors:data-[pressed]:[border-color:Highlight] forced-colors:disabled:[color:GrayText] forced-colors:disabled:[border-color:GrayText]",
  {
    variants: {
      variant: {
        outline:
          "border-border hover:not-disabled:not-data-[pressed]:bg-background-muted hover:not-disabled:not-data-[pressed]:text-foreground data-[pressed]:border-border-strong",
        ghost:
          "hover:not-disabled:not-data-[pressed]:bg-background-muted hover:not-disabled:not-data-[pressed]:text-foreground",
      },
      size: {
        sm: "h-[var(--control-sm)] px-2.5 text-[length:var(--text-sm)] [@media(hover:none)_and_(pointer:coarse)]:h-9",
        md: "h-[var(--control-md)] px-[var(--space-3)] text-[length:var(--text-sm)] [@media(hover:none)_and_(pointer:coarse)]:h-11",
        lg: "h-[var(--control-lg)] px-[var(--space-4)] text-[length:var(--text-base)]",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

export type ToggleVariant = NonNullable<VariantProps<typeof toggleVariants>["variant"]>;
export type ToggleSize = NonNullable<VariantProps<typeof toggleVariants>["size"]>;

export type ToggleProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggle>,
  "className"
> & {
  className?: string;
  variant?: ToggleVariant;
  size?: ToggleSize;
};

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant = "ghost", size = "md", ...props }, ref) => (
    <BaseToggle
      ref={ref}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Toggle.displayName = "Toggle";

export type ToggleGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggleGroup>,
  "className"
> & {
  className?: string;
  variant?: ToggleVariant;
  size?: ToggleSize;
};

interface ToggleGroupContextValue {
  variant: ToggleVariant;
  size: ToggleSize;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: "ghost",
  size: "md",
});

export const useToggleGroupStyle = () => React.useContext(ToggleGroupContext);

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, variant = "ghost", size = "md", ...props }, ref) => (
    <ToggleGroupContext.Provider value={{ variant, size }}>
      <BaseToggleGroup
        ref={ref}
        className={cn(
          "inline-flex items-center gap-[var(--space-1)] data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      />
    </ToggleGroupContext.Provider>
  ),
);
ToggleGroup.displayName = "ToggleGroup";

export type ToggleGroupItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggle>,
  "className"
> & {
  className?: string;
};

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, ...props }, ref) => {
    const { variant, size } = useToggleGroupStyle();
    return (
      <BaseToggle
        ref={ref}
        className={cn(toggleVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
