import { apiRequest } from "./apiClient";
import { cancelReminderNotification } from "./notificationService";
import {
  clearReminderNotificationIds,
  getAllReminderNotificationIds,
} from "./reminderStorage";
import { clearSettings } from "./settingsStorage";
import { removeAuthTokens } from "./tokenStorage";

async function clearLocalAccountData(userId: string): Promise<void> {
  try {
    const notificationIds =
      await getAllReminderNotificationIds(userId);

    for (const notificationId of notificationIds) {
      try {
        await cancelReminderNotification(notificationId);
      } catch {
        // Continue cleaning up the remaining local account data.
      }
    }
  } catch {
    // Continue cleanup even if stored notification data is unavailable.
  }

  try {
    await clearReminderNotificationIds(userId);
  } catch {
    // Continue cleanup.
  }

  try {
    await clearSettings();
  } catch {
    // Continue cleanup.
  }

  try {
  await removeAuthTokens();
    } catch {
      // The backend account has already been deleted.
    }
}

export async function deleteAccount(
  userId: string
): Promise<void> {
  await apiRequest<void>("/api/v1/users/me", {
    method: "DELETE",
  });

  await clearLocalAccountData(userId);
}