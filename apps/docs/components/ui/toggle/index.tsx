"use client";

import * as React from "react";
import { Toggle as BaseToggle } from "@base-ui-components/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui-components/react/toggle-group";
import "./styles.css";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

/* ───────────── Toggle ───────────── */

export type ToggleVariant = "outline" | "ghost";
export type ToggleSize = "sm" | "md" | "lg";

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
      className={cx(
        "sh-ui-toggle",
        `sh-ui-toggle--${variant}`,
        `sh-ui-toggle--${size}`,
        className,
      )}
      {...props}
    />
  ),
);
Toggle.displayName = "Toggle";

/* ───────────── ToggleGroup ───────────── */

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
        className={cx("sh-ui-toggle-group", className)}
        {...props}
      />
    </ToggleGroupContext.Provider>
  ),
);
ToggleGroup.displayName = "ToggleGroup";

/* ───────────── ToggleGroupItem ───────────── */

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
        className={cx(
          "sh-ui-toggle",
          `sh-ui-toggle--${variant}`,
          `sh-ui-toggle--${size}`,
          className,
        )}
        {...props}
      />
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
