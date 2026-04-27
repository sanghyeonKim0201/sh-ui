"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
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
  /**
   * 외형 변형.
   * - `underline` — 활성 탭 하단 underline (기본). 일반 탭 UI
   * - `pill` — 활성 탭 둥근 배경. 세그먼트 컨트롤 스타일
   * - `plain` — 시각 강조 없음. 직접 스타일링용
   *
   * @default "underline"
   */
  variant?: TabsVariant;
};

/**
 * 한 영역에 여러 패널을 배치하고 탭으로 전환하는 컴파운드 컴포넌트. 같은 페이지의 동일 평면
 * 정보를 분류할 때 사용한다(라우트 분기는 라우팅으로). 자식 구조: TabsList > TabsTrigger × n, TabsContent × n.
 */
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

/** 탭 트리거들을 묶는 컨테이너. 키보드 화살표·Home·End로 트리거 간 이동이 가능하다. */
export const TabsList = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.List>>
>(({ className, ...props }, ref) => (
  <BaseTabs.List ref={ref} className={cx("sh-ui-tabs__list", className)} {...props} />
));
TabsList.displayName = "TabsList";

/** 한 탭의 트리거 버튼. `value` prop으로 매칭되는 TabsContent와 연결된다. */
export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>>
>(({ className, ...props }, ref) => (
  <BaseTabs.Tab ref={ref} className={cx("sh-ui-tabs__trigger", className)} {...props} />
));
TabsTrigger.displayName = "TabsTrigger";

/** 활성 탭 위치를 시각적으로 강조하는 인디케이터(보통 underline). TabsList 안에 둔다. */
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

/** 한 탭의 패널. 같은 `value`의 TabsTrigger가 활성일 때 노출된다. */
export const TabsContent = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>>
>(({ className, ...props }, ref) => (
  <BaseTabs.Panel ref={ref} className={cx("sh-ui-tabs__content", className)} {...props} />
));
TabsContent.displayName = "TabsContent";

/** 현재 Tabs의 variant를 자식에서 읽기 위한 훅. 커스텀 트리거를 만들 때 유용. */
export const useTabsVariant = () => React.useContext(TabsContext).variant;
