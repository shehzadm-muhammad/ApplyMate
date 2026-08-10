import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const PENDING_VERIFICATION_KEY =
  "applymate_pending_email_verification";

export interface PendingEmailVerification {
  email: string;
  verificationExpiresAt: string | null;
  resendAvailableAt: string | null;
}

function getWebStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export async function savePendingEmailVerification(
  pendingVerification: PendingEmailVerification,
): Promise<void> {
  const value = JSON.stringify(pendingVerification);

  if (Platform.OS === "web") {
    getWebStorage()?.setItem(
      PENDING_VERIFICATION_KEY,
      value,
    );
    return;
  }

  await SecureStore.setItemAsync(
    PENDING_VERIFICATION_KEY,
    value,
  );
}

export async function getPendingEmailVerification(): Promise<
  PendingEmailVerification | null
> {
  let storedValue: string | null;

  if (Platform.OS === "web") {
    storedValue =
      getWebStorage()?.getItem(
        PENDING_VERIFICATION_KEY,
      ) ?? null;
  } else {
    storedValue = await SecureStore.getItemAsync(
      PENDING_VERIFICATION_KEY,
    );
  }

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (
      typeof parsedValue !== "object" ||
      parsedValue === null
    ) {
      await removePendingEmailVerification();
      return null;
    }

    const pending =
      parsedValue as Partial<PendingEmailVerification>;

    if (
      typeof pending.email !== "string" ||
      pending.email.trim().length === 0
    ) {
      await removePendingEmailVerification();
      return null;
    }

    return {
      email: pending.email,
      verificationExpiresAt:
        typeof pending.verificationExpiresAt === "string"
          ? pending.verificationExpiresAt
          : null,
      resendAvailableAt:
        typeof pending.resendAvailableAt === "string"
          ? pending.resendAvailableAt
          : null,
    };
  } catch {
    /*
     * Corrupt or incompatible local verification state should
     * never prevent ApplyMate from starting normally.
     */
    await removePendingEmailVerification();
    return null;
  }
}

export async function removePendingEmailVerification(): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(
      PENDING_VERIFICATION_KEY,
    );
    return;
  }

  await SecureStore.deleteItemAsync(
    PENDING_VERIFICATION_KEY,
  );
}