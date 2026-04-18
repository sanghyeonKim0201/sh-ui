"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
import "./styles.css";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export type TabsVariant = "underline" | "pill" | "plain";

interface TabsContextValue {
  variant: TabsVariant;
}
const TabsContext = React.createContext<TabsContextValue>({ variant: "underline" });

export type TabsProps = WithStringClassName<
  React.ComponentPropsWithoutRef<typeof BaseTabs.Root>
> & {
  /** 외형 변형. 기본 `underline`. */
  variant?: TabsVariant;
};

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, variant = "underline", ...props }, ref) => (
    <TabsContext.Provider value={{ variant }}>
      <BaseTabs.Root
        ref={ref}
        data-variant={variant}
        className={cx("sh-ui-tabs", className)}
        {...props}
      />
    </TabsContext.Provider>
  ),
);
Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.List>>
>(({ className, ...props }, ref) => (
  <BaseTabs.List ref={ref} className={cx("sh-ui-tabs__list", className)} {...props} />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>>
>(({ className, ...props }, ref) => (
  <BaseTabs.Tab ref={ref} className={cx("sh-ui-tabs__trigger", className)} {...props} />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsIndicator = React.forwardRef<
  HTMLSpanElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.Indicator>>
>(({ className, ...props }, ref) => (
  <BaseTabs.Indicator
    ref={ref}
    className={cx("sh-ui-tabs__indicator", className)}
    {...props}
  />
));
TabsIndicator.displayName = "TabsIndicator";

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>>
>(({ className, ...props }, ref) => (
  <BaseTabs.Panel ref={ref} className={cx("sh-ui-tabs__content", className)} {...props} />
));
TabsContent.displayName = "TabsContent";

export const useTabsVariant = () => React.useContext(TabsContext).variant;
