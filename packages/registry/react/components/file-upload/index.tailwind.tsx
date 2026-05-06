"use client";

import * as React from "react";


import { cn } from "@SH_UI_UTILS@";
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

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
  if (!ctx) throw new Error("FileUpload 하위 컴포넌트는 <FileUpload> 내부에서만 사용할 수 있습니다.");
  return ctx;
}

export interface FileUploadProps {
  value?: File[]; defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onFiles?: (files: File[]) => void;
  multiple?: boolean; accept?: string;
  maxSize?: number; maxFiles?: number;
  disabled?: boolean;
  onError?: (message: string) => void;
  placeholder?: React.ReactNode; hint?: React.ReactNode;
  showFileList?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string; name?: string;
  children?: React.ReactNode;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ value, defaultValue, onValueChange, onFiles, multiple = false, accept, maxSize, maxFiles, disabled = false, onError, placeholder, hint, showFileList = true, className, style, id, name, children }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<File[]>(defaultValue ?? []);
    const files = isControlled ? value! : internal;

    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const [dragging, setDragging] = React.useState(false);

    const update = React.useCallback((next: File[]) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
      onFiles?.(next);
    }, [isControlled, onValueChange, onFiles]);

    const addFiles = React.useCallback((incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const accepted: File[] = [];
      for (const f of arr) {
        if (maxSize && f.size > maxSize) {
          onError?.(`${f.name}: 최대 ${formatBytes(maxSize)}까지 업로드 가능합니다.`);
          continue;
        }
        accepted.push(f);
      }
      if (accepted.length === 0) return;
      let next = multiple ? [...files, ...accepted] : [accepted[accepted.length - 1]];
      if (maxFiles && next.length > maxFiles) {
        onError?.(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
        next = next.slice(0, maxFiles);
      }
      update(next);
    }, [files, maxSize, maxFiles, multiple, onError, update]);

    const remove = React.useCallback((idx: number) => update(files.filter((_, i) => i !== idx)), [files, update]);
    const openPicker = React.useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    const ctx = React.useMemo<FileUploadContextValue>(() => ({
      files, dragging, disabled, multiple, accept, id, name, inputRef,
      setDragging, addFiles, remove, openPicker,
    }), [files, dragging, disabled, multiple, accept, id, name, addFiles, remove, openPicker]);

    return (
      <FileUploadContext.Provider value={ctx}>
        <div className={cn("flex flex-col gap-[var(--space-3)]", className)} style={style}>
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {children ?? <DefaultLayout placeholder={placeholder} hint={hint} showFileList={showFileList} />}
        </div>
      </FileUploadContext.Provider>
    );
  },
);
FileUpload.displayName = "FileUpload";

function DefaultLayout({ placeholder, hint, showFileList }: { placeholder?: React.ReactNode; hint?: React.ReactNode; showFileList: boolean }) {
  const { files } = useFileUpload();
  return (
    <>
      <FileUploadDropzone>
        <UploadIcon />
        <div className="text-[length:var(--text-sm)] text-foreground [&_strong]:font-semibold">
          {placeholder ?? <><strong>파일을 드래그</strong>하거나 <strong>클릭해서 선택</strong></>}
        </div>
        {hint && <div className="text-[length:var(--text-xs)] text-foreground-muted">{hint}</div>}
      </FileUploadDropzone>
      {showFileList && files.length > 0 && <FileUploadList />}
    </>
  );
}

export interface FileUploadDropzoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop" | "onDragOver" | "onDragLeave"> {
  children?: React.ReactNode;
}

export const FileUploadDropzone = React.forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  function FileUploadDropzone({ className, children, onClick, ...rest }, ref) {
    const { dragging, disabled, setDragging, addFiles, openPicker } = useFileUpload();
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
        className={cn(
          "relative flex flex-col items-center justify-center gap-[var(--space-2)] py-[var(--space-8)] px-[var(--space-6)] min-h-40 bg-background-subtle text-foreground-muted border-[1.5px] border-dashed border-border rounded-[var(--radius)] cursor-pointer text-center transition-[border-color,background-color,color] duration-[var(--duration-fast)] hover:border-border-strong hover:text-foreground focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:border-primary motion-reduce:transition-none",
          dragging && "border-foreground bg-background-muted text-foreground",
          disabled && "opacity-[var(--opacity-disabled)] cursor-not-allowed pointer-events-none",
          className,
        )}
        onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) openPicker(); }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); }
        }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          if (disabled) return;
          addFiles(e.dataTransfer.files);
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export interface FileUploadTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const FileUploadTrigger = React.forwardRef<HTMLButtonElement, FileUploadTriggerProps>(
  function FileUploadTrigger({ className, onClick, children, type, ...rest }, ref) {
    const { disabled, openPicker } = useFileUpload();
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled || rest.disabled}
        className={cn(
          "inline-flex items-center justify-center gap-[var(--space-2)] py-[var(--space-2)] px-[var(--space-3)] text-[length:var(--text-sm)] font-medium text-foreground bg-background border border-border rounded-[calc(var(--radius)-2px)] cursor-pointer transition-[background-color,border-color] duration-[var(--duration-fast)] hover:not-disabled:bg-background-muted hover:not-disabled:border-border-strong focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
          className,
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
          if (!e.defaultPrevented) openPicker();
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

export interface FileUploadListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  children?: React.ReactNode | ((args: { files: File[]; remove: (idx: number) => void }) => React.ReactNode);
}

export const FileUploadList = React.forwardRef<HTMLUListElement, FileUploadListProps>(
  function FileUploadList({ className, children, ...rest }, ref) {
    const { files, remove } = useFileUpload();
    if (files.length === 0) return null;
    const content = typeof children === "function"
      ? children({ files, remove })
      : (children ?? files.map((f, i) => <FileUploadItem key={`${f.name}-${i}`} file={f} index={i} />));

    return (
      <ul ref={ref} className={cn("list-none m-0 p-0 flex flex-col gap-1.5", className)} {...rest}>
        {content}
      </ul>
    );
  },
);

export interface FileUploadItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
  file: File;
  index: number;
  children?: React.ReactNode;
}

export const FileUploadItem = React.forwardRef<HTMLLIElement, FileUploadItemProps>(
  function FileUploadItem({ file, index, className, children, ...rest }, ref) {
    const { disabled, remove } = useFileUpload();
    return (
      <li
        ref={ref}
        className={cn(
          "flex items-center gap-2.5 py-[var(--space-2)] px-[var(--space-3)] bg-background border border-border rounded-[calc(var(--radius)-2px)] text-[length:var(--text-sm)] text-foreground [&>svg]:text-foreground-muted [&>svg]:shrink-0",
          className,
        )}
        {...rest}
      >
        {children ?? (
          <>
            <FileIcon />
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={file.name}>{file.name}</span>
            <span className="text-[length:var(--text-xs)] text-foreground-muted shrink-0">{formatBytes(file.size)}</span>
            <button
              type="button"
              className="inline-flex items-center justify-center w-6 h-6 p-0 bg-transparent border-none rounded-[calc(var(--radius)-4px)] text-foreground-muted cursor-pointer transition-[color,background-color] duration-[var(--duration-fast)] shrink-0 hover:not-disabled:text-foreground hover:not-disabled:bg-background-muted focus-visible:outline-[length:var(--border-width-strong)] focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed motion-reduce:transition-none"
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
  },
);

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden>
      <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
      <path d="M5 2.5h6l4 4v9a1.5 1.5 0 0 1-1.5 1.5h-8.5A1.5 1.5 0 0 1 3.5 15.5v-11A1.5 1.5 0 0 1 5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M11 2.5v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
