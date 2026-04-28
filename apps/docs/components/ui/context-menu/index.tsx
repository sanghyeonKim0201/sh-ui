import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import "./styles.css";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

/* ───────── Root ───────── */

/**
 * 우클릭(또는 long-press)으로 열리는 컨텍스트 메뉴 루트. 자식으로 Trigger와 Content를 둔다.
 * 사용 가능 액션이 명시적으로 보이는 게 유리한 경우엔 일반 버튼 + DropdownMenu를 권장.
 */
export const ContextMenu = BaseContextMenu.Root;

/* ───────── Trigger ─────────
 * 우클릭(또는 long-press)을 감지하는 wrapper. 기본은 투명, 사용자는
 * 자신의 영역(Card, 이미지 등)에 적용하여 감싼다.
 */

/** 우클릭/long-press를 감지할 영역. Card나 이미지 등 임의 영역을 자식으로 감싼다. */
export const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Trigger>>
>(function ContextMenuTrigger({ className, ...props }, ref) {
  return (
    <BaseContextMenu.Trigger
      ref={ref}
      className={cx("sh-ui-cm__trigger", className)}
      {...props}
    />
  );
});

/* ───────── Content ───────── */

export interface ContextMenuContentProps
  extends WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.Popup>
  > {
  /**
   * Portal이 마운트될 DOM 노드.
   * @default document.body
   */
  container?: React.ComponentPropsWithoutRef<
    typeof BaseContextMenu.Portal
  >["container"];
}

/** 메뉴의 실제 콘텐츠. portal로 마운트되며 클릭 위치 기준으로 자동 배치된다. */
export const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  ContextMenuContentProps
>(function ContextMenuContent({ className, children, container, ...props }, ref) {
  return (
    <BaseContextMenu.Portal container={container}>
      <BaseContextMenu.Positioner className="sh-ui-cm__positioner">
        <BaseContextMenu.Popup
          ref={ref}
          className={cx("sh-ui-cm__content", className)}
          {...props}
        >
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  );
});

/* ───────── Item ───────── */

/** 일반 메뉴 항목. 클릭 시 메뉴가 닫히고 onClick이 발생한다. */
export const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Item>>
>(function ContextMenuItem({ className, ...props }, ref) {
  return (
    <BaseContextMenu.Item
      ref={ref}
      className={cx("sh-ui-cm__item", className)}
      {...props}
    />
  );
});

/* ───────── CheckboxItem / RadioItem ───────── */

/** 체크 표시를 토글하는 메뉴 항목. 메뉴는 닫지 않고 상태만 바꾸는 옵션 ON/OFF 용도. */
export const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.CheckboxItem>
  >
>(function ContextMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.CheckboxItem
      ref={ref}
      className={cx("sh-ui-cm__item", "sh-ui-cm__item--check", className)}
      {...props}
    >
      <span className="sh-ui-cm__item-indicator" aria-hidden>
        <BaseContextMenu.CheckboxItemIndicator>
          <CheckIcon />
        </BaseContextMenu.CheckboxItemIndicator>
      </span>
      <span className="sh-ui-cm__item-text">{children}</span>
    </BaseContextMenu.CheckboxItem>
  );
});

/** RadioItem들을 단일 선택 그룹으로 묶는 컨테이너. `value`로 선택값을 제어. */
export const ContextMenuRadioGroup = BaseContextMenu.RadioGroup;

/** ContextMenuRadioGroup 내부의 단일 선택 항목. */
export const ContextMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.RadioItem>
  >
>(function ContextMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.RadioItem
      ref={ref}
      className={cx("sh-ui-cm__item", "sh-ui-cm__item--check", className)}
      {...props}
    >
      <span className="sh-ui-cm__item-indicator" aria-hidden>
        <BaseContextMenu.RadioItemIndicator>
          <DotIcon />
        </BaseContextMenu.RadioItemIndicator>
      </span>
      <span className="sh-ui-cm__item-text">{children}</span>
    </BaseContextMenu.RadioItem>
  );
});

/* ───────── Group / Label / Separator ───────── */

/** 의미적으로 묶이는 항목 그룹. ContextMenuLabel과 함께 사용해 카테고리 헤더를 붙인다. */
export const ContextMenuGroup = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Group>>
>(function ContextMenuGroup({ className, ...props }, ref) {
  return (
    <BaseContextMenu.Group
      ref={ref}
      className={cx("sh-ui-cm__group", className)}
      {...props}
    />
  );
});

/** 그룹의 카테고리 헤더 라벨. 클릭 불가, 시각·접근성 컨텍스트 제공용. */
export const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.GroupLabel>
  >
>(function ContextMenuLabel({ className, ...props }, ref) {
  return (
    <BaseContextMenu.GroupLabel
      ref={ref}
      className={cx("sh-ui-cm__label", className)}
      {...props}
    />
  );
});

/** 항목 사이의 시각적 구분선. */
export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function ContextMenuSeparator({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cx("sh-ui-cm__separator", className)}
      {...props}
    />
  );
});

/* ───────── Submenu ───────── */

/** 서브메뉴 루트. 호버/포커스 시 우측으로 자식 메뉴를 펼친다. */
export const ContextMenuSub = BaseContextMenu.SubmenuRoot;

/** 서브메뉴를 여는 항목. 우측 화살표 아이콘이 자동 부착된다. */
export const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<
    React.ComponentPropsWithoutRef<typeof BaseContextMenu.SubmenuTrigger>
  >
>(function ContextMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.SubmenuTrigger
      ref={ref}
      className={cx("sh-ui-cm__item", "sh-ui-cm__sub-trigger", className)}
      {...props}
    >
      <span className="sh-ui-cm__item-text">{children}</span>
      <span className="sh-ui-cm__sub-arrow" aria-hidden>
        <ChevronRightIcon />
      </span>
    </BaseContextMenu.SubmenuTrigger>
  );
});

/** 서브메뉴의 콘텐츠. ContextMenuContent의 별칭이다. */
export const ContextMenuSubContent = ContextMenuContent;

/* ───────── 기본 아이콘 ───────── */

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden>
      <circle cx="4" cy="4" r="3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
