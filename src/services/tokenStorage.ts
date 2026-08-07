import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "applymate_access_token";
const REFRESH_TOKEN_KEY = "applymate_refresh_token";

function getWebStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export async function saveAccessToken(
  token: string,
): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function saveRefreshToken(
  token: string,
): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(REFRESH_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function saveAuthTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  /*
   * Store the rotated refresh token first. If storing the access token
   * subsequently fails, the valid refresh token can still restore the
   * session.
   */
  await saveRefreshToken(refreshToken);
  await saveAccessToken(accessToken);
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
  }

  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function removeAccessToken(): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function removeRefreshToken(): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function removeAuthTokens(): Promise<void> {
  await Promise.all([
    removeAccessToken(),
    removeRefreshToken(),
  ]);
}