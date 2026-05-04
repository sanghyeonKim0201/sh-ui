'use client';

import type { ApiResponse } from './apiTypes';
import { ApiError } from './error';

const PROXY_BASE = '/api/proxy';

export async function clientFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${PROXY_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<T>;

  if (res.status === 401) {
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/sign-in')
    ) {
      window.location.href = '/sign-in';
    }
    throw new ApiError(401, body.error?.code ?? 'UNAUTHORIZED', body.error);
  }

  if (!res.ok || body.result === 'ERROR') {
    throw new ApiError(res.status, body.error?.code ?? '', body.error);
  }

  return body.data;
}
