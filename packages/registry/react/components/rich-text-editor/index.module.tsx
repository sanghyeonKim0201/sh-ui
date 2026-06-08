"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import type { AnyExtension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import { Markdown } from "tiptap-markdown";
import { cn } from "@SH_UI_UTILS@";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  CodeIcon,
  Code2Icon,
  BaselineIcon,
  LinkIcon,
  UnlinkIcon,
  MinusIcon,
  Undo2Icon,
  Redo2Icon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import styles from "./styles.module.css";

/** 툴바 a11y 라벨/툴팁 — 기본 영어. `labels` prop 으로 부분 덮어쓰기(i18n). */
export interface RichTextEditorLabels {
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  code: string;
  h1: string;
  h2: string;
  h3: string;
  bulletList: string;
  orderedList: string;
  blockquote: string;
  codeBlock: string;
  textColor: string;
  link: string;
  horizontalRule: string;
  undo: string;
  redo: string;
  colorDefault: string;
  colorMoss: string;
  colorRed: string;
  colorOrange: string;
  colorBlue: string;
  linkUrl: string;
  apply: string;
  removeLink: string;
  cancel: string;
}

const DEFAULT_LABELS: RichTextEditorLabels = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  code: "Inline code",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  bulletList: "Bulleted list",
  orderedList: "Ordered list",
  blockquote: "Blockquote",
  codeBlock: "Code block",
  textColor: "Text color",
  link: "Link",
  horizontalRule: "Horizontal rule",
  undo: "Undo",
  redo: "Redo",
  colorDefault: "Default",
  colorMoss: "Moss",
  colorRed: "Red",
  colorOrange: "Orange",
  colorBlue: "Blue",
  linkUrl: "Link URL",
  apply: "Apply",
  removeLink: "Remove link",
  cancel: "Cancel",
};

