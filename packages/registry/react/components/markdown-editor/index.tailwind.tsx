"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeEditor } from "../code-editor";

import { cn } from "@SH_UI_UTILS@";
export interface MarkdownEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  preview?: boolean;
  previewPosition?: "right" | "bottom";
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  "aria-label"?: string;
}


/**
 * 마크다운 에디터 (Tailwind 변종) — react-markdown 의 출력 HTML 트리에 대한
 * descendant 스타일링은 utility 만으로 깔끔하게 표현이 어려워 <style> 태그로 inject.
 * outer wrapper grid 레이아웃만 utility class.
 */
export function MarkdownEditor({
  value: valueProp, defaultValue, onChange, placeholder, readOnly,
  preview = true, previewPosition = "right", minHeight, maxHeight, className,
  "aria-label": ariaLabel = "Markdown editor",
}: MarkdownEditorProps) {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(valueProp ?? defaultValue ?? "");
  const value = isControlled ? valueProp : internalValue;

  const handleChange = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const layoutClass = !preview
    ? "grid-cols-1"
    : previewPosition === "bottom"
      ? "grid-cols-1"
      : "grid-cols-2 max-md:grid-cols-1";

  return (
    <div
      className={cn("grid gap-[var(--space-3)]", layoutClass, className)}
      data-readonly={readOnly || undefined}
    >
      <div className="min-w-0">
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
          className="sh-ui-md-editor__preview min-w-0 border border-border rounded-[var(--radius)] bg-background overflow-hidden"
          role="region"
          aria-label="Preview"
          style={{
            "--sh-ui-md-editor-min-height": minHeight,
            "--sh-ui-md-editor-max-height": maxHeight,
          } as React.CSSProperties}
        >
          <div className="sh-ui-md-editor__preview-inner">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-md-editor]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-md-editor", "");
  style.textContent = `
.sh-ui-md-editor__preview-inner { padding: var(--space-3) var(--space-4); min-height: var(--sh-ui-md-editor-min-height, 7.5rem); max-height: var(--sh-ui-md-editor-max-height, 25rem); overflow-y: auto; font-size: 0.875rem; line-height: 1.65; color: var(--foreground); }
.sh-ui-md-editor__preview-inner > :first-child { margin-top: 0; }
.sh-ui-md-editor__preview-inner > :last-child { margin-bottom: 0; }
.sh-ui-md-editor__preview-inner h1, .sh-ui-md-editor__preview-inner h2, .sh-ui-md-editor__preview-inner h3, .sh-ui-md-editor__preview-inner h4, .sh-ui-md-editor__preview-inner h5, .sh-ui-md-editor__preview-inner h6 { margin-top: var(--space-4); margin-bottom: var(--space-2); font-weight: 600; line-height: 1.3; color: var(--foreground); }
.sh-ui-md-editor__preview-inner h1 { font-size: 1.5rem; }
.sh-ui-md-editor__preview-inner h2 { font-size: 1.25rem; }
.sh-ui-md-editor__preview-inner h3 { font-size: 1.125rem; }
.sh-ui-md-editor__preview-inner h4, .sh-ui-md-editor__preview-inner h5, .sh-ui-md-editor__preview-inner h6 { font-size: 1rem; }
.sh-ui-md-editor__preview-inner p, .sh-ui-md-editor__preview-inner ul, .sh-ui-md-editor__preview-inner ol, .sh-ui-md-editor__preview-inner blockquote, .sh-ui-md-editor__preview-inner pre, .sh-ui-md-editor__preview-inner table { margin-top: 0; margin-bottom: var(--space-3); }
.sh-ui-md-editor__preview-inner ul, .sh-ui-md-editor__preview-inner ol { padding-inline-start: var(--space-5); }
.sh-ui-md-editor__preview-inner li { margin-bottom: var(--space-1); }
.sh-ui-md-editor__preview-inner li > input[type="checkbox"] { margin-inline-end: var(--space-2); }
.sh-ui-md-editor__preview-inner a { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }
.sh-ui-md-editor__preview-inner a:hover { text-decoration-thickness: 2px; }
.sh-ui-md-editor__preview-inner blockquote { padding: var(--space-2) var(--space-3); border-inline-start: 3px solid var(--border-strong); background: var(--background-subtle); color: var(--foreground-muted); border-radius: 0 calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0; }
.sh-ui-md-editor__preview-inner blockquote > :last-child { margin-bottom: 0; }
.sh-ui-md-editor__preview-inner code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.875em; padding: 0.125rem 0.375rem; border-radius: calc(var(--radius) - 4px); background: var(--background-muted); color: var(--foreground); }
.sh-ui-md-editor__preview-inner pre { padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius); background: var(--background-subtle); overflow-x: auto; font-size: 0.8125rem; line-height: 1.6; }
.sh-ui-md-editor__preview-inner pre > code { padding: 0; background: transparent; font-size: inherit; }
.sh-ui-md-editor__preview-inner hr { border: 0; border-top: 1px solid var(--border); margin: var(--space-4) 0; }
.sh-ui-md-editor__preview-inner table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.sh-ui-md-editor__preview-inner th, .sh-ui-md-editor__preview-inner td { padding: var(--space-2) var(--space-3); border: 1px solid var(--border); text-align: start; }
.sh-ui-md-editor__preview-inner thead { background: var(--background-subtle); }
.sh-ui-md-editor__preview-inner img { max-width: 100%; height: auto; border-radius: calc(var(--radius) - 2px); }
.sh-ui-md-editor__preview-inner del { color: var(--foreground-muted); }
  `;
  document.head.appendChild(style);
}
