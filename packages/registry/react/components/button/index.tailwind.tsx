import * as React from "react";
import { cn } from "@SH_UI_UTILS@";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--space-2)] border border-transparent rounded-[var(--radius)] font-medium leading-none whitespace-nowrap cursor-pointer select-none transition-[background-color,color,border-color] duration-[var(--duration-fast)] disabled:opacity-[var(--opacity-disabled)] disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "bg-background-muted text-foreground border-border hover:bg-background-subtle",
        ghost:
          "bg-transparent text-foreground hover:bg-background-muted",
        danger:
          "bg-danger text-danger-foreground hover:bg-danger-hover",
        link:
          "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-[var(--control-sm)] px-[var(--space-3)] text-[length:var(--text-sm)]",
        md: "h-[var(--control-md)] px-[var(--space-4)] text-[length:var(--text-sm)]",
        lg: "h-[var(--control-lg)] px-[var(--space-5)] text-[length:var(--text-base)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type Size = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 시각적 위계.
   * - `primary` — 페이지의 주요 액션. 한 화면에 하나만 권장.
   * - `secondary` — 보조 액션. 약한 배경 + border.
   * - `ghost` — 배경 없는 hover 강조 액션. 툴바/메뉴 항목에 적합.
   * - `danger` — 파괴적 액션(삭제, 취소 등).
   * - `link` — 텍스트 링크처럼 보이는 인라인 버튼.
   *
   * @default "primary"
   */
  variant?: Variant;
  /**
   * 크기.
   * - `sm` — 조밀한 영역(테이블 행, 툴바)
   * - `md` — 일반
   * - `lg` — CTA·랜딩 영역
   *
   * @default "md"
   */
  size?: Size;
}

/**
 * 사용자 액션을 트리거하는 기본 버튼 (Tailwind utility class 변종).
 * variant로 시각적 위계(primary/secondary/ghost/danger/link)를,
 * size로 크기를 결정한다. 페이지 이동 목적이면 anchor를 감싼 `link` variant를 사용할 것.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
