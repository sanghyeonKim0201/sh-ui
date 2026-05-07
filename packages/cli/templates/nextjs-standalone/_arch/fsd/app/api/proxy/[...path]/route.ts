import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import {
  captureApiError,
  logApiError,
} from '@/src/shared/api/observability';

const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';
const ACCESS_TOKEN_COOKIE = 'accessToken';
const LOCALE_COOKIE = 'NEXT_LOCALE';

const proxyRequest = async (
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
  method: string,
) => {
  const { path } = await ctx.params;
  const apiPath = path.join('/');
  const url = new URL(`${API_URL}/${apiPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const locale =
    cookieStore.get(LOCALE_COOKIE)?.value ??
    request.headers.get('Accept-Language') ??
    undefined;

  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (locale) headers['Accept-Language'] = locale;

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('Content-Type');
    if (contentType?.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      headers['Content-Type'] = 'application/json';
      body = await request.text();
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), { method, headers, body });
  } catch (error) {
    console.error(`[PROXY] ${method} ${url.toString()} —`, error);
    return NextResponse.json(
      {
        result: 'ERROR',
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to reach upstream server.',
        },
      },
      { status: 502 },
    );
  }

  const data = await response.json();

  if (!response.ok) {
    logApiError('PROXY', {
      url: url.toString(),
      method,
      status: response.status,
      requestBody: typeof body === 'string' ? body : undefined,
      responseBody: data,
    });

    captureApiError({
      url: url.toString(),
      apiPath,
      method,
      status: response.status,
      responseBody: data,
    });
  }

  return NextResponse.json(data, { status: response.status });
};

export const GET = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'GET');

export const POST = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'POST');

export const PUT = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'PUT');

export const PATCH = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'PATCH');

export const DELETE = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'DELETE');
