export const dynamic = "force-static";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
} from "@/components/ui/file-upload";
import { CodeTabs } from "@/components/ui/code-tabs";
import { VariantSource } from "@/components/variant-source";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { MultiValidateDemo } from "./_demos/multi-validate";
import { CustomListDemo } from "./_demos/custom-list";

export default function FileUploadPage() {
  return (
    <main className="container">
      <h1>FileUpload</h1>
      <p className="muted">
        드래그&amp;드롭 + 클릭 선택을 지원하는 파일 업로드. Compound 컴포넌트 패턴으로 Dropzone / Trigger / List 를 조합해 자유롭게 UI를 구성할 수 있다.
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
              code: `// 자식 없이 렌더하면 기본 레이아웃(Dropzone + List) 자동 구성 (backward-compat)
<FileUpload hint="PNG, JPG · 최대 5MB" />`,
            },
            {
              value: "impl",
              label: "구현",
              language: "tsx",
              filename: "components/ui/file-upload/index.tsx",
              code: `// FileUpload는 Provider로 state(files, dragging, disabled)를 공유.
// 각 part(Dropzone / Trigger / List / Item)는 Context에서 핸들러를 꺼내 사용한다.

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ value, defaultValue, onValueChange, onFiles, multiple, accept,
     maxSize, maxFiles, disabled, onError, children, ... }, ref) => {
    const [internal, setInternal] = React.useState<File[]>(defaultValue ?? []);
    const files = value ?? internal;
    const [dragging, setDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const addFiles = (incoming: FileList | File[]) => { /* maxSize/maxFiles 검증 */ };
    const remove   = (idx: number) => update(files.filter((_, i) => i !== idx));
    const openPicker = () => inputRef.current?.click();

    return (
      <FileUploadContext.Provider value={{ files, dragging, disabled, addFiles, remove, openPicker, ... }}>
        <div className="sh-ui-file-upload">
          <input ref={inputRef} type="file" className="sh-ui-file-upload__input" ... />
          {children ?? <DefaultLayout />}
        </div>
      </FileUploadContext.Provider>
    );
  },
);`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add file-upload` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add file-upload` },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="file-upload" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
} from "@/components/ui/file-upload";

<FileUpload
  multiple
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  maxFiles={4}
  onFiles={setFiles}
>
  <FileUploadDropzone>
    <p>파일을 여기로 드래그</p>
    <FileUploadTrigger>파일 선택</FileUploadTrigger>
  </FileUploadDropzone>
  <FileUploadList />
</FileUpload>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// Flutter에서는 실제 파일 선택은 file_picker 등 외부 패키지에 위임.
// ShUiFileUpload는 UI만 제공하고 onPickFiles 콜백에서 플러그인을 호출한다.
import 'widgets/sh_ui_file_upload.dart';

final List<ShUiFileInfo> _files = [];

ShUiFileUpload(
  files: _files,
  multiple: true,
  hint: '이미지만 · 최대 5MB',
  onPickFiles: () async {
    // final result = await FilePicker.platform.pickFiles(allowMultiple: true);
    // if (result != null) {
    //   setState(() => _files.addAll(result.files.map(
    //     (f) => ShUiFileInfo(name: f.name, size: f.size),
    //   )));
    // }
  },
  onRemove: (i) => setState(() => _files.removeAt(i)),
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Compound API (Dropzone + Trigger + List)</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload multiple accept="image/*" maxSize={5 * 1024 * 1024}>
              <FileUploadDropzone>
                <div style={{ fontSize: "0.875rem" }}>
                  <strong>파일을 드래그</strong>해서 놓거나
                </div>
                <FileUploadTrigger>파일 선택</FileUploadTrigger>
                <div className="muted" style={{ fontSize: "0.75rem" }}>
                  PNG, JPG · 최대 5MB
                </div>
              </FileUploadDropzone>
              <FileUploadList />
            </FileUpload>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<FileUpload multiple accept="image/*" maxSize={5 * 1024 * 1024}>
  <FileUploadDropzone>
    <div><strong>파일을 드래그</strong>해서 놓거나</div>
    <FileUploadTrigger>파일 선택</FileUploadTrigger>
    <div className="muted">PNG, JPG · 최대 5MB</div>
  </FileUploadDropzone>
  <FileUploadList />
</FileUpload>`,
            },
          ]}
        />
      </Preview>

      <h3>다중 파일 + 유효성 검사</h3>
      <Preview>
        <Preview.Demo>
          <MultiValidateDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [files, setFiles] = useState<File[]>([]);
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
/>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// ShUiFileUpload는 UI만 담당. 검증 로직은 onPickFiles 내부에서 직접 수행.
final List<ShUiFileInfo> _files = [];

ShUiFileUpload(
  files: _files,
  multiple: true,
  hint: '이미지만 · 최대 4개 · 파일당 5MB',
  onPickFiles: () async {
    // file_picker 등으로 파일 가져온 뒤 maxSize / maxFiles 직접 체크
  },
  onRemove: (i) => setState(() => _files.removeAt(i)),
)`,
            },
          ]}
        />
      </Preview>

      <h3>비활성</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload disabled hint="현재 업로드를 받지 않습니다." />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<FileUpload disabled hint="현재 업로드를 받지 않습니다." />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiFileUpload(
  enabled: false,
  hint: '현재 업로드를 받지 않습니다.',
)`,
            },
          ]}
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<FileUpload
  accept=".pdf,.docx"
  placeholder={<>계약서를 끌어서 놓으세요</>}
  hint="PDF, DOCX"
/>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiFileUpload(
  files: const [],
  onPickFiles: () {
    // file_picker에서 allowedExtensions: ['pdf', 'docx']
  },
  placeholder: const Text('계약서를 끌어서 놓으세요'),
  hint: 'PDF, DOCX',
)`,
            },
          ]}
        />
      </Preview>

      <h3>파일 목록 커스텀 렌더</h3>
      <p className="muted">
        <code>FileUploadList</code>에 render prop 또는 children을 넘기면 직접 렌더할 수 있다. 또는 <code>showFileList=&#123;false&#125;</code>로 내장 목록을 숨기고 별도 UI를 그린다.
      </p>
      <Preview>
        <Preview.Demo>
          <CustomListDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<FileUpload multiple onFiles={setFiles}>
  <FileUploadDropzone>...</FileUploadDropzone>
  <FileUploadList>
    {({ files, remove }) =>
      files.map((f, i) => (
        <li key={i}>
          {f.name}
          <button onClick={() => remove(i)}>x</button>
        </li>
      ))
    }
  </FileUploadList>
