"use client";

import * as React from "react";
import styles from "./styles.module.css";


import { cn } from "@SH_UI_UTILS@";
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
  /** 제어 모드 파일 배열. 지정 시 순수 제어 컴포넌트로 동작한다. */
  value?: File[];
  /** 비제어 모드 초기값. */
  defaultValue?: File[];
  /** 파일 목록 변경 콜백. 추가/제거/대체 모두 이 콜백으로 통보된다. */
  onValueChange?: (files: File[]) => void;
  /** `onValueChange` 별칭 (compound API 호환). 보통 `onValueChange` 사용 권장. */
  onFiles?: (files: File[]) => void;
  /**
   * 다중 선택 허용. `false`면 새 파일이 기존 파일을 대체한다.
   * @default false
   */
  multiple?: boolean;
  /**
   * 네이티브 `<input accept>`. MIME 또는 확장자.
   * @example "image/*", ".pdf,.docx"
   */
  accept?: string;
  /** 파일당 최대 바이트. 초과 시 `onError`로 알림 후 해당 파일은 거부된다. */
  maxSize?: number;
  /** 총 파일 개수 상한. 초과 시 `onError` 후 잘려서 보관. */
  maxFiles?: number;
  /** 비활성. 클릭/드롭 모두 차단. */
  disabled?: boolean;
  /** 검증 실패(크기·개수 초과) 시 한국어 메시지가 전달된다. 토스트 등에 연결. */
  onError?: (message: string) => void;
  /** 기본 dropzone 중앙 텍스트 커스터마이즈. children 미지정 시에만 적용. */
  placeholder?: React.ReactNode;
  /** 기본 dropzone 하단 힌트. children 미지정 시에만 적용. */
  hint?: React.ReactNode;
  /**
   * 기본 레이아웃에서 파일 목록 노출 여부. children 조립 모드에서는 FileUploadList 존재 여부로 결정.
   * @default true
   */
  showFileList?: boolean;
  className?: string;
  /** 루트 래퍼 div에 적용할 인라인 스타일. */
  style?: React.CSSProperties;
  /** 네이티브 input의 `id`. `<Label htmlFor>`와 연결할 때 사용. */
  id?: string;
  /** 네이티브 input의 `name`. form submit 시 필드명. */
  name?: string;
  /**
   * compound 모드. 미지정 시 기본 dropzone+목록 레이아웃이 자동 렌더된다.
   * 직접 조립하려면 `FileUploadDropzone`/`FileUploadTrigger`/`FileUploadList`/`FileUploadItem`을 자식으로 넘긴다.
   */
  children?: React.ReactNode;
}

/**
 * 파일 선택·드래그앤드롭 업로드. children 없이 쓰면 기본 dropzone+목록 레이아웃이 자동으로 그려지고,
 * 직접 조립하려면 FileUploadDropzone/Trigger/List/Item을 자식으로 사용한다.
 * 파일은 컴포넌트가 보관할 뿐 실제 업로드는 호출 측에서 onValueChange로 받아 처리한다.
 */
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
        <div className={cn(styles["file-upload"], className)} style={style}>
          {/* 공유 네이티브 input. Trigger/Dropzone 모두 이를 통해 파일 선택을 연다. */}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            className={styles["file-upload__input"]}
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
        <div className={styles["file-upload__text"]}>
          {placeholder ?? (
            <>
              <strong>파일을 드래그</strong>하거나 <strong>클릭해서 선택</strong>
            </>
          )}
        </div>
        {hint && <div className={styles["file-upload__hint"]}>{hint}</div>}
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

/**
 * 파일을 드롭하거나 클릭해 파일 선택창을 여는 영역. 키보드 Enter/Space로도 동작.
 */
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
      className={cn(
        styles["file-upload__dropzone"],
        dragging && styles["file-upload__dropzone--drag"],
        disabled && styles["file-upload__dropzone--disabled"],
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

/** 파일 선택창을 여는 버튼. Dropzone 내부에 두면 클릭 버블링이 자동 차단된다. */
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
      className={cn(styles["file-upload__trigger"], className)}
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
   * 직접 노드를 넘기거나, 함수를 넘기면 현재 files와 remove 함수를 받아 직접 렌더할 수 있다.
   * 미지정 시 파일당 `FileUploadItem`이 자동 렌더된다.
   *
   * @example
   * <FileUploadList>
   *   {({ files, remove }) => files.map((f, i) => (
   *     <li key={i}>{f.name} <button onClick={() => remove(i)}>x</button></li>
   *   ))}
   * </FileUploadList>
   */
  children?:
    | React.ReactNode
    | ((args: {
        /** 현재 보관 중인 파일 목록. */
        files: File[];
        /** 인덱스 기반 파일 제거. */
        remove: (idx: number) => void;
      }) => React.ReactNode);
}

/**
 * 선택된 파일 목록(`<ul>`). children에 함수를 넘기면 files·remove를 받아 직접 렌더할 수 있고,
 * 생략하면 파일당 FileUploadItem이 자동 렌더된다.
 */
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
      className={cn(styles["file-upload__list"], className)}
      {...rest}
    >
      {content}
    </ul>
  );
});

export interface FileUploadItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
  /** 표시할 파일 객체. */
  file: File;
  /** files 배열 내 index. 내부 remove 버튼이 사용한다. */
  index: number;
  /** 미지정 시 기본 레이아웃(아이콘 + 이름 + 크기 + 제거 버튼). */
  children?: React.ReactNode;
}

/** 파일 목록의 한 항목. 기본 레이아웃은 아이콘 + 이름 + 크기 + 제거 버튼이다. */
export const FileUploadItem = React.forwardRef<
  HTMLLIElement,
  FileUploadItemProps
>(function FileUploadItem({ file, index, className, children, ...rest }, ref) {
  const { disabled, remove } = useFileUpload();
  return (
    <li
      ref={ref}
      className={cn(styles["file-upload__item"], className)}
      {...rest}
    >
      {children ?? (
        <>
          <FileIcon />
          <span className={styles["file-upload__name"]} title={file.name}>
            {file.name}
          </span>
          <span className={styles["file-upload__size"]}>
            {formatBytes(file.size)}
          </span>
          <button
            type="button"
            className={styles["file-upload__remove"]}
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
