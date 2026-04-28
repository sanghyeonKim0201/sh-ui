export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function FileUploadRecipe() {
  return (
    <main className="container">
      <h1>파일 업로드</h1>
      <p className="muted">
        multipart 직접 업로드, 진행률 표시, 클라이언트 검증, presigned URL
        대안.
      </p>

      <h2>경로 선택</h2>
      <ul>
        <li>
          <strong>multipart 직접 업로드</strong> — 백엔드가 파일을 직접 받는
          경우. 작은 파일·이미지 일반. 템플릿의 <code>/api/proxy</code>가
          multipart 를 그대로 forward 함.
        </li>
        <li>
          <strong>presigned URL</strong> — 백엔드가 S3 등 외부 스토리지로 가는
          업로드 URL 만 발급, 클라가 직접 스토리지에 업로드. 큰 파일·동영상,
          서버 비용·트래픽 줄이려는 경우.
        </li>
      </ul>

      <h2>패턴 1 — multipart 직접 업로드</h2>

      <h3>API 함수</h3>
      <CodePanel
        language="ts"
        filename="entities/file/api/postFileUploadApi.ts"
        code={`import { http } from '@/shared/api/http';

type UploadResult = { id: number; url: string };

export const postFileUploadApi = async (
  formData: FormData,
  onProgress?: (percent: number) => void,
) => {
  const { data } = await http.post<UploadResult>('/v1/files/upload', formData, {
    headers: { 'content-type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
};`}
      />
      <p className="muted">
        <strong>주의:</strong> <code>onUploadProgress</code>는 클라이언트
        컨텍스트에서만 동작한다. 서버 컴포넌트에서 호출하면 이벤트는 발생하지
        않지만 업로드 자체는 정상 처리됨.
      </p>

      <h3>클라이언트 검증</h3>
      <CodePanel
        language="ts"
        filename="entities/file/lib/validateFile.ts"
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

      <h3>훅</h3>
      <CodePanel
        language="ts"
        filename="features/file-upload/model/useFileUpload.ts"
        code={`import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { postFileUploadApi } from '@/entities/file/api/postFileUploadApi';
import { validateFile } from '@/entities/file/lib/validateFile';

export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const error = validateFile(file);
      if (error) throw error;

      const formData = new FormData();
      formData.append('file', file);

      return postFileUploadApi(formData, setProgress);
    },
    onSettled: () => setProgress(0),
  });

  return { ...mutation, progress };
};`}
      />

      <h3>UI</h3>
      <CodePanel
        language="tsx"
        filename="features/file-upload/ui/FileUploadField.tsx"
        code={`'use client';
import { useFileUpload } from '../model/useFileUpload';

export function FileUploadField() {
  const { mutate, isPending, progress, data, error } = useFileUpload();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutate(file);
  };

  return (
    <div>
      <input type="file" onChange={handleChange} disabled={isPending} />
      {isPending && <progress value={progress} max={100} />}
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
        filename="entities/file/api/postPresignedUrlApi.ts"
        code={`import { http } from '@/shared/api/http';

type PresignedUrl = {
  uploadUrl: string;
  fields: Record<string, string>;
  fileId: string;
};

export const postPresignedUrlApi = async (input: {
  filename: string;
  contentType: string;
  size: number;
}) => {
  const { data } = await http.post<PresignedUrl>('/v1/files/presigned-url', input);
  return data;
};

export const postFileCompleteApi = async (fileId: string) => {
  await http.post(\`/v1/files/\${fileId}/complete\`);
};`}
      />

      <h3>훅</h3>
      <CodePanel
        language="ts"
        filename="features/file-upload/model/usePresignedUpload.ts"
        code={`import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import {
  postPresignedUrlApi,
  postFileCompleteApi,
} from '@/entities/file/api/postPresignedUrlApi';
import { validateFile } from '@/entities/file/lib/validateFile';

const uploadToStorage = (
  url: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void,
) => {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener('load', () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed')),
    );
    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.open('POST', url);
    xhr.send(formData);
  });
};

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

      await uploadToStorage(presigned.uploadUrl, presigned.fields, file, setProgress);
      await postFileCompleteApi(presigned.fileId);

      return { fileId: presigned.fileId };
    },
    onSettled: () => setProgress(0),
  });
};`}
      />
      <p className="muted">
        S3 직접 업로드는 axios 가 아니라 <code>XMLHttpRequest</code>를 쓰는 게
        간단하다 — fetch 는 진행률 이벤트가 없고, axios 는 응답 인터셉터가
        백엔드 응답 형식(<code>ApiResponse</code>)을 가정하는데 S3 응답은 그
        형식이 아니다.
      </p>

      <h2>UI 컴포넌트</h2>
      <p>
        sh-ui 의{" "}
        <a href="/components/file-upload">
          <code>FileUpload</code>
        </a>{" "}
        컴포넌트가 dropzone · 진행률 표시 · validation 표시를 묶어 제공한다.
        위 훅과 결합해서 쓰면 된다.
      </p>
    </main>
  );
}
