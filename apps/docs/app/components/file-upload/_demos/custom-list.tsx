"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

export function CustomListDemo() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <FileUpload
        showFileList={false}
        multiple
        hint="선택 후 아래에 커스텀 목록이 표시됩니다."
        value={files}
        onValueChange={setFiles}
      />
      {files.length > 0 && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem" }}>
          선택된 파일: {files.map((f) => f.name).join(", ")}
        </div>
      )}
    </div>
  );
}
