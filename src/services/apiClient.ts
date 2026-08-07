import { API_BASE_URL } from "../config/apiConfig";
import type {
  ApiErrorResponse,
  LoginResponse,
  RefreshTokenRequest,
} from "../types/api";
import { notifySessionExpired } from "./sessionEvents";
import {
  getAccessToken,
  getRefreshToken,
  removeAuthTokens,
  saveAuthTokens,
} from "./tokenStorage";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  authenticated?: boolean;
  headers?: Record<string, string>;
}

interface RequestResult {
  response: Response;
  parsedBody: unknown;
}

let refreshPromise: Promise<void> | null = null;

export class ApiError extends Error {
  readonly status: number;
  readonly response: ApiErrorResponse | null;

  constructor(
    status: number,
    message: string,
    response: ApiErrorResponse | null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  const content = await response.text();

  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

function getErrorResponse(
  parsedBody: unknown,
): ApiErrorResponse | null {
  if (typeof parsedBody !== "object" || parsedBody === null) {
    return null;
  }

  return parsedBody as ApiErrorResponse;
}

function createApiError(result: RequestResult): ApiError {
  const errorResponse = getErrorResponse(result.parsedBody);

  return new ApiError(
    result.response.status,
    errorResponse?.message ??
      `Request failed with HTTP ${result.response.status}.`,
    errorResponse,
  );
}

async function executeRequest(
  path: string,
  method: HttpMethod,
  body: unknown,
  headers: Record<string, string>,
  accessToken: string | null,
): Promise<RequestResult> {
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to connect to the ApplyMate server.",
      null,
    );
  }

  return {
    response,
    parsedBody: await parseResponseBody(response),
  };
}

async function expireSession(): Promise<void> {
  try {
    await removeAuthTokens();
  } finally {
    notifySessionExpired();
  }
}

function isLoginResponse(value: unknown): value is LoginResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Partial<LoginResponse>;

  return (
    typeof response.accessToken === "string" &&
    response.accessToken.length > 0 &&
    typeof response.refreshToken === "string" &&
    response.refreshToken.length > 0
  );
}

async function performTokenRefresh(): Promise<void> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    await expireSession();

    throw new ApiError(
      401,
      "Your session has expired. Please log in again.",
      null,
    );
  }

  const request: RefreshTokenRequest = {
    refreshToken,
  };

  const result = await executeRequest(
    "/api/v1/auth/refresh",
    "POST",
    request,
    {},
    null,
  );

  if (!result.response.ok) {
    const error = createApiError(result);

    /*
     * A rejected refresh token means the session has genuinely ended.
     * Server and connection errors remain retryable and do not erase
     * the local session.
     */
    if (
      result.response.status === 400 ||
      result.response.status === 401
    ) {
      await expireSession();

      throw new ApiError(
        401,
        "Your session has expired. Please log in again.",
        error.response,
      );
    }

    throw error;
  }

  if (!isLoginResponse(result.parsedBody)) {
    await expireSession();

    throw new ApiError(
      401,
      "Your session has expired. Please log in again.",
      null,
    );
  }

  await saveAuthTokens(
    result.parsedBody.accessToken,
    result.parsedBody.refreshToken,
  );
}

async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    authenticated = true,
    headers = {},
  } = options;

  const initialAccessToken = authenticated
    ? await getAccessToken()
    : null;

  let result = await executeRequest(
    path,
    method,
    body,
    headers,
    initialAccessToken,
  );

  if (authenticated && result.response.status === 401) {
    const latestAccessToken = await getAccessToken();

    /*
     * Another request may already have refreshed the session while
     * this request was waiting for its original 401 response.
     */
    if (
      latestAccessToken &&
      latestAccessToken !== initialAccessToken
    ) {
      result = await executeRequest(
        path,
        method,
        body,
        headers,
        latestAccessToken,
      );
    } else {
      await refreshSession();

      const refreshedAccessToken = await getAccessToken();

      result = await executeRequest(
        path,
        method,
        body,
        headers,
        refreshedAccessToken,
      );
    }

    /*
     * Retry exactly once. A second 401 means the refreshed session
     * cannot be used and the user must authenticate again.
     */
    if (result.response.status === 401) {
      await expireSession();
    }
  }

  if (!result.response.ok) {
    throw createApiError(result);
  }

  return result.parsedBody as T;
}