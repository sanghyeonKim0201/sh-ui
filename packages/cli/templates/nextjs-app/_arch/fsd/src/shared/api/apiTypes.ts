/** 공통 API 에러 형식 */
export type ApiErrorBody = {
  message: string;
  code: string;
};

/** 백엔드 공통 응답 래퍼 */
export type ApiResponse<TData = unknown, TError = ApiErrorBody> = {
  result: 'SUCCESS' | 'ERROR';
  data: TData;
  error: TError | null;
};

/** 페이지네이션 응답 래퍼 */
export type PaginatedData<T> = {
  content: T[];
  totalItems: number;
  offset: number;
  limit: number;
  hasNext: boolean;
};
