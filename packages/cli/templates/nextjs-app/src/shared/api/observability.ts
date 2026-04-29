type ApiCaptureParams = {
  url: string;
  apiPath: string;
  method: string;
  status: number | undefined;
  responseBody?: unknown;
};

type ApiLogParams = {
  url: string;
  method: string;
  status: number | undefined;
  requestHeaders?: Record<string, string | undefined>;
  requestBody?: unknown;
  responseBody?: unknown;
};

export const captureApiError = (_params: ApiCaptureParams): void => {};

export const logApiError = (_prefix: string, _params: ApiLogParams): void => {};