export interface RichTextEditorProps {
  /**
   * 입출력 포맷. 기본 'html'(하위호환). 'markdown' 이면 value/defaultValue/onChange 가
   * markdown 문자열로 동작한다(tiptap-markdown 직렬화).
   *
   * 주의: 이 값은 **마운트 시점에만** 읽힌다 — 내부 `useEditor` 는 한 번만 생성되므로
   * 런타임에 format 을 바꾸려면 에디터를 리마운트해야 한다(예: key prop 교체).
   * 동일 제약이 `extensions` 에도 적용된다.
   * @default "html"
   */
  format?: "html" | "markdown";
  /**
   * Controlled — 현재 본문(format 에 따라 HTML 또는 markdown 문자열).
   * 명시 시 외부 상태가 진실원천이 되고 onChange 로 갱신한다.
   * 미지정이면 uncontrolled — Tiptap editor 가 자체 doc 으로 동작.
   */
  value?: string;
  /**
   * Uncontrolled 초기 본문(format 에 따라 HTML 또는 markdown 문자열). value 미지정 시에만 사용.
   * @default ""
   */
  defaultValue?: string;
  /**
   * 본문이 바뀔 때마다 호출 (controlled · uncontrolled 모두).
   * format='html' 이면 HTML, format='markdown' 이면 markdown 문자열을 넘긴다.
   */
  onChange?: (value: string) => void;
  /** Enter 로 제출. true 면 Enter=onSubmit, Shift+Enter=줄바꿈. 기본 false. */
  submitOnEnter?: boolean;
  /** 제출 콜백(submitOnEnter 또는 외부 버튼). */
  onSubmit?: () => void;
  /**
   * StarterKit·기본 확장 뒤에 append 할 추가 TipTap 확장(멘션 등).
   * 주의: `format` 과 마찬가지로 마운트 시점에만 읽힌다 — 런타임 변경은 리마운트 필요.
   */
  extensions?: AnyExtension[];
  /** 에디터 생성 시 콜백(외부에서 인스턴스 제어). */
  onCreate?: (editor: Editor) => void;
  /** 비어 있을 때 표시할 placeholder. */
  placeholder?: string;
  /** 읽기 전용. 키 입력·툴바 차단. */
  readOnly?: boolean;
  /** 상단 툴바 숨기기. 본문 영역만 렌더. */
  hideToolbar?: boolean;
  /** 핵심 버튼만 노출(좁은 패널용). 제목/코드블록/목록 일부를 생략한다. */
  compact?: boolean;
  /** "always"(기본) 항상 노출 · "focus" 포커스/편집 중에만 노출(인라인 느낌). */
  toolbarMode?: "always" | "focus";
  /** 툴바 라벨/툴팁 i18n. 누락 키는 영어 기본값. */
  labels?: Partial<RichTextEditorLabels>;
  /** 본문 영역의 최소 높이. */
  minHeight?: string;
  /** 본문 영역의 최대 높이. 초과 시 내부 스크롤. */
  maxHeight?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * 본문 텍스트 색 — CSS 변수로 저장(`var(--sh-ui-rte-c-*)`)해 라이트/다크 테마를
 * 추종한다(하드 hex 가 아님). 변수 정의부는 styles.module.css. moss 는 accent.
 */
const COLOR_SWATCHES = [
  { key: "moss", cssVar: "--sh-ui-rte-c-moss", labelKey: "colorMoss" },
  { key: "red", cssVar: "--sh-ui-rte-c-red", labelKey: "colorRed" },
  { key: "orange", cssVar: "--sh-ui-rte-c-orange", labelKey: "colorOrange" },
  { key: "blue", cssVar: "--sh-ui-rte-c-blue", labelKey: "colorBlue" },
] as const;

const colorValue = (cssVar: string) => `var(${cssVar})`;

/** tiptap-markdown storage 로 현재 doc 을 markdown 문자열로 직렬화. */
function readMarkdown(editor: Editor): string {
  const storage = editor.storage as {
    markdown?: { getMarkdown(): string };
  };
  // markdown storage 가 없으면(직렬화 확장 미등록) HTML 을 흘려보내면 포맷이 어긋난다 —
  // markdown 을 기대한 호출자에게 HTML 을 주지 않도록 빈 문자열로 폴백.
  return storage.markdown?.getMarkdown() ?? "";
}

/** 선택 영역(없으면 URL 텍스트 삽입)에 링크를 적용. */
function applyLink(editor: Editor, rawUrl: string) {
  const url = rawUrl.trim();
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  const { empty } = editor.state.selection;
  const inLink = editor.isActive("link");
  if (empty && !inLink) {
    // 선택 없이 호출되면 URL 자체를 anchor 텍스트로 삽입 — 빈 링크 마크가 남는 걸 방지
    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: url,
        marks: [{ type: "link", attrs: { href: url } }],
      })
      .run();
    return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

type ToolbarPanel = "none" | "link" | "color";

/**
 * Tiptap 기반 리치 텍스트 에디터.
 *
 * Controlled (value/onChange) · Uncontrolled (defaultValue) 모두 지원. 라우터·외부 상태와
 * 동기화할 게 없는 단일 입력 폼이라면 defaultValue 한 줄로 끝 — useState 불필요.
 *
 * 툴바: 굵게/기울임/밑줄/취소선/코드 · 글자색 · 링크 · 헤딩 · 리스트 · 인용 · 코드블록 ·
 * 구분선 · 실행취소/다시실행. compact 로 핵심만, toolbarMode="focus" 로 인라인 느낌.
 */
export function RichTextEditor({
  format = "html",
  value: valueProp,
  defaultValue,
  onChange,
  submitOnEnter = false,
  onSubmit,
  extensions,
  onCreate,
  placeholder,
  readOnly = false,
  hideToolbar = false,
  compact = false,
  toolbarMode = "always",
  labels,
  minHeight,
  maxHeight,
  className,
  "aria-label": ariaLabel = "Rich text editor",
}: RichTextEditorProps) {
  const isControlled = valueProp !== undefined;
  const [isFocused, setIsFocused] = useState(false);
  const [panel, setPanel] = useState<ToolbarPanel>("none");
  const L = labels ? { ...DEFAULT_LABELS, ...labels } : DEFAULT_LABELS;

  // onSubmit/submitOnEnter 를 ref 로 잡아 handleKeyDown 이 stale closure 가 되지 않게
  // 한다(에디터를 매 렌더마다 재생성하지 않으려고 콜백은 useEditor deps 에서 제외).
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const submitOnEnterRef = useRef(submitOnEnter);
  submitOnEnterRef.current = submitOnEnter;

  // 마지막으로 onChange 로 흘려보냈거나(우리 echo) controlled-sync 로 주입한 value.
  // controlled-sync 가 자기 자신의 emit 을 다시 setContent 하는 루프(커서 점프)를 막는다.
  // 비교는 정규화된 직렬화 형태가 아니라 "우리가 마지막으로 본 문자열" 기준이라
  // markdown 정규화(`**hi**` vs `**hi**\n`)로도 깨지지 않는다.
  const lastSyncedRef = useRef<string | undefined>(undefined);

  /** format 에 맞춰 에디터의 현재 본문을 직렬화(html/markdown). */
  const readValue = (ed: Editor): string =>
    format === "markdown" ? readMarkdown(ed) : ed.getHTML();

  const editor = useEditor({
    extensions: [
      // Link/Underline 은 v3 StarterKit 에 포함 — Link 는 따로 설정하려 끄고 별도 등록(중복 경고 회피).
      StarterKit.configure({ link: false }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
        emptyEditorClass: styles["rte__is-empty"],
      }),
      Link.configure({
        // 편집 중엔 클릭으로 이탈 방지, 읽기 전용일 때만 클릭 시 열림.
        openOnClick: readOnly,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      // markdown 모드에서만 직렬화 확장 등록 — html 모드(기본)는 기존과 동일.
      ...(format === "markdown" ? [Markdown.configure({ html: false })] : []),
      ...(extensions ?? []),
    ],
    // markdown 모드에서 tiptap-markdown 은 문자열을 markdown 으로 파싱한다.
    content: valueProp ?? defaultValue ?? "",
    editable: !readOnly,
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      onCreate?.(editor);
    },
    onUpdate: ({ editor }) => {
      const output = readValue(editor);
      // 우리가 방금 emit 한 값을 controlled-sync 가 다시 주입하지 않도록 기록.
      lastSyncedRef.current = output;
      onChange?.(output);
    },
    editorProps: {
      attributes: {
        class: styles.rte__content,
        "aria-label": ariaLabel,
      },
      handleKeyDown: (_view, event) => {
        if (
          submitOnEnterRef.current &&
          event.key === "Enter" &&
          !event.shiftKey &&
          // IME 조합 확정 Enter 는 제출이 아님(한글 등 — 조합 확정을 잘못 제출하면
          // 입력이 날아간다). isComposing + 레거시 keyCode 229 둘 다 가드.
          !event.isComposing &&
          event.keyCode !== 229
        ) {
          event.preventDefault();
          onSubmitRef.current?.();
          return true;
        }
        return false;
      },
    },
  });

  // controlled 모드에서만 외부 value 를 에디터 doc 에 동기화.
  // 직렬화 결과(readValue) 와 비교하면 markdown 정규화로 영원히 불일치 → 매 렌더 setContent
  // → 커서 점프가 난다. 대신 "마지막으로 우리가 주고받은 문자열"(lastSyncedRef) 과 비교해
  // 자기 echo 만 건너뛰고, 진짜 외부 변경(예: 채널 전환)은 항상 로드한다.
  useEffect(() => {
    if (!isControlled) return;
    if (!editor) return;
    if (valueProp === lastSyncedRef.current) return;
    lastSyncedRef.current = valueProp;
    editor.commands.setContent(valueProp ?? "", { emitUpdate: false });
  }, [isControlled, valueProp, editor]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [readOnly, editor]);

  const showToolbar =
    !hideToolbar && (toolbarMode === "always" || isFocused || panel !== "none");

  // 포커스 추적(toolbarMode="focus" 노출 판정용) — 래퍼의 focusin/focusout(버블).
  // 에디터·툴바 버튼·링크 입력·컬러 스와치 어디로 포커스가 옮겨가도 컨테이너 안이면
  // "포커스 중"을 유지(focusout 의 relatedTarget 가 컨테이너 내부면 무시).
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setIsFocused(false);
  };

