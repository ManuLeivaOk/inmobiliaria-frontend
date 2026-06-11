import type { ApiErrorBody } from '@/lib/auth/types';
import { API_BASE } from './config';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    const msg = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message;
    super(msg);
    this.name = 'ApiError';
  }
}

type RequestOptions = RequestInit & {
  accessToken?: string | null;
  skipAuth?: boolean;
  _retryAfterRefresh?: boolean;
};

let accessTokenGetter: (() => string | null) | null = null;
let accessTokenSetter: ((token: string | null) => void) | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;
let sessionExpiredHandler: (() => void | Promise<void>) | null = null;
let sessionExpiredNotifying = false;

/** Una sola operación de refresh a la vez (evita invalidar la familia de tokens). */
let refreshInFlight: Promise<string | null> | null = null;

export function configureApiClient(handlers: {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  refresh: () => Promise<string | null>;
  onSessionExpired?: () => void | Promise<void>;
}) {
  accessTokenGetter = handlers.getAccessToken;
  accessTokenSetter = handlers.setAccessToken;
  refreshHandler = handlers.refresh;
  sessionExpiredHandler = handlers.onSessionExpired ?? null;
}

async function runRefreshOnce(): Promise<string | null> {
  if (!refreshHandler) return null;

  if (!refreshInFlight) {
    refreshInFlight = refreshHandler().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function notifySessionExpired(): Promise<void> {
  if (!sessionExpiredHandler || sessionExpiredNotifying) return;
  sessionExpiredNotifying = true;
  try {
    await sessionExpiredHandler();
  } finally {
    sessionExpiredNotifying = false;
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {
    statusCode: response.status,
    message: response.statusText || 'Error desconocido',
  };

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    /* respuesta sin JSON */
  }

  return new ApiError(response.status, body);
}

function isAuthPath(path: string): boolean {
  return (
    path.includes('/auth/refresh') ||
    path.includes('/auth/login') ||
    path.includes('/auth/register') ||
    path.includes('/auth/clear-session')
  );
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { accessToken, skipAuth, _retryAfterRefresh, headers, ...init } =
    options;
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;


  const token =
    accessToken !== undefined ? accessToken : accessTokenGetter?.() ?? null;

  const requestHeaders = new Headers(headers);

  const isFormData = init.body instanceof FormData;
  if (!requestHeaders.has('Content-Type') && init.body && !isFormData) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (token && !skipAuth) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
    credentials: 'include',
  });

  if (
    response.status === 401 &&
    !skipAuth &&
    !_retryAfterRefresh &&
    !isAuthPath(path)
  ) {
    const newToken = await runRefreshOnce();

    if (newToken) {
      return apiRequest<T>(path, {
        ...options,
        accessToken: newToken,
        _retryAfterRefresh: true,
      });
    }

    await notifySessionExpired();
    throw await parseError(response);
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function setAccessTokenInClient(token: string | null) {
  accessTokenSetter?.(token);
}
