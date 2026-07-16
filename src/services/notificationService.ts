import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { getSettings } from "./settingsStorage";

export async function prepareNotifications(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      "applymate-reminders",
      {
        name: "ApplyMate reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      }
    );
  }

  const existingPermissions =
    await Notifications.getPermissionsAsync();

  if (existingPermissions.status === "granted") {
    return true;
  }

  const requestedPermissions =
    await Notifications.requestPermissionsAsync();

  return requestedPermissions.status === "granted";
}

type ScheduleReminderInput = Readonly<{
  reminderId: string;
  title: string;
  company: string;
  type: string;
  dueDate: string;
  dueTime: string;
}>;

export async function scheduleReminderNotification({
  reminderId,
  title,
  company,
  type,
  dueDate,
  dueTime,
}: ScheduleReminderInput): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  const settings = await getSettings();

  if (!settings.notificationsEnabled) {
    return null;
  }

  const hasPermission = await prepareNotifications();

  if (!hasPermission) {
    return null;
  }

  const notificationDate = new Date(
    `${dueDate}T${dueTime}:00`
  );

  if (
    Number.isNaN(notificationDate.getTime()) ||
    notificationDate.getTime() <= Date.now()
  ) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: company
        ? `${type} reminder for ${company}`
        : `${type} reminder`,
      sound: true,
      data: {
        reminderId,
      },
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationDate,
      channelId:
        Platform.OS === "android"
          ? "applymate-reminders"
          : undefined,
    },
  });
}

export async function cancelReminderNotification(
  notificationId?: string | null
): Promise<void> {
  if (!notificationId || Platform.OS === "web") {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(
    notificationId
  );
}