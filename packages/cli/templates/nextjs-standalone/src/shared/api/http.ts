import axios from 'axios';

import { ApiError } from './error';
import type { ApiResponse } from './apiTypes';

const HTTP_TIMEOUT = 10_000;

const http = axios.create({
  baseURL: '/api/proxy',
  timeout: HTTP_TIMEOUT,
});

// 서버 컴포넌트에서 호출 시 axios 는 절대 URL 이 필요하다.
// 호스트만 프리픽스하고 그 외 분기는 두지 않는다.
http.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') return config;

  const { headers: getHeaders } = await import('next/headers');
  const hdrs = await getHeaders();
  const host = hdrs.get('host') ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  config.baseURL = `${protocol}://${host}/api/proxy`;
  return config;
});

http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse;
    if (body && typeof body === 'object' && 'result' in body) {
      if (body.result === 'ERROR') {
        return Promise.reject(
          new ApiError(response.status, body.error?.code ?? '', body.error),
        );
      }
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      const body = response?.data as ApiResponse | undefined;
      const errorBody = body?.error ?? null;
      return Promise.reject(
        new ApiError(
          response?.status ?? 0,
          errorBody?.code ?? '',
          errorBody,
        ),
      );
    }
    return Promise.reject(error);
  },
);

export { http };
