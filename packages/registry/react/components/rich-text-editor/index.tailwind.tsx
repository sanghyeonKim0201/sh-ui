"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { cn } from "@SH_UI_UTILS@";
import {
  BoldIcon, ItalicIcon, StrikethroughIcon,
  Heading1Icon, Heading2Icon, Heading3Icon,
  ListIcon, ListOrderedIcon, QuoteIcon,
  CodeIcon, Code2Icon, LinkIcon, MinusIcon,
  Undo2Icon, Redo2Icon,
} from "lucide-react";

export interface RichTextEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  hideToolbar?: boolean;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  "aria-label"?: string;
}


export function RichTextEditor({
  value: valueProp, defaultValue, onChange, placeholder, readOnly = false, hideToolbar = false,
  minHeight, maxHeight, className,
  "aria-label": ariaLabel = "Rich text editor",
}: RichTextEditorProps) {
  const isControlled = valueProp !== undefined;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? "",
        emptyEditorClass: "sh-ui-rte__is-empty",
      }),
      Link.configure({
        openOnClick: false, autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: valueProp ?? defaultValue ?? "",
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => { onChange?.(editor.getHTML()); },
    editorProps: {
      attributes: { class: "sh-ui-rte__content", "aria-label": ariaLabel },
    },
  });

  useEffect(() => {
    if (!isControlled) return;
    if (!editor) return;
    if (editor.getHTML() === valueProp) return;
    editor.commands.setContent(valueProp ?? "", { emitUpdate: false });
  }, [isControlled, valueProp, editor]);

  useEffect(() => { editor?.setEditable(!readOnly); }, [readOnly, editor]);

  return (
    <div
      className={cn(
        "sh-ui-rte flex flex-col border border-border rounded-[var(--radius)] bg-background overflow-hidden transition-[border-color] duration-[var(--duration-fast)] focus-within:border-primary focus-within:outline-[length:var(--border-width-strong)] focus-within:outline-ring focus-within:outline-offset-2 data-[readonly]:bg-background-subtle motion-reduce:transition-none",
        className,
      )}
      data-readonly={readOnly || undefined}
      style={{ "--sh-ui-rte-min-height": minHeight, "--sh-ui-rte-max-height": maxHeight } as React.CSSProperties}
    >
      {!hideToolbar && <Toolbar editor={editor} disabled={readOnly} />}
      <EditorContent editor={editor} className="sh-ui-rte__viewport" />
    </div>
  );
}

interface ToolbarProps { editor: Editor | null; disabled: boolean; }

