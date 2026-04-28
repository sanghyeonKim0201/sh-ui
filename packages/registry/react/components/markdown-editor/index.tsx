"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeEditor } from "../code-editor";
import "./styles.css";

export interface MarkdownEditorProps {
  /** 현재 마크다운 (controlled). */
  value: string;
  /** 마크다운이 바뀔 때 호출. */
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

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

/**
 * 마크다운 에디터 — CodeEditor(소스) + react-markdown(라이브 프리뷰)의 합성.
 *
 * 미리보기는 GFM(테이블·체크박스·strikethrough)을 지원하고, raw HTML은 기본적으로
 * 차단(react-markdown 기본 동작)되어 사용자 입력으로부터의 XSS가 자동 방어된다.
 */
export function MarkdownEditor({
  value,
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
          onChange={onChange}
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
