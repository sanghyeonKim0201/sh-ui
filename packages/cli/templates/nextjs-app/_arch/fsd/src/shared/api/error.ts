import type { ApiErrorBody } from './apiTypes';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly data: ApiErrorBody | null,
  ) {
    super(data?.message ?? `API 요청 실패 (${status})`);
    this.name = 'ApiError';
  }
}
