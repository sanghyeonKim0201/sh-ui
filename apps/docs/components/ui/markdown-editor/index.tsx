"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeEditor } from "../code-editor";
import "./styles.css";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
export interface MarkdownEditorProps {
  /**
   * Controlled — 현재 마크다운. 명시 시 외부 상태가 진실원천.
   * 미지정이면 uncontrolled — 컴포넌트가 자체 내부 상태로 동작.
   */
  value?: string;
  /**
   * Uncontrolled 초기값. value 미지정 시에만 사용된다.
   * @default ""
   */
  defaultValue?: string;
  /** 마크다운이 바뀔 때마다 호출 (controlled · uncontrolled 모두). */
  onChange?: (value: string) => void;
  /** 비어 있을 때 표시할 placeholder. */
  placeholder?: string;
  /** 읽기 전용. 키 입력 차단, 미리보기는 그대로 렌더. */
  readOnly?: boolean;
  /**
   * 미리보기 패널 표시 여부.
   * @default true
   */
  preview?: boolean;
  /**
   * 미리보기 위치. 좁은 화면(<768px)에서는 항상 아래로 쌓임.
   * @default "right"
   */
  previewPosition?: "right" | "bottom";
  /** 에디터·미리보기 영역의 최소 높이 (CSS 길이 단위). */
  minHeight?: string;
  /** 에디터·미리보기 영역의 최대 높이. 초과 시 내부 스크롤. */
  maxHeight?: string;
  className?: string;
  /** 에디터 영역에 부여할 aria-label. */
  "aria-label"?: string;
}


/**
 * 마크다운 에디터 — CodeEditor(소스) + react-markdown(라이브 프리뷰)의 합성.
 *
 * Controlled (value/onChange) · Uncontrolled (defaultValue) 모두 지원. 미리보기 패널이
 * 현재 마크다운을 필요로 하므로 uncontrolled 모드에서도 내부 상태로 트래킹.
 *
 * 미리보기는 GFM(테이블·체크박스·strikethrough)을 지원하고, raw HTML은 기본적으로
 * 차단(react-markdown 기본 동작)되어 사용자 입력으로부터의 XSS가 자동 방어된다.
 */
export function MarkdownEditor({
  value: valueProp,
  defaultValue,
  onChange,
  placeholder,
  readOnly,
  preview = true,
  previewPosition = "right",
  minHeight,
  maxHeight,
  className,
  "aria-label": ariaLabel = "Markdown editor",
}: MarkdownEditorProps) {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(valueProp ?? defaultValue ?? "");
  const value = isControlled ? valueProp : internalValue;

  const handleChange = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  return (
    <div
      className={cx(
        "sh-ui-md-editor",
        preview && `sh-ui-md-editor--${previewPosition}`,
        !preview && "sh-ui-md-editor--no-preview",
        className,
      )}
      data-readonly={readOnly || undefined}
    >
      <div className="sh-ui-md-editor__source">
        <CodeEditor
          value={value}
          onChange={handleChange}
          language="markdown"
          placeholder={placeholder}
          readOnly={readOnly}
          minHeight={minHeight}
          maxHeight={maxHeight}
          aria-label={ariaLabel}
        />
      </div>
      {preview && (
        <div
          className="sh-ui-md-editor__preview"
          role="region"
          aria-label="Preview"
          style={
            {
              "--sh-ui-md-editor-min-height": minHeight,
              "--sh-ui-md-editor-max-height": maxHeight,
            } as React.CSSProperties
          }
        >
          <div className="sh-ui-md-editor__preview-inner">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
