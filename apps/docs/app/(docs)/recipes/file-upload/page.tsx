export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function FileUploadRecipe() {
  return (
    <main className="container">
      <h1>파일 업로드</h1>
      <p className="muted">
        multipart 직접 업로드, 진행률 표시, 클라이언트 검증, presigned URL 대안.
      </p>

      <h2>경로 선택</h2>
      <ul>
        <li>
          <strong>multipart 직접 업로드</strong> — 백엔드가 파일을 직접 받는
          경우. 작은 파일·이미지 일반. 베이스의 <code>/api/proxy</code> 가
          multipart 를 그대로 forward 한다.
        </li>
        <li>
          <strong>presigned URL</strong> — 백엔드가 S3 등 외부 스토리지로 가는
          업로드 URL 만 발급, 클라가 직접 스토리지에 업로드. 큰 파일·동영상,
          서버 비용·트래픽 줄이려는 경우.
        </li>
      </ul>

      <h2>진행률이 필요한가</h2>
      <p>
        베이스의 <code>http()</code> 는 fetch 기반이라{" "}
        <strong>업로드 진행률 이벤트를 제공하지 않는다</strong>. 진행률이
        필요하면 <code>XMLHttpRequest</code> 를 직접 써야 한다 — 두 패턴 모두
        같은 헬퍼를 재활용할 수 있다 (아래 <code>uploadWithProgress</code>).
      </p>

      <h2>공통 — 클라이언트 검증</h2>
      <CodePanel
        language="ts"
        filename="src/entities/file/lib/validateFile.ts"
        code={`const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type FileValidationError =
  | { code: 'FILE_TOO_LARGE'; max: number }
  | { code: 'INVALID_FILE_TYPE'; allowed: string[] };

export const validateFile = (file: File): FileValidationError | null => {
  if (file.size > MAX_SIZE) {
    return { code: 'FILE_TOO_LARGE', max: MAX_SIZE };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { code: 'INVALID_FILE_TYPE', allowed: ALLOWED_TYPES };
  }
  return null;
};`}
      />

      <h2>공통 — XHR 진행률 헬퍼</h2>
      <p>
        FormData 업로드를 진행률 이벤트와 함께 보내는 작은 헬퍼. multipart 직접
        업로드와 presigned URL 둘 다 재활용한다.
      </p>
      <CodePanel
        language="ts"
        filename="src/shared/lib/uploadWithProgress.ts"
        code={`type UploadOptions = {
  url: string;
  formData: FormData;
  onProgress?: (percent: number) => void;
  withCredentials?: boolean;
};

export function uploadWithProgress({
  url,
  formData,
  onProgress,
  withCredentials = false,
}: UploadOptions) {
  return new Promise<{ status: number; body: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.withCredentials = withCredentials;

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener('load', () =>
      resolve({ status: xhr.status, body: xhr.responseText }),
    );
    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.send(formData);
  });
}`}
      />

      <h2>패턴 1 — multipart 직접 업로드 (BFF 경유)</h2>

      <h3>API 함수 (진행률 없이, 단순)</h3>
      <p>
        진행률이 필요 없다면 <code>http()</code> 한 줄. FormData 를 보낼 때는{" "}
        <code>Content-Type</code> 헤더를 비워야 브라우저가 boundary 를 채운다.
      </p>
      <CodePanel
        language="ts"
        filename="src/entities/file/api/postFileUploadApi.ts"
        code={`import { http } from '@/src/shared/api/http';

type UploadResult = { id: number; url: string };

export const postFileUploadApi = async (formData: FormData) => {
  return http<UploadResult>('/v1/files/upload', {
    method: 'POST',
    body: formData,
    headers: {}, // ← 명시적 빈 객체로 기본 Content-Type 덮어쓰기
  });
};`}
      />

      <h3>API 함수 (진행률 포함)</h3>
      <p>
        진행률이 필요하면 BFF 를 거치지 않고 위 헬퍼로 백엔드에 직접 쏜다 — 단,
        쿠키가 필요한 경우 백엔드가 CORS + credentials 를 허용해야 한다. 더
        간단한 방법은 BFF 를 거치는 단순 패턴 + 별도 진행률 indicator
        (indeterminate) 를 쓰는 것.
      </p>
      <CodePanel
        language="ts"
        code={`import { uploadWithProgress } from '@/src/shared/lib/uploadWithProgress';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const postFileUploadWithProgress = async (
  file: File,
  onProgress?: (percent: number) => void,
) => {
  const fd = new FormData();
  fd.append('file', file);

  const { status, body } = await uploadWithProgress({
    url: \`\${API_URL}/v1/files/upload\`,
    formData: fd,
    onProgress,
    withCredentials: true,
  });

  if (status < 200 || status >= 300) throw new Error('Upload failed');
  const parsed = JSON.parse(body);
  return parsed.data;  // envelope 가정
};`}
      />

      <h3>훅</h3>
      <CodePanel
        language="ts"
        filename="src/features/file-upload/model/useFileUpload.ts"
        code={`import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { postFileUploadApi } from '@/src/entities/file/api/postFileUploadApi';
import { validateFile } from '@/src/entities/file/lib/validateFile';

export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const error = validateFile(file);
      if (error) throw error;

      const fd = new FormData();
      fd.append('file', file);

      // 진행률 없는 단순 버전
      return postFileUploadApi(fd);
    },
    onSettled: () => setProgress(0),
  });

  return { ...mutation, progress, setProgress };
};`}
      />

      <h3>UI</h3>
      <CodePanel
        language="tsx"
        filename="src/features/file-upload/ui/FileUploadField.tsx"
        code={`'use client';

import { useFileUpload } from '../model/useFileUpload';

export function FileUploadField() {
  const { mutate, isPending, data, error } = useFileUpload();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutate(file);
  };

  return (
    <div>
      <input type="file" onChange={handleChange} disabled={isPending} />
      {isPending && <span>업로드 중...</span>}
      {data && <span>업로드 완료: {data.id}</span>}
      {error && <span className="error">에러</span>}
    </div>
  );
}`}
      />

      <h2>패턴 2 — presigned URL</h2>

      <h3>흐름</h3>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`1. 클라 → 백엔드 (BFF 경유): "이 파일 업로드할 URL 줘"
   POST /v1/files/presigned-url { filename, contentType, size }

2. 백엔드 → 클라: { uploadUrl, fields, fileId }

3. 클라 → S3 (직접): multipart POST 로 파일 업로드
   uploadUrl 에 fields + file 을 FormData 로 전송

4. 클라 → 백엔드 (BFF 경유): "업로드 끝났어, 메타데이터 저장해"
   POST /v1/files/{fileId}/complete`}
      />

      <h3>API 함수</h3>
      <CodePanel
        language="ts"
        filename="src/entities/file/api/postPresignedUrlApi.ts"
        code={`import { http } from '@/src/shared/api/http';

type PresignedUrl = {
  uploadUrl: string;
  fields: Record<string, string>;
  fileId: string;
};

export const postPresignedUrlApi = (input: {
  filename: string;
  contentType: string;
  size: number;
}) =>
  http<PresignedUrl>('/v1/files/presigned-url', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const postFileCompleteApi = (fileId: string) =>
  http(\`/v1/files/\${fileId}/complete\`, { method: 'POST' });`}
      />

      <h3>훅 — XHR 헬퍼 재활용</h3>
      <CodePanel
        language="ts"
        filename="src/features/file-upload/model/usePresignedUpload.ts"
        code={`import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import {
  postPresignedUrlApi,
  postFileCompleteApi,
} from '@/src/entities/file/api/postPresignedUrlApi';
import { validateFile } from '@/src/entities/file/lib/validateFile';
import { uploadWithProgress } from '@/src/shared/lib/uploadWithProgress';

export const usePresignedUpload = () => {
  const [progress, setProgress] = useState(0);

  return useMutation({
    mutationFn: async (file: File) => {
      const error = validateFile(file);
      if (error) throw error;

      const presigned = await postPresignedUrlApi({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      const fd = new FormData();
      Object.entries(presigned.fields).forEach(([k, v]) => fd.append(k, v));
      fd.append('file', file);

      const { status } = await uploadWithProgress({
        url: presigned.uploadUrl,
        formData: fd,
        onProgress: setProgress,
      });
      if (status < 200 || status >= 300) throw new Error('Upload failed');

      await postFileCompleteApi(presigned.fileId);

      return { fileId: presigned.fileId };
    },
    onSettled: () => setProgress(0),
  });
};`}
      />
      <p className="muted">
        S3 직접 업로드는 <code>http()</code> 가 아니라{" "}
        <code>XMLHttpRequest</code> 를 쓰는 게 간단하다 — fetch 는 진행률
        이벤트가 없고, 베이스의 transport 는{" "}
        <code>{`{ result, data, error }`}</code> envelope 을 가정하는데 S3
        응답은 그 형식이 아니다.
      </p>

      <h2>UI 컴포넌트</h2>
      <p>
        sh-ui 의{" "}
        <a href="/components/file-upload">
          <code>FileUpload</code>
        </a>{" "}
        컴포넌트를 사용하면 드래그앤드롭 / 미리보기 / 다중 파일 선택 등을 위
        패턴 위에 얹을 수 있다.
      </p>
    </main>
  );
}
