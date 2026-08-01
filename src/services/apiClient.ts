import { API_BASE_URL } from "../config/apiConfig";
import type { ApiErrorResponse } from "../types/api";
import { notifySessionExpired } from "./sessionEvents";
import { getAccessToken, removeAccessToken } from "./tokenStorage";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  authenticated?: boolean;
  headers?: Record<string, string>;
}

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

async function parseResponseBody(response: Response): Promise<unknown> {
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

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (authenticated) {
    const token = await getAccessToken();

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
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

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorResponse =
      typeof parsedBody === "object" && parsedBody !== null
        ? (parsedBody as ApiErrorResponse)
        : null;

    if (response.status === 401 && authenticated) {
      await removeAccessToken();
      notifySessionExpired();
    }

    throw new ApiError(
      response.status,
      errorResponse?.message ??
        `Request failed with HTTP ${response.status}.`,
      errorResponse,
    );
  }

  return parsedBody as T;
}