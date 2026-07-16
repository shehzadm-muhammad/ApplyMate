import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  cancelReminderNotification,
  scheduleReminderNotification,
} from "./notificationService";

const REMINDERS_KEY = "@applymate/reminders";

export type ReminderType =
  | "Interview"
  | "Assessment"
  | "Follow-up"
  | "Deadline"
  | "Other";

export type Reminder = {
  id: string;
  title: string;
  company: string;
  type: ReminderType;
  dueDate: string;
  dueTime: string;
  notes: string;
  completed: boolean;
  createdAt: string;
  notificationId: string | null;
};

export type NewReminder = Omit<
  Reminder,
  | "id"
  | "completed"
  | "createdAt"
  | "notificationId"
>;

async function storeReminders(
  reminders: Reminder[]
): Promise<void> {
  await AsyncStorage.setItem(
    REMINDERS_KEY,
    JSON.stringify(reminders)
  );
}

export async function getReminders(): Promise<Reminder[]> {
  const storedReminders =
    await AsyncStorage.getItem(REMINDERS_KEY);

  if (!storedReminders) {
    return [];
  }

  const parsedReminders = JSON.parse(
    storedReminders
  ) as Partial<Reminder>[];

  return parsedReminders.map((reminder) => ({
    id:
      reminder.id ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: reminder.title ?? "",
    company: reminder.company ?? "",
    type: reminder.type ?? "Other",
    dueDate: reminder.dueDate ?? "",
    dueTime: reminder.dueTime ?? "",
    notes: reminder.notes ?? "",
    completed: reminder.completed ?? false,
    createdAt:
      reminder.createdAt ?? new Date().toISOString(),
    notificationId: reminder.notificationId ?? null,
  }));
}

export async function saveReminder(
  values: NewReminder
): Promise<Reminder> {
  const reminders = await getReminders();

  const id = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

  const notificationId =
    await scheduleReminderNotification({
      reminderId: id,
      title: values.title,
      company: values.company,
      type: values.type,
      dueDate: values.dueDate,
      dueTime: values.dueTime,
    });

  const reminder: Reminder = {
    ...values,
    id,
    completed: false,
    createdAt: new Date().toISOString(),
    notificationId,
  };

  await storeReminders([reminder, ...reminders]);

  return reminder;
}

export async function updateReminder(
  id: string,
  updates: NewReminder
): Promise<Reminder | null> {
  const reminders = await getReminders();

  const existingReminder = reminders.find(
    (reminder) => reminder.id === id
  );

  if (!existingReminder) {
    return null;
  }

  await cancelReminderNotification(
    existingReminder.notificationId
  );

  const notificationId = existingReminder.completed
    ? null
    : await scheduleReminderNotification({
        reminderId: existingReminder.id,
        title: updates.title,
        company: updates.company,
        type: updates.type,
        dueDate: updates.dueDate,
        dueTime: updates.dueTime,
      });

  const updatedReminder: Reminder = {
    ...existingReminder,
    ...updates,
    notificationId,
    id: existingReminder.id,
    completed: existingReminder.completed,
    createdAt: existingReminder.createdAt,
  };

  await storeReminders(
    reminders.map((reminder) =>
      reminder.id === id ? updatedReminder : reminder
    )
  );

  return updatedReminder;
}

export async function toggleReminder(
  id: string
): Promise<void> {
  const reminders = await getReminders();

  const targetReminder = reminders.find(
    (reminder) => reminder.id === id
  );

  if (!targetReminder) {
    return;
  }

  const willBeCompleted = !targetReminder.completed;

  let notificationId: string | null = null;

  if (willBeCompleted) {
    await cancelReminderNotification(
      targetReminder.notificationId
    );
  } else {
    notificationId =
      await scheduleReminderNotification({
        reminderId: targetReminder.id,
        title: targetReminder.title,
        company: targetReminder.company,
        type: targetReminder.type,
        dueDate: targetReminder.dueDate,
        dueTime: targetReminder.dueTime,
      });
  }

  await storeReminders(
    reminders.map((reminder) =>
      reminder.id === id
        ? {
            ...reminder,
            completed: willBeCompleted,
            notificationId,
          }
        : reminder
    )
  );
}

export async function deleteReminder(
  id: string
): Promise<void> {
  const reminders = await getReminders();

  const reminderToDelete = reminders.find(
    (reminder) => reminder.id === id
  );

  await cancelReminderNotification(
    reminderToDelete?.notificationId
  );

  await storeReminders(
    reminders.filter((reminder) => reminder.id !== id)
  );
}