import * as React from "react";
import styles from "./styles.module.css";

import { cn } from "@SH_UI_UTILS@";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}


/**
 * 여러 줄 텍스트 입력. 네이티브 `<textarea>` 위에 sh-ui 토큰 스타일만 입혔다.
 * 라벨/오류 메시지는 외부에서 조립한다 — 단독 사용 시 `<Label>`과 `aria-describedby` 연결 권장.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(styles.textarea, className)}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
