export const dynamic = "force-static";

import { FileUpload } from "@/components/ui/file-upload";
import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { MultiValidateDemo } from "./_demos/multi-validate";
import { CustomListDemo } from "./_demos/custom-list";

export default function FileUploadPage() {
  return (
    <main className="container">
      <h1>FileUpload</h1>
      <p className="muted">
        드래그&amp;드롭 + 클릭 선택을 지원하는 파일 업로드. 네이티브 <code>&lt;input type=&quot;file&quot;&gt;</code>은 시각적으로 숨기고 접근성만 유지한다.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload hint="PNG, JPG · 최대 5MB" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `<FileUpload hint="PNG, JPG · 최대 5MB" />`,
            },
            {
              value: "impl",
              label: "구현",
              language: "tsx",
              filename: "components/ui/file-upload/index.tsx",
              code: `function formatBytes(bytes: number): string {
  if (bytes < 1024) return \`\${bytes} B\`;
  if (bytes < 1024 ** 2) return \`\${(bytes / 1024).toFixed(1)} KB\`;
  if (bytes < 1024 ** 3) return \`\${(bytes / 1024 / 1024).toFixed(1)} MB\`;
  return \`\${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB\`;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ value, defaultValue, onValueChange, multiple, accept, maxSize, maxFiles,
     disabled, onError, placeholder, hint, showFileList = true, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<File[]>(defaultValue ?? []);
    const files = isControlled ? value! : internal;
    const [dragging, setDragging] = React.useState(false);

    const update = (next: File[]) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    // 파일당 maxSize 검증 → 실패 메시지는 onError로 위임(UI는 부모 책임)
    const validate = (file: File): string | null =>
      maxSize && file.size > maxSize
        ? \`\${file.name}: 최대 \${formatBytes(maxSize)}까지 업로드 가능합니다.\`
        : null;

    const addFiles = (incoming: FileList | File[]) => {
      const accepted: File[] = [];
      for (const f of Array.from(incoming)) {
        const err = validate(f);
        if (err) { onError?.(err); continue; }
        accepted.push(f);
      }
      if (accepted.length === 0) return;

      // multiple=false면 마지막 파일만 유지 (네이티브 input 동작과 동일)
      let next = multiple ? [...files, ...accepted] : [accepted[accepted.length - 1]];
      if (maxFiles && next.length > maxFiles) {
        onError?.(\`최대 \${maxFiles}개까지 업로드 가능합니다.\`);
        next = next.slice(0, maxFiles);
      }
      update(next);
    };

    return (
      <div className="sh-ui-file-upload">
        <label
          className={cx("sh-ui-file-upload__dropzone",
            dragging && "sh-ui-file-upload__dropzone--drag",
            disabled && "sh-ui-file-upload__dropzone--disabled")}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!disabled) addFiles(e.dataTransfer.files);
          }}
        >
          <input
            type="file" multiple={multiple} accept={accept} disabled={disabled}
            className="sh-ui-file-upload__input"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = ""; // 동일 파일 재선택 가능하도록 초기화
            }}
          />
          {/* 드롭존 UI · 파일 리스트 (생략) */}
        </label>
      </div>
    );
  },
);`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add file-upload`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/file-upload/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { FileUpload } from "@/components/ui/file-upload";

<FileUpload
  multiple
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  maxFiles={4}
  hint="이미지만 · 최대 5MB"
  value={files}
  onValueChange={setFiles}
  onError={(msg) => toast(msg)}
/>`}
      />

      <h2>Examples</h2>

      <h3>다중 파일 + 유효성 검사</h3>
      <Preview>
        <Preview.Demo>
          <MultiValidateDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const [files, setFiles] = useState<File[]>([]);
const [error, setError] = useState<string | null>(null);

<FileUpload
  multiple
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  maxFiles={4}
  hint="이미지만 · 최대 4개 · 파일당 5MB"
  value={files}
  onValueChange={(next) => { setFiles(next); setError(null); }}
  onError={(msg) => setError(msg)}
/>`}
        />
      </Preview>

      <h3>비활성</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload disabled hint="현재 업로드를 받지 않습니다." />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<FileUpload disabled hint="현재 업로드를 받지 않습니다." />`}
        />
      </Preview>

      <h3>커스텀 placeholder</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload
              accept=".pdf,.docx"
              placeholder={<>계약서를 끌어서 놓으세요</>}
              hint="PDF, DOCX"
            />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<FileUpload
  accept=".pdf,.docx"
  placeholder={<>계약서를 끌어서 놓으세요</>}
  hint="PDF, DOCX"
/>`}
        />
      </Preview>

      <h3>파일 목록 숨기기</h3>
      <p className="muted">
        <code>showFileList=&#123;false&#125;</code>로 목록을 숨기고 원하는 대로 직접 렌더.
      </p>
      <Preview>
        <Preview.Demo>
          <CustomListDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<FileUpload
  showFileList={false}
  multiple
  value={files}
  onValueChange={setFiles}
/>
{files.length > 0 && (
  <div>선택된 파일: {files.map((f) => f.name).join(", ")}</div>
)}`}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>FileUpload</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "File[]", description: "제어 모드 — 외부 상태로 파일 목록 관리." },
          { prop: "onValueChange", type: "(files: File[]) => void", description: "선택/추가/삭제 시 호출." },
          { prop: "multiple", type: "boolean", default: "false", description: "여러 파일 선택 허용." },
          { prop: "accept", type: "string", description: "네이티브 accept 속성 (MIME 또는 확장자)." },
          { prop: "maxSize", type: "number", description: "파일당 최대 바이트. 초과 시 onError 호출 후 스킵." },
          { prop: "maxFiles", type: "number", description: "총 파일 개수 상한." },
          { prop: "placeholder", type: "ReactNode", description: "드롭존에 표시할 안내 노드." },
          { prop: "hint", type: "string", description: "보조 설명 (드롭존 하단)." },
          { prop: "showFileList", type: "boolean", default: "true", description: "내장 파일 목록 표시 여부." },
          { prop: "onError", type: "(message: string) => void", description: "검증 실패 메시지." },
          { prop: "disabled", type: "boolean" },
        ]}
      />
    </main>
  );
}