import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/api";
import { apiRequest } from "./apiClient";
import {
  removeAccessToken,
  saveAccessToken,
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

  await saveAccessToken(response.accessToken);

  return response;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>("/api/v1/users/me");
}

export async function logoutUser(): Promise<void> {
  await removeAccessToken();
}