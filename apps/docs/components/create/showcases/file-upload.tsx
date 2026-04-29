import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
} from "@/components/ui/file-upload";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ maxWidth: 360 }}>
    <FileUpload multiple>
      <FileUploadDropzone>
        <strong>파일을 드래그</strong>하거나 클릭해서 선택
      </FileUploadDropzone>
      <FileUploadList />
    </FileUpload>
  </div>
);

const showcase: ShowcaseManifest = {
  id: "file-upload",
  label: "FileUpload",
  category: "form",
  Demo,
};

export default showcase;
