import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui-components/react/accordion";
import "./styles.css";

function cx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export const Accordion = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseAccordion.Root>>
>(({ className, ...props }, ref) => (
  <BaseAccordion.Root
    ref={ref}
    className={cx("sh-ui-accordion", className)}
    {...props}
  />
));
Accordion.displayName = "Accordion";

export const AccordionItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseAccordion.Item>>
>(({ className, ...props }, ref) => (
  <BaseAccordion.Item
    ref={ref}
    className={cx("sh-ui-accordion__item", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

/**
 * Trigger: 헤더 버튼. 우측에 chevron이 자동으로 붙고 expanded 상태에서 회전한다.
 * Base UI의 AccordionHeader(h3)로 감싸 의미론적 헤더 구조를 유지한다.
 */
export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>
  >
>(({ className, children, ...props }, ref) => (
  <BaseAccordion.Header className="sh-ui-accordion__header">
    <BaseAccordion.Trigger
      ref={ref}
      className={cx("sh-ui-accordion__trigger", className)}
      {...props}
    >
      <span className="sh-ui-accordion__trigger-label">{children}</span>
      <svg
        className="sh-ui-accordion__chevron"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
    className={cx("sh-ui-accordion__panel", className)}
    {...props}
  >
    <div className="sh-ui-accordion__content">{children}</div>
  </BaseAccordion.Panel>
));
AccordionContent.displayName = "AccordionContent";
