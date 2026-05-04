"use client";

import { useState } from "react";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
} from "@/components/ui/file-upload";

export function CustomListDemo() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <FileUpload multiple value={files} onValueChange={setFiles}>
        <FileUploadDropzone>
          <div style={{ fontSize: "0.875rem" }}>
            <strong>파일을 드래그</strong>해서 놓거나
          </div>
          <FileUploadTrigger>파일 선택</FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {({ files, remove }) =>
            files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.25rem 0.5rem",
                  background: "var(--background-subtle)",
                  borderRadius: "calc(var(--radius) - 4px)",
                  fontSize: "0.8125rem",
                }}
              >
                <span>📄</span>
                <span style={{ flex: 1 }}>{f.name}</span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  style={{
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--foreground-muted)",
                  }}
                  aria-label={`${f.name} 제거`}
                >
                  ✕
                </button>
              </li>
            ))
          }
        </FileUploadList>
      </FileUpload>
    </div>
  );
}