  return (
    <div
      className={cn(styles.rte, className)}
      data-readonly={readOnly || undefined}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      style={
        {
          "--sh-ui-rte-min-height": minHeight,
          "--sh-ui-rte-max-height": maxHeight,
        } as React.CSSProperties
      }
    >
      {showToolbar && (
        <Toolbar
          editor={editor}
          disabled={readOnly}
          compact={compact}
          panel={panel}
          setPanel={setPanel}
          labels={L}
        />
      )}
      <EditorContent editor={editor} className={styles.rte__viewport} />
    </div>
  );
}

interface ToolbarProps {
  editor: Editor | null;
  disabled: boolean;
  compact: boolean;
  panel: ToolbarPanel;
  setPanel: (next: ToolbarPanel) => void;
  labels: RichTextEditorLabels;
}

/** 활성/실행가능 상태 스냅샷 — useEditorState 로 트랜잭션마다 구독(버튼 강조 즉시 반영). */
function Toolbar({
  editor,
  disabled,
  compact,
  panel,
  setPanel,
  labels: L,
}: ToolbarProps) {
  const flags = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            canBold: e.can().toggleBold(),
            italic: e.isActive("italic"),
            canItalic: e.can().toggleItalic(),
            underline: e.isActive("underline"),
            canUnderline: e.can().toggleUnderline(),
            strike: e.isActive("strike"),
            canStrike: e.can().toggleStrike(),
            code: e.isActive("code"),
            canCode: e.can().toggleCode(),
            h1: e.isActive("heading", { level: 1 }),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bulletList: e.isActive("bulletList"),
            orderedList: e.isActive("orderedList"),
            blockquote: e.isActive("blockquote"),
            codeBlock: e.isActive("codeBlock"),
            link: e.isActive("link"),
            color: e.getAttributes("textStyle").color as string | undefined,
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  const togglePanel = (next: Exclude<ToolbarPanel, "none">) =>
    setPanel(panel === next ? "none" : next);

  const f = flags;
  const editorReady = !!editor && !!f;
  const colorActive = Boolean(f?.color) || panel === "color";

  return (
    <div
      className={styles.rte__toolbar}
      role="toolbar"
      aria-label="Formatting"
      aria-disabled={disabled || undefined}
    >
      <div className={styles["rte__toolbar-row"]}>
        <ToolbarButton
          label={L.bold}
          icon={<BoldIcon size={16} />}
          isActive={f?.bold}
          disabled={disabled || !editorReady || !f?.canBold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label={L.italic}
          icon={<ItalicIcon size={16} />}
          isActive={f?.italic}
          disabled={disabled || !editorReady || !f?.canItalic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label={L.underline}
          icon={<UnderlineIcon size={16} />}
          isActive={f?.underline}
          disabled={disabled || !editorReady || !f?.canUnderline}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label={L.strike}
          icon={<StrikethroughIcon size={16} />}
          isActive={f?.strike}
          disabled={disabled || !editorReady || !f?.canStrike}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        {!compact && (
          <ToolbarButton
            label={L.code}
            icon={<CodeIcon size={16} />}
            isActive={f?.code}
            disabled={disabled || !editorReady || !f?.canCode}
            onClick={() => editor?.chain().focus().toggleCode().run()}
          />
        )}

        <ToolbarSeparator />

        <ToolbarButton
          label={L.textColor}
          icon={<BaselineIcon size={16} />}
          isActive={colorActive}
          disabled={disabled || !editorReady}
          onClick={() => togglePanel("color")}
        />
        <ToolbarButton
          label={L.link}
          icon={<LinkIcon size={16} />}
          isActive={f?.link || panel === "link"}
          disabled={disabled || !editorReady}
          onClick={() => togglePanel("link")}
        />

        {!compact && (
          <>
            <ToolbarSeparator />
            <ToolbarButton
              label={L.h1}
              icon={<Heading1Icon size={16} />}
              isActive={f?.h1}
              disabled={disabled || !editorReady}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 1 }).run()
              }
            />
            <ToolbarButton
              label={L.h2}
              icon={<Heading2Icon size={16} />}
              isActive={f?.h2}
              disabled={disabled || !editorReady}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
            />
            <ToolbarButton
              label={L.h3}
              icon={<Heading3Icon size={16} />}
              isActive={f?.h3}
              disabled={disabled || !editorReady}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
            />
          </>
        )}

        <ToolbarSeparator />

        <ToolbarButton
          label={L.bulletList}
          icon={<ListIcon size={16} />}
          isActive={f?.bulletList}
          disabled={disabled || !editorReady}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        {!compact && (
          <>
            <ToolbarButton
              label={L.orderedList}
              icon={<ListOrderedIcon size={16} />}
              isActive={f?.orderedList}
              disabled={disabled || !editorReady}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
              label={L.blockquote}
              icon={<QuoteIcon size={16} />}
              isActive={f?.blockquote}
              disabled={disabled || !editorReady}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            />
            <ToolbarButton
              label={L.codeBlock}
              icon={<Code2Icon size={16} />}
              isActive={f?.codeBlock}
              disabled={disabled || !editorReady}
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            />

            <ToolbarSeparator />

            <ToolbarButton
              label={L.horizontalRule}
              icon={<MinusIcon size={16} />}
              disabled={disabled || !editorReady}
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            />
          </>
        )}

        <ToolbarSeparator />

        <ToolbarButton
          label={L.undo}
          icon={<Undo2Icon size={16} />}
          disabled={disabled || !editorReady || !f?.canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          label={L.redo}
          icon={<Redo2Icon size={16} />}
          disabled={disabled || !editorReady || !f?.canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        />
      </div>

      {panel === "color" && editor && (
        <ColorRow
          editor={editor}
          current={f?.color}
          onClose={() => setPanel("none")}
          labels={L}
        />
      )}
      {panel === "link" && editor && (
        <LinkRow
          editor={editor}
          hasLink={!!f?.link}
          onClose={() => setPanel("none")}
          labels={L}
        />
      )}
    </div>
  );
}

/** 텍스트 색 선택 행 — 스와치 클릭 시 적용 후 닫힘. mousedown preventDefault 로 에디터 포커스 유지. */
function ColorRow({
  editor,
  current,
  onClose,
  labels: L,
}: {
  editor: Editor;
  current: string | undefined;
  onClose: () => void;
  labels: RichTextEditorLabels;
}) {
  const choose = (value: string | null) => {
    if (value === null) editor.chain().focus().unsetColor().run();
    else editor.chain().focus().setColor(value).run();
    onClose();
  };
  return (
    <div className={cn(styles.rte__panel, styles["rte__panel--swatches"])}>
      <Swatch
        label={L.colorDefault}
        onChoose={() => choose(null)}
        isActive={!current}
      >
        <span className={styles["rte__swatch-a"]}>A</span>
      </Swatch>
      {COLOR_SWATCHES.map((c) => {
        const value = colorValue(c.cssVar);
        return (
          <Swatch
            key={c.key}
            label={L[c.labelKey]}
            color={value}
            isActive={current === value}
            onChoose={() => choose(value)}
          />
        );
      })}
    </div>
  );
}

function Swatch({
  label,
  color,
  isActive,
  onChoose,
  children,
}: {
  label: string;
  color?: string;
  isActive?: boolean;
  onChoose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(styles.rte__swatch, isActive && "is-active")}
      style={color ? { backgroundColor: color } : undefined}
      aria-label={label}
      aria-pressed={isActive || undefined}
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={onChoose}
    >
      {children}
    </button>
  );
}

