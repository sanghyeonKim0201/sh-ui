"use client";

import * as React from "react";
import "./styles.css";

function cx(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

/* ───────────── context ───────────── */

interface FileUploadContextValue {
  files: File[];
  dragging: boolean;
  disabled: boolean;
  multiple: boolean;
  accept?: string;
  id?: string;
  name?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setDragging: (v: boolean) => void;
  addFiles: (incoming: FileList | File[]) => void;
  remove: (idx: number) => void;
  openPicker: () => void;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(null);

function useFileUpload() {
  const ctx = React.useContext(FileUploadContext);
  if (!ctx) {
    throw new Error(
      "FileUpload 하위 컴포넌트는 <FileUpload> 내부에서만 사용할 수 있습니다.",
    );
  }
  return ctx;
}

/* ───────────── root ───────────── */

export interface FileUploadProps {
  /** 제어 모드. 있으면 컴포넌트는 순수 제어 컴포넌트로 동작한다. */
  value?: File[];
  /** 비제어 모드 초기값. */
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  /** onFiles — onValueChange 별칭 (compound API 호환). */
  onFiles?: (files: File[]) => void;
  multiple?: boolean;
  /** `accept` 속성 (e.g. "image/*", ".pdf,.docx"). */
  accept?: string;
  /** 파일당 최대 바이트. 초과 시 onError. */
  maxSize?: number;
  /** 총 파일 개수 상한. */
  maxFiles?: number;
  disabled?: boolean;
  onError?: (message: string) => void;
  /** 드롭존 중앙 텍스트 커스터마이즈 (자식이 없을 때만 사용됨). */
  placeholder?: React.ReactNode;
  /** 드롭존 하단 힌트 (자식이 없을 때만 사용됨). */
  hint?: React.ReactNode;
  /**
   * 내장 파일 목록 표시 여부. 자식이 없을 때(backward-compat default 레이아웃)만 적용.
   * compound 사용 시에는 FileUploadList의 존재 여부로 결정.
   */
  showFileList?: boolean;
  className?: string;
  /** 루트 래퍼 div 에 적용할 인라인 스타일. */
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  children?: React.ReactNode;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onFiles,
      multiple = false,
      accept,
      maxSize,
      maxFiles,
      disabled = false,
      onError,
      placeholder,
      hint,
      showFileList = true,
      className,
      style,
      id,
      name,
      children,
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<File[]>(defaultValue ?? []);
    const files = isControlled ? value! : internal;

    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const [dragging, setDragging] = React.useState(false);

    const update = React.useCallback(
      (next: File[]) => {
        if (!isControlled) setInternal(next);
        onValueChange?.(next);
        onFiles?.(next);
      },
      [isControlled, onValueChange, onFiles],
    );

    const addFiles = React.useCallback(
      (incoming: FileList | File[]) => {
        const arr = Array.from(incoming);
        const accepted: File[] = [];
        for (const f of arr) {
          if (maxSize && f.size > maxSize) {
            onError?.(
              `${f.name}: 최대 ${formatBytes(maxSize)}까지 업로드 가능합니다.`,
            );
            continue;
          }
          accepted.push(f);
        }
        if (accepted.length === 0) return;

        let next = multiple
          ? [...files, ...accepted]
          : [accepted[accepted.length - 1]];
        if (maxFiles && next.length > maxFiles) {
          onError?.(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
          next = next.slice(0, maxFiles);
        }
        update(next);
      },
      [files, maxSize, maxFiles, multiple, onError, update],
    );

    const remove = React.useCallback(
      (idx: number) => {
        update(files.filter((_, i) => i !== idx));
      },
      [files, update],
    );

    const openPicker = React.useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    const ctx = React.useMemo<FileUploadContextValue>(
      () => ({
        files,
        dragging,
        disabled,
        multiple,
        accept,
        id,
        name,
        inputRef,
        setDragging,
        addFiles,
        remove,
        openPicker,
      }),
      [files, dragging, disabled, multiple, accept, id, name, addFiles, remove, openPicker],
    );

    return (
      <FileUploadContext.Provider value={ctx}>
        <div className={cx("sh-ui-file-upload", className)} style={style}>
          {/* 공유 네이티브 input. Trigger/Dropzone 모두 이를 통해 파일 선택을 연다. */}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            className="sh-ui-file-upload__input"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = ""; // 동일 파일 재선택 허용
            }}
          />
          {children ?? (
            <DefaultLayout
              placeholder={placeholder}
              hint={hint}
              showFileList={showFileList}
            />
          )}
        </div>
      </FileUploadContext.Provider>
    );
  },
);
FileUpload.displayName = "FileUpload";

