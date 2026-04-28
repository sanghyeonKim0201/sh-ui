"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  CodeIcon,
  Code2Icon,
  LinkIcon,
  MinusIcon,
  Undo2Icon,
  Redo2Icon,
} from "lucide-react";
import "./styles.css";

export interface RichTextEditorProps {
  /** 현재 HTML (controlled). */
  value: string;
  /** 본문이 바뀔 때 호출. HTML 문자열을 그대로 넘긴다. */
  onChange?: (html: string) => void;
  /** 비어 있을 때 표시할 placeholder. */
  placeholder?: string;
  /** 읽기 전용. 키 입력·툴바 차단. */
  readOnly?: boolean;
  /** 상단 툴바 숨기기. 본문 영역만 렌더. */
  hideToolbar?: boolean;
  /** 본문 영역의 최소 높이. */
  minHeight?: string;
  /** 본문 영역의 최대 높이. 초과 시 내부 스크롤. */
  maxHeight?: string;
  className?: string;
  "aria-label"?: string;
}

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

/**
 * Tiptap 기반 리치 텍스트 에디터.
 *
 * controlled — `value` 는 HTML 문자열, `onChange` 로 부모가 상태를 소유한다.
 * 기본 toolbar 는 StarterKit 의 표준 마크업(헤딩·리스트·인용·코드·링크 등) 을 다룬다.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  hideToolbar = false,
  minHeight,
  maxHeight,
  className,
  "aria-label": ariaLabel = "Rich text editor",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? "",
        emptyEditorClass: "sh-ui-rte__is-empty",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "sh-ui-rte__content",
        "aria-label": ariaLabel,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [readOnly, editor]);

  return (
    <div
      className={cx("sh-ui-rte", className)}
      data-readonly={readOnly || undefined}
      style={
        {
          "--sh-ui-rte-min-height": minHeight,
          "--sh-ui-rte-max-height": maxHeight,
        } as React.CSSProperties
      }
    >
      {!hideToolbar && <Toolbar editor={editor} disabled={readOnly} />}
      <EditorContent editor={editor} className="sh-ui-rte__viewport" />
    </div>
  );
}

interface ToolbarProps {
  editor: Editor | null;
  disabled: boolean;
}

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
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="sh-ui-rte__toolbar" role="toolbar" aria-label="Formatting" aria-disabled={disabled || undefined}>
      <ToolbarButton
        editor={editor}
        label="Bold"
        icon={<BoldIcon size={16} />}
        isActive={editor?.isActive("bold")}
        canRun={() => !!editor?.can().toggleBold()}
        run={() => editor?.chain().focus().toggleBold().run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Italic"
        icon={<ItalicIcon size={16} />}
        isActive={editor?.isActive("italic")}
        canRun={() => !!editor?.can().toggleItalic()}
        run={() => editor?.chain().focus().toggleItalic().run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Strikethrough"
        icon={<StrikethroughIcon size={16} />}
        isActive={editor?.isActive("strike")}
        canRun={() => !!editor?.can().toggleStrike()}
        run={() => editor?.chain().focus().toggleStrike().run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Inline code"
        icon={<CodeIcon size={16} />}
        isActive={editor?.isActive("code")}
        canRun={() => !!editor?.can().toggleCode()}
        run={() => editor?.chain().focus().toggleCode().run()}
        disabled={disabled}
      />

      <ToolbarSeparator />

      <ToolbarButton
        editor={editor}
        label="Heading 1"
        icon={<Heading1Icon size={16} />}
        isActive={editor?.isActive("heading", { level: 1 })}
        run={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Heading 2"
        icon={<Heading2Icon size={16} />}
        isActive={editor?.isActive("heading", { level: 2 })}
        run={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Heading 3"
        icon={<Heading3Icon size={16} />}
        isActive={editor?.isActive("heading", { level: 3 })}
        run={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={disabled}
      />

      <ToolbarSeparator />

      <ToolbarButton
        editor={editor}
        label="Bulleted list"
        icon={<ListIcon size={16} />}
        isActive={editor?.isActive("bulletList")}
        run={() => editor?.chain().focus().toggleBulletList().run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Ordered list"
        icon={<ListOrderedIcon size={16} />}
        isActive={editor?.isActive("orderedList")}
        run={() => editor?.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Blockquote"
        icon={<QuoteIcon size={16} />}
        isActive={editor?.isActive("blockquote")}
        run={() => editor?.chain().focus().toggleBlockquote().run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Code block"
        icon={<Code2Icon size={16} />}
        isActive={editor?.isActive("codeBlock")}
        run={() => editor?.chain().focus().toggleCodeBlock().run()}
        disabled={disabled}
      />

      <ToolbarSeparator />

      <ToolbarButton
        editor={editor}
        label="Link"
        icon={<LinkIcon size={16} />}
        isActive={editor?.isActive("link")}
        run={promptLink}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Horizontal rule"
        icon={<MinusIcon size={16} />}
        run={() => editor?.chain().focus().setHorizontalRule().run()}
        disabled={disabled}
      />

      <ToolbarSeparator />

      <ToolbarButton
        editor={editor}
        label="Undo"
        icon={<Undo2Icon size={16} />}
        canRun={() => !!editor?.can().undo()}
        run={() => editor?.chain().focus().undo().run()}
        disabled={disabled}
      />
      <ToolbarButton
        editor={editor}
        label="Redo"
        icon={<Redo2Icon size={16} />}
        canRun={() => !!editor?.can().redo()}
        run={() => editor?.chain().focus().redo().run()}
        disabled={disabled}
      />
    </div>
  );
}

interface ToolbarButtonProps {
  editor: Editor | null;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  /** false 를 반환하면 비활성. */
  canRun?: () => boolean;
  run: () => void;
  disabled: boolean;
}

function ToolbarButton({
  editor,
  label,
  icon,
  isActive,
  canRun,
  run,
  disabled,
}: ToolbarButtonProps) {
  const isDisabled = disabled || !editor || (canRun ? !canRun() : false);
  return (
    <button
      type="button"
      className={cx("sh-ui-rte__btn", isActive && "is-active")}
      aria-label={label}
      aria-pressed={isActive || undefined}
      title={label}
      disabled={isDisabled}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={run}
    >
      {icon}
    </button>
  );
}

function ToolbarSeparator() {
  return <span aria-hidden className="sh-ui-rte__sep" />;
}
