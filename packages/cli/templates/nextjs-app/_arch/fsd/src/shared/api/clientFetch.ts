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
    // 이미 sign-in 페이지면 redirect 루프 방지.
    // next-intl 활성 시 path 가 `/ko/sign-in` 형태가 되므로 regex 로 match.
    if (typeof window !== 'undefined' && !/\/sign-in(\/|$)/.test(window.location.pathname)) {
      // /sign-in 으로만 보내면 middleware (next-intl 활성 시) 가 default locale 을 prefix 추가.
      window.location.href = '/sign-in';
    }
    throw new ApiError(401, body.error?.code ?? 'UNAUTHORIZED', body.error);
  }

  if (!res.ok || body.result === 'ERROR') {
    throw new ApiError(res.status, body.error?.code ?? '', body.error);
  }

  return body.data;
}
