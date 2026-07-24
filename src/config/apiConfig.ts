const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

if (!configuredUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is missing. Add it to the root .env.local file.",
  );
}

export const API_BASE_URL = configuredUrl.replace(/\/+$/, "");