function Toolbar({ editor, disabled }: ToolbarProps) {
  const promptLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const { empty } = editor.state.selection;
    const inLink = editor.isActive("link");
    if (empty && !inLink) {
      editor.chain().focus().insertContent({
        type: "text", text: url,
        marks: [{ type: "link", attrs: { href: url } }],
      }).run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 py-[var(--space-1)] px-[var(--space-2)] bg-background-muted border-b border-border"
      role="toolbar"
      aria-label="Formatting"
      aria-disabled={disabled || undefined}
    >
      <ToolbarButton editor={editor} label="Bold" icon={<BoldIcon size={16} />} isActive={editor?.isActive("bold")} canRun={() => !!editor?.can().toggleBold()} run={() => editor?.chain().focus().toggleBold().run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Italic" icon={<ItalicIcon size={16} />} isActive={editor?.isActive("italic")} canRun={() => !!editor?.can().toggleItalic()} run={() => editor?.chain().focus().toggleItalic().run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Strikethrough" icon={<StrikethroughIcon size={16} />} isActive={editor?.isActive("strike")} canRun={() => !!editor?.can().toggleStrike()} run={() => editor?.chain().focus().toggleStrike().run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Inline code" icon={<CodeIcon size={16} />} isActive={editor?.isActive("code")} canRun={() => !!editor?.can().toggleCode()} run={() => editor?.chain().focus().toggleCode().run()} disabled={disabled} />

      <ToolbarSeparator />

      <ToolbarButton editor={editor} label="Heading 1" icon={<Heading1Icon size={16} />} isActive={editor?.isActive("heading", { level: 1 })} run={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Heading 2" icon={<Heading2Icon size={16} />} isActive={editor?.isActive("heading", { level: 2 })} run={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Heading 3" icon={<Heading3Icon size={16} />} isActive={editor?.isActive("heading", { level: 3 })} run={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} disabled={disabled} />

      <ToolbarSeparator />

      <ToolbarButton editor={editor} label="Bulleted list" icon={<ListIcon size={16} />} isActive={editor?.isActive("bulletList")} run={() => editor?.chain().focus().toggleBulletList().run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Ordered list" icon={<ListOrderedIcon size={16} />} isActive={editor?.isActive("orderedList")} run={() => editor?.chain().focus().toggleOrderedList().run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Blockquote" icon={<QuoteIcon size={16} />} isActive={editor?.isActive("blockquote")} run={() => editor?.chain().focus().toggleBlockquote().run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Code block" icon={<Code2Icon size={16} />} isActive={editor?.isActive("codeBlock")} run={() => editor?.chain().focus().toggleCodeBlock().run()} disabled={disabled} />

      <ToolbarSeparator />

      <ToolbarButton editor={editor} label="Link" icon={<LinkIcon size={16} />} isActive={editor?.isActive("link")} run={promptLink} disabled={disabled} />
      <ToolbarButton editor={editor} label="Horizontal rule" icon={<MinusIcon size={16} />} run={() => editor?.chain().focus().setHorizontalRule().run()} disabled={disabled} />

      <ToolbarSeparator />

      <ToolbarButton editor={editor} label="Undo" icon={<Undo2Icon size={16} />} canRun={() => !!editor?.can().undo()} run={() => editor?.chain().focus().undo().run()} disabled={disabled} />
      <ToolbarButton editor={editor} label="Redo" icon={<Redo2Icon size={16} />} canRun={() => !!editor?.can().redo()} run={() => editor?.chain().focus().redo().run()} disabled={disabled} />
    </div>
  );
}

interface ToolbarButtonProps {
  editor: Editor | null;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  canRun?: () => boolean;
  run: () => void;
  disabled: boolean;
}

function ToolbarButton({ editor, label, icon, isActive, canRun, run, disabled }: ToolbarButtonProps) {
  const isDisabled = disabled || !editor || (canRun ? !canRun() : false);
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 p-0 bg-transparent text-foreground-muted border border-transparent rounded-[calc(var(--radius)-2px)] cursor-pointer transition-[color,background-color,border-color] duration-[var(--duration-fast)] hover:not-disabled:text-foreground hover:not-disabled:bg-background hover:not-disabled:border-border focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-1 disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed motion-reduce:transition-none",
        isActive && "text-foreground bg-background border-border-strong",
      )}
      aria-label={label}
      aria-pressed={isActive || undefined}
      title={label}
      disabled={isDisabled}
      onMouseDown={(e) => { e.preventDefault(); }}
      onClick={run}
    >
      {icon}
    </button>
  );
}

function ToolbarSeparator() {
  return <span aria-hidden className="inline-block w-px h-5 mx-[var(--space-1)] bg-border" />;
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-rte]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-rte", "");
  style.textContent = `
.sh-ui-rte__viewport { display: flex; min-height: var(--sh-ui-rte-min-height, 9rem); max-height: var(--sh-ui-rte-max-height, 28rem); overflow-y: auto; }
.sh-ui-rte__viewport > .ProseMirror { flex: 1; }
.sh-ui-rte__content { outline: none; padding: var(--space-3) var(--space-4); font-size: 0.9375rem; line-height: 1.65; color: var(--foreground); }
.sh-ui-rte__content > :first-child { margin-top: 0; }
.sh-ui-rte__content > :last-child { margin-bottom: 0; }
.sh-ui-rte__content p { margin: 0 0 var(--space-3); }
.sh-ui-rte__content h1, .sh-ui-rte__content h2, .sh-ui-rte__content h3, .sh-ui-rte__content h4, .sh-ui-rte__content h5, .sh-ui-rte__content h6 { margin: var(--space-4) 0 var(--space-2); font-weight: 600; line-height: 1.3; }
.sh-ui-rte__content h1 { font-size: 1.5rem; }
.sh-ui-rte__content h2 { font-size: 1.25rem; }
.sh-ui-rte__content h3 { font-size: 1.125rem; }
.sh-ui-rte__content ul, .sh-ui-rte__content ol { margin: 0 0 var(--space-3); padding-inline-start: var(--space-5); }
.sh-ui-rte__content li { margin-bottom: var(--space-1); }
.sh-ui-rte__content li > p { margin: 0; }
.sh-ui-rte__content blockquote { margin: 0 0 var(--space-3); padding: var(--space-2) var(--space-3); border-inline-start: 3px solid var(--border-strong); background: var(--background-subtle); color: var(--foreground-muted); border-radius: 0 calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0; }
.sh-ui-rte__content blockquote > :last-child { margin-bottom: 0; }
.sh-ui-rte__content code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.875em; padding: 0.125rem 0.375rem; border-radius: calc(var(--radius) - 4px); background: var(--background-muted); color: var(--foreground); }
.sh-ui-rte__content pre { margin: 0 0 var(--space-3); padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius); background: var(--background-subtle); overflow-x: auto; font-size: 0.8125rem; line-height: 1.6; }
.sh-ui-rte__content pre code { padding: 0; background: transparent; font-size: inherit; }
.sh-ui-rte__content hr { border: 0; border-top: 1px solid var(--border); margin: var(--space-4) 0; }
.sh-ui-rte__content a { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }
.sh-ui-rte__content a:hover { text-decoration-thickness: 2px; }
.sh-ui-rte__content p.is-editor-empty:first-child::before, .sh-ui-rte__content .is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--foreground-muted); float: left; pointer-events: none; height: 0; }
.sh-ui-rte__content del, .sh-ui-rte__content s { color: var(--foreground-muted); }
.sh-ui-rte__content ::selection { background: var(--background-muted); }
  `;
  document.head.appendChild(style);
}
