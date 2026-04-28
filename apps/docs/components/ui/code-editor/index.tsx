"use client";

import { useEffect, useMemo, useRef } from "react";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView, placeholder as placeholderExt } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { css as cssLang } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { markdown } from "@codemirror/lang-markdown";
import "./styles.css";

export type CodeEditorLanguage =
  | "text"
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "json"
  | "css"
  | "html"
  | "markdown";

export interface CodeEditorProps {
  /** 현재 코드 (controlled). */
  value: string;
  /** 코드가 바뀔 때 호출. 미지정 시 read-only로 동작하지 않음 — 편집은 가능하지만 부모로 전달되지 않는다. */
  onChange?: (value: string) => void;
  /**
   * 신택스 하이라이팅 언어.
   * @default "text"
   */
  language?: CodeEditorLanguage;
  /** 비어 있을 때 표시할 placeholder. */
  placeholder?: string;
  /** 읽기 전용. 키 입력은 막지만 선택·복사는 가능. */
  readOnly?: boolean;
  /**
   * 좌측 줄 번호 표시 여부.
   * @default true
   */
  showLineNumbers?: boolean;
  /** 에디터 최소 높이 (CSS 길이 단위). */
  minHeight?: string;
  /** 에디터 최대 높이 (CSS 길이 단위). 초과 시 내부 스크롤. */
  maxHeight?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

function languageExtension(language: CodeEditorLanguage): Extension {
  switch (language) {
    case "javascript":
      return javascript();
    case "typescript":
      return javascript({ typescript: true });
    case "jsx":
      return javascript({ jsx: true });
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "json":
      return json();
    case "css":
      return cssLang();
    case "html":
      return html();
    case "markdown":
      return markdown();
    case "text":
    default:
      return [];
  }
}

/**
 * CodeMirror 6 기반 인라인 코드 에디터.
 *
 * 기본은 controlled — `value`/`onChange` 로 부모가 상태를 소유한다.
 * 신택스 하이라이팅·자동 들여쓰기·괄호 매칭 등은 CodeMirror `basicSetup` 을 그대로 사용,
 * 컬러·여백은 sh-ui 토큰(`--background`, `--foreground`, `--border` 등)으로 매핑돼 테마에 자동 추종.
 */
export function CodeEditor({
  value,
  onChange,
  language = "text",
  placeholder,
  readOnly = false,
  showLineNumbers = true,
  minHeight,
  maxHeight,
  className,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const compartments = useMemo(
    () => ({
      language: new Compartment(),
      readOnly: new Compartment(),
      lineNumbers: new Compartment(),
      placeholder: new Compartment(),
    }),
    [],
  );

  useEffect(() => {
    if (!hostRef.current) return;

    const extensions: Extension[] = [
      basicSetup,
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString());
        }
      }),
      compartments.language.of(languageExtension(language)),
      compartments.readOnly.of(EditorState.readOnly.of(readOnly)),
      compartments.lineNumbers.of(
        showLineNumbers
          ? []
          : EditorView.theme({ ".cm-gutters": { display: "none" } }),
      ),
      compartments.placeholder.of(placeholder ? placeholderExt(placeholder) : []),
    ];

    const view = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: hostRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // 초기 마운트 1회만 — 후속 동기화는 별도 이펙트가 처리
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.language.reconfigure(languageExtension(language)),
    });
  }, [language, compartments.language]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.readOnly.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly, compartments.readOnly]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.lineNumbers.reconfigure(
        showLineNumbers
          ? []
          : EditorView.theme({ ".cm-gutters": { display: "none" } }),
      ),
    });
  }, [showLineNumbers, compartments.lineNumbers]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.placeholder.reconfigure(
        placeholder ? placeholderExt(placeholder) : [],
      ),
    });
  }, [placeholder, compartments.placeholder]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const node = view.contentDOM;
    if (id) node.id = id;
    if (ariaLabel) node.setAttribute("aria-label", ariaLabel);
    else node.removeAttribute("aria-label");
    if (ariaLabelledBy) node.setAttribute("aria-labelledby", ariaLabelledBy);
    else node.removeAttribute("aria-labelledby");
  }, [id, ariaLabel, ariaLabelledBy]);

  return (
    <div
      ref={hostRef}
      className={cx("sh-ui-code-editor", className)}
      data-readonly={readOnly || undefined}
      style={
        {
          "--sh-ui-code-editor-min-height": minHeight,
          "--sh-ui-code-editor-max-height": maxHeight,
        } as React.CSSProperties
      }
    />
  );
}
