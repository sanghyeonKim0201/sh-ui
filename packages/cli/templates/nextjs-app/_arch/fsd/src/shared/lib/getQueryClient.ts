import { isServer } from '@tanstack/react-query';

import {
  getBrowserQueryClient,
  getServerQueryClient,
} from '@/src/shared/api/queryClient';

/**
 * RSC 와 클라이언트 양쪽에서 안전하게 호출 가능한 QueryClient 핸들.
 * 서버에서는 React `cache()` 로 요청 단위 싱글턴, 브라우저에서는 모듈 싱글턴.
 */
export function getQueryClient() {
  return isServer ? getServerQueryClient() : getBrowserQueryClient();
}
