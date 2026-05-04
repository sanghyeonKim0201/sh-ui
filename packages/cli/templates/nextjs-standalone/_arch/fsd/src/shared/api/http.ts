import { clientFetch } from './clientFetch';
import { serverFetch } from './serverFetch';

/**
 * isomorphic 진입점.
 * RSC/서버에서는 백엔드로 직통, 브라우저에서는 /api/proxy 경유.
 * API 함수는 한 번만 작성하고 환경 분기는 여기서 처리한다.
 */
export function http<T>(path: string, init?: RequestInit): Promise<T> {
  return typeof window === 'undefined'
    ? serverFetch<T>(path, init)
    : clientFetch<T>(path, init);
}
