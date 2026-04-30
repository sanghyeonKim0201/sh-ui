import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function mergeClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

export const Card = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass(
        "flex flex-col gap-[var(--space-6)] py-[var(--space-6)] bg-background text-foreground border border-border rounded-[var(--radius)] max-sm:gap-[var(--space-4)] max-sm:py-[var(--space-4)]",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={mergeClass(
        "grid grid-cols-1 auto-rows-auto gap-y-1.5 px-[var(--space-6)] has-[[data-slot=card-action]]:grid-cols-[1fr_auto] max-sm:px-[var(--space-4)]",
        className,
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass(
        "text-[length:var(--text-base)] font-semibold leading-tight tracking-tight",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass(
        "text-[length:var(--text-sm)] leading-normal text-foreground-muted",
        className,
      )}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

/**
 * 헤더 우측에 배치되는 슬롯. CardHeader 내부에서 grid 2번째 컬럼을 차지.
 * CardHeader가 `has-[[data-slot=card-action]]` 으로 감지해 레이아웃을 전환한다.
 */
export const CardAction = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={mergeClass(
        "col-start-2 row-span-2 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  ),
);
CardAction.displayName = "CardAction";

export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass(
        "px-[var(--space-6)] text-[length:var(--text-sm)] leading-relaxed max-sm:px-[var(--space-4)]",
        className,
      )}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClass(
        "px-[var(--space-6)] flex items-center gap-[var(--space-2)] max-sm:px-[var(--space-4)] max-sm:flex-wrap",
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";
