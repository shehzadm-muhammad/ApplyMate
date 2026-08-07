import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_IDS_KEY = "@applymate/reminder-notification-ids";

type NotificationIdMap = Record<string, string>;

function getKey(userId: string): string {
  return `${NOTIFICATION_IDS_KEY}/${userId}`;
}

async function getNotificationIds(userId: string): Promise<NotificationIdMap> {
  const stored = await AsyncStorage.getItem(getKey(userId));

  if (!stored) {
    return {};
  }

  return JSON.parse(stored) as NotificationIdMap;
}

async function storeNotificationIds(
  userId: string,
  ids: NotificationIdMap
): Promise<void> {
  await AsyncStorage.setItem(getKey(userId), JSON.stringify(ids));
}

export async function getReminderNotificationId(
  userId: string,
  reminderId: string
): Promise<string | null> {
  const ids = await getNotificationIds(userId);
  return ids[reminderId] ?? null;
}

export async function setReminderNotificationId(
  userId: string,
  reminderId: string,
  notificationId: string | null
): Promise<void> {
  const ids = await getNotificationIds(userId);

  if (notificationId) {
    ids[reminderId] = notificationId;
  } else {
    delete ids[reminderId];
  }

  await storeNotificationIds(userId, ids);
}

export async function getAllReminderNotificationIds(
  userId: string
): Promise<string[]> {
  const ids = await getNotificationIds(userId);
  return Object.values(ids);
}

export async function clearReminderNotificationIds(
  userId: string
): Promise<void> {
  await AsyncStorage.removeItem(getKey(userId));
}