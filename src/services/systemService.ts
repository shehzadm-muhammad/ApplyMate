import type { ApiStatusResponse } from "../types/api";
import { apiRequest } from "./apiClient";

export async function getApiStatus(): Promise<ApiStatusResponse> {
  return apiRequest<ApiStatusResponse>("/api/v1/status", {
    authenticated: false,
  });
}