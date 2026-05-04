import * as React from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import styles from "./styles.module.css";


import { cn } from "@SH_UI_UTILS@";
/* ───────────── Radio ───────────── */

export type RadioProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadio.Root>,
  "className"
> & {
  className?: string;
};

/**
 * 단일 선택지. 단독으로 쓰지 않고 반드시 `RadioGroup` 안에 두 개 이상을 묶어 사용한다.
 * 단일 선택이지만 즉시 적용되는 설정에는 Switch를, 다중 선택에는 Checkbox를 권장.
 */
export const Radio = React.forwardRef<HTMLElement, RadioProps>(
  ({ className, ...props }, ref) => (
    <BaseRadio.Root
      ref={ref}
      className={cn(styles.radio, className)}
      {...props}
    >
      <BaseRadio.Indicator className={styles.radio__indicator} />
    </BaseRadio.Root>
  ),
);
Radio.displayName = "Radio";

/* ───────────── RadioGroup ───────────── */

export type RadioGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadioGroup>,
  "className"
> & {
  className?: string;
  /**
   * 그룹 내 항목 배치 방향.
   * - `vertical` — 세로 나열 (기본)
   * - `horizontal` — 가로 나열. 짧은 라벨 2~3개에만 권장
   *
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
};

/**
 * 여러 Radio를 묶는 컨테이너. 같은 `name` 아래 단일 선택을 보장하고,
 * 키보드 화살표로 항목 간 이동이 가능하다. 그룹 라벨은 외부 `<Label>`로 제공할 것.
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <BaseRadioGroup
      ref={ref}
      className={cn(styles["radio-group"], className)}
      data-orientation={orientation}
      {...props}
    />
  ),
);
RadioGroup.displayName = "RadioGroup";
