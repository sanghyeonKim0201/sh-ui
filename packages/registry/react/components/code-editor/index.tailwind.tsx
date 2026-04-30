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

export type CodeEditorLanguage =
  | "text" | "javascript" | "typescript" | "jsx" | "tsx"
  | "json" | "css" | "html" | "markdown";

export interface CodeEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  language?: CodeEditorLanguage;
  placeholder?: string;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  minHeight?: string;
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
    case "javascript": return javascript();
    case "typescript": return javascript({ typescript: true });
    case "jsx": return javascript({ jsx: true });
    case "tsx": return javascript({ jsx: true, typescript: true });
    case "json": return json();
    case "css": return cssLang();
    case "html": return html();
    case "markdown": return markdown();
    case "text":
    default: return [];
  }
}

/**
 * CodeMirror 6 기반 인라인 코드 에디터 (Tailwind 변종).
 * CodeMirror 자체의 .cm-* descendant 클래스는 Tailwind utility 로 표현 어려워
 * <style> 태그로 한 번 inject — 컴포넌트의 outer wrapper 만 Tailwind utility.
 */
export function CodeEditor({
  value: valueProp, defaultValue, onChange, language = "text", placeholder, readOnly = false,
  showLineNumbers = true, minHeight, maxHeight, className, id,
  "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy,
}: CodeEditorProps) {
  const isControlled = valueProp !== undefined;
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialDocRef = useRef(valueProp ?? defaultValue ?? "");

  const compartments = useMemo(() => ({
    language: new Compartment(),
    readOnly: new Compartment(),
    lineNumbers: new Compartment(),
    placeholder: new Compartment(),
  }), []);

  useEffect(() => {
    if (!hostRef.current) return;
    const extensions: Extension[] = [
      basicSetup,
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChangeRef.current?.(update.state.doc.toString());
      }),
      compartments.language.of(languageExtension(language)),
      compartments.readOnly.of(EditorState.readOnly.of(readOnly)),
      compartments.lineNumbers.of(showLineNumbers ? [] : EditorView.theme({ ".cm-gutters": { display: "none" } })),
      compartments.placeholder.of(placeholder ? placeholderExt(placeholder) : []),
    ];
    const view = new EditorView({
      state: EditorState.create({ doc: initialDocRef.current, extensions }),
      parent: hostRef.current,
    });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isControlled) return;
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === valueProp) return;
    view.dispatch({ changes: { from: 0, to: current.length, insert: valueProp ?? "" } });
  }, [isControlled, valueProp]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: compartments.language.reconfigure(languageExtension(language)) });
  }, [language, compartments.language]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: compartments.readOnly.reconfigure(EditorState.readOnly.of(readOnly)) });
  }, [readOnly, compartments.readOnly]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.lineNumbers.reconfigure(showLineNumbers ? [] : EditorView.theme({ ".cm-gutters": { display: "none" } })),
    });
  }, [showLineNumbers, compartments.lineNumbers]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.placeholder.reconfigure(placeholder ? placeholderExt(placeholder) : []),
    });
  }, [placeholder, compartments.placeholder]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const node = view.contentDOM;
    if (id) node.id = id;
    if (ariaLabel) node.setAttribute("aria-label", ariaLabel); else node.removeAttribute("aria-label");
    if (ariaLabelledBy) node.setAttribute("aria-labelledby", ariaLabelledBy); else node.removeAttribute("aria-labelledby");
  }, [id, ariaLabel, ariaLabelledBy]);

  return (
    <div
      ref={hostRef}
      className={cx(
        "sh-ui-code-editor relative border border-border rounded-[var(--radius)] bg-background text-[0.8125rem] leading-relaxed overflow-hidden transition-[border-color] duration-[var(--duration-fast)] focus-within:border-foreground focus-within:outline-[length:var(--border-width-strong)] focus-within:outline-foreground focus-within:outline-offset-2 data-[readonly]:bg-background-subtle motion-reduce:transition-none",
        className,
      )}
      data-readonly={readOnly || undefined}
      style={{ "--sh-ui-code-editor-min-height": minHeight, "--sh-ui-code-editor-max-height": maxHeight } as React.CSSProperties}
    />
  );
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-code-editor]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-code-editor", "");
  style.textContent = `
.sh-ui-code-editor .cm-editor { background: transparent; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.sh-ui-code-editor .cm-editor.cm-focused { outline: none; }
.sh-ui-code-editor .cm-scroller { font-family: inherit; min-height: var(--sh-ui-code-editor-min-height, 7.5rem); max-height: var(--sh-ui-code-editor-max-height, 25rem); }
.sh-ui-code-editor .cm-content { caret-color: var(--foreground); color: var(--foreground); padding: var(--space-3) 0; }
.sh-ui-code-editor .cm-line { padding: 0 var(--space-3); }
.sh-ui-code-editor .cm-gutters { background: var(--background-subtle); color: var(--foreground-muted); border-right: 1px solid var(--border); }
.sh-ui-code-editor .cm-activeLineGutter, .sh-ui-code-editor .cm-activeLine { background: var(--background-muted); }
.sh-ui-code-editor .cm-cursor, .sh-ui-code-editor .cm-dropCursor { border-left-color: var(--foreground); }
.sh-ui-code-editor .cm-selectionBackground, .sh-ui-code-editor .cm-editor .cm-selectionBackground, .sh-ui-code-editor .cm-editor.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .sh-ui-code-editor ::selection { background: var(--background-muted) !important; }
.sh-ui-code-editor .cm-placeholder { color: var(--foreground-muted); }
.sh-ui-code-editor .cm-tooltip { background: var(--background); border: 1px solid var(--border); color: var(--foreground); border-radius: calc(var(--radius) - 2px); }
.sh-ui-code-editor .cm-tooltip-autocomplete > ul > li[aria-selected] { background: var(--background-muted); color: var(--foreground); }
.sh-ui-code-editor .cm-matchingBracket, .sh-ui-code-editor .cm-nonmatchingBracket { background: var(--background-muted); color: var(--foreground); }
  `;
  document.head.appendChild(style);
}
