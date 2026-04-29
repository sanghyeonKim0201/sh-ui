"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

export function MultiValidateDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <FileUpload
        multiple
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        maxFiles={4}
        hint="이미지만 · 최대 4개 · 파일당 5MB"
        value={files}
        onValueChange={(next) => {
          setFiles(next);
          setError(null);
        }}
        onError={(msg) => setError(msg)}
      />
      {error && (
        <p style={{ color: "var(--danger)", fontSize: "0.8125rem", margin: "0.5rem 0 0" }}>
          {error}
        </p>
      )}
      <p className="muted" style={{ fontSize: "0.8125rem", margin: "0.5rem 0 0" }}>
        현재 {files.length}개 선택됨.
      </p>
    </div>
  );
}
