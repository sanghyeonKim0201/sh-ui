import * as React from "react";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import "./styles.css";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

/**
 * 상단 앱 메뉴바(파일/편집/보기 등). 내부에 DropdownMenu를 나란히 배치하여
 * 좌우 화살표로 메뉴 간 이동이 가능해진다.
 *
 *   <Menubar>
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>파일</DropdownMenuTrigger>
 *       <DropdownMenuContent>...</DropdownMenuContent>
 *     </DropdownMenu>
 *     <DropdownMenu>...</DropdownMenu>
 *   </Menubar>
 */
export const Menubar = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseMenubar>>
>(function Menubar({ className, ...props }, ref) {
  return (
    <BaseMenubar
      ref={ref}
      className={cx("sh-ui-menubar", className)}
      {...props}
    />
  );
});
