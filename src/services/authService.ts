import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
} from "../types/api";
import { apiRequest } from "./apiClient";
import {
  getRefreshToken,
  removeAuthTokens,
  saveAuthTokens,
} from "./tokenStorage";

export async function registerUser(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    authenticated: false,
    body: request,
  });
}

export async function loginUser(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>(
    "/api/v1/auth/login",
    {
      method: "POST",
      authenticated: false,
      body: request,
    },
  );

  await saveAuthTokens(
    response.accessToken,
    response.refreshToken,
  );

  return response;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>("/api/v1/users/me");
}

export async function logoutUser(): Promise<void> {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken) {
      const request: RefreshTokenRequest = {
        refreshToken,
      };

      await apiRequest<void>("/api/v1/auth/logout", {
        method: "POST",
        authenticated: false,
        body: request,
      });
    }
  } catch {
    /*
     * Logout remains successful on the device even when the backend
     * cannot be reached. The server-side token will eventually expire.
     */
  } finally {
    await removeAuthTokens();
  }
}