/** 인라인 링크 편집 행 — window.prompt 대체. 적용/제거/취소(아이콘). Enter 적용, Esc 취소. */
function LinkRow({
  editor,
  hasLink,
  onClose,
  labels: L,
}: {
  editor: Editor;
  hasLink: boolean;
  onClose: () => void;
  labels: RichTextEditorLabels;
}) {
  const [url, setUrl] = useState(
    () =>
      (editor.getAttributes("link").href as string | undefined) ?? "https://",
  );

  const apply = () => {
    applyLink(editor, url);
    onClose();
  };
  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  };

  return (
    <div className={styles.rte__panel}>
      <input
        type="url"
        value={url}
        autoFocus
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        placeholder="https://"
        aria-label={L.linkUrl}
        className={styles["rte__link-input"]}
      />
      <button
        type="button"
        className={styles.rte__btn}
        aria-label={L.apply}
        title={L.apply}
        onClick={apply}
      >
        <CheckIcon size={16} />
      </button>
      {hasLink && (
        <button
          type="button"
          className={styles.rte__btn}
          aria-label={L.removeLink}
          title={L.removeLink}
          onClick={remove}
        >
          <UnlinkIcon size={16} />
        </button>
      )}
      <button
        type="button"
        className={styles.rte__btn}
        aria-label={L.cancel}
        title={L.cancel}
        onClick={onClose}
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}

interface ToolbarButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  label,
  icon,
  isActive,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.rte__btn, isActive && "is-active")}
      aria-label={label}
      aria-pressed={isActive || undefined}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

function ToolbarSeparator() {
  return <span aria-hidden className={styles.rte__sep} />;
}