</FileUpload>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiFileUpload(
  files: _files,
  showFileList: false,
  multiple: true,
  onPickFiles: () async { /* ... */ },
),
if (_files.isNotEmpty)
  Text('선택된 파일: \${_files.map((f) => f.name).join(', ')}'),`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>FileUpload</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "File[]", description: "제어 모드 — 외부 상태로 파일 목록 관리." },
          { prop: "defaultValue", type: "File[]", description: "비제어 모드 초기값." },
          { prop: "onValueChange", type: "(files: File[]) => void", description: "선택/추가/삭제 시 호출." },
          { prop: "onFiles", type: "(files: File[]) => void", description: "onValueChange 별칭(compound API 호환)." },
          { prop: "multiple", type: "boolean", default: "false", description: "여러 파일 선택 허용." },
          { prop: "accept", type: "string", description: "네이티브 accept 속성 (MIME 또는 확장자)." },
          { prop: "maxSize", type: "number", description: "파일당 최대 바이트. 초과 시 onError 호출 후 스킵." },
          { prop: "maxFiles", type: "number", description: "총 파일 개수 상한." },
          { prop: "placeholder", type: "ReactNode", description: "기본 Dropzone 중앙 텍스트 (children 없을 때만)." },
          { prop: "hint", type: "ReactNode", description: "보조 설명 (children 없을 때만)." },
          { prop: "showFileList", type: "boolean", default: "true", description: "내장 파일 목록 표시 여부 (children 없을 때만)." },
          { prop: "onError", type: "(message: string) => void", description: "검증 실패 메시지." },
          { prop: "disabled", type: "boolean" },
          { prop: "children", type: "ReactNode", description: "compound 구성. 없으면 기본 레이아웃 자동 렌더." },
        ]}
      />

      <h3>FileUploadDropzone</h3>
      <p className="muted">
        드래그&amp;드롭 영역. 클릭/Enter/Space 키로도 파일 선택 창을 연다. <code>div</code> 엘리먼트.
      </p>

      <h3>FileUploadTrigger</h3>
      <p className="muted">
        파일 선택 창을 여는 버튼. 표준 <code>button</code> props를 그대로 받는다.
      </p>

      <h3>FileUploadList</h3>
      <PropsTable
        rows={[
          {
            prop: "children",
            type: "ReactNode | ((args: { files: File[]; remove: (i: number) => void }) => ReactNode)",
            description: "커스텀 렌더. 없으면 내부에서 FileUploadItem 자동 렌더.",
          },
        ]}
      />

      <h3>FileUploadItem</h3>
      <PropsTable
        rows={[
          { prop: "file", type: "File", description: "렌더할 파일." },
          { prop: "index", type: "number", description: "files 배열 index. remove 버튼에서 사용." },
          { prop: "children", type: "ReactNode", description: "있으면 기본 row 대신 렌더." },
        ]}
      />

      <h2>접근성</h2>
      <ul>
        <li>Dropzone — <code>role=&quot;button&quot;</code>, <code>tabIndex=0</code>, <code>Enter</code>/<code>Space</code>로 파일 선택 창 열기</li>
        <li>드래그 앤 드롭 외에 키보드·클릭만으로도 업로드 가능</li>
        <li>각 파일 row의 제거 버튼은 파일명을 포함한 <code>aria-label</code>로 레이블링 (예: <code>&quot;report.pdf 제거&quot;</code>)</li>
        <li>disabled 시 <code>aria-disabled</code> + <code>tabIndex=-1</code>로 포커스 제외</li>
      </ul>
    </main>
  );
}
