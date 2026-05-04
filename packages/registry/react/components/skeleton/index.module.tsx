import * as React from "react";
import styles from "./styles.module.css";


import { cn } from "@SH_UI_UTILS@";
/**
 * 로딩 중 콘텐츠 자리를 채우는 placeholder 박스. 폭/높이는 인라인 스타일이나
 * 클래스로 직접 지정한다. `aria-hidden`이 기본 적용되므로 스크린리더에 노출되지
 * 않는다 — 로딩 상태 안내가 필요하면 부모에 `aria-busy`를 함께 둘 것.
 */
export const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn(styles.skeleton, className)}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";
