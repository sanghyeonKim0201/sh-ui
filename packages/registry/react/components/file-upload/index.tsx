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

export interface FileUploadProps {
  /** 제어 모드. 있으면 컴포넌트는 순수 제어 컴포넌트로 동작한다. */
  value?: File[];
  /** 비제어 모드 초기값. */
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  multiple?: boolean;
  /** `accept` 속성 (e.g. "image/*", ".pdf,.docx"). */
  accept?: string;
  /** 파일당 최대 바이트. 초과 시 onError. */
  maxSize?: number;
  /** 총 파일 개수 상한. */
  maxFiles?: number;
  disabled?: boolean;
  onError?: (message: string) => void;
  /** 드롭존 중앙 텍스트 커스터마이즈. */
  placeholder?: React.ReactNode;
  /** 드롭존 하단 힌트 (예: "PNG, JPG · 최대 5MB") */
  hint?: React.ReactNode;
  /** 선택한 파일 목록을 컴포넌트가 그릴지 여부. false면 사용자가 직접 렌더. */
  showFileList?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      multiple,
      accept,
      maxSize,
      maxFiles,
      disabled,
      onError,
      placeholder,
      hint,
      showFileList = true,
      className,
      id,
      name,
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<File[]>(defaultValue ?? []);
    const files = isControlled ? value! : internal;

    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const [dragging, setDragging] = React.useState(false);

    function update(next: File[]) {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    }

    function validate(file: File): string | null {
      if (maxSize && file.size > maxSize) {
        return `${file.name}: 최대 ${formatBytes(maxSize)}까지 업로드 가능합니다.`;
      }
      return null;
    }

    function addFiles(incoming: FileList | File[]) {
      const arr = Array.from(incoming);
      const accepted: File[] = [];
      for (const f of arr) {
        const err = validate(f);
        if (err) {
          onError?.(err);
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
    }

    function remove(idx: number) {
      update(files.filter((_, i) => i !== idx));
    }

    return (
      <div className={cx("hyeon-file-upload", className)}>
        <label
          className={cx(
            "hyeon-file-upload__dropzone",
            dragging && "hyeon-file-upload__dropzone--drag",
            disabled && "hyeon-file-upload__dropzone--disabled",
          )}
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
        >
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            className="hyeon-file-upload__input"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = ""; // 동일 파일 재선택 가능하도록 초기화
            }}
          />
          <UploadIcon />
          <div className="hyeon-file-upload__text">
            {placeholder ?? (
              <>
                <strong>파일을 드래그</strong>하거나 <strong>클릭해서 선택</strong>
              </>
            )}
          </div>
          {hint && <div className="hyeon-file-upload__hint">{hint}</div>}
        </label>

        {showFileList && files.length > 0 && (
          <ul className="hyeon-file-upload__list">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="hyeon-file-upload__item">
                <FileIcon />
                <span className="hyeon-file-upload__name" title={f.name}>
                  {f.name}
                </span>
                <span className="hyeon-file-upload__size">{formatBytes(f.size)}</span>
                <button
                  type="button"
                  className="hyeon-file-upload__remove"
                  onClick={() => remove(i)}
                  disabled={disabled}
                  aria-label={`${f.name} 제거`}
                >
                  <XIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
FileUpload.displayName = "FileUpload";

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