/* ───────────── default layout (backward-compat) ───────────── */

function DefaultLayout({
  placeholder,
  hint,
  showFileList,
}: {
  placeholder?: React.ReactNode;
  hint?: React.ReactNode;
  showFileList: boolean;
}) {
  const { files } = useFileUpload();
  return (
    <>
      <FileUploadDropzone>
        <UploadIcon />
        <div className="sh-ui-file-upload__text">
          {placeholder ?? (
            <>
              <strong>파일을 드래그</strong>하거나 <strong>클릭해서 선택</strong>
            </>
          )}
        </div>
        {hint && <div className="sh-ui-file-upload__hint">{hint}</div>}
      </FileUploadDropzone>
      {showFileList && files.length > 0 && <FileUploadList />}
    </>
  );
}

/* ───────────── parts ───────────── */

export interface FileUploadDropzoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop" | "onDragOver" | "onDragLeave"> {
  children?: React.ReactNode;
}

export const FileUploadDropzone = React.forwardRef<
  HTMLDivElement,
  FileUploadDropzoneProps
>(function FileUploadDropzone({ className, children, onClick, ...rest }, ref) {
  const { dragging, disabled, setDragging, addFiles, openPicker } =
    useFileUpload();
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      className={cx(
        "sh-ui-file-upload__dropzone",
        dragging && "sh-ui-file-upload__dropzone--drag",
        disabled && "sh-ui-file-upload__dropzone--disabled",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) openPicker();
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        addFiles(e.dataTransfer.files);
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface FileUploadTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const FileUploadTrigger = React.forwardRef<
  HTMLButtonElement,
  FileUploadTriggerProps
>(function FileUploadTrigger({ className, onClick, children, type, ...rest }, ref) {
  const { disabled, openPicker } = useFileUpload();
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled || rest.disabled}
      className={cx("sh-ui-file-upload__trigger", className)}
      onClick={(e) => {
        // Dropzone 내부에 있을 때 상위 onClick이 중복 트리거되지 않도록 버블 차단
        e.stopPropagation();
        onClick?.(e);
        if (!e.defaultPrevented) openPicker();
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export interface FileUploadListProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  /**
   * 커스텀 렌더. 없으면 내부에서 파일당 FileUploadItem을 자동 렌더한다.
   * render prop 형태로 files를 노출한다.
   */
  children?:
    | React.ReactNode
    | ((args: {
        files: File[];
        remove: (idx: number) => void;
      }) => React.ReactNode);
}

export const FileUploadList = React.forwardRef<
  HTMLUListElement,
  FileUploadListProps
>(function FileUploadList({ className, children, ...rest }, ref) {
  const { files, remove } = useFileUpload();
  if (files.length === 0) return null;

  const content =
    typeof children === "function"
      ? children({ files, remove })
      : (children ??
        files.map((f, i) => (
          <FileUploadItem key={`${f.name}-${i}`} file={f} index={i} />
        )));

  return (
    <ul
      ref={ref}
      className={cx("sh-ui-file-upload__list", className)}
      {...rest}
    >
      {content}
    </ul>
  );
});

export interface FileUploadItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
  file: File;
  /** files 배열 내 index. remove 버튼에서 사용. */
  index: number;
  children?: React.ReactNode;
}

export const FileUploadItem = React.forwardRef<
  HTMLLIElement,
  FileUploadItemProps
>(function FileUploadItem({ file, index, className, children, ...rest }, ref) {
  const { disabled, remove } = useFileUpload();
  return (
    <li
      ref={ref}
      className={cx("sh-ui-file-upload__item", className)}
      {...rest}
    >
      {children ?? (
        <>
          <FileIcon />
          <span className="sh-ui-file-upload__name" title={file.name}>
            {file.name}
          </span>
          <span className="sh-ui-file-upload__size">
            {formatBytes(file.size)}
          </span>
          <button
            type="button"
            className="sh-ui-file-upload__remove"
            onClick={() => remove(index)}
            disabled={disabled}
            aria-label={`${file.name} 제거`}
          >
            <XIcon />
          </button>
        </>
      )}
    </li>
  );
});

/* ───────────── icons ───────────── */

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M5 2.5h6l4 4v9a1.5 1.5 0 0 1-1.5 1.5h-8.5A1.5 1.5 0 0 1 3.5 15.5v-11A1.5 1.5 0 0 1 5 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11 2.5v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M4 4l8 8m0-8l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
