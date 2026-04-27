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
  /**
   * 외형 변형.
   * - `ghost` — 배경 없음, 눌림 시만 강조 (기본)
   * - `outline` — 항상 border 표시
   *
   * @default "ghost"
   */
  variant?: ToggleVariant;
  /**
   * 크기. `sm` / `md` / `lg`.
   *
   * @default "md"
   */
  size?: ToggleSize;
};

/**
 * 눌린 상태(pressed)를 가진 버튼. 툴바의 "굵게/기울임" 같은 즉시 토글 액션에 적합.
 * 시각만으로 상태를 구분하지 말고 `aria-label`이나 아이콘 옆 텍스트로 의미를 명확히 할 것.
 */
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
  /**
   * 그룹 내 모든 항목에 적용될 외형. 자식 ToggleGroupItem이 자동 상속한다.
   * @default "ghost"
   */
  variant?: ToggleVariant;
  /**
   * 그룹 내 모든 항목에 적용될 크기. 자식 ToggleGroupItem이 자동 상속한다.
   * @default "md"
   */
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

/**
 * 여러 ToggleGroupItem을 묶는 컨테이너. `toggleMultiple` 옵션으로 단일/다중 선택을
 * 결정하고, 그룹 단위로 variant·size를 적용한다. 항목들은 반드시 `ToggleGroupItem`을 사용할 것.
 */
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

/** ToggleGroup의 자식 항목. 부모 그룹의 variant·size를 자동으로 상속한다. */
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
