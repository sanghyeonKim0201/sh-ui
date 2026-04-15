import * as React from "react";
import "./styles.css";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function mergeClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

export const Card = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={mergeClass("sh-ui-card", className)} {...props} />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={mergeClass("sh-ui-card__header", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass("sh-ui-card__title", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass("sh-ui-card__description", className)}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

/**
 * 헤더 우측에 배치되는 슬롯. CardHeader 내부에서 grid 2번째 컬럼을 차지.
 * CardHeader가 `:has(.sh-ui-card__action)`으로 감지해 레이아웃을 전환한다.
 */
export const CardAction = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass("sh-ui-card__action", className)}
      {...props}
    />
  ),
);
CardAction.displayName = "CardAction";

export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass("sh-ui-card__content", className)}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass("sh-ui-card__footer", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";
