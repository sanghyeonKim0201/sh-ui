import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";


import { cn } from "@SH_UI_UTILS@";
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export type AccordionSize = "sm" | "md";

type AccordionProps = WithStringClassName<
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Root>
> & {
  size?: AccordionSize;
};

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, size = "md", ...props }, ref) => (
    <BaseAccordion.Root
      ref={ref}
      className={cn("flex flex-col w-full", className)}
      data-size={size}
      {...props}
    />
  ),
);
Accordion.displayName = "Accordion";

export const AccordionItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseAccordion.Item>>
>(({ className, ...props }, ref) => (
  <BaseAccordion.Item
    ref={ref}
    className={cn("border-b border-border first:border-t", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>>
>(({ className, children, ...props }, ref) => (
  <BaseAccordion.Header className="m-0 font-[inherit]">
    <BaseAccordion.Trigger
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-[var(--space-4)] w-full px-[var(--space-1)] py-[var(--space-4)] bg-transparent border-none text-foreground text-[0.9375rem] font-medium leading-snug text-left cursor-pointer transition-[background-color] duration-[var(--duration-fast)] hover:not-disabled:not-data-[disabled]:bg-background-muted focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:rounded-[calc(var(--radius)-2px)] disabled:cursor-not-allowed disabled:text-foreground-muted data-[disabled]:cursor-not-allowed data-[disabled]:text-foreground-muted [[data-size=sm]_&]:py-[var(--space-2)] [[data-size=sm]_&]:text-[length:var(--text-xs)] [[data-size=sm]_&]:leading-[1.2] motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
      <svg
        className="shrink-0 text-foreground-muted transition-transform duration-[180ms] data-[panel-open]:rotate-180 [[data-size=sm]_&]:w-3 [[data-size=sm]_&]:h-3 motion-reduce:transition-none"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </BaseAccordion.Trigger>
  </BaseAccordion.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseAccordion.Panel>>
>(({ className, children, ...props }, ref) => (
  <BaseAccordion.Panel
    ref={ref}
    className={cn(
      "overflow-hidden h-[var(--accordion-panel-height)] transition-[height] duration-[var(--duration-slow)] data-[starting-style]:h-0 data-[ending-style]:h-0 motion-reduce:transition-none",
      className,
    )}
    {...props}
  >
    <div className="px-[var(--space-1)] pb-[var(--space-4)] text-[length:var(--text-sm)] leading-relaxed text-foreground-muted [[data-size=sm]_&]:pb-[var(--space-2)] [[data-size=sm]_&]:text-[length:var(--text-xs)] [[data-size=sm]_&]:leading-[1.5]">
      {children}
    </div>
  </BaseAccordion.Panel>
));
AccordionContent.displayName = "AccordionContent";
