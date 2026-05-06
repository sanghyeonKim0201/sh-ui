"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";


import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export type TabsVariant = "underline" | "pill" | "plain";

interface TabsContextValue { variant: TabsVariant; }
const TabsContext = React.createContext<TabsContextValue>({ variant: "underline" });

export type TabsProps = WithStringClassName<
  React.ComponentPropsWithoutRef<typeof BaseTabs.Root>
> & {
  variant?: TabsVariant;
};

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, variant = "underline", ...props }, ref) => (
    <TabsContext.Provider value={{ variant }}>
      <BaseTabs.Root
        ref={ref}
        data-variant={variant}
        className={cn("flex flex-col gap-[var(--space-3)] w-full data-[orientation=vertical]:flex-row", className)}
        {...props}
      />
    </TabsContext.Provider>
  ),
);
Tabs.displayName = "Tabs";

const listVariantClasses =
  "data-[variant=underline]:[&]:w-full data-[variant=underline]:[&]:gap-0 data-[variant=underline]:[&]:shadow-[inset_0_-1px_0_var(--border)] data-[variant=pill]:[&]:p-[var(--space-1)] data-[variant=pill]:[&]:bg-[var(--background-muted,var(--background))] data-[variant=pill]:[&]:border data-[variant=pill]:[&]:border-border data-[variant=pill]:[&]:rounded-[var(--radius)] [[data-orientation=vertical]_&]:flex-col [[data-orientation=vertical]_&]:items-stretch [[data-orientation=vertical][data-variant=underline]_&]:w-auto [[data-orientation=vertical][data-variant=underline]_&]:shadow-[inset_-1px_0_0_var(--border)]";

export const TabsList = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.List>>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TabsContext);
  return (
    <BaseTabs.List
      ref={ref}
      data-variant={variant}
      className={cn(
        "relative inline-flex items-center gap-[var(--space-1)] w-fit",
        listVariantClasses,
        className,
      )}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

const triggerVariantClasses =
  "[[data-variant=underline]_&]:py-2.5 [[data-variant=underline]_&]:px-[var(--space-4)] [[data-variant=pill]_&]:py-1.5 [[data-variant=pill]_&]:px-[var(--space-3)] [[data-variant=pill]_&]:rounded-[calc(var(--radius)-2px)] [[data-variant=plain]_&]:py-1.5 [[data-variant=plain]_&]:px-[var(--space-2)] [[data-variant=plain]_&]:rounded-[calc(var(--radius)-2px)] data-[selected]:[[data-variant=plain]_&]:bg-[var(--background-muted,transparent)]";

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>>
>(({ className, ...props }, ref) => (
  <BaseTabs.Tab
    ref={ref}
    className={cn(
      "relative z-[1] inline-flex items-center justify-center gap-1.5 py-[var(--space-2)] px-[var(--space-3)] bg-transparent text-foreground-muted border-0 text-[length:var(--text-sm)] font-medium leading-none cursor-pointer transition-[color,background-color] duration-[var(--duration-fast)] select-none whitespace-nowrap hover:not-disabled:not-data-[selected]:text-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 data-[selected]:text-foreground disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
      triggerVariantClasses,
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const indicatorVariantClasses =
  "[[data-variant=underline]_&]:shadow-[inset_0_-2px_0_var(--primary)] [[data-variant=pill]_&]:bg-background [[data-variant=pill]_&]:rounded-[calc(var(--radius)-2px)] [[data-variant=pill]_&]:shadow-[0_1px_2px_rgba(0,0,0,0.06)] [[data-variant=plain]_&]:hidden [[data-orientation=vertical][data-variant=underline]_&]:shadow-[inset_-2px_0_0_var(--primary)]";

export const TabsIndicator = React.forwardRef<
  HTMLSpanElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.Indicator>>
>(({ className, ...props }, ref) => (
  <BaseTabs.Indicator
    ref={ref}
    className={cn(
      "absolute z-0 pointer-events-none transition-[top,left,width,height] duration-[180ms] data-[activation-direction=none]:transition-none top-[var(--active-tab-top)] left-[var(--active-tab-left)] w-[var(--active-tab-width)] h-[var(--active-tab-height)]",
      indicatorVariantClasses,
      className,
    )}
    {...props}
  />
));
TabsIndicator.displayName = "TabsIndicator";

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>>
>(({ className, ...props }, ref) => (
  <BaseTabs.Panel
    ref={ref}
    className={cn(
      "outline-none focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:rounded-[var(--radius)]",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export const useTabsVariant = () => React.useContext(TabsContext).variant;
