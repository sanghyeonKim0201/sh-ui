import { cookies } from 'next/headers';

import type { ApiResponse } from './apiTypes';
import { ApiError } from './error';
import { captureApiError, logApiError } from './observability';

const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const LOCALE_COOKIE = 'NEXT_LOCALE';

export async function serverFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  const locale = jar.get(LOCALE_COOKIE)?.value;

  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const method = (init.method ?? 'GET').toUpperCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(locale && { 'Accept-Language': locale }),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  });

  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok || body.result === 'ERROR') {
    logApiError('SERVER_FETCH', {
      url,
      method,
      status: res.status,
      requestBody: typeof init.body === 'string' ? init.body : undefined,
      responseBody: body,
    });

    captureApiError({
      url,
      apiPath: path,
      method,
      status: res.status,
      responseBody: body,
    });

    throw new ApiError(res.status, body.error?.code ?? '', body.error);
  }

  return body.data;
}
